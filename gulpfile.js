const gulp = require('gulp');
const PluginError = require('plugin-error');
const log = require('fancy-log');
const webpack = require('webpack');
const sass = require('node-sass');
const fs = require('fs');
const webpackConfig = require('./webpack.config.js');
const demoWebpackConfig = require('./demo.webpack.config.js');



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
    webpack(webpackConfig).run(webpackOnBuild(cb));
};

function doDemoWebpack(cb){
    webpack(demoWebpackConfig).run(webpackOnBuild(cb));
}

function watch(){
    webpack(webpackConfig).watch(300, webpackOnBuild());
};

function watchDemo(){
    webpack(demoWebpackConfig).watch(300, webpackOnBuild());
};


function doSassBuild (done, options = {}){
    const cssOutputLocation = './dist/react-workflow-viz.min.css';
    sass.render({
        file: './src/styles.scss',
        outFile: './dist/react-workflow-viz.map.css', // sourceMap location
        outputStyle: options.outputStyle || 'compressed',
        sourceMap: true
    }, function(error, result) { // node-style callback from v3.0.0 onwards
        if (error) {
            console.error("Error", error.status, error.file, error.line + ':' + error.column);
            console.log(error.message);
            done();
        } else {
            //console.log(result.css.toString());

            console.log("Finished compiling SCSS in", result.stats.duration, "ms");
            console.log("Writing to", cssOutputLocation);

            fs.writeFile(cssOutputLocation, result.css.toString(), null, function(err){
                if (err){
                    return console.error(err);
                }
                console.log("Wrote " + cssOutputLocation);
                done();
            });
        }
    });
};

gulp.task('build', doWebpack);
//gulp.task('build-publish',  gulp.series(setProduction, doWebpack));
//gulp.task('watch', gulp.series(doWebpack, watch));
gulp.task('watch',
    gulp.series(
        doWebpack,
        doDemoWebpack,
        (done) => doSassBuild(done, {}),
        gulp.parallel(
            watch,
            watchDemo,
        )
    )
);
//gulp.task('watch-quick',    gulp.series(setQuick, doWebpack, watch));
gulp.task('build-scss', function(done){ doSassBuild(done, {}) });
