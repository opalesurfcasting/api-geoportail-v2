/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 * @requires Geoportal/UI/Panel.js
 */
/**
 * Class: Geoportal.Control.Panel
 * The Geoportal panel class.
 *      Its differs from <OpenLayers.Control.Panel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Panel-js.html> with the handling of the
 *      "controlactivated" event and correct a bug under IE for complex panel.
 *
 * Inherits from:
 *  - {<OpenLayers.Control.Panel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Panel-js.html>}
 */
Geoportal.Control.Panel = OpenLayers.Class( OpenLayers.Control.Panel, {

    /**
     * Property: uis
     * {Array(String)} List of supported UI classes.  Add to this list to
     * add support for additional uis. This list is ordered :
     * the first ui which returns true for the  'supported()'
     * method will be used, if not defined in the 'ui' option.
     */
    uis: ["Geoportal.UI.Panel"],

    /**
     * Constructor: Geoportal.Control.Panel
     * Create a new control panel.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     */
    initialize: function(options) {
        Geoportal.Control.prototype.initialize.apply(this, [options]);
        this.controls = [];
        this.activeState = {};
    },

    /**
     * APIMethod: destroy
     * Stop observing events and delete inner controls.
     */
    destroy: function() {
        OpenLayers.Control.Panel.prototype.destroy.apply(this, arguments);
    },

    /**
     * APIMethod: activate
     * 
     * Returns:
     * {Boolean}  True if the control was successfully activated or
     *            false if the control was already active.
     */
    activate: function() {
        if (OpenLayers.Control.prototype.activate.apply(this, arguments)) {
            if (this.map) {
                this.map.events.on({
                    "controlactivated":this.onActivateControl,
                    scope:this
                });
            }
            if (this.controls) {
                var control;
                for (var i= 0, len= this.controls.length; i<len; i++) {
                    control= this.controls[i];
                    if (control === this.defaultControl ||
                        (this.saveState && this.activeState[control.id])) {
                        control.activate();
                    }
                }
            }
            if (this.saveState === true) {
                this.defaultControl = null;
            }
            this.redraw();
            return true;
        } else {
            return false;
        }
    },

    /**
     * APIMethod: deactivate
     * 
     * Returns:
     * {Boolean} True if the control was effectively deactivated or false
     *           if the control was already inactive.
     */
    deactivate: function() {
        if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
            if (this.controls) {
                var control;
                for (var i= 0, len= this.controls.length; i<len; i++) {
                    control= this.controls[i];
                    this.activeState[control.id] = control.deactivate();
                }
            }
            if (this.map) {
                this.events.un({
                    "controlactivated":this.onActivateControl,
                    scope:this
                });
            }
            return true;
        } else {
            return false;
        }
    },

    /**
     * Method: redraw
     * Display the panel.
     */
    redraw: function() {
        if (this.active) {
            OpenLayers.Control.Panel.prototype.redraw.apply(this,arguments);
            this.div.style.display= 'block';//ensure visible
        }
    },

    /**
     * APIMethod: onActivateControl
     * Call when activateControl() method is called by a panel.
     *      Allow to desactivate controls which can be usefull to prevent
     *      multiple controls to handle unexpected events.
     *
     * Parameters:
     * object - {Object} Object with a panel property referencing the
     *     panel having triggered the event.
     *
     * Returns:
     * {Boolean} true when controls have been deactivated, false otherwise.
     */
    onActivateControl: function(object) {
        if (!this.controls) { return true; }
        for (var i= 0, len= this.controls.length; i<len; i++) {
            var cntrl= this.controls[i];
            // don't deactivate the control that has issued the event :
            if (cntrl == object.control) {
                continue;
            }
            if (cntrl.type == OpenLayers.Control.TYPE_BUTTON) {
                continue;
            }
            if (cntrl.type == OpenLayers.Control.TYPE_TOGGLE &&
                (cntrl instanceof Geoportal.Control.PanelToggle)) {
                continue;
            }
            // active without type or
            // OpenLayers.Control.TYPE_TOGGLE or
            // OpenLayers.Control.TYPE_TOOL :
            // desactivation
            cntrl.deactivate();
        }
        return true;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.Panel"*
     */
    CLASS_NAME: "Geoportal.Control.Panel"
});
