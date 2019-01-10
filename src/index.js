/* eslint-disable no-console, no-await-in-loop */
const fs = require('fs');
const request = require('request-promise');
const cheerio = require('cheerio');
const sizeOf = require('image-size');
const PDF = require('pdfkit');

function renderError(func, url, err) {
  console.error(`Error in ${func} for the following url: ${url}`);
  console.error(err);
}

async function requestUrl(url, noEncoding = false) {
  try {
    const options = {
      url,
      methos: 'GET',
      headers: {
        'cache-control': 'no-cache',
      },
    };
    if (noEncoding) {
      options.encoding = null;
    }
    const res = await request(options);
    return res;
  } catch (err) {
    renderError('requestUrl', url, err);
    return null;
  }
}

async function getChaptersFromManga(mangaUrl) {
  try {
    const res = await requestUrl(mangaUrl);
    const $ = cheerio.load(res);
    const $chapters = $('ul.chapter-list a');
    const chapterList = [];
    $chapters.each((i, c) =>
      chapterList.push({
        chapter: $(c).text(),
        url: `${c.attribs.href}/all-pages`,
      })
    );
    return chapterList;
  } catch (err) {
    renderError('getChaptersFromManga', mangaUrl, err);
    return [];
  }
}

async function getChapterImages(chapterUrl) {
  try {
    const res = await requestUrl(chapterUrl);
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

async function buildPDF(url) {
  try {
    const images = await getChapterImages(url);
    const firstImage = await requestUrl(images[0], true);
    const firstImageSize = sizeOf(firstImage);
    const pdf = new PDF({
      size: [firstImageSize.width, firstImageSize.height],
    });
    pdf.pipe(fs.createWriteStream('./test2.pdf'));
    await pdf.image(firstImage, 0, 0);

    const numImages = images.length;
    for (let i = 1; i < numImages; i += 1) {
      const image = await requestUrl(images[i], true);
      const dimensions = sizeOf(image);
      pdf.addPage({
        size: [dimensions.width, dimensions.height],
      });
      await pdf.image(image, 0, 0);
      if (i === numImages - 1) {
        pdf.end();
      }
    }
    // pdf.end();
  } catch (err) {
    renderError('buildPDF', url, err);
  }
}

/* getChaptersFromManga('https://www.funmanga.com/Tensei-Shitara-Slime-Datta-Ken'); */
buildPDF('https://www.funmanga.com/Tensei-Shitara-Slime-Datta-Ken/1/all-pages');