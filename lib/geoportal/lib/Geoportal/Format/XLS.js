/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Format.js
 */
/**
 * Class: Geoportal.Format.XLS
 * The Geoportal framework XML for Location Service support base class.
 *
 * Inherits from:
 *  - <Geoportal.Format>
 *  - <OpenLayers.Format.XML.VersionedOGC at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format/XML/VersionedOGC-js.html>
 */
Geoportal.Format.XLS= OpenLayers.Class(Geoportal.Format, OpenLayers.Format.XML.VersionedOGC, {

    /**
     * Property: defaultVersion
     * {String} Version number to assume if none found.
     *      Default is *"1.2"*
     */
    defaultVersion: "1.2",

    /**
     * Property: defaultCoreService
     * {String} Core service to instanciante.
     *      Default is *"LocationUtilityService"*
     */
    defaultCoreService: "LocationUtilityService",

    /**
     * APIProperty: coreService
     * {String} Specify a core service string.
     */
    coreService: null,

    /**
     * Constructor: Geoportal.Format.XLS.
     * Constructor.
     *
     * Parameters:
     * options - {Object} Optional object whose properties will be set on
     *     the object.
     */
    initialize: function(options) {
        OpenLayers.Format.XML.VersionedOGC.prototype.initialize.apply(this, [options]);
    },

    /**
     * Method: getVersion
     * Returns the version to use. Subclasses can override this function
     * if a different version detection is needed.
     *
     * Parameters:
     * root - {DOMElement}
     * options - {Object} Optional configuration object.
     *
     * Returns:
     * {String} The version to use.
     */
    getVersion: function(root, options) {
        var version = OpenLayers.Format.XML.VersionedOGC.prototype.getVersion.apply(this, arguments);
        if (version == "1.0.0") {
            version = "1.0";
        }
        if (version == "1.1.1" || version == "1.1.0") {
            version = "1.1";
        }
        return version;
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
        var coreService= this.coreService || this.defaultCoreService;
        if (!this.parser || this.parser.VERSION != version || this.parser.CORESERVICE != coreService) {
            var format = Geoportal.Format[this.name][
                "v" + version.replace(/\./g, "_") + profile
            ];
            format= format? format[coreService] : null;
            if(!format) {
                throw OpenLayers.i18n('XLS.version', {
                    'xlsVersion' : version + profile,
                    'coreService': coreService
                });
            }
            this.parser = new format(this.options);
        }
        return this.parser;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Format.XLS"*
     */
    CLASS_NAME:"Geoportal.Format.XLS"
});

/**
 * Class: OpenLayers.Format.XLS
 * Read/Wite XLS (OpenLS). Create a new instance with the
 * <OpenLayers.Format.XLS at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format/XLS-js.html>
 *     constructor. Currently only implemented for Location Utility Services, more
 *     specifically only for Geocoding. No support for Reverse Geocoding as yet.
 * 
 * Inherits from:
 *  - <Geoportal.Format.XLS>
 */
OpenLayers.Format.XLS = OpenLayers.Class(Geoportal.Format.XLS, {

    /**
     * Constant: CLASS_NAME
     * {String} *"OpenLayers.Format.XLS"*
     */
    CLASS_NAME: "OpenLayers.Format.XLS"
});
