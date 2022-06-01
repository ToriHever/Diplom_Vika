const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const glob = require('glob');

const PATH = {
    dev: {
        source: 'src',
        scripts: 'src/js',
        styles: 'src/styles',
        assets: 'src/assets',
    },
    pub: {
        source: 'dist',
        scripts: 'dist/js',
        styles: 'dist/styles',
        assets: 'dist/assets',
    },
};

const processPathToValid = (obj, el, ext) => {
    ext = ext.replace('.', '');
    const { name, dir } = path.parse(el)
    const pathToFile = dir.substr(dir.indexOf(PATH.dev.scripts) + PATH.dev.scripts.length).replace('/', '').replace(ext, '');
    return `${pathToFile}/${name}`;
};

const PATH_DEV = path.resolve(__dirname, PATH.dev.source);
const PATH_PUB = path.resolve(__dirname, PATH.pub.source);

const config = {
    entry: glob.sync(PATH_DEV + '/**/*.js').reduce((obj, el) => {
        if (path.parse(el).name.includes('.service') || path.parse(el).name.includes('.util')) return obj;
        return {
            ...obj,
            [processPathToValid(obj, el, path.parse(el).ext)]: el
        };
    }, {}),
    mode: 'development',
    devServer: {
        static: PATH_PUB,
        port: 8080,
        hot: true
    },
    module: {
        rules: [
            {
                test: /\.(s*)css$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1
                        }
                    },
                    'postcss-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.(js)$/i,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/env',
                                {
                                    targets: {
                                        browsers: ['last 1 version'],
                                    },
                                },
                            ],
                        ],
                        plugins: [
                            '@babel/plugin-proposal-class-properties',
                            ['@babel/plugin-transform-runtime', {'regenerator': true}],
                        ],
                    },
                },
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'url-loader?name=img/[name].[ext]',
                },
            },
        ]
    },
    output: {
        path: path.resolve(__dirname, PATH.pub.scripts),
        filename: '[name].js',
        publicPath: './',
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'pages', to: PATH_PUB },
                { from: PATH.dev.assets, to: PATH_PUB + '/assets' },
            ],
        }),
    ],
    resolve: {
        alias: {
            SCSS: path.resolve(PATH.dev.styles),
            SCRIPTS: path.resolve(PATH.dev.scripts),
        },
        extensions: ['.js'],
    }
};

module.exports = config;
