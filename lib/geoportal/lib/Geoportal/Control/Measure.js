/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/**
 * @requires Geoportal/Control/Form.js
 */
/**
 * Class: Geoportal.Control.Measure
 * Allows for drawing of features for measurements.
 *
 * Inherits from:
 *  - <Geoportal.Control.Form>
 */
Geoportal.Control.Measure= OpenLayers.Class( OpenLayers.Control.Measure, Geoportal.Control.Form, {

    /**
     * Property: geodesic
     * {Boolean} Calculate geodesic metrics instead of planar metrics.  This
     *     requires that geometries can be transformed into Geographic/WGS84
     *     (if that is not already the map projection).  Default is true.
     */
    geodesic: true,

    /**
     * Constructor: Geoportal.Control.Measure
     *
     * Parameters:
     * handler - {<Geoportal.Handler>}
     * options - {Object}
     */
    initialize: function(handler, options) {
        Geoportal.Control.Form.prototype.initialize.apply(this, [options]);
        this.callbacks = OpenLayers.Util.extend(
            {done: this.measureComplete, point: this.measurePartial},
            this.callbacks
        );

        // let the handler options override, so old code that passes 'persist'
        // directly to the handler does not need an update
        this.handlerOptions = OpenLayers.Util.extend(
            {persist: this.persist}, this.handlerOptions
        );
        this.handler= new handler(this, this.callbacks, this.handlerOptions);
        this.needsForm= (this.targetElement==null);
    },

    /**
     * Method: activate
     * Do the addition via a form.
     *      The form is as follows :
     *
     * (start code)
     * <form id='__addopanel__{#Id}' name='__addopanel__{#Id}'
     * action='javascript:void(null)'>
     * </form>
     * (end)
     *
     * Returns:
     * {Boolean}  True if the control was successfully activated or
     *            false if the control was already active.
     */
    activate: function() {
        if (!Geoportal.Control.Form.prototype.activate.apply(this,arguments)) {
            return false;
        }
        if (this.needsForm===true) {
            var f= this.div.ownerDocument.createElement('form');
            f.id= '__addopanel__' + this.id;
            f.name= f.id;
            f.action= 'javascript:void(null)';
            this.addOutputPanel(f);
            this.map.addControl(this.formControl);
            this.formControl.activate();
            this.formControl.addContent(f);
        }
        return true;
    },

    /**
     * Method: deactivate
     * Terminate and clean the form.
     *
     * Returns:
     * {Boolean}  True if the control was successfully deactivated or
     *            false if the control was already inactive.
     */
    deactivate: function() {
        if (this.needsForm===true) {
            this.targetElement= null;
        }
        return Geoportal.Control.Form.prototype.deactivate.apply(this,arguments);
    },

    /**
     * Method: addOutputPanel
     * Build the form and add the specified fields for the measurement.
     * Should be overridden by sub-classes.
     *
     * Parameters:
     * form - {DOMElement} the HTML form.
     */
    addOutputPanel: function(form) {
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.Measure"*
     */
    CLASS_NAME:"Geoportal.Control.Measure"
});
