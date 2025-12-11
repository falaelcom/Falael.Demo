module.exports = {
    options: {
        sourceMap: true
    },

    dist: {
        options: {
            preserveComments: false
        },
        src:  'build/js/main.js',
        dest: 'build/js/main.min.js'
    }
};