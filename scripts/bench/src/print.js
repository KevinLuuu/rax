const Table = require('cli-table');
const chalk = require('chalk');

module.exports = function(data, frameworks, benchmarks) {
  const table = new Table({
    chars: {
      top: '',
      'top-mid': '',
      'top-left': '',
      'top-right': '',
      bottom: '',
      'bottom-mid': '',
      'bottom-left': '',
      'bottom-right': '',
      left: '',
      'left-mid': '',
      mid: ' ',
      'mid-mid': '',
      right: '',
      'right-mid': '',
      middle: '│'
    }
  });

  Object.keys(data).map(type => {
    const rowHeader = [chalk.white.bold(type)];
    frameworks.map(framework => {
      rowHeader.push(chalk.white.bold(framework));
    });
    table.push(rowHeader);

    const benchmarksResult = data[type];

    Object.keys(benchmarksResult).map(benchmark => {
      const result = benchmarksResult[benchmark];

      const benchmarkInfo = benchmarks[benchmark];
      const title = benchmarkInfo.label;
      const row = [chalk.gray(title)];

      row[title] = frameworks.map(framework => {
        if (!result[framework]) {
          row.push('-');
        } else { 
          const mean = result[framework].mean.toFixed(2);
          const factor = result[framework].factor;
          if (result[framework].warning) {
            row.push(`${chalk.red(mean)}(${factor})`);
            return;
          }

          if (result[framework].factor > 1.5) {
            row.push(`${chalk.yellow(mean)}(${factor})`);
            return;
          }

          row.push(`${mean}(${factor})`);
        }
      });

      table.push(row);
    });
  });

  console.log(table.toString());
};
