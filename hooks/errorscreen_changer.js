const utils = require("./utils");

module.exports = function (context) {


    const confs = utils.getConfigs();

    let indexFileContent = utils.readErrorFile(context.opts.projectRoot + confs.androidPath + confs.errorFile);
    utils.indexReplacer(context.opts.projectRoot + confs.androidPath + confs.errorFile, indexFileContent);
    utils.indexJSChanger(context.opts.projectRoot + confs.androidPath + "scripts/ECOP_Mobile_PS.index.js");
}