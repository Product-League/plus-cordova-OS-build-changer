const utils = require("./utils");

module.exports = function (context) {


    const confs = utils.getConfigs();

    let indexFileContent = utils.readErrorFile(context.opts.projectRoot + confs.androidPath + confs.errorFile);
    utils.indexReplacer(context.opts.projectRoot + confs.androidPath + confs.errorFile, indexFileContent);
    utils.indexJSChanger(context.opts.projectRoot + confs.androidPath + "scripts/ECOP_Mobile_PS.index.js");
    utils.minifier(context.opts.projectRoot + confs.androidPath + "scripts", '.js', {js: true});
    utils.minifier(context.opts.projectRoot + confs.androidPath + "css", '.css', {css: true} );
    /*utils.minifier(context.opts.projectRoot + confs.androidPath + 'img', '.jpg');
    utils.minifier(context.opts.projectRoot + confs.androidPath + 'img', '.png');
    utils.minifier(context.opts.projectRoot + confs.androidPath + 'img', '.gif');
    utils.minifier(context.opts.projectRoot + confs.androidPath + 'img', '.svg');*/
    utils.minifier(context.opts.projectRoot + confs.androidPath, '.html',{html: true});
    utils.minifier(context.opts.projectRoot + confs.androidPath, '.js', {js: true});

}