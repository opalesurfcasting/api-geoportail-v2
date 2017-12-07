/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 */
/**
 * Class: Geoportal.Control.ToggleControl
 * Super-class for controls for which the content div can be shown/hidden (like
 * <Geoportal.Control.LayerSwitcher> or <Geoportal.Control.ToolBox>).
 *
 * Inherits from:
 *  - <Geoportal.Control>
 */
Geoportal.Control.ToggleControl = OpenLayers.Class(Geoportal.Control, {

    /**
     * Property: contentDiv
     * {DOMElement} the content div this control shows/hides
     */
    contentDiv: null,

    /**
     * Constructor: Geoportal.Control.ToggleControl
     * Build the toggle control
     *
     * Parameters:
     * options - {Object} Hashtable of options to set on the control
     *          Contains the contentDiv option.
     */
    initialize: function(options) {
        Geoportal.Control.prototype.initialize.apply(this, [options]);
    },

    /**
     * APIMethod: setContent
     * Assign the div this control shows/hides.
     *
     * Parameters:
     * div - {DOMElement} the div to monitor
     */
    setContent: function(div) {
        this.contentDiv= div;
    },

    /**
     * APIMethod: clickOnLabel
     * In case of double click on the label, open or close it.
     *
     * Parameters:
     * evt - {Event} the browser event
     */
    clickOnLabel: function(evt) {
        if (this.contentDiv != null) {
            var minimize= this.contentDiv.style.display == "block";
            this.showControls(minimize);
            this.ignoreEvent(evt);
        }
    },

    /**
     * APIMethod: setMap
     * Register events and set the map.
     *
     * Parameters:
     * map - {<OpenLayers.Map>}
     */
    setMap: function(map) {
        Geoportal.Control.prototype.setMap.apply(this, arguments);
    },

    /**
     * APIMethod: ignoreEvent
     * Stop the given event.
     *
     * Parameters:
     * evt - {Event} the browser event
     */
    ignoreEvent: function(evt) {
        if (evt!=null) {
            OpenLayers.Event.stop(evt,true);
        }
    },

    /**
     * APIMethod: maximizeControl
     * Show up the labels and divs for the control
     *
     * Parameters:
     * e - {<OpenLayers.Event at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Event-js.html>} the browser event
     */
    maximizeControl: function(e) {
        this.showControls(false);
        this.ignoreEvent(e);
    },

    /**
     * APIMethod: minimizeControl
     * Hide all the contents of the control, shrink the size,
     *     add the maximize icon
     *
     * Parameters:
     * e - {<OpenLayers.Event at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Event-js.html>} the browser event
     */
    minimizeControl: function(e) {
        this.showControls(true);
        this.ignoreEvent(e);
    },

    /**
     * APIMethod: showControls
     * Hide/Show all the contents of the control depending on whether we are
     *     minimized or not
     *
     * Parameters:
     * minimize - {Boolean}
     */
    showControls: function(minimize) {
        if (this.contentDiv) {
            this.contentDiv.style.display= minimize? "none" : "block";
        }
        this.map.events.triggerEvent("controlvisibilitychanged", {
            control:this,
            visibility:!minimize
        });
    },

    /**
     * APIMethod: mouseDown
     * Register a local 'mouseDown' flag so that we'll know whether or not
     *     to ignore a mouseUp event
     *
     * Parameters:
     * evt - {<OpenLayers.Event at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Event-js.html>} the browser event
     */
    mouseDown: function(evt) {
        this.isMouseDown= true;
        // this prevent select to work under Chrome !
        this.ignoreEvent(evt);
    },

    /**
     * APIMethod: mouseUp
     * If the 'isMouseDown' flag has been set, that means that the drag was
     *     started from within the LayerSwitcher control, and thus we can
     *     ignore the mouseup. Otherwise, let the Event continue.
     *
     * Parameters:
     * evt - {<OpenLayers.Event at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Event-js.html>} the browser event
     */
    mouseUp: function(evt) {
        if (this.isMouseDown) {
            this.isMouseDown= false;
            this.ignoreEvent(evt);
        }
    },

    /**
     * APIMethod: createInnerDiv
     * Create a div appended to the target.
     *
     * Parameters:
     * id - {String} div's identifier.
     * cn - {String} className value.
     * pElmt - {DOMElement} target parent container.
     * inner - {String} possible innerHTML string.
     *
     * Returns:
     * {DOMElement} the newly created div.
     */
    createInnerDiv: function(id,cn,pElmt,inner) {
        var d= (this.div? this.div.ownerDocument : OpenLayers.getDoc()).createElement('div');
        if (id) {
            d.id= id;
        }
        if (cn==null) {
            cn= '';
        }
        d.className= cn+' olControlNoSelect';
        //tests:
        //d.title= OpenLayers.Util.createUniqueID('title');
        if (inner) {
            d.innerHTML= inner;
        }
        pElmt.appendChild(d);

        return d;
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

        // create layout divs
        this.loadContents();

        // set mode to minimize
        if (!this.outsideViewport) {
            this.minimizeControl();
        }

        // populate div with current info
        this.redraw();

        return this.div;
    },

    /**
     * APIMethod: loadContents
     * Set up the labels and divs for the control.
     * DOM elements for the base layers are not created here.
     *      To be overriden by sub-classes.
     */
    loadContents: function() {
    },

    /**
     * APIMethod: redraw
     * Populate content of the control.
     *
     * Returns:
     * {DOMElement} A reference to the DIV DOMElement containing the control
     */
    redraw: function() {
        return this.div;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.ToggleControl"*
     */
    CLASS_NAME: "Geoportal.Control.ToggleControl"
});
