/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 */
/**
 * Class: Geoportal.Control.Copyright
 * Display a (c)opyright !
 *
 * The control's structure is as follows :
 *
 * (start code)
 * <div id='#{id}' class='gpControlCopyright'>&copy; xxx</div>
 * (end)
 *
 * Inherits from:
 *  - {<Geoportal.Control>}
 */
Geoportal.Control.Copyright=
    OpenLayers.Class( Geoportal.Control, {

    /**
     * APIProperty: copyright
     * {String} The text behind (c).
     */
    copyright: null,

    /**
     * Constructor: Geoportal.Control.Copyright
     * Build the control.
     *
     * Parameters:
     * options - {DOMElement} Options for control.
     */
    initialize: function(options) {
        Geoportal.Control.prototype.initialize.apply(this, arguments);
        if (!this.copyright) {
            this.copyright= '&copy; IGN';
        }
    },

    /**
     * APIMethod: redraw
     * Clear the div and start over.
     */
    redraw: function() {
        if (this.div) {
            this.div.innerHTML= OpenLayers.i18n(this.copyright);
        }
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
        Geoportal.Control.prototype.draw.apply(this,arguments);
        this.redraw();

        return this.div;
    },

    /**
     * APIMethod: changeLang
     * Assigns the current language
     *
     * Parameters:
     * evt - {<OpenLayers.Event at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Event-js.html>} event fired
     *               evt.lang holds the new language
     */
    changeLang: function(evt) {
        this.redraw();
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.Copyright"*
     */
    CLASS_NAME: "Geoportal.Control.Copyright"
});
