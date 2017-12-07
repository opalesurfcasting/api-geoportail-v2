/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
 /*
 * @requires Geoportal/Control.js
 */
/**
 * Class: Geoportal.Control.PanPanel
 * The PanPanel is visible component for panning the map North, South, East or
 * West in small steps. By default it is drawn in the top left corner of the
 * map.
 *
 * Note: 
 * If you wish to use this class with the default images and you want 
 *       it to look nice in ie6, you should add the following, conditionally
 *       added css stylesheet to your HTML file:
 * 
 * (code)
 * <!--[if lte IE 6]>
 *   <link rel="stylesheet" href="../theme/default/ie6-style.css" type="text/css" />
 * <![endif]-->
 * (end)
 *
 * Inherits from:
 *  - <Geoportal.Control>
 *  - <OpenLayers.Control.PanPanel> 
 */
Geoportal.Control.PanPanel = OpenLayers.Class(Geoportal.Control, OpenLayers.Control.PanPanel, {

    /**
     * Property: uis
     * {Array(String)} List of supported UI classes.  Add to this list to
     * add support for additional uis. This list is ordered :
     * the first ui which returns true for the  'supported()'
     * method will be used, if not defined in the 'ui' option.
     */
    uis: ["Geoportal.UI"],

    /**
     * Constructor: Geoportal.Control.PanPanel 
     * Add the four directional pan buttons.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     */
    initialize: function(options) {
        OpenLayers.Control.PanPanel.prototype.initialize.apply(this, [options]);
        Geoportal.Control.prototype.initialize.apply(this, [options]);
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.PanPanel"*
     */
    CLASS_NAME: "Geoportal.Control.PanPanel"
});