const utils = require("./utils");

module.exports = function (context) {
    const confs = utils.getConfigs();
    const appId = utils.getAppIdentifier(context.opts.projectRoot + confs.configPathAndroid);

    //MIN SDK Changer Android
    utils.minSDKChangerAndroid(context.opts.projectRoot);

    //Removal of unused resources
    utils.removeUnusedFolders(context.opts.projectRoot, context.opts.projectRoot + confs.androidPath, appId, true);

    //Indexes Changer
    let indexFileContent = utils.readFile(context.opts.projectRoot + confs.androidPath + confs.indexFile);
    utils.indexReplacer(context.opts.projectRoot + confs.androidPath + confs.indexFile, indexFileContent);
    utils.indexJSChanger(context.opts.projectRoot + confs.androidPath + "scripts/ECOP_Mobile.index.js");

    //File minification
    utils.minifier(context.opts.projectRoot + confs.androidPath + "scripts", '.js', {js: true});
    utils.minifier(context.opts.projectRoot + confs.androidPath + "css", '.css', {} );
    utils.minifier(context.opts.projectRoot + confs.androidPath, '.js', {js: true});
    utils.minifyImages(context.opts.projectRoot + confs.androidPath + 'img');

    //Error File Changer
    let errorFileContent = utils.readFile(context.opts.projectRoot + confs.androidPath + confs.errorFile);
    utils.errorFileReplacer(context.opts.projectRoot + confs.androidPath + confs.errorFile, errorFileContent, confs.textToReplace, '');
}