/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 */
/**
 * Class: Geoportal.Control.RemoveLayer
 * Implements a button control for removing the layer for the map. Designed
 * to be used with a <Geoportal.Control.Panel>.
 *
 * The control is displayed through <OpenLayers.Control.Panel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Panel-js.html> by using the
 * displayClass of the control : gpControlRemoveLayer. Two effective styles are
 * connected with this : gpControlRemoveLayerItemActive and
 * gpControlRemoveLayerItemInactive.
 *
 * Inherits from:
 *  - <Geoportal.Control>
 */
Geoportal.Control.RemoveLayer= OpenLayers.Class(Geoportal.Control, {

    /**
     * Property: type
     * {String} The type of <Geoportal.Control> -- When added to a
     *     <Control.Panel>, 'type' is used by the panel to determine how to
     *     handle our events.
     */
    type: OpenLayers.Control.TYPE_BUTTON,

    /**
     * APIProperty: layer
     * {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the controlled layer
     */
    layer: null,

    /**
     * Property: removable
     * {Boolean} true when the layer can be drop off the map, false otherwise.
     *      Defaults to *false*
     */
    removable: false,

    /**
     * Constructor: Geoportal.Control.RemoveLayer
     * Build a removal button.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} layer to remove.
     * options - {Object} any options usefull for control.
     */
    initialize: function(layer, options) {
        Geoportal.Control.prototype.initialize.apply(this, [options]);
        this.layer= layer;
        this.removable= this.layer.view && this.layer.view.drop;
        if (!this.removable) {
            this.setDisplayClass('gpControlRemoveLayerNone');
            this.setTitle=('');
        } else {
            this.setTitle(this.getTitle() || this.getDisplayClass()+'.title');
        }
    },

    /**
     * Method: trigger
     * Do the removal.
     */
    trigger: function() {
        if (this.removable && this.layer && this.layer.map) {
            if (this.layer.features) {
                this.layer.destroyFeatures(this.layer.features.slice());//use a copy to force deletion of features
            }
            this.layer.map.removeLayer(this.layer);
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
        if (this.removable) {
            Geoportal.Control.prototype.changeLang.apply(this,arguments);
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.RemoveLayer"*
     */
    CLASS_NAME: "Geoportal.Control.RemoveLayer"
});
