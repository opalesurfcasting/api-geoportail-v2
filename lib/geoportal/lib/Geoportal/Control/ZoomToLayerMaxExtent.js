/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 */
/**
 * Class: Geoportal.Control.ZoomToLayerMaxExtent
 * Implements a button control for zoom to the max extent of the attached
 * layer. Designed to be used with a <Geoportal.Control.Panel>.
 *
 * The control is displayed through <OpenLayers.Control.Panel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Panel-js.html> by using the
 * displayClass of the control : gpControlZoomToLayerMaxExtent. Two effective
 * styles are connected with this : gpControlZoomToLayerMaxExtentItemActive
 * and gpControlZoomToLayerMaxExtentItemInactive.
 *
 * Inherits from:
 *  - <Geoportal.Control>
 */
Geoportal.Control.ZoomToLayerMaxExtent= OpenLayers.Class(Geoportal.Control, {

    /**
     * Property: type
     * {String} The type of <Geoportal.Control> -- When added to a
     *     <Control.Panel>, 'type' is used by the panel to determine how to
     *     handle our events.
     */
    type: OpenLayers.Control.TYPE_BUTTON,

    /**
     * Property: visible
     * {Boolean} true the control is shown, false it is not displayed.
     *      Defaults to *true*
     */
    visible: true,

    /**
     * APIProperty: layer
     * {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the controlled layer
     */
    layer: null,

    /**
     * Property: zoomable
     * {Boolean} true when the layer can be zoomed, false otherwise.
     *      Defaults to *false*
     */
    zoomable: false,

    /**
     * Constructor: Geoportal.Control.ZoomToLayerMaxExtent
     * Build a zoom button.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} layer to zoom
     * options - {Object} any options usefull for control.
     */
    initialize: function(layer, options) {
        Geoportal.Control.prototype.initialize.apply(this, [options]);
        this.layer= layer;
        this.zoomable= this.layer.view && this.layer.view.zoomToExtent;
        if (!this.zoomable) {
            this.setDisplayClass('gpControlZoomToLayerMaxExtentNone');
            this.setTitle('');
        } else {
            this.setTitle(this.getTitle() || this.getDisplayClass()+'.title');
        }
    },

    /**
     * Method: trigger
     * Do the zoom.
     */
    trigger: function() {
        if (this.zoomable && this.layer && this.layer.map) {
            var mx= this.layer.getDataExtent();
            if (mx) {
                // reduced to 1 point ?
                if (mx.getWidth()==0 || mx.getHeight()==0) {
                    this.layer.map.zoomTo(this.layer.minZoomLevel);
                } else {
                    this.layer.map.zoomToExtent(mx,true);
                }
            }
        }
    },

    /**
     * APIMethod: changeLang
     * Assigns the current language
     *
     * Parameters:
     * evt - {<OpenLayers.Event at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Event-js.html>} event fired.
     *      evt.lang holds the new language
     */
    changeLang: function(evt) {
        if (this.zoomable) {
            Geoportal.Control.prototype.changeLang.apply(this, arguments);
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.ZoomToLayerMaxExtent"*
     */
    CLASS_NAME: "Geoportal.Control.ZoomToLayerMaxExtent"
});
