const { ArgumentParser } = require('argparse');
const chalk = require('chalk');
const { validateURL } = require('./util.js');
const { buildSingleChapter, buildAllChapters } = require('./index.js');
const pkg = require('../package.json');

const domain = 'https://funmanga.com';

const parser = new ArgumentParser({
  version: pkg.version,
  addHelp: true,
  description: `${
    pkg.description
  }. \n Downloads all available chapters by default`,
});

parser.addArgument('mangaName', {
  help: 'String with the name of the Manga to retrieve',
});

parser.addArgument(['-c', '--chapter'], {
  type: 'int',
  help: 'The number of the chapter to download',
});

async function run() {
  const args = parser.parseArgs();
  const url = `${domain}/${args.mangaName}${
    args.chapter ? `/${args.chapter}/all-pages` : ''
  }`;

  console.log(`>> manda-dl version ${chalk.bold.blue(pkg.version)}`);
  console.log('>> Manga:', chalk.blue(args.mangaName.split('-').join(' ')));
  console.log('>> Chapter:', chalk.blue(args.chapter || 'All'));
  console.log('>> Validating manga availability at https://funmanga.com/');

  const isValidUrl = await validateURL(url);

  if (!isValidUrl) {
    if (args.chapter) {
      return console.log(
        '>> Error: Wrong Manga name or Chapter number. Please verify that the Manga and Chapter are available in https://funmanga.com/'
      );
    }

    return console.log(
      '>> Error: Wrong Manga name. Please verify that the Manga is available at https://funmanga.com/'
    );
  }

  if (args.chapter) {
    return buildSingleChapter(url);
  }
  return buildAllChapters(url);
}

run();
