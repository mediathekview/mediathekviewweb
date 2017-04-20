module.exports = function(grunt) {
  require('time-grunt')(grunt);

  let srcFiles = [
    'video-tag-shim.js',
    'node_modules/es5-shim/es5-shim.js',
    'node_modules/es5-shim/es5-sham.js'
  ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('./package.json'),
    clean: {
      dist: 'dist/*'
    },
    copy: {
      dist: {
        files: [
          { expand: true, src: ['video-tag-shim.js'], dest: 'dist/', filter: 'isFile' },
        ]
      }
    },
    concat: {
      options: {
        separator: '\n',
      },
      dist: {
        src: srcFiles,
        dest: 'dist/videojs-ie8.js',
      }
    },
    uglify: {
      dist: {
        options: {
          mangle: true,
          enclose: { 'window': 'window', 'document': 'document' }
        },
        files: {
          'dist/videojs-ie8.min.js': srcFiles
        }
      }
    }
  });

  // load all the npm grunt tasks
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', 'dist');
  grunt.registerTask('dist', ['clean', 'concat', 'uglify']);
};
