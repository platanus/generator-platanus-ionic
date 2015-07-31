# Platanus Ionic Generator

Get up and running with Ionic, Crosswalk, Restmod, ngCordova, Karma and more.

## Getting started

- Install Yeoman with `npm install -g yo`.
- Install the generator with `npm install -g generator-platanus-ionic`.
- Now you can run `yo platanus-ionic` on an empty folder to start up the generator.

## What does it do?

- Creates a new Ionic project based on our guidelines and a specified template.
- Sets up SCSS support.
- Adds specified platforms and Crosswalk if necessary.
- Sets up an API proxy.
- Installs all the required dependencies.

## What's in a template?

This generator supports templates, which allow you to define a base source code for the application. They are very similar in purpose to the official Ionic starter templates that you can use with the Ionic CLI (tabs, side-menu, etc).

Our [Starter Template](https://github.com/platanus/ionic-starter-template), which is used by default if you don't specify a different one, includes some sample views, models, routes and controllers to use as boilerplate for your application, but if you have any recurring patterns in the way you structure your Angular components, Ionic views or folder structure, or if there are certain pieces of code you use in all of your apps, you could create your own template.

A template also includes the `bower.json` and `karma.conf.js` files because these are closely related to your specific app's dependencies. For example, if you're building a template that comes with out-of-the-box support for authentication, you might want to add certain components (like [angular-auth](http://github.com/platanus/angular-auth)) to your Bower and Karma configuration files, so it's important to specify them here.

To specify a template, just point to the proper GitHub repository when prompted. You can use the `#` sign to specify a branch, like `platanus/ionic-starter-template#super-features`.

## After generating

Use `ionic serve` to start a web server. To learn more about the Platanus Ionic workflow, take a look at the README file of your generated app. Happy development!

## Credits

Thank you [contributors](https://github.com/platanus/generator-platanus-ionic/graphs/contributors)!

<img src="http://platan.us/gravatar_with_text.png" alt="Platanus" width="250"/>

generator-platanus-ionic is maintained by [platanus](http://platan.us).
