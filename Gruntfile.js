module.exports = function(grunt) {
	grunt.initConfig({

		uglify: {
            my_target: {
                files: {
                    'dist/js/libs/jquery.min.js': ['src/js/libs/jquery.min.js'],
                    'dist/js/main.min.js' : ['src/js/main.js']
                }
            }
        },

        cssmin: {
        	target: {
				    files: {
				      'dist/css/style.min.css': 'src/css/style.css'
				    }
			  }
        },

        htmlmin: {                                     	 // Task 
		    dist: {                                      // Target 
		      options: {                                 // Target options 
		        removeComments: true,
		        collapseWhitespace: true
		      },
		      files: {                                   // Dictionary of files 
		        'dist/index.html': 'src/index.html'     // 'destination': 'source' 
		      }
		    },
		    dev: {                                       // Another target 
		        files: [{
		          expand: true,
		          cwd: 'neighbourhood-map',
		          src: ['src/**/*.html', '*.html'],
		          dest: 'dist'
		      }]
		    }
		},

		imagemin: {
            dynamic: {
                files: [{
                    expand: true,
                    cwd: 'src/img/',
                    src: ['**/*.{png,gif,jpg,svg}'],
                    dest: 'dist/img/'
                }]
            }
        }
	})

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-imagemin');

	grunt.registerTask('default', ['uglify', 'cssmin', 'htmlmin', 'imagemin']);
}