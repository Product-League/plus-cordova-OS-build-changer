const fs = require('fs');
const path = require('path');
const minify = require('minify');
const CleanCSS = require('clean-css');

//Initial configs
const configs = {
    textToReplace: 'There was an error processing your request.',
    androidPath: "/platforms/android/app/src/main/assets/www/",
    iosPath: "/platforms/ios/www/",
    errorFile: '_error.html'
};

function getConfigs() {
    return configs;
}

function readErrorFile(path) {
    return fs.readFileSync(path, "utf-8");
}

function errorFileReplacer(path, content, textToReplace, replacementText) {
    content = content.replace(textToReplace, replacementText);
    fs.writeFileSync(path, content, "utf-8");
}


function indexReplacer(path, content) {
    content = content.replace('<script type="text/javascript" src="scripts/OutSystemsManifestLoader.js', '<script async type="text/javascript" src="scripts/OutSystemsManifestLoader.js');
    //content = content.replace('<script type="text/javascript" src="scripts/OutSystems.js', '<script async type="text/javascript" src="scripts/OutSystems.js');
    content = content.replace('<script type="text/javascript" src="scripts/OutSystemsReactView.js', '<script async type="text/javascript" src="scripts/OutSystemsReactView.js');
    content = content.replace('<script type="text/javascript" src="scripts/cordova.js', '<script async type="text/javascript" src="scripts/cordova.js');
    content = content.replace('<script type="text/javascript" src="scripts/Debugger.js', '<script async type="text/javascript" src="scripts/Debugger.js');
    content = content.replace('<script type="text/javascript" src="scripts/ECOP_Mobile_PS.appDefinition.js', '<script async type="text/javascript" src="scripts/ECOP_Mobile_PS.appDefinition.js');
    content = content.replace('<script type="text/javascript" src="scripts/OutSystemsReactWidgets.js', '<script async type="text/javascript" src="scripts/OutSystemsReactWidgets.js');
    content = content.replace('<script type="text/javascript" src="scripts/ECOP_Mobile_PS.index.js', '<script async type="text/javascript" src="scripts/ECOP_Mobile_PS.index.js')
    //content = content.replace('<script type="text/javascript" src="scripts/ONEConferenceMobile.appDefinition.js', '<script async type="text/javascript" src="scripts/ONEConferenceMobile.appDefinition.js')
    content = content.substr(0, content.indexOf('<script type="text/javascript" src="scripts/NullDebugger.js')) + content.substr(content.indexOf('</script>', content.indexOf('<script type="text/javascript" src="scripts/NullDebugger.js')) + 9)
    fs.writeFileSync(path, content, "utf-8");
}

function indexJSChanger(path) {
    let indexjs = fs.readFileSync(path, "utf-8");
    indexjs = indexjs.replace(', NullDebugger', "");
    indexjs = indexjs.replace(', "OutSystems/ClientRuntime/NullDebugger"', "");
    fs.writeFileSync(path, indexjs, 'utf-8');
}

function minifier (dirPath, fileExtension, options) {
    const cssMin = new CleanCSS({
        level: {
          1: {
            cleanupCharsets: true, // controls `@charset` moving to the front of a stylesheet; defaults to `true`
            normalizeUrls: true, // controls URL normalization; defaults to `true`
            optimizeBackground: true, // controls `background` property optimizations; defaults to `true`
            optimizeBorderRadius: true, // controls `border-radius` property optimizations; defaults to `true`
            optimizeFilter: true, // controls `filter` property optimizations; defaults to `true`
            optimizeFont: true, // controls `font` property optimizations; defaults to `true`
            optimizeFontWeight: true, // controls `font-weight` property optimizations; defaults to `true`
            optimizeOutline: true, // controls `outline` property optimizations; defaults to `true`
            removeEmpty: true, // controls removing empty rules and nested blocks; defaults to `true`
            removeNegativePaddings: true, // controls removing negative paddings; defaults to `true`
            removeQuotes: true, // controls removing quotes when unnecessary; defaults to `true`
            removeWhitespace: true, // controls removing unused whitespace; defaults to `true`
            replaceMultipleZeros: true, // contols removing redundant zeros; defaults to `true`
            replaceTimeUnits: true, // controls replacing time units with shorter values; defaults to `true`
            replaceZeroUnits: true, // controls replacing zero values with units; defaults to `true`
            roundingPrecision: false, // rounds pixel values to `N` decimal places; `false` disables rounding; defaults to `false`
            selectorsSortingMethod: 'standard', // denotes selector sorting method; can be `'natural'` or `'standard'`, `'none'`, or false (the last two since 4.1.0); defaults to `'standard'`
            specialComments: 'all', // denotes a number of /*! ... */ comments preserved; defaults to `all`
            tidyAtRules: true, // controls at-rules (e.g. `@charset`, `@import`) optimizing; defaults to `true`
            tidyBlockScopes: true, // controls block scopes (e.g. `@media`) optimizing; defaults to `true`
            tidySelectors: true, // controls selectors optimizing; defaults to `true`,
            variableValueOptimizers: [] // controls value optimizers which are applied to variables
          },
          2: {
            overrideProperties: false
          }
        }
      })
    fs.readdirSync(dirPath).filter(file => 
        file.endsWith(fileExtension)).forEach(file => {
            if(fileExtension === '.css'){
                console.log("Minifying CSS File: " + file);
                fs.writeFileSync(path.join(dirPath, file), cssMin.minify(fs.readFileSync(path.join(dirPath, file), 'utf-8')).styles);
            } else{
                console.log("Minifying File: " + file);
                minify(path.join(dirPath, file), options).then(minifiedFile => {
                    fs.writeFileSync(path.join(dirPath, file), minifiedFile);
                })
            }

    })
}


module.exports = {
    getConfigs,
    readErrorFile,
    errorFileReplacer,
    indexReplacer,
    indexJSChanger,
    minifier
}