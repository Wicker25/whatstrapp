const path = require('path');

module.exports = {
    target: 'web',
    entry: './src/bootstrap.js',
    output: {
        filename: 'bootstrap.js',
        library: 'WhatsTrapp',
        path: path.resolve(__dirname, 'dist')
    },
    externals: {
        'window': 'window',
    }
};
