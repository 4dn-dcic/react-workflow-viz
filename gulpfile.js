const gulp = require('gulp');
const PluginError = require('plugin-error');
const log = require('fancy-log');
const webpack = require('webpack');
const sass = require('node-sass');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require("path");



function setProduction(done){
    process.env.NODE_ENV = 'production';
    done();
}

function setDevelopment(done){
    process.env.NODE_ENV = 'development';
    done();
}


function webpackOnBuild(done) {
    const start = Date.now();
    let end = null;
    return function (err, stats) {
        if (err) {
            throw new PluginError("webpack", err);
        }
        log("[webpack]", stats.toString({
            colors: true
        }));
        end = Date.now();
        log("Build Completed, running for " + ((end - start)/1000)) + 's';
        if (done) {
            done(err);
        }
    };
}


function doWebpack(cb){
    const webpackConfig = require('./webpack.config.workflow-viz');
    webpack(webpackConfig).run(webpackOnBuild(cb));
};

function doDemoWebpack(cb){
    const demoWebpackConfig = require('./webpack.config.demo');
    webpack(demoWebpackConfig).run(webpackOnBuild(cb));
}

function watch(){
    const webpackConfig = require('./webpack.config.workflow-viz');
    webpack(webpackConfig).watch(300, webpackOnBuild());
};

function watchDemo(){
    const demoWebpackConfig = require('./webpack.config.demo');
    webpack(demoWebpackConfig).watch(300, webpackOnBuild());
};


function doBuildESModules(done){
    const subP = spawn("npx", [
        "babel",
        path.join(__dirname, 'src'),
        "--out-dir",
        path.join(__dirname, 'es'),
        "--env-name",
        "esm"
    ], { stdio: "inherit" });

    subP.on("close", (code)=>{
        done();
    });
}


function performSassBuild(done, options = {}){
    const {
        action = 'render',
        cssOutputLocation = './dist/react-workflow-viz.min.css',
        ...otherOpts
    } = options;

    const useOpts = { // Defaults, overriden by otherOpts
        file: './src/styles.scss',
        outFile: './dist/react-workflow-viz.map.css', // sourceMap location
        outputStyle: 'compressed',
        sourceMap: true,
        ...otherOpts
    };

    sass.render(useOpts, function(error, result) { // node-style callback from v3.0.0 onwards
        if (error) {
            console.error("Error", error.status, error.file, error.line + ':' + error.column);
            console.log(error.message);
            done();
        } else {
            //console.log(result.css.toString());

            console.log("Finished compiling SCSS in", result.stats.duration, "ms");
            console.log("Writing to", cssOutputLocation);

            fs.writeFile(cssOutputLocation, result.css.toString(), function(err){
                if (err){
                    return console.error(err);
                }
                console.log("Wrote " + cssOutputLocation);
                done();
            });
        }
    });
};

function doBuildScss(done){
    performSassBuild(done, {});
}

function doWatchScss(done){
    const subP = spawn("node-sass", [
        "./src/styles.scss",
        "./dist/react-workflow-viz.min.css",
        "--watch",
        "--recursive"
    ], { stdio: "inherit" });

    subP.on("close", (code)=>{
        done();
    });
}


//gulp.task('build-publish',  gulp.series(setProduction, doWebpack));
//gulp.task('watch', gulp.series(doWebpack, watch));
gulp.task('watch',
    gulp.series(
        setDevelopment,
        doWebpack,
        doDemoWebpack,
        doBuildScss,
        gulp.parallel(
            watch,
            watchDemo,
            doWatchScss
        )
    )
);

gulp.task('build',
    gulp.series(
        setProduction,
        gulp.parallel(
            doBuildScss,
            doWebpack,
            gulp.series(
                doBuildESModules,
                doDemoWebpack
            )
        )
    )
);

gulp.task('build-scss', doBuildScss);
