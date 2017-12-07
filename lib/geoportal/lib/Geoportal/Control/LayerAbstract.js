/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 */
/**
 * Class: Geoportal.Control.LayerAbstract
 * Implements a control for displaying the layer's abstract.
 *
 * The control's structure is as follows :
 *
 * (start code)
 *   <div class="gpLayerAbstractDivClass">
 *     <p>#{layer.description[0]}</p>
 *     <p>#{layer.description[1]}</p>
 *   </div>
 * (end)
 *
 * Inherits from:
 * - {<Geoportal.Control>}
 */
Geoportal.Control.LayerAbstract=
    OpenLayers.Class( Geoportal.Control, {

    /**
     * APIProperty: layer
     * {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the layer the abstract is watched
     */
    layer: null,

    /**
     * Constructor: Geoportal.Control.LayerAbstract
     * Build the control
     *
     * Parameters:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the controlled layer.
     * options - {DOMElement} Options for control.
     */
    initialize: function(layer, options) {
        Geoportal.Control.prototype.initialize.apply(this, [options]);
        this.layer= layer;
        if (typeof(this.layer.description)=='string') {
            this.layer.description= [this.layer.description];
        } else {
            this.layer.description= [] ;
        }
    },

    /**
     * APIMethod: destroy
     * Unregister events and delete control
     */
    destroy: function() {
        Geoportal.Control.prototype.destroy.apply(this, arguments);
        this.layer= null;
    },

    /**
     * APIMethod: draw
     * Call the default draw, and then draw the control.
     *
     * Parameters:
     * px - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} the position where to draw the control.
     *
     * Returns:
     * {DOMElement} the control's div.
     */
    draw: function(px) {
        Geoportal.Control.prototype.draw.apply(this, arguments);
        for (var i= 0, l= this.layer.description.length; i<l; i++) {
            var desc= this.layer.description[i];
            this.div.innerHTML+= '<p>' + OpenLayers.i18n(desc) + '</p>';
        }
        return this.div;
    },

    /**
     * APIMethod: changeLang
     * Assigns the current language
     *
     * Parameters:
     * evt - {Event} event fired.
     *      evt.lang holds the new language
     */
    changeLang: function(evt) {
        Geoportal.Control.prototype.changeLang.apply(this,arguments);
        this.div.innerHTML = '';
        for (var i= 0, l= this.layer.description.length; i<l; i++) {
            var desc= this.layer.description[i];
            this.div.innerHTML+= '<p>' + OpenLayers.i18n(desc) + '</p>';
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.LayerAbstract"*
     */
    CLASS_NAME: "Geoportal.Control.LayerAbstract"
});
