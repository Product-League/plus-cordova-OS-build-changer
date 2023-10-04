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
    androidMainPath: "/platforms/android/app/src/main/",
    androidAppPath: "/platforms/android/app/",
    configPathAndroid: "/platforms/android/app/src/main/res/xml/config.xml",
    configPathIos: "/platforms/ios/ECOP Mobile/config.xml",
    androidManifest: "AndroidManifest.xml",
    iosPath: "/platforms/ios/www/",
    iosMainPath: "/platforms/ios/",
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
    console.log("Index: " + content);

    content = content.replace('<script type="text/javascript">', '<script type="text/javascript" src="/ECOP_Mobile/scripts/ECOP_Mobile.quicklink.js"></script><script type="text/javascript">setTimeout(()=>{quicklink.prerender(["/ECOP_Mobile/Promotions", "/ECOP_Mobile/Cart", "/ECOP_Mobile/ProductListPage"], true);}, 50)')
    fs.writeFileSync(indexPath, content, "utf-8");
}

function indexJSChanger(indexJSPath) {
    let indexjs = readFile(indexJSPath);
    indexjs = indexjs.replace(', NullDebugger', "");
    indexjs = indexjs.replace(', "OutSystems/ClientRuntime/NullDebugger"', "");
    fs.writeFileSync(indexJSPath, indexjs, 'utf-8');
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
}

function deepMinifier(dirPath) {
    fs.readdirSync(dirPath).forEach(file => {
        if(fs.statSync(path.join(dirPath, file)).isDirectory()){
            deepMinifier(path.join(dirPath, file));
        } else if(file.endsWith('.js')){
            console.log("Minifying JS File: " + file);
            minify(path.join(dirPath, file), {js: true}).then(minifiedFile => {
                fs.writeFileSync(path.join(dirPath, file), minifiedFile);
            })
        } else if(file.endsWith('.css') && !file.startsWith('PLUS_OutSystemsUI_2_8_0')) {
            console.log("Minifying CSS File: " + file);
            fs.writeFileSync(path.join(dirPath, file), cssMinifier.minify(fs.readFileSync(path.join(dirPath, file), 'utf-8')).styles);
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
    console.log(manifest)

    resources.forEach(resource => {
        let key = '/ECOP_Mobile/' + resource;

        switch(true) {
            case resource.endsWith(configs.notificareSuffix):
                key = key + '/notificare-services.zip';
                console.log(key);
                delete manifest.manifest.urlVersions[key];
                break;
            case resource.endsWith(configs.firebaseSuffix):
                let firebaseKeys = ['/google-services.json', '/GoogleService-Info.plist'];
                firebaseKeys.forEach(firebaseKey => {
                    let tmpKey = key;
                    tmpKey = tmpKey + firebaseKey;
                    console.log(key);
                    delete manifest.manifest.urlVersions[tmpKey];
                }) 
                break;
            default:
                break;

        }
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

function moveGSFiles(oldPath, newPath){
    fs.copyFileSync(oldPath, newPath);
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

function performanceLogcatAdd (androidManifestPath){
    const parseString = xml2js.parseString;
    const builder = new xml2js.Builder();
    const filePath = androidManifestPath;
    const androidManifest = fs.readFileSync(filePath).toString();
    let manifestRoot;
  
    if (androidManifest) {
      parseString(androidManifest, (err, manifest) => {
        if (err) return console.error(err);
  
        manifestRoot = manifest['manifest'];
  
        if(!manifestRoot['application'][0]['meta-data']){
            manifestRoot['application'][0]['meta-data']= [];
        }
        
  
        manifestRoot['application'][0]['meta-data'].push({'$': {'android:name': 'firebase_performance_logcat_enabled', 'android:value': 'true'}});
          fs.writeFileSync(androidManifestPath, builder.buildObject(manifest));
        }
      )}
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
    replaceFileRegex,
    deepMinifier,
    performanceLogcatAdd,
    moveGSFiles
}