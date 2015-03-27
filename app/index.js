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
      type: 'input',
      name: 'appId',
      message: 'What is the package ID for this app?',
      default: 'us.platan.starter'
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
      name: 'baseRepo',
      message: 'What is the Github repository you want to use as the app base?',
      default: 'platanus/ionic-app-base#master'
    }, {
      type: 'input',
      name: 'templateRepo',
      message: 'What is the Github repository you want to use as the template for this project?',
      default: 'platanus/ionic-starter-template#master'
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
      downloadGithubRepo(this.options.baseRepo, '.', done);
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
    },
    addProjectName: function() {
      console.log('Setting up app name on project files...');
      var appName = this.options.appName;
      var replace_files = ['package.json', 'bower.json', 'config.xml', 'npm-shrinkwrap.json', 'ionic.project'];
      replace_files.forEach(function(file){
        var contents = fs.readFileSync(file, 'utf8');
        contents = contents.replace('platanus-ionic-starter', appName);
        fs.writeFileSync(file, contents);
      });
    },
    addProjectId: function() {
      console.log('Writing app ID on config.xml...');
      var contents = fs.readFileSync('config.xml', 'utf8');
      contents = contents.replace('us.platan.starter', this.options.appId);
      fs.writeFileSync('config.xml', contents);
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
    },
    greet: function() {
      console.log('\n------------');
      console.log('* All done! Run '+chalk.yellow('ionic serve')+' to start up a web server.');
      console.log('* Please refer to your app base\'s documentation for more information');
      console.log('  about the project\'s folder structure and workflow.');
      console.log(chalk.yellow('* Thank you from Platanus!'));
      console.log('-------------\n');
    }
  }
});


function downloadGithubRepo(repository, dest, cb) {
  var split = repository.split('#');
  repository = split[0];
  var branch = 'master';
  if ( split.length == 2 ) branch = split[1];

  var tempFolder = 'tmp' + Date.now();
  var repoFolder = repository.split('/')[1] + '-'+branch;
  var repoUrl = getGithubRepoZip(repository, branch);
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

function getGithubRepoZip(repository, branch){
  console.log('Downloading https://github.com/' + repository + '/archive/'+branch+'.zip');
  return 'https://github.com/' + repository + '/archive/'+branch+'.zip';
}
