/* global module:false */

/**
 * Grunt file that handles managing tasks such as rendering
 * SASS, providing a basic HTTP server, building a
 * distribution, and deploying.
 */
module.exports = function(grunt) {
  // Project configuration.  Most of this is directly read from
  // package.json.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: '/*! <%%= pkg.title || pkg.name %> - v<%%= pkg.version %> - ' +
        '<%%= grunt.template.today("yyyy-mm-dd") + "\\n" %>' +
        '<%%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        '* Copyright (c) <%%= grunt.template.today("yyyy") %> <%%= pkg.author.name %>;' +
        ' Licensed <%%= _.pluck(pkg.licenses, "type").join(", ") %> */' +
        '<%%= "\\n\\n" %>'
    },
    // Clean up the distribution fold
    clean: {
      folder: 'dist/'
    },
    // JS Hint checks code for coding styles and possible errors
    jshint: {
      options: {
        curly: true,
        //es3: true,
        forin: true,
        latedef: true,
        //maxlen: 80,
        indent: 2
      },
      files: ['Gruntfile.js', 'js/*.js', 'data-processing/*.js']
    },
    <% if (projectPrerequisites.useCompass) { %>
    // Compass is an extended SASS.  Set it up so that it generates to .tmp/
    compass: {
      options: {
        sassDir: 'styles',
        cssDir: '.tmp/css',
        generatedImagesDir: '.tmp/images',
        fontsDir: 'styles/fonts',
        imagesDir: 'images',
        javascriptsDir: 'js',
        importPath: 'bower_components',
        httpPath: './',
        relativeAssets: true
      },
      dist: {
        options: {
          imagesDir: './images',
          environment: 'production',
          outputStyle: 'compressed',
          relativeAssets: false,
          cssDir: '.tmp/dist_css'
        }
      },
      dev: {
        options: {
          debugInfo: true
        }
      }
    },
    <% } %>
    // R.js to bring together files through requirejs.
    requirejs: {
      compile: {
        options: {
          name: 'minnpost-template-testing',
          baseUrl: 'js',
          mainConfigFile: 'js/config.js',
          out: 'dist/<%%= pkg.name %>.latest.js',
          optimize: 'none'
        }
      }
    },
    // Brings files toggether
    concat: {
      options: {
        separator: '\r\n\r\n'
      },
      // CSS
      dist_css: {
        src: [
          <% for (var c in filteredComponentMap.css) { filteredComponentMap.css[c].forEach(function(f) { %>
          'bower_components/<%= f %>.css',<% }) } %>
          '<%%= compass.dist.options.cssDir %>/main.css'
        ],
        dest: 'dist/<%%= pkg.name %>.<%%= pkg.version %>.css'
      },
      dist_css_latest: {
        src: ['<%%= concat.dist_css.src %>'],
        dest: 'dist/<%%= pkg.name %>.latest.css'
      },
      dist_css_ie: {
        src: [
          <% for (var c in filteredComponentMap.ie) { filteredComponentMap.ie[c].forEach(function(f) { %>
          'bower_components/<%= f %>.css',<% }) } %>
          '<%%= compass.dist.options.cssDir %>/main.ie.css'
        ],
        dest: 'dist/<%%= pkg.name %>.<%%= pkg.version %>.ie.css'
      },
      dist_css_latest_ie: {
        src: ['<%%= concat.dist_css_ie.src %>'],
        dest: 'dist/<%%= pkg.name %>.latest.ie.css'
      }
    },
    uglify: {
      options: {
        banner: '<%%= meta.banner %>'
      },
      dist: {
        src: ['<%%= requirejs.compile.options.out %>'],
        dest: 'dist/<%%= pkg.name %>.<%%= pkg.version %>.min.js'
      },
      dist_latest: {
        src: ['<%%= requirejs.compile.options.out %>'],
        dest: 'dist/<%%= pkg.name %>.latest.min.js'
      }
    },
    // Copy relevant files over to distribution
    copy: {
      images: {
        files: [
          {
            cwd: './images/',
            expand: true,
            filter: 'isFile',
            src: ['*'],
            dest: 'dist/images/'
          }
          /*
          {
            cwd: '<%%= compass.options.generatedImagesDir %>',
            expand: true,
            filter: 'isFile',
            src: ['*'],
            dest: 'dist/images/'
          }
          */
        ]
      },
      data: {
        files: [
          {
            cwd: './data/',
            expand: true,
            filter: 'isFile',
            src: ['**/*.json'],
            dest: 'dist/data/'
          }
        ]
      }
    },
    // Deploy to S3
    s3: {
      options: {
        // This is specific to MinnPost
        //
        // These are assumed to be environment variables:
        //
        // AWS_ACCESS_KEY_ID
        // AWS_SECRET_ACCESS_KEY
        //
        // See https://npmjs.org/package/grunt-s3
        //key: 'YOUR KEY',
        //secret: 'YOUR SECRET',
        bucket: 'data.minnpost',
        access: 'public-read'
      },
      mp_deploy: {
        upload: [
          {
            src: 'dist/*',
            dest: 'projects/<%%= pkg.name %>/'
          },
          {
            src: 'dist/data/**/*',
            dest: 'projects/<%%= pkg.name %>/data/',
            rel: 'dist/data'
          },
          {
            src: 'dist/images/**/*',
            dest: 'projects/<%%= pkg.name %>/images/',
            rel: 'dist/images'
          }
        ]
      }
    },
    // HTTP Server
    connect: {
      server: {
        options: {
          port: <%= 8800 + Math.floor(Math.random() * 100) %>
        }
      }
    },
    // Watches files for changes and performs task
    watch: {
      files: ['<%%= jshint.files %>', 'sass/*.scss'],
      tasks: 'lint-watch'
    }
  });

  // Load plugin tasks
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-mustache');
  grunt.loadNpmTasks('grunt-s3');

  // Default build task
  grunt.registerTask('default', ['jshint', 'compass:dist', 'clean', 'concat', 'requirejs', 'uglify', 'copy']);

  // Watch tasks
  grunt.registerTask('watcher', ['jshint', 'compass:dev']);
  grunt.registerTask('server', ['connect', 'watch']);

  // Deploy tasks
  grunt.registerTask('deploy', ['s3']);

};