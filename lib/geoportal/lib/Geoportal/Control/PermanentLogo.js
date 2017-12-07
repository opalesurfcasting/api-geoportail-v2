/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 * @requires Geoportal/Util.js
 */
/**
 * Class: Geoportal.Control.PermanentLogo
 * The Geoportal logo class.
 * Allow to add permanent logo on the map
 *
 * Inherits from:
 * - {<Geoportal.Control>}
 */
Geoportal.Control.PermanentLogo= OpenLayers.Class( Geoportal.Control, {

    /**
     * APIProperty: permaLogo
     * {String} The path to the image.
     */
    permaLogo: null,

    /**
     * APIProperty: permaURL
     * {String} The URL the logo is pointing at.
     */
    permaURL: null,

    /**
     * Constructor: Geoportal.Control.PermanentLogo
     * Build the control.
     *
     * Parameters:
     * options - {DOMElement} Options for control.
     */
    initialize: function(options) {
        Geoportal.Control.prototype.initialize.apply(this, arguments);
        if (!this.permaLogo) {
            this.permaLogo= Geoportal.Util.getImagesLocation()+'logo_gp.gif';
//            this.permaLogo= Geoportal.Util.getImagesLocation()+'logo_geo_api_contour_blanc_1px.png';
//            this.permaLogo= Geoportal.Util.getImagesLocation()+'logo_geoportail_api.gif';
        }
        if (!this.permaURL) {
            this.permaURL= 'http://www.geoportail.fr/';
        }
    },

    /**
     * APIMethod: destroy
     * Unregister events and delete control
     */
    destroy: function() {
        this.map.events.unregister("changebaselayer", this, this.changeBaseLayer);
        this.map.events.unregister("preaddlayer", this, this.onGeoportalLayer);
        this.map.events.unregister("changelayer", this, this.changeBaseLayer);

        Geoportal.Control.prototype.destroy.apply(this, arguments);
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
        if (this.permaURL!=null) {
            var aLogo= OpenLayers.getDoc().createElement("a");
            aLogo.setAttribute("href", this.permaURL);
            aLogo.setAttribute("target", "_blank");
            this.div.appendChild(aLogo);
        }
        if (this.hasGeoportalLayers()) {
            this.div.style.display= 'block';
        } else {
            this.div.style.display= 'none';
        }
        return this.div;
    },

    /**
     * Method: onGeoportalLayer
     * Checks if the given layer is a Geoportal's layer to make the logo
     * visible.
     *
     * Parameters:
     * evt - {<Event>} the "preaddlayer" event.
     *      Context:
     *      layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the pre-added layer.
     */
    onGeoportalLayer: function(evt) {
        if (!(this.div.style.display=='none')) { return; }
        if (!evt) { return; }
        if (!evt.layer) { return; }
        var lyr= evt.layer;
        //if (lyr.isBaseLayer) { return; }
        if (!lyr.visibility) { return; }
        //FIXME: GPP3, how to detect Geoportal layer's ?
        //FIXME: let's relax test on instanceof ...
        if (lyr.GeoRM/* && (lyr.GeoRM instanceof Geoportal.GeoRMHandler.Updater)*/) {
            this.div.style.display= 'block';
        }
    },

    /**
     * Method: hasGeoportalLayers
     * Checks if the current map contains at least one Geoportal layer.
     *
     * Returns:
     * {Boolean} true if the current map has a Geoportal layer displayed or is
     * empty, false otherwise.
     */
    hasGeoportalLayers: function() {
        if (!this.map) { return false; }
        for (var i= 0, l= this.map.layers.length; i<l; i++) {
            var lyr= this.map.layers[i];
            //if (lyr.isBaseLayer) { continue; }
            if (!lyr.visibility) { continue; }
            //FIXME: GPP3, how to detect Geoportal layer's ?
            //FIXME: let's relax test on instanceof ...
            if (lyr.GeoRM/* && (lyr.GeoRM instanceof Geoportal.GeoRMHandler.Updater)*/) {
                return true;
            }
        }
        return (this.map.layers.length==0);
    },

    /**
     * APIMethod: setMap
     * Set map and register events
     *
     * Parameters:
     * map - {OpenLayers.Map}
     */
    setMap: function() {
        Geoportal.Control.prototype.setMap.apply(this, arguments);

        this.map.events.register('preaddlayer', this, this.onGeoportalLayer);
        this.map.events.register("changebaselayer", this, this.changeBaseLayer);
        this.map.events.register("changelayer", this, this.changeBaseLayer);
        this.map.events.register("controlvisibilitychanged", this, this.onVisibilityChanged);
    },

    /**
     * APIMethod: changeBaseLayer
     * Display or hide Geoportal permanent logo.
     *
     * Parameters:
     * evt - {Event} "changebaselayer" , "changelayer" events.
     *
     * Context:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the new baseLayer
     */
    changeBaseLayer: function(evt) {
        if (!evt) { return; }
        if (evt.type=='changelayer' && evt.property!='visibility') { return; }
        if (this.hasGeoportalLayers()) {
            this.div.style.display= 'block';
        } else {
            this.div.style.display= 'none';
        }
    },

    /**
     * Method: onVisibilityChanged
     * Move the control if necessary on "controlvisibilitychanged" event.
     *
     * Parameters:
     * e - {Event}
     */
    onVisibilityChanged: function(e) {
        if (!e || !e.size) { return; }
        var f= (e.visibility? 1:-1);
        var b= this.bottom;
        if (!b) {
            b= (e.visibility? Geoportal.Util.getComputedStyle(this.div, 'bottom', true): 0);
        }
        this.bottom= b+f*e.size.h;
        this.div.style['bottom']= this.bottom+'px';
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.PermanentLogo"*
     */
    CLASS_NAME: "Geoportal.Control.PermanentLogo"
});
