'use strict';
var fs = require('fs-extra')
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var Download = require('download');
var shelljs = require('shelljs/global');

var ionic = function(args) {
  return exec('ionic ' + args);
};

var cordovaPlugins = [
  "org.apache.cordova.device",
  "org.apache.cordova.console",
  "com.ionic.keyboard"
];

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
      message: 'Please enter the base API url that will be proxified through /api',
      default: 'http://myapp.pow/api'
    }, {
      type: 'input',
      name: 'templateRepo',
      message: 'What is the Github repository you want to use as the template for this project?',
      default: 'platanus/ionic-starter-template'
    }];

    this.prompt(prompts, function (answers) {
      this.options = answers;
      done();
    }.bind(this));
  },

  writing: {
    fetchAppBase: function() {
      var done = this.async();
      console.log('Downloading Ionic base app...');
      downloadGithubRepo('platanus/ionic-app-base', '.', done);
    },
    fetchIonicTemplate: function() {
      var done = this.async();
      console.log('Downloading Platanus Ionic template...');
      downloadGithubRepo(this.options.templateRepo, 'app', done);
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
    mkdirWww: function() {
      console.log('Creating \'www\' directory...');
      fs.mkdirsSync('www');
    }
  },

  install: function(){
    this.installDependencies();
  },

  end: {
    ionicAddPlatforms: function() {
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
    cordovaAddPlugins: function() {
      console.log('Installing Cordova plugins...');
      cordovaPlugins.forEach(function(plugin){
        exec('cordova plugin add ' + plugin);
      });
    }
  }
});


function downloadGithubRepo(repository, dest, cb) {
  var tempFolder = 'tmp' + Date.now();
  var repoFolder = repository.split('/')[1] + '-master';
  var repoUrl = getGithubRepoZip(repository);
  var download = new Download({extract: true})
    .get(repoUrl)
    .dest(tempFolder);
  download.run(function(err){
    if ( err ) throw err;
    fs.copySync(tempFolder + '/' + repoFolder + '/.', dest);
    fs.removeSync(tempFolder);
    cb();
  });
};

function getGithubRepoZip(repository){
  return 'https://github.com/' + repository + '/archive/master.zip';
}
