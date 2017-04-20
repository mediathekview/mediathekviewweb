module.exports = function(config) {
  var browsers = config.browsers;
  var frameworks = ['qunit'];
  var plugins = ['karma-qunit'];

  var addBrowserLauncher = function(browser) {
    plugins.push('karma-' + browser.toLowerCase() + '-launcher');
  };

  // On Travis CI, we can only run in Firefox.
  if (process.env.TRAVIS) {
    browsers = ['Firefox'];
    browsers.forEach(addBrowserLauncher);

  // If specific browsers are requested on the command line, load their
  // launchers.
  } else if (browsers.length) {
    browsers.forEach(addBrowserLauncher);

  // If no browsers are specified, we will do a `karma-detect-browsers` run,
  // which means we need to set up that plugin and all the browser plugins
  // we are supporting.
  } else {
    frameworks.push('detectBrowsers');
    plugins.push('karma-detect-browsers');
    ['chrome', 'firefox', 'ie', 'safari'].forEach(addBrowserLauncher);
  }

  config.set({
    basePath: '..',
    frameworks: frameworks,

    files: [
      'node_modules/sinon/pkg/sinon.js',
      'node_modules/sinon/pkg/sinon-ie.js',
      'test/dist/bundle.js'
    ],

    browsers: browsers,
    plugins: plugins,

    detectBrowsers: {
      usePhantomJS: false
    },

    reporters: ['dots'],
    port: 9876,
    colors: true,
    autoWatch: false,
    singleRun: true,
    concurrency: Infinity
  });
};
