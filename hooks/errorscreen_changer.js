const utils = require("./utils");
const fs = require('fs');
const xml2js = require('xml2js');

module.exports = function (context) {
    const confs = utils.getConfigs();

    const parseString = xml2js.parseString;
    const builder = new xml2js.Builder();
    const config_xml = fs.readFileSync(context.opts.projectRoot + '/platforms/android/app/src/main/res/xml/config.xml').toString();

    parseString(config_xml, (err, config) => {
        if (err) return console.error(err);
        
        const packageName = config['widget']['id'];
        console.log("PACKAGE NAME: "+packageName)
    })


    let indexFileContent = utils.readErrorFile(context.opts.projectRoot + confs.androidPath + 'index.html');
    utils.indexReplacer(context.opts.projectRoot + confs.androidPath + confs.errorFile, indexFileContent);
    utils.indexJSChanger(context.opts.projectRoot + confs.androidPath + "scripts/ECOP_Mobile_PS.index.js");
    utils.minifier(context.opts.projectRoot + confs.androidPath + "scripts", '.js', {js: true});
    utils.minifier(context.opts.projectRoot + confs.androidPath + "css", '.css', {} );
    //utils.minifier(context.opts.projectRoot + confs.androidPath, '.html',{html: true});
    utils.minifier(context.opts.projectRoot + confs.androidPath, '.js', {js: true});
    utils.minifyImages(context.opts.projectRoot + confs.androidPath + 'img');

}