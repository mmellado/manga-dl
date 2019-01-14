const fs = require('fs');
const path = require('path');
const mkdir = require('mkdirp-promise');
const cheerio = require('cheerio');
const sizeOf = require('image-size');
const PDF = require('pdfkit');
const chalk = require('chalk');
const {
  request,
  renderError,
  getMangaName,
  getChapterNumber,
} = require('./util.js');
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

async function getImageUrls(chapterUrl) {
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

async function getImageData(imageUrl) {
  const res = {
    buffer: null,
    width: null,
    height: null,
  };
  try {
    res.buffer = await request(imageUrl, true);
    if (res.buffer) {
      const size = sizeOf(res.buffer);
      res.width = size.width;
      res.height = size.height;
    }
    return res;
  } catch (err) {
    renderError('getImageBuffer', imageUrl, err);
    return res;
  }
}

async function addImageToPDF(pdf, img, addPage = true) {
  try {
    if (addPage) {
      pdf.addPage({ size: [img.width, img.height] });
    }
    pdf.image(img.buffer, 0, 0);
  } catch (err) {
    renderError('addImageToPDF', 'image', err);
  }
}

async function buildPDF(url, name, chapter) {
  try {
    const fileName = `${name}-Chapter-${chapter}`;
    const destDir = path.resolve(OUT_DIR, name);
    const filePath = path.resolve(destDir, fileName);
    const images = await getImageUrls(url);
    const numImages = images.length;
    const img = await getImageData(images[0]);

    if (!img.buffer) return false;

    await mkdir(destDir);
    const pdf = new PDF({
      size: [img.width, img.height],
    });
    pdf.pipe(fs.createWriteStream(filePath));

    addImageToPDF(pdf, img, false);
    for (let i = 1; i < numImages; i += 1) {
      const image = await getImageData(images[i]);
      addImageToPDF(pdf, image);

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
