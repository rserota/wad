module.exports = function(grunt) {

  // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                // define a string to put between each file in the concatenated output
                separator: ';'
            },
            build: {
            // the files to concatenate
                src: ['src/Recorderjs/recorder.js', 'src/tuna.js', 'src/wad.js'],
            // the location of the resulting JS file
                dest: 'build/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: '<%= umd.all.options.dest %>',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        umd: {
            all: {
                options: {
                    src: '<%= concat.build.dest %>',
                    dest: 'build/<%= pkg.name %>.js',
                    objectToExport: 'Wad'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-umd');
    
    // Default task(s).
    grunt.registerTask('default', ['concat', 'umd', 'uglify']);

};