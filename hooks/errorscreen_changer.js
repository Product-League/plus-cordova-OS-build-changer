const utils = require("./utils");

module.exports = function (context) {


    const confs = utils.getConfigs();

    let indexFileContent = utils.readErrorFile(context.opts.projectRoot + confs.androidPath + confs.errorFile);
    utils.indexReplacer(context.opts.projectRoot + confs.androidPath + confs.errorFile, indexFileContent);
    utils.indexJSChanger(context.opts.projectRoot + confs.androidPath + "scripts/ECOP_Mobile_PS.index.js");

    const foldersToProcess = ['javascript', 'style', 'media', 'js', 'img', 'css', 'html', 'assets', 'media'];

    utils.processFiles(context.opts.projectRoot + confs.androidPath, true);
    
    foldersToProcess.forEach(function (folder) {
        utils.processFiles(path.join(context.opts.projectRoot + confs.androidPath, folder));
    });
    
    utils.checkIfFinished();
}