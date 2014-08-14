module.exports = function(grunt) {
  this.registerTask('default', ['test']);

  this.registerTask('dist', 'Builds a distributable version of {%= title %}', [
    'lint',
    'build',
    'copy:dist'
  ]);

  this.registerTask('build', 'Builds {%= title %}', [
    'clean',
    'transpile:amd',
    'concat:amd',
    'concat:browser'
  ]);

  this.registerTask('build_tests', "Builds {%= title %}'s tests", [
    'build',
    'transpile:tests',
    'concat:tests'
  ]);

  this.registerTask('lint', 'Applies all the JSHint/spacing rules', [
    'jshint',
    'lintspaces'
  ]);

  this.registerTask('test', 'Executes the tests', [
    'lint',
    'build_tests',
    'connect:dev',
    'mocha'
  ]);

  this.registerTask('copy:dist', 'Copies all distribution files to /dist', [
    'copy:plain_download',
    'copy:plain_bower',
    'copy:amd_download',
    'copy:amd_bower',
  ]);

  var pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({
    connect: {
      dev:{
        server: {},
        options: {
          hostname: '0.0.0.0',
          port: grunt.option('port') || 8000,
          base: '.'
        }
      }
    },

    transpile: {
      amd: {
        type: 'amd',
        files: [{
          expand: true,
          cwd: 'lib/',
          src: ['**/*.js'],
          dest: 'tmp/lib'
        }]
      },
      tests: {
        type: 'amd',
        files: [{
          expand: true,
          cwd: './',
          src: ['tests/**/*.js'],
          dest: 'tmp/'
        }]
      }
    },

    mocha: {
      test: {
        options: {
          run: true,
          reporter: process.env.REPORTER || 'Spec',
          urls: ['http://localhost:8000/test/index.html']
        },
      }
    },

    concat: {
      amd: {
        files: (function() {
          var files = {};
          files['tmp/' + pkg.name + '.amd.js'] = ['wrap/amd.start',
            'tmp/lib/**/*.js', 'wrap/amd.end'];
          return files;
        })()
      },
      browser: {
        files: (function() {
          var files = {};
          files['tmp/' + pkg.name + '.js'] = ['wrap/browser.start',
            'vendor/loader.js', 'tmp/lib/**/*.js', 'wrap/browser.end'];
          return files;
        })()
      },
      tests: {
        files: (function() {
          var files = {};
          files['tmp/' + pkg.name + '-tests.js'] = ['wrap/amd.start',
            'tmp/tests/**/*.js', 'wrap/amd.end'];
          return files;
        })()
      }
    },

    clean: {
      tests: ['dist', 'tmp'],
    },

    jshint: {
      library: 'lib/**/*.js',
      options: {
        jshintrc: '.jshintrc'
      },
      tests: {
        files: {
          src: ['tests/**/*.js']
        },
        options: {
          jshintrc: 'tests/.jshintrc'
        }
      }
    },

    lintspaces: {
      all: {
        src: [
          'lib/**/*',
          'tests/**/*',
          'test/index.html',
          'wrap/**/*'
        ],
        options: {
          newline: true,
          trailingspaces: true,
          indentation: 'spaces',
          spaces: 2
        }
      }
    },

    copy: {
      plain_download: {
        files: [{
          src: ['tmp/' + pkg.name + '.js'],
          dest: 'dist/download/' + pkg.name + '-' + pkg.version + '.js'
        }]
      },
      plain_bower: {
        files: [{
          src: ['tmp/' + pkg.name + '.js'],
          dest: 'dist/bower/' + pkg.main + '.js'
        }]
      },
      amd_download: {
        files: [{
          src: ['tmp/' + pkg.name + '.amd.js'],
          dest: 'dist/download/' + pkg.name + '-' + pkg.version + '.amd.js'
        }]
      },
      amd_bower: {
        files: [{
          src: ['tmp/' + pkg.name + '.amd.js'],
          dest: 'dist/bower/' + pkg.main + '.amd.js'
        }]
      }
    },

    watch: {
      files: ['lib/**/*', 'tests/**/*'],
      tasks: ['test']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-es6-module-transpiler');
  grunt.loadNpmTasks('grunt-lintspaces');
}
