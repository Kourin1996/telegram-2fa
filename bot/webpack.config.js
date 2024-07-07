const path = require('path');

module.exports = {
    entry: './src/index.js',
    mode: 'production',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '',
        library: {
            type: "module",
        },
    },
    // plugins: [
    //     new webpack.ProvidePlugin({
    //         Buffer: ['buffer', 'Buffer'],
    //     }),
    //     // 他のプラグイン
    // ],
    optimization: {
        minimize: true
    },
    experiments: {
        outputModule: true,
        asyncWebAssembly: true, 
    },
    resolve: {
        extensions: ['.js'],
    },
};