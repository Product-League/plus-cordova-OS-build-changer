const utils = require("./utils");

module.exports = function (context) {

  const confs = utils.getConfigs();
  const appId = utils.getAppIdentifier(context.opts.projectRoot + confs.configPathIos);

  //MIN SDK Changer
  utils.minSDKChanger(context.opts.projectRoot, false);

  //Removal of unused resources
  utils.removeUnusedFolders(context.opts.projectRoot, context.opts.projectRoot + confs.iosPath, appId, false);

  //Indexes Changer
  let indexFileContent = utils.readFile(context.opts.projectRoot + confs.iosPath + confs.indexFile);
  utils.indexReplacer(context.opts.projectRoot + confs.iosPath + confs.indexFile, indexFileContent);
  utils.indexJSChanger(context.opts.projectRoot + confs.iosPath + "scripts/ECOP_Mobile.index.js");

  //File minification
  utils.minifier(context.opts.projectRoot + confs.iosPath + "scripts", '.js', {js: true});
  utils.minifier(context.opts.projectRoot + confs.iosPath + "css", '.css', {} );
  utils.minifier(context.opts.projectRoot + confs.iosPath, '.js', {js: true});
  utils.minifyImages(context.opts.projectRoot + confs.iosPath + 'img');

  //Error File Changer
  let errorFileContent = utils.readFile(context.opts.projectRoot + confs.iosPath + confs.errorFile);
  utils.errorFileReplacer(context.opts.projectRoot + confs.iosPath + confs.errorFile, errorFileContent, confs.textToReplace, '');

}
