#!/usr/bin/env node
'use strict';

// Require modules
const childProcess = require('child_process');
const program = require('commander');
const versionCheck = require('github-version-checker');
const chalk = require('chalk');
const pkg = require('./package.json');

// Define program.
program
  .name('setperms')
  .description('Modify owner, group and access right for multiple files and directories.')
  .version(pkg.version)
  .usage('[options] <files/dirs...>')
  .option('-u, --usergroup [expression]', 'change the owner and/or group')
  .option('-o, --octal [mode]', 'change the access rights in octal mode')
  .option('-R, --recursive', 'operate on files and directories recursively')
  .parse(process.argv);

// Handler function
const execute = () => {
  if (program.rawArgs.length < 4 || program.args.length === 0) {
    program.help();
  } else {
    // Command list to execute later
    const execute = [];

    // Handle chown
    // Only proceed if user and/or group are set
    if (program.usergroup) {
      let chown = 'chown ';

      // Arguments
      if (program.recursive) chown += '--recursive ';

      // Parameters
      chown += program.usergroup;
      chown += ' ';
      chown += program.args.join(' ');
      execute.push(chown);
    }

    // Handle chown
    // Only proceed if octal mode is set
    if (program.octal) {
      let chmod = 'chmod ';

      // Arguments
      if (program.recursive) chmod += '--recursive ';

      // Parameters
      chmod += program.octal;
      chmod += ' ';
      chmod += program.args.join(' ');
      execute.push(chmod);
    }

    // Execute commands
    for (const cmd of execute) {
      console.log('  Executing "%s"...', cmd);
      childProcess.execSync(cmd);
      console.log('  Done!');
    }
  }
};

// Check for updates
const updateOpts = {
  owner: 'axelrindle',
  repo: 'setperms',
  currentVersion: pkg.version
};
versionCheck(updateOpts)
  .then(update => {
    if (update) {
      console.log('- - - - - - - - - - - - - - - - - - - - - - - - -');
      console.log('  ' + chalk.green('An update is available: ') + chalk.bold(update.tag_name));
      console.log('  ' + chalk.cyan('You are on version ') + chalk.bold(updateOpts.currentVersion) + '!');
      console.log('- - - - - - - - - - - - - - - - - - - - - - - - -');
    }
  })
  .catch(err => {
    if (err) console.error(chalk.red('  Failed to check for updates!'));
  })
  .finally(execute);
