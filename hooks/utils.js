const fs = require('fs'),
    path = require('path'),
    minify = require('minify'),
    CleanCSS = require('clean-css'),
    imagemin = require('imagemin'),
    imageminPng = require('imagemin-pngquant'),
    imageminJpeg = require('imagemin-jpegtran'),
    imageminSVG = require('imagemin-svgo'),
    imageminGIF = require('imagemin-gifsicle'),
    xml2js = require('xml2js'),
    cssOptions = {
        keepSpecialComments: 0
    },
    cssMinifier = new CleanCSS(cssOptions);

//Initial configs
const configs = {
    textToReplace: 'There was an error processing your request.',
    androidPath: "/platforms/android/app/src/main/assets/www/",
    configPathAndroid: "/platforms/android/app/src/main/res/xml/config.xml",
    configPathIos: "/platforms/ios/ECOP Mobile/config.xml",
    iosPath: "/platforms/ios/www/",
    errorFile: '_error.html',
    indexFile: 'index.html',
    urlPath: 'ECOP_Mobile',
    notificareSuffix: '.notificare',
    firebaseSuffix: '.firebase'
};

function getConfigs() {
    return configs;
}

function readFile(path) {
    return fs.readFileSync(path, "utf-8");
}

function errorFileReplacer(path, content, textToReplace, replacementText) {
    content = content.replace(textToReplace, replacementText);
    fs.writeFileSync(path, content, "utf-8");
}


function indexReplacer(path, content) {
    content = content.replace('<script type="text/javascript" src="scripts/OutSystemsManifestLoader.js', '<script async type="text/javascript" src="scripts/OutSystemsManifestLoader.js');
    console.log('OutSystemsManifestLoader async')
    //content = content.replace('<script type="text/javascript" src="scripts/OutSystems.js', '<script async type="text/javascript" src="scripts/OutSystems.js');

    content = content.replace('<script type="text/javascript" src="scripts/OutSystemsReactView.js', '<script async type="text/javascript" src="scripts/OutSystemsReactView.js');
    console.log('OutSystemsReactView async')

    content = content.replace('<script type="text/javascript" src="scripts/cordova.js', '<script async type="text/javascript" src="scripts/cordova.js');
    console.log('cordova async')

    content = content.replace('<script type="text/javascript" src="scripts/Debugger.js', '<script async type="text/javascript" src="scripts/Debugger.js');
    console.log('Debugger async')

    content = content.replace('<script type="text/javascript" src="scripts/ECOP_Mobile_PS.appDefinition.js', '<script async type="text/javascript" src="scripts/ECOP_Mobile_PS.appDefinition.js');
    console.log('appDefinition async')

    content = content.replace('<script type="text/javascript" src="scripts/OutSystemsReactWidgets.js', '<script async type="text/javascript" src="scripts/OutSystemsReactWidgets.js');
    console.log('OutSystemsReactWidgets async')

    content = content.replace('<script type="text/javascript" src="scripts/ECOP_Mobile_PS.index.js', '<script async type="text/javascript" src="scripts/ECOP_Mobile_PS.index.js')
    console.log('index async')

    content = content.substr(0, content.indexOf('<script type="text/javascript" src="scripts/NullDebugger.js')) + content.substr(content.indexOf('</script>', content.indexOf('<script type="text/javascript" src="scripts/NullDebugger.js')) + 9)

    fs.writeFileSync(path, content, "utf-8");
}

function indexJSChanger(path) {
    let indexjs = fs.readFileSync(path, "utf-8");
    indexjs = indexjs.replace(', NullDebugger', "");
    indexjs = indexjs.replace(', "OutSystems/ClientRuntime/NullDebugger"', "");
    fs.writeFileSync(path, indexjs, 'utf-8');
}

function minifier(dirPath, fileExtension, options) {
    fs.readdirSync(dirPath).filter(file =>
        file.endsWith(fileExtension)).forEach(file => {
            switch (true) {
                case fileExtension === '.css':
                    if (!file.startsWith('PLUS_OutSystemsUI_2_8_0')) {
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
function minifyImages(dirPath) {
    imagemin([dirPath + "**/*.(jpg,svg,gif,png"], {
        cwd: dirPath,
        destination: dirPath,
        plugins: [
            imageminPng(),
            imageminJpeg(),
            imageminSVG(),
            imageminGIF()
        ]
    }).then(() => console.log('Images minified'));
}

function getAppIdentifier(path) {
    const parseString = xml2js.parseString;
    const config_xml = fs.readFileSync(path).toString();

    parseString(config_xml, (err, config) => {
        if (err) return console.error(err);

        console.log("App identifier: " + config['widget']['$'].id);
        console.log(typeof config['widget']['$'].id)
        return config['widget']['$'].id.toString();
    })
}

function removeUnusedFolders(foldersPath, appId) {
    const files = fs.readdirSync(foldersPath);
    files.forEach(folder => {
        if (folder.includes(configs.notificareSuffix) || folder.includes(configs.firebaseSuffix)) {
            if (folder !== 'com.plusosdev.ecopmobile' + configs.notificareSuffix || folder !== 'com.plusosdev.ecopmobile' + configs.firebaseSuffix) {
                console.log(folder)
                const dirFiles = fs.readdirSync(foldersPath + folder);
                dirFiles.forEach(file => {
                    fs.unlinkSync(foldersPath + folder + "/" + file);
                    console.log(`${file} is deleted!`)
                })

                fs.rmdir(foldersPath + folder, err => {
                    if (err) {
                        throw err;
                    }

                    console.log(`${foldersPath + folder} is deleted!`);
                });
            }

        }
    })
}

module.exports = {
    getConfigs,
    readFile,
    errorFileReplacer,
    indexReplacer,
    indexJSChanger,
    minifier,
    minifyImages,
    getAppIdentifier,
    removeUnusedFolders
}