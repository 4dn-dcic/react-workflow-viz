const path = require('path');
const webpack = require('webpack');
const env = process.env.NODE_ENV;


module.exports = [{
    mode: "development",
    entry: {
        "demo" : path.resolve(__dirname, 'demo/demo.js')
    },
    target: "web",
    output: {
        path: path.resolve(__dirname, 'demo'),
        publicPath: "/demo/",
        filename: "demo-compiled.js",

        libraryTarget: "umd",
        library: "[name]",
        umdNamedDefine: true
    },
    // https://github.com/hapijs/joi/issues/665
    // stub modules on client side depended on by joi (a dependency of jwt)
    node: {
        net: "empty",
        tls: "empty",
        dns: "empty",
    },
    externals: {
        'xmlhttprequest' : '{XMLHttpRequest:XMLHttpRequest}',
        'react' : {
            commonjs: 'react',
            commonjs2: 'react',
            amd: 'react',
            root: 'React',
        },
        'react-dom': {
            commonjs: 'react-dom',
            commonjs2: 'react-dom',
            amd: 'react-dom',
            root: 'ReactDOM',
        },
        'react-workflow-viz' : "react-workflow-viz"
    },
    module: {
        rules: [
            // Strip @jsx pragma in react-forms, which makes babel abort
            {
                test: /\.js$/,
                loader: 'string-replace-loader',
                enforce: 'pre',
                query: {
                    search: '@jsx',
                    replace: 'jsx',
                }
            },
            // add babel to load .js files as ES6 and transpile JSX
            {
                test: /\.(js|jsx)$/,
                include: [
                    path.resolve(__dirname, 'demo/demo.js')
                ],
                use: [
                    {
                        loader: 'babel-loader'
                    }
                ]
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'webfonts/',
                        }
                    }
                ]
            }
        ]
    },
    optimization: { minimize : false },
    resolve : {
        extensions : [".webpack.js", ".web.js", ".js", ".json", ".jsx"],
    },
    devtool: 'eval',
    // Inform our code of what build we're on.
    // This works via a find-replace.
    plugins: [ new webpack.DefinePlugin({ 'BUILDTYPE' : JSON.stringify(env) }) ]
}];
