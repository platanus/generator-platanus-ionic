'use strict';
var fs = require('fs')
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var child_process = require('child_process');
var exec = child_process.execSync;

var ionic = function(args) {
  return child_process.execFileSync('ionic', args.split(' '));
};

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
      message: 'What is the name of this new app?',
      default: 'platanus-ionic-starter'
    }, {
      type: 'checkbox',
      name: 'platforms',
      message: 'What platforms do you need to support?',
      choices: [
        { name: 'iOS', value: 'ios' },
        { name: 'Android', value: 'android' }
      ]
    }, {
      type: 'confirm',
      name: 'useCrosswalk',
      message: 'Since Android is supported, should I include Crosswalk in the project?',
      default: true,
      when: function(answers){
        if ( answers.platforms.indexOf('android') > -1 ) return true;
        return false;
      }
    }, {
      type: 'input',
      name: 'proxyApiUrl',
      message: 'Please enter the base API url that will be proxified through /api '+chalk.yellow('(e.g. http://myapp.pow/api, empty if not used)')
    }];

    this.prompt(prompts, function (answers) {
      this.options = answers;
      done();
    }.bind(this));
  },

  writing: {
    ionicSetup: function() {
      console.log('Initializing Ionic app...');
      ionic('start '+this.options.appName+' tabs');
      exec('cp -rf ' + this.options.appName + '/. .');
      exec('rm -rf ' + this.options.appName);
    },
    ionicSetupSass: function() {
      console.log('Setting up SCSS support...');
      ionic('setup sass');
    },
    ionicSetupProxy: function() {
      if ( this.options.proxyApiUrl && this.options.proxyApiUrl.length > 0 ) {
        console.log('Setting up API proxy...');
        var ionicProjectFile = fs.readFileSync('ionic.project');
        var ionicProject = JSON.parse(ionicProjectFile);
        ionicProject.proxies = [
          { 'path': '/api', 'proxyUrl': this.options.proxyApiUrl }
        ];
        fs.writeFileSync('ionic.project', JSON.stringify(ionicProject, null, 2));
      }
    },
    ionicSetupPlatforms: function() {
      if ( this.options.platforms.indexOf('ios') > -1 ) {
        console.log('Adding iOS platform...');
        ionic('platform add ios');
      }
      if ( this.options.platforms.indexOf('android') > -1 ) {
        console.log('Adding Android platform...');
        ionic('platform add android');
      }
    },
    ionicSetupCrosswalk: function() {
      if ( this.options.useCrosswalk ) {
        console.log('Adding Crosswalk support...');
        ionic('browser add crosswalk');
      }
    },
    projectFiles: function() {
      this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore')
      );
      this.fs.copy(
        this.templatePath('karma.conf.js'),
        this.destinationPath('karma.conf.js')
      );
    }
  },

  install: function () {
    console.log('Setting up dependencies...');

    this.bowerInstall(['angular-mocks', 'angular-restmod', 'ngCordova'], { 'saveDev': true });
    this.npmInstall(['karma', 'karma-jasmine', 'karma-phantomjs-launcher'], { 'saveDev': true });

    this.installDependencies();
  }
});
