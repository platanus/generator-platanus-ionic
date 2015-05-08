Platanus Ionic App
=====================

This app was created with the Platanus Ionic Generator! Below you will find instructions on how to develop with our guidelines.

## Getting started

If you cloned this app, as opposed to generating it, you need to:

- Run ```npm install``` and then ```bower install```.
- Run ```mkdir www``` or ```gulp build``` to generate the missing ```www``` folder, otherwise you might get a *Not a Cordova project* error.
- Run ```cordova prepare``` in order to add the platforms and plugins defined in the app's config.xml, as per Cordova 5.0.

## Common tasks

The Platanus Ionic workflow tries to adhere as much as possible to the Cordova & Ionic way of doing things, so to do common tasks such as to serve, emulate or build your app, or adding platforms and plugins, use the Ionic and Cordova CLI commands you would regularly use. Some tasks are:

- ```ionic serve``` to serve the app to your browser
- ```ionic emulate ios``` to launch your app in the iOS emulator
- ```ionic build android --env=staging``` to build an APK using the 'staging' environment
- ```cordova plugin add cordova-plugin-device --save``` to add the Device Cordova plugin to the app and persist it on the config.xml

**Note on platforms and plugins:** When adding/removing platforms or plugins using the ```cordova``` tool, please suffix your commands with the ```--save``` flag, so the changes are persisted on the app's ```config.xml``` for fellow developers to use.

## Files

Work with the code found within the `app` folder. When running commands such as `ionic run ios` or `ionic build android`, an included Cordova before_prepare hook will automatically move the required files to the `www` folder before the native build process.

To avoid certain files being moved into this folder, use the `.buildignore` file. It allows you to specify files or folders that you want to leave out of the production builds, e.g. large bower components or innecessary placeholder images used only on development. It uses [node-glob](http://github.com/isaacs/node-glob) syntax.

## Environments

Following the example found in the `environments` folder, you can create different environments with variables that will be exposed in the code as Angular constants, through the `app/js/env.js` file. In the example, you would have an `ENV` constant available, which is an object containing the `someApiKey` property.

Please note that since the `environment.json` to `env.js` translation is done in the Cordova hook mentioned before, these environmental variables will only work when running, building or emulating the native application. When running `ionic serve`, this process will always default to the `development` environment if it exists.

To choose which environment you want to use in your build, add the `--env` parameter to your command, like so:

```
ionic run ios --env=production
ionic emulate android --env=testing
ionic build ios --env=staging
```

## Testing

This project is already set up for testing with Karma, Jasmine and PhantomJS. We recommend you install the Karma CLI with `npm install -g karma-cli` so you can simply do `karma start` in order to run your tests.
