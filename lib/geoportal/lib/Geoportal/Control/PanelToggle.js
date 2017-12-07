/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/Panel.js
 */
/**
 * Class: Geoportal.Control.PanelToggle
 * Implements a button control for showing/hidding the panel containing the
 * control. Designed to be used with a <Geoportal.Control.Panel>.
 *
 * The control is displayed through <OpenLayers.Control.Panel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Panel-js.html> by using the
 * displayClass of the control : gpControlPanelToggle. Two effective styles are
 * connected with this : gpControlPanelToggleItemActive and
 * gpControlPanelToggleItemInactive.
 *
 * Inherits from:
 *  - <Geoportal.Control>
 */
Geoportal.Control.PanelToggle= OpenLayers.Class(Geoportal.Control, {

    /**
     * Property: type
     * {String} The type of <Geoportal.Control>.
     *     Defaults to *OpenLayers.Control.TYPE_TOGGLE*
     */
    type: OpenLayers.Control.TYPE_TOGGLE,

    /**
     * APIProperty: panel
     * {<OpenLayers.Control.Panel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Panel-js.html>} the panel this control shows/hides.
     */
    panel: null,

    /**
     * Property: panelVisibility
     * {Boolean} true the panel is shown, false it is not displayed.
     *      Defaults to *false*
     */
    panelVisibility: false,

    /**
     * Constructor: Geoportal.Control.PanelToggle
     * Build a panel displaying switch.
     *
     * Parameters:
     * panel - {<OpenLayers.Control.Panel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Panel-js.html>} panel containing this control.
     * options - {Object} any options usefull for control.
     */
    initialize: function(panel, options) {
        Geoportal.Control.prototype.initialize.apply(this, [options]);
        this.panel= panel;
        // push visibility into the panel :
        this.panel.panelVisibility= this.panelVisibility;
        this.panel.redraw= function() {
            if (this.controls) {
                for (var i= 0, len= this.controls.length; i<len; i++) {
                    var cntrl= this.controls[i];
                    var isToggle= (cntrl instanceof Geoportal.Control.PanelToggle);
                    var element= cntrl.getUI().getDom();
                    if (element) {
                        if (element.parentNode) {
                            element= element.parentNode.removeChild(element);
                        }
                        if (this.active) {
                            if (cntrl.active===true) {
                                element.className = cntrl.getDisplayClass() + "ItemActive olButton";
                            } else {
                                element.className = cntrl.getDisplayClass() + "ItemInactive olButton";
                            }
                            if (isToggle) {
                                if (this.panelVisibility) {
                                    element.title= OpenLayers.i18n(cntrl.getDisplayClass()+'.opened');
                                } else {
                                    element.title= OpenLayers.i18n(cntrl.getDisplayClass()+'.closed');
                                }
                            }
                            this.getUI().getDom().appendChild(element);
                            if (!isToggle && this.map) {
                                if (this.panelVisibility) {
                                    element.style.display= 'block';
                                } else {
                                    element.style.display= 'none';
                                }
                            }
                        }
                    }
                }
            }
            if (!this.active && this.getUI()) {
                // ui might be null due to a previous destroy ...
                this.getUI().reset();
            }
        };
        this.panel.activateControl= function(control) {
            if (!this.active) { return false; }
            if (control.type == OpenLayers.Control.TYPE_BUTTON) {
                control.trigger();
                this.redraw();
                return;
            }
            if (control.type == OpenLayers.Control.TYPE_TOGGLE) {
                if (control.active) {
                    control.deactivate();
                } else {
                    if (!(control instanceof Geoportal.Control.PanelToggle) &&
                        this.map) {
                        this.map.events.triggerEvent("controlactivated",{control:control});
                    }
                    control.activate();
                }
                this.redraw();
                return;
            }
            for (var i= 0, len= this.controls.length; i<len; i++) {
                if (this.controls[i] != control) {
                    if (this.controls[i].type != OpenLayers.Control.TYPE_TOGGLE) {
                        this.controls[i].deactivate();
                    }
                }
            }

            // trigger special event :
            if (this.map) {
                this.map.events.triggerEvent("controlactivated",{control:control});
            }
            control.activate();
        };
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
        this.redraw();
        return this.div;
    },

    /**
     * Method: redraw
     * Show or hide controls of the parent panel.
     */
    redraw: function() {
        if (this.panelVisibility) {
            this.setClass(this.getDisplayClass() + 'ItemActive olButton');
            this.setTitle(OpenLayers.i18n(this.getDisplayClass()+'.opened'));
        } else {
            this.setClass(this.getDisplayClass() + 'ItemInactive olButton');
            this.setTitle(OpenLayers.i18n(this.getDisplayClass()+'.closed'));
        }
    },

    /**
     * Method: activate
     * Show the control.
     *
     * Returns:
     * {Boolean} true if activation succeeded, false otherwise.
     */
    activate: function() {
        if (this.active) {
            return false;
        }
        if (this.handler) {
            this.handler.activate();
        }
        this.active= true;
        this.panelVisibility= this.panel.panelVisibility= true;
        this.events.triggerEvent("activate");
        return true;
    },

    /**
     * Method: deactivate
     * Hide the control.
     *
     * Returns:
     * {Boolean} true if activation succeeded, false otherwise.
     */
    deactivate: function() {
        if (!this.active) {
            return false;
        }
        if (this.handler) {
            this.handler.deactivate();
        }
        this.active= false;
        this.panelVisibility= this.panel.panelVisibility= false;
        this.events.triggerEvent("deactivate");
        return true;
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
        if (this.panelVisibility) {//FIXME
            this.div.title= OpenLayers.i18n(this.getDisplayClass()+'.opened');
        } else {
            this.div.title= OpenLayers.i18n(this.getDisplayClass()+'.closed');
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.PanelToggle"*
     */
    CLASS_NAME: "Geoportal.Control.PanelToggle"
});
