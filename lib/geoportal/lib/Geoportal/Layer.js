/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/**
 * Class: Geoportal.Layer
 * The Geoportal framework layer base class
 *
 * Inherits from:
 * - <OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>
 */
Geoportal.Layer= OpenLayers.Class( OpenLayers.Layer, {

    /**
     * APIMethod: clone
     *
     * Parameters:
     * obj - {<Geoportal.Layer>} The layer to be cloned
     *
     * Returns:
     * {<Geoportal.Layer>} An exact clone of this <Geoportal.Layer>
     */
    clone: function (obj) {

        if (obj == null) {
            obj = new Geoportal.Layer(this.name, this.getOptions());
        }

        //get all additions from superclasses
        obj = OpenLayers.Layer.prototype.clone.apply(this, [obj]);

        // copy/set any non-init, non-simple values here

        return obj;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Layer"*
     */
    CLASS_NAME:"Geoportal.Layer"
});

/**
 * APIFunction: onPreAddLayer
 *
 * Parameters:
 * evt - {Event} the "preaddlayer" event
 *      Context: baseLayer listening the event. The 'layer' property
 *      contains the layer to add.
 */
Geoportal.Layer.onPreAddLayer= function(evt) {
    if (evt==null) { return; }
    if (evt.layer==null) { return; }
    if (evt.layer.isBaseLayer) { return; }
    // save visibility and transparency :
    if (evt.layer.getCompatibleProjection(this)!==null) {
        if (!evt.layer.savedStates[this.id]) {
            evt.layer.savedStates[this.id]= {};
        }
        evt.layer.savedStates[this.id].visibility= !!evt.layer.visibility;
        if (evt.layer.opacity!=undefined) {
            evt.layer.savedStates[this.id].opacity= evt.layer.opacity;
        }
    }
};

