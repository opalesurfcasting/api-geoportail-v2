/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/Panel.js
 */

/**
 * Class: Geoportal.Control.NavToolbar
 *
 * Inherits from:
 *  - <Geoportal.Control.Panel>
 */
Geoportal.Control.NavToolbar = OpenLayers.Class(Geoportal.Control.Panel, {

    /**
     * Constructor: Geoportal.Control.NavToolbar
     * Add two controls (two mouse controls for panning and zooming in).
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be used
     *     to extend the control. Use navigationOptions to pass options to
     *     <OpenLayers.Control.Navigation at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Navigation-js.html>,
     *     and zoomBoxOptions to pass options to
     *     <OpenLayers.Control.ZoomBox at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/ZoomBox-js.html>.
     */
    initialize: function(options) {
        Geoportal.Control.Panel.prototype.initialize.apply(this, [options]);
        //FIXME: activeOverMapOnly
        this.addControls([
            new OpenLayers.Control.Navigation(OpenLayers.Util.extend({
                title:'olControlDragPan.title',
                zoomBoxEnabled:true,
                mouseWheelOptions:{
                    cumulative:false
                }
            },options.navigationOptions)),
            new OpenLayers.Control.ZoomBox(OpenLayers.Util.extend({
                title:'olControlZoomBox.title'
            },options.zoomBoxOptions))
        ]);
        this.defaultControl= this.controls[0];
    },

    /**
     * Method: draw
     * calls the default draw, and then activates mouse defaults.
     */
    draw: function() {
        Geoportal.Control.Panel.prototype.draw.apply(this, arguments);
        this.activateControl(this.controls[0]);
        return this.div;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.NavToolbar"*
     */
    CLASS_NAME: "Geoportal.Control.NavToolbar"
});
