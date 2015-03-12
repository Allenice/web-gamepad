module.exports = function (grunt) {

  grunt.initConfig({
    requirejs: {
      compile: {
        options: {
          baseUrl: "public/js/",
          name: 'app/app',
          optimize: 'none',
          out: 'public/js/index.js'
        }
      }
    },
    watch: {
      dev: {
        files: ['public/js/app/**/*.js'],
        tasks: ['requirejs']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['requirejs', 'watch']);


};
