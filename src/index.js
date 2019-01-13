const fs = require('fs');
const path = require('path');
const mkdir = require('mkdirp-promise');
const cheerio = require('cheerio');
const sizeOf = require('image-size');
const PDF = require('pdfkit');
const chalk = require('chalk');
const { request, renderError } = require('./util.js');
const { loader, killLoader } = require('./loader.js');

const OUT_DIR = path.resolve(process.env.HOME, 'manga_dl');

async function getChaptersFromManga(mangaUrl) {
  try {
    const res = await request(mangaUrl);
    const $ = cheerio.load(res);
    const $chapters = $('ul.chapter-list a');
    const chapterList = [];
    $chapters.each((i, c) => chapterList.push(`${c.attribs.href}/all-pages`));
    return chapterList.reverse();
  } catch (err) {
    renderError('getChaptersFromManga', mangaUrl, err);
    return [];
  }
}

async function getChapterImages(chapterUrl) {
  try {
    const res = await request(chapterUrl);
    const $ = cheerio.load(res);
    const $images = $('img.img-responsive');
    const imgArray = [];
    $images.each((i, img) => imgArray.push(img.attribs.src));
    return imgArray;
  } catch (err) {
    renderError('getChaperImages', chapterUrl, err);
    return [];
  }
}

async function buildPDF(url, name, chapter) {
  try {
    const fileName = `${name}-Chapter-${chapter}`;
    const destDir = path.resolve(OUT_DIR, name);
    const filePath = path.resolve(destDir, fileName);
    const images = await getChapterImages(url);
    const firstImage = await request(images[0], true);
    if (!firstImage) {
      return false;
    }
    const firstImageSize = sizeOf(firstImage);
    await mkdir(destDir);
    const pdf = new PDF({
      size: [firstImageSize.width, firstImageSize.height],
    });
    pdf.pipe(fs.createWriteStream(filePath));
    await pdf.image(firstImage, 0, 0);

    const numImages = images.length;
    for (let i = 1; i < numImages; i += 1) {
      const image = await request(images[i], true);
      const dimensions = sizeOf(image);
      pdf.addPage({
        size: [dimensions.width, dimensions.height],
      });
      await pdf.image(image, 0, 0);
      if (i === numImages - 1) {
        pdf.end();
      }
    }
    return true;
  } catch (err) {
    renderError('buildPDF', url, err);
    return false;
  }
}

function getMangaName(url) {
  const parts = url.split('/');
  return parts[3];
}

function getChapterNumber(url) {
  const parts = url.split('/');
  return parts[4];
}

async function buildChapter(chapterUrl, name) {
  const chapter = getChapterNumber(chapterUrl);

  const title = `Chapter ${chapter}`;
  loader(title);
  const success = await buildPDF(chapterUrl, name, chapter);
  if (success) {
    killLoader(title);
  } else {
    killLoader(title, true);
  }
}

async function buildSingleChapter(chapterUrl) {
  const name = getMangaName(chapterUrl);
  const spacedName = name.split('-').join(' ');

  console.log(`Building files for: ${chalk.bold(spacedName)}`);
  buildChapter(chapterUrl, name);
}

async function buildAllChapters(mangaUrl) {
  const name = getMangaName(mangaUrl);
  const spacedName = name.split('-').join(' ');
  const chapters = await getChaptersFromManga(mangaUrl);
  const numChapters = chapters.length;

  console.log(`Building files for: ${chalk.bold(spacedName)}`);
  for (let i = 0; i < numChapters; i += 1) {
    await buildChapter(chapters[i], name);
  }
}

module.exports = {
  buildAllChapters,
  buildSingleChapter,
};

buildAllChapters('https://www.funmanga.com/Tensei-Shitara-Slime-Datta-Ken');
