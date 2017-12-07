/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 */
/**
 * Class: Geoportal.Control.OverviewMap
 * The OverviewMap component creates a small overview map, useful to display the 
 * extent of a zoomed map and your main map and provide additional 
 * navigation options to the user.  By default the overview map is drawn in
 * the lower right corner of the main map. Create a new overview map with the
 * <Geoportal.Control.OverviewMap> constructor.
 *
 * Inherits from:
 *  - <Geoportal.Control>
 *  - <OpenLayers.Control.OverviewMap at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/OverviewMap-js.html>
 */
Geoportal.Control.OverviewMap= OpenLayers.Class(Geoportal.Control, OpenLayers.Control.OverviewMap, {

    /**
     * Constructor: Geoportal.Control.OverviewMap
     * Create a new overview map
     *
     * Parameters:
     * options - {Object} Properties of this object will be set on the overview
     * map object.  Note, to set options on the map object contained in this
     * control, set <mapOptions> as one of the options properties.
     */
    initialize: function(options) {
        // force uis property as it is overridden by
        // OpenLayers.Control.OvervieMap:
        this.uis= ["Geoportal.UI"];
        this.layers= [];
        this.handlers= {};
        Geoportal.Control.prototype.initialize.apply(this, [options]);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.OverviewMap"*
     */
    CLASS_NAME: "Geoportal.Control.OverviewMap"
});
