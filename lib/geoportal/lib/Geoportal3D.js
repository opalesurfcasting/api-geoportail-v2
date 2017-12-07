/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/**
 * Header: Geoportal Web 3D API
 */

(function() {
    /**
     * Before creating the Geoportal namespace, check to see if
     * Geoportal.singleFile is true.  This occurs if the
     * Geoportal/SingleFile.js script is included before this one - as is the
     * case with single file builds.
     *
     */
    var singleFile= (typeof(Geoportal)=="object" && Geoportal.singleFile);

    /**
     * Property: scriptName
     * {String} Relative path of this script.
     */
    var scriptName= (!singleFile) ? "lib/Geoportal3D.js" : "Geoportal.js";

    /*
     * If window.Geoportal isn't set when this script (Geoportal.js) is
     * evaluated (and if singleFile is false) then this script will load
     * *all* Geoportal scripts. If window.Geoportal is set to an array
     * then this script will attempt to load scripts for each string of
     * the array, using the string as the src of the script.
     *
     * Example:
     * (code)
     *     <script type="text/javascript">
     *         window.Geoportal = [
     *             "Geoportal/Util.js"
     *         ];
     *     </script>
     *     <script type="text/javascript" src="../lib/Geoportal.js"></script>
     * (end)
     * In this example Geoportal.js will load Util.js only.
     */
    var jsFiles= window.Geoportal;

    /**
     * Namespace: Geoportal
     * The Geoportal 3D API loader based on OpenLayers 2.12.
     *      Aims at providing a Javascript loader for Geoportail's 3D API
     *      based on OpenScales (<http://www.openscales.org>).
     * The Geoportal object provides a namespace for all things Geoportal.
     */
    window.Geoportal= {

        /**
         * Function: _getScriptLocation
         * Return the path to this script.
         *
         * Returns:
         * {String} Path to this script
         */
        _getScriptLocation: (function () {
            var scriptLocation= "";
            var isGP= new RegExp("(^|(.*?\\/))(" + scriptName + ")(\\?|$)");

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
    /**
     * Geoportal.singleFile is a flag indicating this file is being included
     * in a Single File Library build of the Geoportal Library.
     *
     * When we are *not* part of a SFL build we dynamically include the
     * Geoportal library code.
     *
     * When we *are* part of a SFL build we do not dynamically include the
     * Geoportal library code as it will be appended at the end of this file.
     */
    if(!singleFile) {
        if (!jsFiles) {
            jsFiles= [
                // OPENLAYERS:
                "../../openlayers/lib/OpenLayers/SingleFile.js",//make OpenLayers believes it is compacted!
                "../../openlayers/lib/OpenLayers/BaseTypes/Class.js",
                "../../openlayers/lib/OpenLayers/BaseTypes.js",
                "../../openlayers/lib/OpenLayers/BaseTypes/Element.js",
                "../../openlayers/lib/OpenLayers/Console.js",
                "../../openlayers/lib/OpenLayers/Lang.js",
                "../../openlayers/lib/OpenLayers/Util.js",
                "../../openlayers/lib/OpenLayers/Format.js",
                "../../openlayers/lib/OpenLayers/Format/XML.js",
                "../../openlayers/lib/OpenLayers/Format/JSON.js",
                "../../openlayers/lib/OpenLayers/Geometry.js",
                "../../openlayers/lib/OpenLayers/Events.js",
                "../../openlayers/lib/OpenLayers/Geometry/Point.js",
                "../../openlayers/lib/OpenLayers/Lang/en.js",
                "../../openlayers/lib/OpenLayers/Lang/fr.js",
                "../../openlayers/lib/OpenLayers/Lang/it.js",
                "../../openlayers/lib/OpenLayers/Lang/de.js",
                "../../openlayers/lib/OpenLayers/Lang/es.js",
                // FLEX:
                // PROJ4JS:
                // GEOPORTAL:
                "OpenLayers/OverloadedOpenLayersMinimum.js",
                "Geoportal/Lang.js",
                "Geoportal/Lang/en.js",
                "Geoportal/Lang/fr.js",
                "Geoportal/Lang/de.js",
                "Geoportal/Lang/es.js",
                "Geoportal/Lang/it.js",
                "Geoportal/InterfaceViewer.js",
                "Geoportal/InterfaceViewer/VG.js",
                "Geoportal/Util.js",
                "Geoportal/Loader.js",
                "Geoportal/Loader/VG.js"
            ]; // etc.
        }

        // See http://trac.osgeo.org/openlayers/ticket/2933
        // use "parser-inserted scripts" for guaranteed execution order
        // http://hsivonen.iki.fi/script-execution/
        var allScriptTags= new Array(jsFiles.length);

        var host= Geoportal._getScriptLocation() + "lib/";
        for (var i= 0, len= jsFiles.length; i < len; i++) {
            allScriptTags[i]= "<script" +
                                " type='text/javascript'" +
                                " src='" + host + jsFiles[i] + "'" +
                                " charset='UTF-8'" +
                              "></script>";
        }
        document.write(allScriptTags.join(""));
    }
})();

/**
 * Constant: VERSION_NUMBER
 * {String} *"Geoportal 2.1.2 3D ; publicationDate=2015-04-02"*
 */
Geoportal.VERSION_NUMBER="Geoportal 2.1.2 3D ; publicationDate=2015-04-02";
