const requestUrl = require('request-promise');
const chalk = require('chalk');

function renderError(func, url, err) {
  if (err.statusCode === 404) {
    console.log(
      chalk.red(
        '\nError retrieving the following image form the requested chapter'
      )
    );
    console.log(chalk.bold(`${chalk.red('✘')}   ${url}`));
    console.log('Image ignored');
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

module.exports = {
  request,
  renderError,
};
