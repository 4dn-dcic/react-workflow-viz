const path = require('path');
const webpack = require('webpack');
const env = process.env.NODE_ENV;
const TerserPlugin = require('terser-webpack-plugin');

console.log("NODE_ENV:", env);

const mode = (env === 'production' ? 'production' : 'development');
const minify = mode === 'production' ? true : false;

const plugins = [];


let chunkFilename = '[name].js';
let devTool = 'source-map'; // Default, slowest.


if (mode === 'production') {
    // add chunkhash to chunk names for production only (it's slower)
    chunkFilename = '[name].[chunkhash].js';
    devTool = 'source-map';
} else if (env === 'quick') {
    devTool = 'eval'; // Fastest
} else if (env === 'development') {
    devTool = 'inline-source-map';
}


const rules = [
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
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, 'demo/demo.js')
        ],
        use: [
            {
                loader: 'babel-loader'
            }
        ]
    }
];

const resolve = {
    extensions : [".webpack.js", ".web.js", ".js", ".json", ".jsx"]
};

const optimization = {
    minimize: minify,
    minimizer: [
        new TerserPlugin({
            parallel: true,
            sourceMap: true,
            terserOptions:{
                compress: minify,
                mangle: false
            }
        })
    ]
};


const webPlugins = plugins.slice(0);

// Inform our React code of what build we're on.
// This works via a find-replace.
webPlugins.push(new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(env),
    'SERVERSIDE' : JSON.stringify(false),
    'BUILDTYPE' : JSON.stringify(env)
}));

const primaryConf = {
    mode: mode,
    entry: {
        // Build from /es directory, not src
        "react-workflow-viz" : path.resolve(__dirname, 'es')
    },
    target: "web",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].min.js',
        chunkFilename: chunkFilename,

        libraryTarget: "umd",
        library: "react-workflow-viz",
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
        }
    },
    module: {
        rules: rules
    },
    optimization: optimization,
    resolve : resolve,
    //resolveLoader : resolve,
    devtool: devTool,
    plugins: webPlugins
};

module.exports = [primaryConf];

if (mode === "production"){
    // Create another build that can be used as module.
    // TODO - see how to compile into sep. files for more performant imports from parent apps.
    const secondaryConf = { ...primaryConf };
    secondaryConf.target = "node";
    secondaryConf.output = {
        ...secondaryConf.output,
        filename : "[name].node.js"
    };
    secondaryConf.optimization = { minimize: false };

    module.exports.push(secondaryConf);
}

