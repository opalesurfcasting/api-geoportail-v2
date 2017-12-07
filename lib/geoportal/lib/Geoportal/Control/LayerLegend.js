/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 */
/**
 * Class: Geoportal.Control.LayerLegend
 * Implements a control for displaying the layer's legend.
 *
 * Inherits from:
 * - {<Geoportal.Control>}
 */
Geoportal.Control.LayerLegend= OpenLayers.Class( Geoportal.Control, {

    /**
     * APIProperty: layer
     * {<OpenLayers.Layer>} the layer the legend is watched
     */
    layer: null,

    /**
     * Constructor: Geoportal.Control.LayerLegend
     * Build the control.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer>} the controlled layer.
     * options - {Object} Options for control.
     */
    initialize: function(layer, options) {
        Geoportal.Control.prototype.initialize.apply(this, [options]);
        this.layer= layer;
    },

    /**
     * Method: updateLegends
     * Update the legend images for the current map zoom level.
     */
    updateLegends: function(){
        this.div.innerHTML = '';
        var legends = this.getLegends();
        var doc= this.div.ownerDocument;
        for (var i=0, l=legends.length; i<l; i++) {
            var legend= legends[i];
            var img= doc.createElement("img");
            img.id= 'legend_' + legend.style + '_' + this.layer.id;
            img.src= legend.href.replace(/&amp;/g,'&');
            if (legend.width && legend.height && legend.width!=-1 && legend.height!=-1) {
                img.width= legend.width;
                img.height= legend.height;
            }
            img.alt= OpenLayers.i18n(legend.title || this.layer.name);
            img.title= OpenLayers.i18n(legend.title || this.layer.name);
            img.vspace= img.hspace= 0;
            this.div.appendChild(img);
            if (i!=l-1) {
                this.div.appendChild(doc.createElement('br'));
            }
        }
    },
    
    /**
     * Method: setMap
     * Set the map property for the control.
     *
     * Parameters:
     * map - {<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>}
     */
    setMap: function(map) {
        Geoportal.Control.prototype.setMap.apply(this, arguments);
        this.map.events.register("zoomend", this, this.updateLegends);
        this.updateLegends();
    },

    /**
     * APIMethod: destroy
     * Unregister events and delete control
     */
    destroy: function() {
        this.map.events.unregister("zoomend", this, this.updateLegends);
        this.layer= null;
        Geoportal.Control.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: getLegends
     * 
     * Returns:
     * {Array(Object)} the valid legends for the current map zoom level
     */
    getLegends : function() {
        var mapDenom = OpenLayers.METERS_PER_INCH *
                    OpenLayers.INCHES_PER_UNIT[this.map.getUnits()] *
                    this.map.getResolution() / 0.28E-3;
        var result = [];
        var legends = this.layer.legends;
        for (var i=0, len=legends.length;i<len;i++) {
            var legend= legends[i];
            var isValid= false;
            if (legend.minScale) {
                if (legend.maxScale) {
                    isValid= (legend.maxScale < mapDenom && legend.minScale > mapDenom);
                } else {
                    isValid= (legend.minScale < mapDenom);
                }
            } else {
                if (legend.maxScale) {
                    isValid= (legend.maxScale < mapDenom);
                } else {
                    isValid= true;
                }
            }
            if (isValid) {
                result.push(legend);
            }
        }
        return result;
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
        this.updateLegends();
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.LayerLegend"*
     */
    CLASS_NAME: "Geoportal.Control.LayerLegend"
});
