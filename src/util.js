const requestUrl = require('request-promise');
const chalk = require('chalk');

function renderError(func, url, err) {
  if (err.statusCode === 404) {
    process.stdout.write('\r ');
    process.stdout.write(`\r${chalk.bold(`(404) ${url}`)}\n`);
  } else {
    console.error(`Error in ${func} for the following url: ${url}`);
    console.error(err);
    process.exit(1);
  }
}

async function request(url, noEncoding = false) {
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
    const res = await requestUrl(options);
    return res;
  } catch (err) {
    renderError('request', url, err);
    return null;
  }
}

async function validateURL(url) {
  try {
    const options = {
      url,
      methos: 'GET',
      headers: {
        'cache-control': 'no-cache',
      },
      resolveWithFullResponse: true,
    };
    const res = await requestUrl(options);
    return res.statusCode === 200 && !res.body.includes('alert alert-warning');
  } catch (err) {
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

module.exports = {
  request,
  renderError,
  getMangaName,
  getChapterNumber,
  validateURL,
};
