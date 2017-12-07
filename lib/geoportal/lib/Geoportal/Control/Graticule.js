/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 */
/**
 * Class: Geoportal.Control.Graticule
 * The Graticule displays a grid of latitude/longitude lines reprojected on
 * the map.
 * 
 * Inherits from:
 *  - <Geoportal.Control>
 *  - <OpenLayers.Control.Graticule>
 *  
 */
Geoportal.Control.Graticule = OpenLayers.Class(Geoportal.Control, OpenLayers.Control.Graticule, {

    /**
     * Property: uis
     * {Array(String)} List of supported UI classes.  Add to this list to
     * add support for additional uis. This list is ordered :
     * the first ui which returns true for the  'supported()'
     * method will be used, if not defined in the 'ui' option.
     */
    uis: ["Geoportal.UI"],

    /**
     * Constructor: Geoportal.Control.Graticule
     * Create a new graticule control to display a grid of latitude/longitude
     * lines.
     * 
     * Parameters:
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     */
    initialize: function(options) {
        OpenLayers.Control.Graticule.prototype.initialize.apply(this, arguments);
        Geoportal.Control.prototype.initialize.apply(this, [options]);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.Graticule"*
     */
    CLASS_NAME: "Geoportal.Control.Graticule"
});
