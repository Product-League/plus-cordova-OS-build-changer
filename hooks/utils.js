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
    manifestPath: "",
    iosPath: "/platforms/ios/www/",
    errorFile: '_error.html',
    indexFile: 'index.html',
    urlPath: 'ECOP_Mobile',
    notificareSuffix: '.notificare',
    firebaseSuffix: '.firebase',
    pluginId: 'cordova-os-build-changer'
};

function getConfigs() {
    return configs;
}

function readFile(filePath) {
    return fs.readFileSync(filePath, "utf-8");
}

function errorFileReplacer(errorPath, content, textToReplace, replacementText) {
    content = content.replace(textToReplace, replacementText);
    fs.writeFileSync(errorPath, content, "utf-8");
}


function indexReplacer(indexPath, content) {
    content = content.replace('<script type="text/javascript" src="scripts/OutSystemsManifestLoader.js', '<script async type="text/javascript" src="scripts/OutSystemsManifestLoader.js');
    console.log('OutSystemsManifestLoader async')
    //content = content.replace('<script type="text/javascript" src="scripts/OutSystems.js', '<script async type="text/javascript" src="scripts/OutSystems.js');

    content = content.replace('<script type="text/javascript" src="scripts/OutSystemsReactView.js', '<script async type="text/javascript" src="scripts/OutSystemsReactView.js');
    console.log('OutSystemsReactView async')

    content = content.replace('<script type="text/javascript" src="scripts/cordova.js', '<script async type="text/javascript" src="scripts/cordova.js');
    console.log('cordova async')

    content = content.replace('<script type="text/javascript" src="scripts/Debugger.js', '<script async type="text/javascript" src="scripts/Debugger.js');
    console.log('Debugger async')

    content = content.replace('<script type="text/javascript" src="scripts/ECOP_Mobile.appDefinition.js', '<script async type="text/javascript" src="scripts/ECOP_Mobile.appDefinition.js');
    console.log('appDefinition async')

    content = content.replace('<script type="text/javascript" src="scripts/OutSystemsReactWidgets.js', '<script async type="text/javascript" src="scripts/OutSystemsReactWidgets.js');
    console.log('OutSystemsReactWidgets async')

    content = content.replace('<script type="text/javascript" src="scripts/ECOP_Mobile.index.js', '<script async type="text/javascript" src="scripts/ECOP_Mobile.index.js')
    console.log('index async')

    content = content.substr(0, content.indexOf('<script type="text/javascript" src="scripts/NullDebugger.js')) + content.substr(content.indexOf('</script>', content.indexOf('<script type="text/javascript" src="scripts/NullDebugger.js')) + 9)
    console.log("Index: " + content)
    fs.writeFileSync(indexPath, content, "utf-8");
}

function indexJSChanger(indexJSPath) {
    let indexjs = readFile(indexJSPath);
    indexjs = indexjs.replace(', NullDebugger', "");
    indexjs = indexjs.replace(', "OutSystems/ClientRuntime/NullDebugger"', "");
    fs.writeFileSync(indexJSPath, indexjs, 'utf-8');
}

function minifier(dirPath, fileExtension, options) {
    fs.readdirSync(dirPath).filter(file => {
        if(file.endsWith(fileExtension)){
            file.endsWith(fileExtension).forEach(file => {
                switch (true) {
                    case fileExtension === '.css':
                        if (!file.startsWith('PLUS_OutSystemsUI_2_8_0')) {
                            console.log("Minifying CSS File: " + file);
                            fs.writeFileSync(path.join(dirPath, file), cssMinifier.minify(fs.readFileSync(path.join(dirPath, file), 'utf-8')).styles);
                        }
                        break;
                    case fileExtension === '.js':
                        console.log("Minifying File: " + file);
                        minify(path.join(dirPath, file), options).then(minifiedFile => {
                            fs.writeFileSync(path.join(dirPath, file), minifiedFile);
                        })
                        break;
                    default:
                        break;
                }
            })
        } if(!file.endsWith('.json') || !file.endsWith('.manifest') || !file.endsWith('.png') || !file.endsWith('.gif') || !file.endsWith('.svg') || !file.endsWith('.css') || !file.endsWith('.woff') || !file.endsWith('.woff2')) {
            minifier(dirPath + '/' + file, '.js', {js: true});
            minifier(dirPath + '/' + file, '.css', {});
        }
    
    }
    )
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

function getAppIdentifier(configPath) {
    const parseString = xml2js.parseString;
    const config_xml = fs.readFileSync(configPath).toString();
    let appId;

    parseString(config_xml, (err, config) => {
        if (err) return console.error(err);

        console.log("App identifier: " + config['widget']['$'].id);
        appId = config['widget']['$'].id;
    })
    return appId;
}

function removeManifestResources(manifestPath, resources) {
    let manifest = readFile(manifestPath);
    manifest = JSON.parse(manifest);

    resources.forEach(resource => {
        let key = '/ECOP_Mobile/' + resource;
        key = key + (resource.endsWith(configs.notificareSuffix) ? '/notificare-services.zip' : '/google-services.zip');
        console.log(key);
        delete manifest.manifest.urlVersions[key];
    })
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
}

function removeUnusedFolders(root, foldersPath, appId, isAndroid) {
    const files = fs.readdirSync(foldersPath);
    let resources = [];
    files.forEach(folder => {
        if (folder.includes(configs.notificareSuffix) || folder.includes(configs.firebaseSuffix)) {
            if (!folder.includes(appId)) {
                console.log(folder)
                resources.push(folder);
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
    removeManifestResources(root + (isAndroid ? configs.androidPath : configs.iosPath) + 'manifest.json', resources);
}

function replaceFileRegex(filePath, regex, replacer, callback) {

    if (!fs.existsSync(filePath)) {
        console.log(filePath + " not found!")
        return;
    }
    let content = fs.readFileSync(filePath, "utf-8")
    content = content.replace(regex, replacer);
    fs.writeFile(filePath, content, callback);
}

function minSDKChangerAndroid(projectRoot) {
    console.log("Changing Android Min SDK!");
    const configPath = path.join("plugins/android.json");
    const configsString = fs.readFileSync(configPath, "utf-8");
    let minSDKconfigs = JSON.parse(configsString).installed_plugins[configs.pluginId];

    const androidVersion = parseInt(minSDKconfigs["ANDROID_MIN_SDK_VERSION"]);
    console.log(androidVersion)
    const pathConfig = path.join(
        projectRoot,
        "platforms",
        "android",
        "cdv-gradle-config.json"
    );


    let content = fs.readFileSync(pathConfig, "utf-8");

    let contentJSON = JSON.parse(content);
    contentJSON.MIN_SDK_VERSION = androidVersion;
    content = JSON.stringify(contentJSON);

    fs.writeFileSync(pathConfig, content);
    console.log("Changed Android MinSDKVersion!");
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
    removeUnusedFolders,
    minSDKChangerAndroid,
    replaceFileRegex
}