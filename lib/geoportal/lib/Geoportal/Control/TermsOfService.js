/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 * @requires Geoportal/Lang.js
 */
/**
 * Class: Geoportal.Control.TermsOfService
 * The Geoportal Terms of service class.
 * Allow to add a text pointing at a url on the map
 *
 * Inherits from:
 * - {<Geoportal.Control>}
 */
Geoportal.Control.TermsOfService= OpenLayers.Class( Geoportal.Control, {

    /**
     * APIProperty: tosLabel
     * {String} the text of the terms of service.
     */
    tosLabel: null,

    /**
     * APIProperty: tosURL
     * {String} The URL the terms of service is pointing at.
     *      Defaults to *'
     */
    tosURL: null,

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
        this.updateTermsOfService();
        return this.div;
    },

    /**
     * Method: updateTermsOfService
     * Fill the control's div.
     */
    updateTermsOfService: function() {
        if (this.div.childNodes.length>0) {
            this.div.removeChild(this.div.childNodes[0]);
        }
        if (this.tosLabel==null) { this.tosLabel= 'TOS'; }
        if (this.tosURL==null) { this.tosURL= 'http://www.geoportail.gouv.fr/depot/api/cgu/licAPI_CGUF.pdf'; }
        var t= OpenLayers.i18n(this.tosLabel);
        var aTOS= this.div.ownerDocument.createElement("a");
        aTOS.setAttribute("href", this.tosURL);
        aTOS.setAttribute("alt", t);
        aTOS.setAttribute("title", t);
        aTOS.setAttribute("target", "_blank");
        aTOS.appendChild(this.div.ownerDocument.createTextNode(t));
        this.div.appendChild(aTOS);
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

        this.map.events.register("controlvisibilitychanged", this, this.onVisibilityChanged);
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
        var b= Geoportal.Util.getComputedStyle(this.div, 'bottom', true);
        b= b+f*e.size.h;
        this.div.style['bottom']= b+'px';
    },

    /**
     * APIMethod: changeLang
     * Assign the current language.
     *
     * Parameters:
     * evt - {Event} event fired.
     *      evt.lang holds the new language
     */
    changeLang: function(evt) {
        this.updateTermsOfService();
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.TermsOfService"*
     */
    CLASS_NAME: "Geoportal.Control.TermsOfService"
});
