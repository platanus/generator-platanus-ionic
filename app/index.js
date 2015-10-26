'use strict';
var fs = require('fs-extra')
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var Download = require('download');
var shelljs = require('shelljs/global');
var http = require('http');
var semver =  require('semver');

var ionic = function(args) {
  return exec('ionic ' + args);
};

var cordova = function(args) {
  return exec('cordova ' + args);
};

var cordovaPlugins = [
  "cordova-plugin-device",
  "cordova-plugin-console",
  "cordova-plugin-whitelist", // will be required for CSP
  "com.ionic.keyboard"
];

var outputCyan = function(cyan, other, br) {
  if ( typeof other === 'undefined' ) other = '';
  var string = chalk.cyan(cyan) + ' ' + other;
  if ( br ) string = '\n' + string + '\n';
  return console.log(string);
};

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: function () {
    var done = this.async();

    console.log('\n------------');
    console.log(chalk.bgYellow.black(' The Platanus Ionic App Generator '))
    console.log('I\'m here to save you from the hassle of setting up an Ionic app.')
    console.log('You\'ll get up and running with a brand new project in no time.')
    console.log('-------------\n');

    this.options = {};

    var prompts = [{
      type: 'input',
      name: 'appNameHuman',
      message: chalk.cyan('[1/6]') + ' What is the name of this new app? ' + chalk.cyan('(e.g. the label below the app icon)'),
      default: 'Platanus Starter'
    }, {
      type: 'input',
      name: 'appName',
      message: chalk.cyan('[2/6]') + ' I need a machine-friendly name.',
      default: 'platanus-ionic-starter'
    }, {
      type: 'input',
      name: 'appId',
      message: chalk.cyan('[3/6]') + ' What is the package ID for this app?',
      default: 'us.platan.starter'
    }, {
      type: 'checkbox',
      name: 'platforms',
      message: chalk.cyan('[4/6]') + ' What platforms do you need to support?',
      choices: [
        { name: 'iOS', value: 'ios' },
        { name: 'Android', value: 'android' }
      ]
    }, {
      type: 'confirm',
      name: 'useCrosswalk',
      message: chalk.cyan('[4a/6]') + ' Since Android is supported, should I include Crosswalk in the project?',
      default: true,
      when: function(answers){
        if ( answers.platforms.indexOf('android') > -1 ) return true;
        return false;
      }
    }, {
      type: 'input',
      name: 'proxyApiUrl',
      message: chalk.cyan('[5/6]') + ' Please enter the base API url that will be proxified through /api',
      default: 'http://myapp.pow/api'
    }, {
      type: 'input',
      name: 'templateRepo',
      message: chalk.cyan('[6/6]') + ' Which Github repository will serve as the template for this project?',
      default: 'platanus/ionic-starter-template#master'
    }];

    this.prompt(prompts, function (answers) {
      this.options = answers;
      done();
    }.bind(this));
  },

  writing: {
    setupAppBase: function() {
      console.log('\n' + chalk.bgCyan.black(' Writing files ') + '\n');
      outputCyan('[1/8]', 'Copying App Base files...');

      fs.copySync(
        this.templatePath('base/.'),
        this.destinationPath('.')
      );
    },
    fetchIonicTemplate: function() {
      var done = this.async();
      outputCyan('[2/8]', 'Downloading Platanus Ionic app template...');

      downloadGithubRepo(this.options.templateRepo, 'app', done);
    },
    moveTemplateRootFiles: function() {
      var filesToRename = ['bowerrc', 'buildignore', 'gitignore', 'node-version'];
      var filesToMove = ['bower.json', 'karma.conf.js'];

      outputCyan('[3/8]', 'Moving and renaming some files...');

      filesToRename.forEach(function(file){
        var dotfile = '.' + file;
        var underfile = '_' + file;
        var contents = fs.readFileSync(underfile);
        fs.writeFileSync(dotfile, contents);
        fs.removeSync(underfile);
      });

      filesToMove.forEach(function(file){
        var contents = fs.readFileSync('app/' + file, 'utf8');
        fs.writeFileSync(file, contents);
        fs.removeSync('app/' + file);
      });
    },
    ionicSetupProxy: function() {
      if ( this.options.proxyApiUrl && this.options.proxyApiUrl.length > 0 ) {
        outputCyan('[4/8]', 'Setting up API proxy...');

        var ionicProjectFile = fs.readFileSync('ionic.project');
        var ionicProject = JSON.parse(ionicProjectFile);
        ionicProject.proxies = [
          { 'path': '/api', 'proxyUrl': this.options.proxyApiUrl }
        ];
        fs.writeFileSync('ionic.project', JSON.stringify(ionicProject, null, 2));
      }
    },
    mkdirWww: function() {
      outputCyan('[5/8]', 'Creating \'www\' directory...');

      fs.mkdirsSync('www');
    },
    addProjectName: function() {
      outputCyan('[6/8]', 'Setting up app name on project files...');

      var appName = this.options.appName;
      var replace_files = ['package.json', 'bower.json', 'config.xml', 'npm-shrinkwrap.json', 'ionic.project'];
      replace_files.forEach(function(file){
        var contents = fs.readFileSync(file, 'utf8');
        contents = contents.replace('platanus-ionic-starter', appName);
        fs.writeFileSync(file, contents);
      });

      var appNameHuman = this.options.appNameHuman;
      var contents = fs.readFileSync('config.xml', 'utf8');
      contents = contents.replace('human-readable-name', appName);
      fs.writeFileSync('config.xml', contents);
    },
    addProjectId: function() {
      outputCyan('[7/8]', 'Writing app ID on config.xml...');

      var contents = fs.readFileSync('config.xml', 'utf8');
      contents = contents.replace('us.platan.starter', this.options.appId);
      fs.writeFileSync('config.xml', contents);
    },
    addNodeVersion: function() {
      outputCyan('[8/8]', 'Writing node version on .node-version...');

      function writeNodeVersionFile(version){
        var contents = fs.readFileSync('.node-version', 'utf8');
        contents = contents.replace('<%= version_alias %>', version);
        fs.writeFileSync('.node-version', getAlias(contents));
      }

      function getAlias(version){
        return semver.major(version) + "." + semver.minor(version);
      }

      http.get('http://node.platasn.us/latest', function(response) {

        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
          if(response.statusCode === 200){
            writeNodeVersionFile(body);
          }
          else {
            writeNodeVersionFile(process.version);
          }
        })
      })
      .on('error', function(e) {
        writeNodeVersionFile(process.version)
      });
    },
    warnTakeover: function() {
      var done = this.async();
      console.log(chalk.yellow('\n>> Now, ') + chalk.cyan('npm & bower') + chalk.yellow(' take the stage. I\'ll be back when they\'re done.'));
      setTimeout(done, 2000);
    }
  },

  install: function(){
    this.installDependencies();
  },

  end: {
    noticeReturn: function() {
      console.log('\n' + chalk.yellow('>> Hey there! I\'m back. We\'re about to finish.') + '\n');
    },
    ionicAddPlatforms: function() {
      console.log(' ');
      var size = this.options.platforms.length.toString();
      this.options.platforms.forEach(function(platform, i){
        var index = (i+1).toString();
        outputCyan('['+ index +'/'+ size +']', 'Adding `' + platform + '` platform...', true);
        ionic('platform add ' + platform + ' --save');
      });
      console.log(' ');
    },
    ionicSetupCrosswalk: function() {
      if ( this.options.useCrosswalk ) {
        outputCyan('Adding Crosswalk support...', '', true);
        // Just push Crosswalk into list of plugins to install :)
        cordovaPlugins.push('cordova-plugin-crosswalk-webview');
      }
    },
    cordovaAddPlugins: function() {
      outputCyan('Installing Cordova plugins...', '', true);
      cordovaPlugins.forEach(function(plugin){
        cordova('plugin add ' + plugin + ' --save');
      });
    },
    greet: function() {
      console.log('\n------------');
      console.log('* All done! Run '+chalk.yellow('ionic serve')+' to start up a web server.');
      console.log('* Please refer to the README in your generated app for more information');
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
  var download = new Download({mode: '755', extract: true})
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
