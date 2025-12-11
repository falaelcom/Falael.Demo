module.exports = {
    styles: {
        options: {
            compress: true,
            sourceMap: true,
            outputSourceFiles: true,
            sourceMapURL: 'styles.min.css.map'
            // sourceMapFilename: 'styles.min.css.map'
        },
        files: {
            'build/css/styles.min.css': 'src/less/styles.less'
        }
    }
};