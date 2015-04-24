Platanus Ionic App Base
=====================

An Ionic base repository for use with the Platanus Ionic Generator.

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
