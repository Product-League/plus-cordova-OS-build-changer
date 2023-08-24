const utils = require("./utils");

module.exports = function (context) {

    /* Original OutSystems error file
    
    <!DOCTYPE html>
<html>
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="format-detection" content="telephone=no" />
    
    <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1" />
<script type="text/javascript">
(function () {
    function appendMetaTagAttributes(metaTag, attribute, values) {
        var elem = document.querySelector("meta[name=" + metaTag + "]");
        if (elem) {
            var attrContent = elem.getAttribute(attribute);
            elem.setAttribute(attribute, (attrContent ? attrContent + "," : "") + values.join(","));
        }
    }
    if (navigator && /OutSystemsApp/i.test(navigator.userAgent)) {
        // If this app is running on the native shell, we want to disable the zoom
        appendMetaTagAttributes("viewport", "content", ["user-scalable=no", "minimum-scale=1.0"]);
    }
})();</script>
....script tags related with OS. src may vary from app to app
    <script type="text/javascript" src="scripts/OutSystemsManifestLoader.js?3F3fZzzNKkqKoP2DsjtxFw"></script>
<script type="text/javascript" src="scripts/OutSystems.js?RnlDcii3Xz75iIHHERIZtA"></script>
<script type="text/javascript" src="scripts/OutSystemsReactView.js?0bmp5RZ49TZneVNXnO6ymw"></script>
<script type="text/javascript" src="scripts/cordova.js?7KqI9_oL9hClomz1RdzTqg"></script>
<script type="text/javascript" src="scripts/Debugger.js?ThHlQdvBpSCYv_0c6nxy5A"></script>
<script type="text/javascript" src="scripts/<EndUserModule>.appDefinition.js?3u+RekUo0pOuwGDwV_EiBQ"></script>
<script type="text/javascript" src="scripts/OutSystemsReactWidgets.js?IdWooa_erXOfwU01FQUTuA"></script>
    
    
    <style>
        ...style tag with the styles applied in the extensability configurations
    </style>
    
</head>
<body>
    <div id="error-screen-wrapper">
        <div id="error-screen-message-wrapper">
            <div id="error-screen-message-text">There was an error processing your request.</div>
            <button class="error-screen-button" id="error-screen-message-reload-button" style="display: inline;"></button>
            <div id="error-screen-spinner" style="display: none;"></div>
            <div id="error-screen-message-text-extra"></div>
        </div>
        <div id="exception-detail" style="display: none">
            <button class="error-screen-button" id="error-screen-show-detail-button">Show Detail</button>
            <div id="exception-detail-text" hidden>
                <div id="error-screen-exception-message"></div>
                <pre id="error-screen-exception-stack"></pre>
            </div>
        </div>
    </div>
    ....script tag related with OS. src may vary from app to app
    <script type="text/javascript" src="scripts/<EndUserModule>.error.js?DBHuO6wnmDqEWkFMr3_N1w"></script>
</body>
</html> 
    */

  const confs = utils.getConfigs();

  let errorFileContent = utils.readErrorFile(context.opts.projectRoot + confs.iosPath + confs.errorFile);
  utils.errorFileReplacer(context.opts.projectRoot + confs.iosPath + confs.errorFile, errorFileContent, 'There was an error processing your request.', '');

}
