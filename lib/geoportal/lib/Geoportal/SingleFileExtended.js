/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/**
 * Header: Geoportal Web 2D API
 */

var Geoportal = {

    /**
     * Constant: VERSION_NUMBER
     * {String} *"Geoportal 2.1.2 Extended ; publicationDate=2015-04-02"*
     */
    VERSION_NUMBER: "Geoportal 2.1.2 Extended ; publicationDate=2015-04-02",

    /**
     * Constant: singleFile
     * TODO: will be removed with OpenLayers 3.0
     */
    singleFile: true,

    /**
     * Function: _getScriptLocation
     * Return the path to this script.
     *
     * Returns:
     * {String} Path to this script
     */
    _getScriptLocation: (function () {
        var scriptLocation= "";
        var isGP= new RegExp("(^|(.*?\\/))(GeoportalExtended\\.js)(\\?|$)");

        // From GeoExt :
        // If we load other scripts right before Geoportal using the same
        // mechanism to add script resources dynamically (e.g. OpenLayers),
        // document.getElementsByTagName will not find the GeoExt script tag
        // in FF2. Using document.documentElement.getElementsByTagName instead
        // works around this issue.
        var scripts= document.documentElement.getElementsByTagName('script');
        for (var i= 0, len= scripts.length; i<len; i++) {
            var src= scripts[i].getAttribute('src');
            if (src) {
                var match= src.match(isGP);
                if (match) {
                    scriptLocation= match[1];
                    break;
                }
            }
        }
        return (function() { return scriptLocation; });
    })()
};
