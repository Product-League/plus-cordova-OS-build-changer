"use strict";

var path = require("path");
var AdmZip = require("adm-zip");

var utils = require("./utilities");
var uts = require('./utils');

var constants = {
  googleServices: "google-services"
};

module.exports = function(context) {
  var cordovaAbove8 = utils.isCordovaAbove(context, 8);
  var cordovaAbove7 = utils.isCordovaAbove(context, 7);
  var defer;
  if (cordovaAbove8) {
    defer = require("q").defer();
  } else {
    defer = context.requireCordovaModule("q").defer();
  }
  const confs = uts.getConfigs();
  
  var platform = context.opts.plugin.platform;
  var platformConfig = utils.getPlatformConfigs(platform);
  if (!platformConfig) {
    utils.handleError("Invalid platform", defer);
  }
   
  const iosConf = utils.getiOSConfigs();

  var wwwPath = utils.getResourcesFolderPath(context, 'ios', iosConf);
  var sourceFolderPath = utils.getSourceFolderPath(context, wwwPath);
  var googleServicesZipFile = utils.getZipFile(sourceFolderPath, constants.googleServices);
  if (!googleServicesZipFile) {
    throw new Error("No configuration zip file found (google-services-zip).");
  }

  var zip = new AdmZip(googleServicesZipFile);

  var targetPath = path.join(wwwPath, constants.googleServices);
  zip.extractAllTo(targetPath, true);

  var files = utils.getFilesFromPath(targetPath);
  if (!files) {
    utils.handleError("No directory found", defer);
  }

  var fileName = files.find(function (name) {
    return name.endsWith(iosConf.firebaseFileExtension);
  });
  if (!fileName) {
    //utils.handleError("No file found", defer);
    throw new Error('Firebase plist file not found');
  }

  var sourceFilePath = path.join(targetPath, fileName);
  console.log(sourceFilePath)
  var destFilePath = path.join(context.opts.projectRoot + confs.iosPath, fileName);
  console.log(destFilePath)

  if(!utils.checkIfFolderExists(destFilePath)){
    utils.copyFromSourceToDestPath(defer, sourceFilePath, destFilePath);
  }

  if (cordovaAbove7) {
    var destPath = path.join(context.opts.projectRoot, "platforms", "ios", "app");
    if (utils.checkIfFolderExists(destPath)) {
      var destFilePath = path.join(destPath, fileName);
      if(!utils.checkIfFolderExists(destFilePath)){
        utils.copyFromSourceToDestPath(defer, sourceFilePath, destFilePath);
      }
    }
  }
      
  return defer.promise;
}