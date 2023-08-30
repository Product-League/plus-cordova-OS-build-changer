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
    xcode = require('xcode'),
    Q = require('q'),
    child_process = require('child_process'),
    ConfigParser = require('cordova-common').ConfigParser,
    cssOptions = {
        keepSpecialComments: 0
    },
    cssMinifier = new CleanCSS(cssOptions),
    pluginId = 'cordova-os-build-changer';

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
    firebaseSuffix: '.firebase'
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

function replaceFileRegex(filePath, regex, replacer, callback){
        
    if(!fs.existsSync(filePath)){
        console.log(filePath+ " not found!")
        return;
    }
    let content = fs.readFileSync(filePath,"utf-8")
    content = content.replace(regex,replacer);
    fs.writeFile(filePath,content,callback);
}

function minSDKChanger(projectRoot, isAndroid) {
    console.log("Changing Android Min SDK!");
    const configPath = isAndroid ? path.join("plugins/android.json") : path.join("plugins/ios.json");
    const configsString = fs.readFileSync(configPath, "utf-8");
    let minSDKconfigs = JSON.parse(configsString).installed_plugins[pluginId];

    if (isAndroid) {
        const androidVersion = parseInt(minSDKconfigs["ANDROID_MIN_SDK_VERSION"]);

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
    } else {


        const iosVersion = parseInt(configs["IOS_MIN_SDK_VERSION"]).toFixed(1);
        const config = new ConfigParser("config.xml");
        const appName = config.name();

        var modifyPbxProj = function () {
            var deferral = new Q.defer();

            const pbxprojpath = path.join(
                projectRoot,
                "platforms",
                "ios",
                appName + ".xcodeproj",
                "project.pbxproj"
            );

            const pbxProject = xcode.project(pbxprojpath)

            pbxProject.parse(function (err) {

                pbxProject.updateBuildProperty("IPHONEOS_DEPLOYMENT_TARGET", iosVersion, "Debug");
                pbxProject.updateBuildProperty("IPHONEOS_DEPLOYMENT_TARGET", iosVersion, "Release");

                fs.writeFile(pbxprojpath, pbxProject.writeSync(), function (err) {
                    if (err) {
                        deferral.reject();
                        throw new Error('Unable to write to Podfile: ' + err);
                    }
                    deferral.resolve();
                });
            })
            return deferral.promise;
        }

        var modifyPodFile = function () {
            var deferral = new Q.defer();
            //const iosVersionInt = parseInt(configs["IOS_MIN_SDK_VERSION"]);
            const podfilePath = path.join(
                projectRoot,
                "platforms",
                "ios",
                "Podfile"
            );

            function replacepodfile(match, g1, g2, g3) {
                return g1 + "platform :ios, '" + iosVersion + "'" + g3
            }

            const updatedByString = "#UPDATED BY MINSDKVERSIONCHANGERPLUGIN";

            var postInstallScript = `
    installer.pods_project.targets.each do |target|
        target.build_configurations.each do |config|
            #sets all pod projects with deployment_target = 12.0
            config.build_settings["IPHONEOS_DEPLOYMENT_TARGET"] = "12.0"
        end
    end`;

            fs.readFile(podfilePath, 'utf8', function (err, content) {
                if (err) {
                    throw new Error('Unable to find Podfile: ' + err);
                }

                const podAlreadyInstalled = content.includes(updatedByString);

                if (podAlreadyInstalled) {
                    deferral.resolve();
                }

                //updates platform :ios, 'xx.x' to the needed version
                content = content.replace(/([\s|\S]*)(platform :ios, '[0-9]+\.[0-9]+')([\S|\s]*)/, replacepodfile);

                //handles post_install 
                var postInstallRegex = /post_install do \|installer\|[^]+end/m;
                var postInstallMatch = content.match(postInstallRegex);

                if (postInstallMatch) {
                    // If post_install already exists, update it by replacing the script
                    var updatedContents = content.replace(postInstallRegex, function (match) {
                        return match.replace(/end/, '') + "\n" + postInstallScript.trim() + '\nend';
                    });

                    try {
                        fs.writeFileSync(podfilePath, updatedByString + "\n" + updatedContents, 'utf8');
                    } catch (err) {
                        throw new Error('Unable to write to Podfile: ' + err);
                    }
                } else {
                    // If post_install doesn't exist, add it to the Podfile
                    var newContents = content.trim() + '\n\npost_install do |installer|\n' + postInstallScript.trim() + '\nend\n';

                    try {
                        fs.writeFileSync(podfilePath, updatedByString + "\n" + newContents, 'utf8')
                    } catch (err) {
                        throw new Error('Unable to write to Podfile: ' + err);
                    }
                }


                var iosPath = path.join(
                    projectRoot,
                    "platforms",
                    "ios"
                );

                var output = child_process.exec("pod install", { cwd: iosPath }, function (error) {
                    if (error != null) {
                        console.log("error :" + error);
                    }
                    deferral.resolve();
                })
            });
            return deferral.promise;
        }

        var modifyConfigXml = function () {
            var deferral1 = new Q.defer();
            var deferral2 = new Q.defer();
            var pathMainConfigXML = path.join(
                projectRoot,
                "config.xml"
            );
            var pathAppConfigXML = path.join(
                projectRoot,
                "platforms",
                "ios",
                appName,
                "config.xml"
            );
            var replaceConfigXML = function (match, g1, g2, g3) {
                return g1 + "name=\"deployment-target\" value=\"" + iosVersion + "\"" + g3
            }

            replaceFileRegex(pathMainConfigXML, /([\s|\S]*)(name=\"deployment-target\" value=\"[0-9]+\.[0-9]+\")([\S|\s]*)/, replaceConfigXML, function (err) {
                if (err) {
                    deferral1.reject();
                    throw new Error('Unable to write to configXml: ' + err);
                }
                deferral1.resolve();
            })
            replaceFileRegex(pathAppConfigXML, /([\s|\S]*)(name=\"deployment-target\" value=\"[0-9]+\.[0-9]+\")([\S|\s]*)/, replaceConfigXML, function (err) {
                if (err) {
                    deferral2.reject();
                    throw new Error('Unable to write to configXml: ' + err);
                }
                deferral2.resolve();
            })
            return Promise.all([deferral1.promise, deferral2.promise]);
        }

        console.log("Started updating ios to support a lower sdk version!")

        const p1 = modifyPbxProj();
        const p2 = modifyPodFile();
        const p3 = modifyConfigXml();

        return Promise.all([p1, p2, p3]).then(function () {
            console.log("Ended updating ios to support a lower sdk version!");
        })
    }
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
    minSDKChanger
}