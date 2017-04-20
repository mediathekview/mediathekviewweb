'use strict';

module.exports = function(grunt) {

    /**
     * grunt release or grunt release:patch increment the patch number
     * grunt release:minor increments the minor version number
     * grunt release:major increments the major version number
     *

     * grunt readme to generate the readme (you might need to do grunt repos first)
     */


    require('time-grunt')(grunt);

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                'lib/**/*.js',
                'test/**/*.js'
            ]
        },
        release: {
            github: {
                repo: 'dylang/node-rss',
                accessTokenVar: 'GITHUB_ACCESS_TOKEN'
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('lint', [
        'jshint'
    ]);

    grunt.registerTask('default', [
        'lint'
    ]);

    grunt.registerTask('pre-publish', [
        'lint',
        'repos',
        'readme'
    ]);
};
