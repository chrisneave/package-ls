#!/usr/bin/env node
var program = require('commander');
var main = require('../lib');

program
  .version(require('../package.json').version)
  .usage('[options] dir')
  .option('-f --format <format>', 'Output format', /^(json|csv)$/i, 'json')
  .parse(process.argv);

main(program);
