const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/WebTableWrapper.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'virtualized-table.js',
        library: 'VirtualizedTable',
        libraryTarget: 'umd',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            ['@babel/preset-react', { runtime: 'automatic' }]
                        ]
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    optimization: {
        // minimize: false // для читаемости
        minimize: true
    }
};