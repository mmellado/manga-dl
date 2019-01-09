const fs = require('fs');
const CloudflareBypasser = require('cloudflare-bypasser');
const PDF = require('pdfkit');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const sizeOf = require('image-size');
const cc = new CloudflareBypasser();

async function getChaptersFromManga(mangaUrl) {
  try {
    const res = await cc.request(mangaUrl);
    const $ = cheerio.load(res.body);
    const $chapters = $('ul.chapter-list a');
    const chapterList = [];
    console.log($chapters);
    $chapters.each((i, c) =>
      chapterList.push({
        chapter: $(c).text(),
        url: c.attribs.href + '/all-pages',
      })
    );
    console.log(chapterList);
  } catch (err) {
    console.log('Error in getChaptersFromManga for url', mangaUrl, '\n');
    console.log(err);
    return [];
  }
}

async function getChapterImages(chapterUrl) {
  try {
    const res = await cc.request(chapterUrl);
    const $ = cheerio.load(res.body);
    const $images = $('img.img-responsive');
    const imgArray = [];
    $images.each((i, img) => imgArray.push(img.attribs.src));
    return imgArray;
  } catch (err) {
    console.log('Error in getChapterImages for url', chapterUrl, '\n');
    console.log(err);
    return [];
  }
}

async function buildPDF(url) {
  try {
    const images = await getChapterImages(url);
    const firstImage = await fetch(images[0]);
    const firstBuffer = await firstImage.buffer();
    const firstImageSize = sizeOf(firstBuffer);
    const pdf = new PDF({
      size: [firstImageSize.width, firstImageSize.height],
    });
    pdf.pipe(fs.createWriteStream('./test2.pdf'));
    await pdf.image(firstBuffer, 0, 0);

    const numImages = images.length;
    for (let i = 1; i < numImages; i++) {
      const image = await fetch(images[i]);
      const buffer = await image.buffer();
      const dimensions = sizeOf(buffer);
      pdf.addPage({ size: [dimensions.width, dimensions.height] });
      await pdf.image(buffer, 0, 0);
      if (i === numImages - 1) {
        pdf.end();
      }
    }
    // pdf.end();
  } catch (err) {
    console.log('Error in buildPDF for url', url, '\n');
    console.log(err);
  }
}

getChaptersFromManga('https://www.funmanga.com/Tensei-Shitara-Slime-Datta-Ken');
// buildPDF('https://www.funmanga.com/Tensei-Shitara-Slime-Datta-Ken/1/all-pages');
