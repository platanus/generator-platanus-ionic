'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var child_process = require('child_process');

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: function () {
    var done = this.async();

    console.log('\nWelcome to the '+chalk.yellow('Platanus')+' '+chalk.cyan('Ionic')+' app generator.');
    console.log('You\'ll get up and running with a brand new Ionic project in no time.\n')

    this.options = {};

    var prompts = [{
      type: 'input',
      name: 'appName',
      message: 'What is the name of your new app?',
      default: 'platanus-ionic-starter'
    }];

    this.prompt(prompts, function (answers) {
      this.options.appName = answers.appName;
      done();
    }.bind(this));
  },

  writing: {
    ionicSetup: function() {
      console.log('Initializing Ionic app (running '+chalk.yellow('ionic start')+')...');
      child_process.execFileSync('ionic', ['start', this.options.appName, 'tabs']);
      child_process.execSync('cp -rf ' + this.options.appName + '/. .');
      child_process.execSync('rm -rf ' + this.options.appName);
    }
  },

  install: function () {
    this.installDependencies({
      skipInstall: this.options['skip-install']
    });
  }
});
