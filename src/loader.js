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
    process.stdout.write(`\r${chapter} .......... ${chalk.blue(icon)}`);
  }, 150);
}

function killLoader(chapter) {
  clearInterval(loaderTimer);
  loaderTimer = null;
  process.stdout.write(`\r${chapter} .......... ${chalk.green('✔')}\n`);
}

module.exports = {
  loader,
  killLoader,
};
