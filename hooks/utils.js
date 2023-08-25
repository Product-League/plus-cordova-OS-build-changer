const fs = require('fs'),
path = require('path'),
minify = require('minify'),
CleanCSS = require('clean-css'),
imagemin = require('imagemin'),
imageminPng = require('imagemin-pngquant'),
imageminJpeg = require('imagemin-jpegtran'),
imageminSVG = require('imagemin-svgo').default,
imageminGIF = require('imagemin-gifsicle')
cssOptions = {
    keepSpecialComments: 0
},
cssMinifier = new CleanCSS(cssOptions);

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
    fs.readdirSync(dirPath).filter(file => 
        file.endsWith(fileExtension)).forEach(file => {
            switch (true) {
                case fileExtension === '.css':
                    if(!file.startsWith('PLUS_OutSystemsUI_2_8_0')){
                        console.log("Minifying CSS File: " + file);
                        fs.writeFileSync(path.join(dirPath, file), cssMinifier.minify(fs.readFileSync(path.join(dirPath, file), 'utf-8')).styles);
                    }
                    break;
                case fileExtension === '.js' || fileExtension === '.html':
                    console.log("Minifying File: " + file);
                    minify(path.join(dirPath, file), options).then(minifiedFile => {
                        fs.writeFileSync(path.join(dirPath, file), minifiedFile);
                    })
                    break;
                default:
                    break;  
            }
        })
}
async function minifyImages(dirPath) {
    await imagemin([dirPath + "**/*.(jpg,svg,gif,png"], {
        cwd: dirPath,
        destination: dirPath, 
        plugins: [
            imageminPng(),
            imageminJpeg(),
            imageminSVG(),
            imageminGIF()
        ]}).then(() => console.log('Images minified'));
}

module.exports = {
    getConfigs,
    readErrorFile,
    errorFileReplacer,
    indexReplacer,
    indexJSChanger,
    minifier,
    minifyImages
}