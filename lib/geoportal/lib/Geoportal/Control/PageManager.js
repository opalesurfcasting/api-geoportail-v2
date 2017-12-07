/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/**
 * Class: Geoportal.Control.PageManager
 * Control for handling a caroussel.
 *      Still experimental.
 *
 * Inherits from:
 * - <Geoportal.Control>
 */
Geoportal.Control.PageManager= OpenLayers.Class( Geoportal.Control, {

    /**
     * Property: previousButton
     * {DOMElement}
     */
    previousButton: null,

    /**
     * Property: nextButton
     * {DOMElement}
     */
    nextButton: null,

    /**
     * Property: currentPage
     * {Integer} current page number
     */
    currentPage: 1,

    /**
     * APIProperty: callback
     * {Function} function to be called on page changes.
     */
    callback: null,

    /**
     * APIProperty: nbPages
     * {Integer} total number of pages
     */
    nbPages: 0,

    /**
     * APIProperty: control
     * {<OpenLayers.Control>} the control that uses this page manager
     */
    control: null,

    /**
     * Constructor: Geoportal.Control.PageManager
     * Utility control for managing consultation of several pages.
     *
     * Parameters:
     * ctrl - {<OpenLayers.Control>} the control that uses this page manager.
     * nbPages - {Integer} total number of pages.
     * callback - {Function} callback function called on page changes.
     * options - {Object} options to build this control.
     */
    initialize: function(ctrl, nbPages, callback, options) {
        Geoportal.Control.prototype.initialize.apply(this, [options]);
        this.control= ctrl;
        this.nbPages= nbPages;
        this.callback= callback;
    },

    /**
     * APIMethod: destroy
     * Clean the control.
     */
    destroy: function() {
        Geoportal.Control.prototype.destroy.apply(this, arguments);
    },

    /**
     * APIMethod: setMap
     * Register events and set the map.
     *
     * Parameters:
     * map - {<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>}
     */
    setMap: function(map) {
        Geoportal.Control.prototype.setMap.apply(this, arguments);
    },

    /**
     * Method: activate
     * Build an empty floating form.
     *      Its title is composed of the displayClass concatenated with
     *      '.title'.
     *
     * Returns:
     * {Boolean} True if the control was successfully activated or
     * false if the control was already active.
     */
    activate: function() {
        if (Geoportal.Control.prototype.activate.apply(this, arguments)) {
            this.displayDiv();
            return true;
        }
        return false;
    },

    /**
     * Method: displayDiv
     * Build the result page.
     */
    displayDiv : function() {
        var div= this.div.ownerDocument.createElement('div');
        div.id= "PageManager" + this.id;
        div.className= "gpPages";

        var span= this.div.ownerDocument.createElement('span');
        this.previousButton= this.buildButton(span,'previous',this.callback);
        OpenLayers.Event.observe(
                this.previousButton,
                "click",
                OpenLayers.Function.bind(this.previousPage,this,this.previousButton)
            );
        this.previousButton.disabled= (this.currentPage == 1);

        var s= this.div.ownerDocument.createElement('span');
        s.id= "label" + this.id;
        s.innerHTML=  this.currentPage + " /" + this.nbPages;
        span.appendChild(s);

        this.nextButton= this.buildButton(span,'next', this.callback);
        OpenLayers.Event.observe(
                this.nextButton,
                "click",
                OpenLayers.Function.bind(this.nextPage,this,this.nextButton)
            );
        this.nextButton.disabled= (this.currentPage == this.nbPages);

        div.appendChild(span);
        this.div.appendChild(div);
    },

    /**
     * Method: previousPage
     * Build the previous page result
     */
    previousPage : function() {
        this.currentPage= this.currentPage - 1;
        this.previousButton.disabled= (this.currentPage == 1);
        this.nextButton.disabled= false;
        OpenLayers.Util.getElement('label' + this.id).innerHTML= this.currentPage + " /" + this.nbPages;
    },

    /**
     * Method: nextPage
     * Build the next page result
     */
    nextPage: function() {
        this.currentPage= this.currentPage + 1;
        this.nextButton.disabled= (this.currentPage == this.nbPages);
        this.previousButton.disabled= false;
        OpenLayers.Util.getElement('label' + this.id).innerHTML= this.currentPage + " /" + this.nbPages;
    },

    /**
     * APIMethod: deactivate
     * Terminate and clean the form.
     *
     * Returns:
     * {Boolean}  True if the control was successfully deactivated or
     *            false if the control was already inactive.
     */
    deactivate: function() {
        if (Geoportal.Control.prototype.deactivate.apply(this, arguments)) {
            this.div.ownerDocument.getElementById("PageManager" + this.id).innerHTML= "";
            return true;
        }
        return false;
    },

    /**
     * APIMethod: buildButton
     * build on button with click event
     *
     *Parameters:
     * div - {<DOMElement>} div where adding the button
     * label - {String>} label of the button
     * buttonCb - {<DOMElement>} event on clicking the button
     *
     * Returns:
     * {DOMElement} the button
     */
    buildButton: function(div,label,buttonCb) {
        var e;

        e= this.div.ownerDocument.createElement('input');
        e.className= this.getDisplayClass()+'Button';
        e.type= 'button';
        e.id= label + this.id;
        e.name= e.id;
        e.value= OpenLayers.i18n(this.getDisplayClass()+'.button.'+label);
        if (buttonCb) {
            OpenLayers.Event.observe(
                e,
                "click",
                OpenLayers.Function.bind(buttonCb,this,e)
            );
        }
        div.appendChild(e);

        return e;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.PageManager"*
     */
    CLASS_NAME:"Geoportal.Control.PageManager"
});
