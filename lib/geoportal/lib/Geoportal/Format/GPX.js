/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Format.js
 */
/**
 * Class: Geoportal.Format.GPX
 * Read/write GPX parser. Create a new instance with the
 *     <Geoportal.Format.GPX> constructor.
 *     See <http://www.topografix.com/gpx.asp>
 *
 * Inherits from:
 *  - <Geoportal.Format>
 *  - <OpenLayers.Format.XML.VersionedOGC at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format/XML/VersionedOGC-js.html>
 */
Geoportal.Format.GPX = OpenLayers.Class(Geoportal.Format, OpenLayers.Format.XML.VersionedOGC, {

    /**
     * APIProperty: defaultVersion
     * {String} Version number to assume if none found.  Default is "1.0".
     */
    defaultVersion: "1.0",

    /**
     * Constructor: Geoportal.Format.GPX
     * Create a new parser for GPX.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     *      * mapping - {object} A mapping between GPX tag and feature's attributes can be passed
     *      in the options object. The default is to keep GPX tag names as
     *      attribute names. If a mapping is null, the GPX tag is skipped;
     *
     * (code)
     * var format= new Geoportal.Format.GPX({
     *      mapping:{
     *          'email': null,      // don't map email by default
     *          'geoidheight': 'H'  // map with 'H' by default
     *                              // any other GPX tag are read/written keeping
     *                              // the GPX name
     *          'gpx':{
     *              ...
     *          },
     *          'wpt':{
     *              'ele': 'z',     // 'ele' is mapped with 'z' attribute
     *              'url': null     // 'url' is never read/written
     *          }
     *      }
     * });
     * (end)
     *
     *      * stringifyOutput - {Boolean} true for the
     *         <Geoportal.Format.GPX.write> method to serialize the GPX document,
     *      false implies returning the GPX document itself. Defaults to
     *      *true* when not given.
     */
    initialize: function(options) {
        options= options || {};
        
        if (options.stringifyOutput===undefined) {
            options.stringifyOutput= true;
        }  
        options.mapping= OpenLayers.Util.extend({}, options.mapping);
        OpenLayers.Format.XML.VersionedOGC.prototype.initialize.apply(this, [options]);
    },

    /**
     * Method: getParser
     * Get an instance of the cached parser if available, otherwise create
     * one.
     *
     * Parameters:
     * version - {String}
     *
     * Returns:
     * {<OpenLayers.Format at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format-js.html>}
     */
    getParser: function(version) {
        version = version || this.defaultVersion;
        var profile = this.profile ? "_" + this.profile : "";
        if (!this.parser || this.parser.VERSION != version) {
            var format = Geoportal.Format[this.name][
                "v" + version.replace(/\./g, "_") + profile
            ];
            if(!format) {
                throw OpenLayers.i18n('GPX.version', {
                    'gpxVersion': version + profile
                });
            }
            this.parser = new format(this.options);
        }
        return this.parser;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Format.GPX"*
     */
    CLASS_NAME: "Geoportal.Format.GPX"
});

/**
 * Class: OpenLayers.Format.GPX
 * Read/write GPX parser. Create a new instance with the 
 *     <OpenLayers.Format.GPX at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format/GPX-js.html> constructor.
 *
 * Inherits from:
 *  - <Geoportal.Format.GPX>
 */
OpenLayers.Format.GPX = OpenLayers.Class(Geoportal.Format.GPX, {

    /**
     * Constant: CLASS_NAME
     * {String} *"OpenLayers.Format.GPX"*
     */
    CLASS_NAME: "OpenLayers.Format.GPX"
});
