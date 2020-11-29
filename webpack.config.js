const path = require('path'),
    glob = require('glob'),
    webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    {CleanWebpackPlugin} = require('clean-webpack-plugin'),
    TerserPlugin = require("terser-webpack-plugin"),
    MiniCssExtractPlugin = require("mini-css-extract-plugin"),
    CssMinimizerPlugin = require('css-minimizer-webpack-plugin'),
    PurgeCSSPlugin = require('purgecss-webpack-plugin'),
    production = process.env.NODE_ENV === 'production'

module.exports = function () {
    return {
        mode: production ? 'production' : 'development',
        entry: './src/js/app.js',
        optimization: {
            splitChunks: {
                chunks: 'all',
                automaticNameDelimiter: '.',
                cacheGroups: {
                    styles: {
                        name: 'styles',
                        test: /\.css$/,
                        enforce: true
                    },
                },
            },
            minimize: true,
            minimizer: [
                new CssMinimizerPlugin({
                    minimizerOptions: {
                        preset: [
                            'default',
                            {
                                discardComments: {
                                    removeAll: true
                                },
                            }
                        ]
                    }
                })
            ]
        },
        plugins: [
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                template: path.resolve('./src/index.html')
            }),
            new MiniCssExtractPlugin({
                filename: production ? 'css/[name].[contenthash:5].css' : 'css/[name].css',
                chunkFilename: 'css/[name].[chunkhash:5].css'
            }),
            new PurgeCSSPlugin({
                paths: glob.sync(`${path.join(__dirname, 'src')}/**/*`, {nodir: true}),
            }),
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                "window.jQuery": "jquery"
            })
        ],
        output: {
            path: path.resolve("public"),
            filename: production ? 'js/[name].[contenthash:5].js' : 'js/[name].js',
            chunkFilename: 'js/[name].[chunkhash:5].js',
            publicPath: ''
        },
        module: {
            rules: [
                {
                    test: /.s?css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader",
                        "sass-loader"
                    ]
                },
                {
                    test: /\.m?js$/,
                    exclude: /(node_modules)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                },
                {
                    test: /\.(pdf|doc|docx|xls|xlsx|txt|csv|tsv)$/,
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                outputPath: 'files/',
                                name: "[name].[contenthash:5].[ext]",
                            },
                        }
                    ]
                },
                {
                    test: /\.(jpg|jpeg|gif|png|svg|webp)$/,
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                outputPath: 'img/',
                                name: "[name].[contenthash:5].[ext]",
                            },
                        },
                        {
                            loader: 'image-webpack-loader',
                            options: {
                                mozjpeg: {
                                    progressive: true,
                                },
                                optipng: {
                                    enabled: true,
                                },
                                pngquant: {
                                    quality: [0.65, 0.90],
                                    speed: 4
                                },
                                gifsicle: {
                                    interlaced: true,
                                    optimizationLevel: 3
                                },
                                webp: {
                                    quality: 75
                                }
                            }
                        },
                    ],
                },
                {
                    test: /\.(woff(2)?|ttf|otf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[contenthash:5].[ext]',
                                outputPath: 'fonts/'
                            }
                        }
                    ]
                },
                {
                    test: /\.html$/,
                    use: {
                        loader: 'html-loader',
                        options: {
                            minimize: {
                                removeComments: false,
                            },
                            attributes: {
                                list: [
                                    {
                                        tag: 'img',
                                        attribute: 'src',
                                        type: 'src'
                                    },
                                    {
                                        tag: 'link',
                                        attribute: 'href',
                                        type: 'src'
                                    },
                                    {
                                        tag: 'script',
                                        attribute: 'href',
                                        type: 'src'
                                    }
                                ]
                            }
                        }
                    }
                }
            ]
        }
    }
}