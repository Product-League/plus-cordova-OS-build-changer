const utils = require("./utils");

module.exports = function (context) {

  const confs = utils.getConfigs();
  const appId = utils.getAppIdentifier(context.opts.projectRoot + confs.configPathIos);

  //Removal of unused resources
  utils.removeUnusedFolders(context.opts.projectRoot, context.opts.projectRoot + confs.iosPath, appId, false);

  //Indexes Changer
  //let indexFileContent = utils.readFile(context.opts.projectRoot + confs.iosPath + confs.indexFile);
  //utils.indexReplacer(context.opts.projectRoot + confs.iosPath + confs.indexFile, indexFileContent);
  utils.indexJSChanger(context.opts.projectRoot + confs.iosPath + "scripts/ECOP_Mobile.index.js");

  //File minification
  utils.deepMinifier(context.opts.projectRoot + confs.iosPath);
  utils.minifyImages(context.opts.projectRoot + confs.iosPath + 'img');

  //Error File Changer
  let errorFileContent = utils.readFile(context.opts.projectRoot + confs.iosPath + confs.errorFile);
  utils.errorFileReplacer(context.opts.projectRoot + confs.iosPath + confs.errorFile, errorFileContent, confs.textToReplace, '');
  utils.moveGSFiles(context.opts.projectRoot + confs.iosPath + appId + confs.firebaseSuffix + '/GoogleService-Info.plist', context.opts.projectRoot + confs.iosPath  + '/GoogleService-Info.plist');

}
