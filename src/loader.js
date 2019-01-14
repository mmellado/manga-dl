const chalk = require('chalk');

let loaderTimer = null;

function loader(chapter) {
  const icons = ['▙', '▛', '▜', '▟'];
  let counter = 0;

  loaderTimer = setInterval(() => {
    counter += 1;
    if (counter >= icons.length) {
      counter = 0;
    }
    const icon = icons[counter];
    process.stdout.write(`\r    ${chapter} .......... ${chalk.blue(icon)}`);
  }, 150);
}

function killLoader(chapter, isError = false) {
  const icon = isError ? chalk.red('✘') : chalk.green('✔');
  clearInterval(loaderTimer);
  loaderTimer = null;
  process.stdout.write(`\r    ${chapter} .......... ${icon}\n`);
}

module.exports = {
  loader,
  killLoader,
};
