/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 * @requires Geoportal/Control/GraphicScale.js
 * @requires Geoportal/Control/Projections.js
 * @requires Geoportal/Control/MousePosition.js
 * @requires Geoportal/Control/Copyright.js
 */
/**
 * Class: Geoportal.Control.Information
 * The Geoportal framework information panel class.
 * Display graphic scale, display projections, mouse positions and copyright.
 *
 * The control's structure is as follows :
 *
 * (start code)
 * <div id="#{id}" class="gpControlInformation olControlNoSelect">
 *   <div id="gs_#{id}" class="gpControlGraphicScale"/>
 *   <div id="pj_#{id}" class="gpControlProjections"/>
 *   <div id="mp_#{id}" class="gpControlMousePosition"/>
 *   <div id="cp_#{id}" class="gpControlCopyright"/>
 * </div>
 * (end)
 *
 * Inherits from:
 *  - {<Geoportal.Control>}
 */
Geoportal.Control.Information= OpenLayers.Class( Geoportal.Control, {

    /**
     * Property: controls
     * {Array(<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>)}
     */
    controls: null,

    /**
     * Constructor: Geoportal.Control.Information
     * Build the information control.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     */
    initialize: function(options) {
        Geoportal.Control.prototype.initialize.apply(this, arguments);
        this.controls= [];
        this.timer= {};
        if (!this.displayProjections) {
            this.displayProjections= [OpenLayers.Projection.CRS84.clone()];
        }
    },

    /**
     * APIMethod: destroy
     * The DOM elements handling base layers are not suppressed.
     */
    destroy: function() {
        if (this.miniDiv) {
            OpenLayers.Event.stopObservingElement(this.miniDiv);
            this.miniDiv= null;
        }
        this.stopCapturingEvents();
        if (this.divEvents) {
            this.divEvents.destroy();
            this.divEvents= null;
        }
        this.maxiDiv= null;

        this.displayProjections= null;
        if (this.controls) {
            for (var i= 0, len= this.controls.length; i<len; i++) {
                this.controls[i].deactivate();
                this.controls[i].destroy();
            }
            this.controls= null;
        }
        if (this.timer) {
            if (this.timer[true])  { window.clearTimeout(this.timer[true]); }
            if (this.timer[false]) { window.clearTimeout(this.timer[false]);}
            this.timer= null;
        }

        Geoportal.Control.prototype.destroy.apply(this, arguments);
    },

    /**
     * APIMethod: redraw
     * Clear the div and start over.
     */
    redraw: function() {
        if (this.div) {
            for (var i= 0, len= this.controls.length; i<len; i++) {
                this.controls[i].redraw();
            }
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
        this.loadContents();

        return this.div;
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
     * APIMethod: mouseDown
     * Register a local 'mouseDown' flag so that we'll know whether or not
     *     to ignore a mouseUp event
     *
     * Parameters:
     * evt - {Event} the browser event
     */
    mouseDown: function(evt) {
        this.isMouseDown= true;
        this.ignoreEvent(evt);/* cause bug in Chrome and IE9 ?*/
    },

    /**
     * APIMethod: mouseUp
     * If the 'isMouseDown' flag has been set, that means that the drag was
     *     started from within the Information control, and thus we can
     *     ignore the mouseup. Otherwise, let the Event continue.
     *
     * Parameters:
     * evt - {Event} the browser event
     */
    mouseUp: function(evt) {
        if (this.isMouseDown) {
            this.isMouseDown= false;
            this.ignoreEvent(evt);/* cause bug in Chrome and IE9 ?*/
        }
    },

    /**
     * APIMethod: maximizeControl
     * Show up the labels and divs for the control
     *
     * Parameters:
     * e - {Event} the browser event
     */
    maximizeControl: function(e) {
        this.toggleControls(false);
        this.ignoreEvent(e);
    },

    /**
     * APIMethod: minimizeControl
     * Hide all the contents of the control, shrink the size,
     *     add the maximize icon
     *
     * Parameters:
     * e - {Event} the browser event
     */
    minimizeControl: function(e) {
        this.toggleControls(true);
        this.ignoreEvent(e);
    },

    /**
     * Method: captureEvents
     * Set observers on the main div.
     */
    captureEvents: function() {
        this.divEvents= this.divEvents || new OpenLayers.Events(this, this.div, null, true);
        this.divEvents.on({
            "dblclick"  : this.ignoreEvent,
            "click"     : this.minimizeControl,
            "mousedown" : this.mouseDown,
            "mouseup"   : this.mouseUp,
            "mouseover" : Geoportal.Control.mapMouseOut,
            "mouseout"  : Geoportal.Control.mapMouseOver
        });
    },

    /**
     * Method: stopCapturingEvents
     * Unset observers on the main div.
     */
    stopCapturingEvents: function() {
        if (this.divEvents) {
            this.divEvents.un({
                "dblclick"  : this.ignoreEvent,
                "click"     : this.minimizeControl,
                "mousedown" : this.mouseDown,
                "mouseup"   : this.mouseUp,
                "mouseover" : Geoportal.Control.mapMouseOut,
                "mouseout"  : Geoportal.Control.mapMouseOver
            });
        }
    },

    /**
     * Method: delayControls
     * Set timer for calling toggleControls or showControls.
     *
     * Parameters:
     * minimize - {Boolean}
     * callback - {String}
     *
     * Returns:
     * {Boolean} true if delayed, false otherwise.
     */
    delayControls: function(minimize, callback) {
        if (this.timer[minimize]) {
            window.clearTimeout(this.timer[minimize]);
            this.timer[minimize]= null;
        }
        if ((this.map && this.map.getApplication() && !this.map.getApplication().isMapReady()) ||
            (minimize && this.timer[!minimize])) {//delay if not ready or awaiting for maximize
            this.timer[minimize]= window.setTimeout(
                OpenLayers.Function.bind(function(m) {
                    this[callback](m);
                }, this, minimize),
                300
            );
            return true;
        }
        return false;
    },

    /**
     * APIMethod: toggleControls
     * Show/Hide the control.
     *
     * Parameters:
     * minimize - {Boolean} iconify when true.
     */
    toggleControls: function(minimize) {
        if (this.delayControls(minimize,'toggleControls')) { return; }
        this.maxiDiv.style.display= minimize ? "none"  : "block";
        this.miniDiv.style.display= minimize ? "block" : "none";
        if (minimize) {
            OpenLayers.Element.removeClass(this.div, this.getDisplayClass());
            OpenLayers.Element.addClass(this.div, this.getDisplayClass()+"Minimized");
            this.stopCapturingEvents();
        } else {
            OpenLayers.Element.addClass(this.div, this.getDisplayClass());
            OpenLayers.Element.removeClass(this.div, this.getDisplayClass()+"Minimized");
            this.captureEvents();
        }
        if (!minimize) {
            var s= this.getSize(true);
        }
        if (this.map) {
            this.map.events.triggerEvent("controlvisibilitychanged",{
                control:this,
                size:this.getSize(),
                visibility:!minimize
            });
        }
    },

    /**
     * APIMethod: showControls
     * Hide/Show all information control depending on whether we are
     *     minimized or not
     *
     * Parameters:
     * minimize - {Boolean} hide when true.
     */
    showControls: function(minimize) {
        if (this.delayControls(minimize,'showControls')) { return; }
        var d= minimize ? "none" : "block";
        if ((this.div.style.display=="none" && !minimize) ||
            (this.div.style.display!="none" && minimize)  ||
            (this.div.style.display=="")) {//first time ?
            this.div.style.display= d;
            if (this.map) {
                if (!minimize) {
                    var s= this.getSize(true);
                }
                this.map.events.triggerEvent("controlvisibilitychanged",{
                    control:this,
                    size:this.miniDiv.style.display!="none"? null : this.getSize(),
                    visibility:!minimize
                });
            }
        }
    },

    /**
     * Method: loadContents
     * Set up the labels and divs for the control
     */
    loadContents: function() {

        this.captureEvents();
        this.maxiDiv= this.div.ownerDocument.createElement('div');

        var d= this.div.ownerDocument.createElement('div');
        d.id= 'gs_'+this.id;
        d.className= 'gpControlGraphicScale olControlNoSelect';
        this.maxiDiv.appendChild(d);
        var cntrl= new Geoportal.Control.GraphicScale({
            id: d.id,
            div: d});
        this.controls.push(cntrl);
        this.map.addControl(cntrl);

        d= this.div.ownerDocument.createElement('div');
        d.id= 'pj_'+this.id;
        d.className= 'gpControlProjections olControlNoSelect';
        this.maxiDiv.appendChild(d);
        cntrl= new Geoportal.Control.Projections({
            id: d.id,
            div: d,
            displayProjections: this.displayProjections});
        this.controls.push(cntrl);
        this.map.addControl(cntrl);

        d= this.div.ownerDocument.createElement('div');
        d.id= 'mp_'+this.id;
        d.className= 'gpControlMousePosition olControlNoSelect';
        this.maxiDiv.appendChild(d);
        cntrl= new Geoportal.Control.MousePosition({
            id: d.id,
            div: d,
            activeOverMapOnly:true});
        this.controls.push(cntrl);
        this.map.addControl(cntrl);

        d= this.div.ownerDocument.createElement('div');
        d.id= 'cp_'+this.id;
        d.className= 'gpControlCopyright olControlNoSelect';
        this.maxiDiv.appendChild(d);
        cntrl= new Geoportal.Control.Copyright({
            id: d.id,
            div: d,
            copyright: this.options? this.options.copyright : undefined});
        this.controls.push(cntrl);
        this.map.addControl(cntrl);
        this.maxiDiv.style.display= "block";
        this.div.appendChild(this.maxiDiv);

        this.miniDiv= this.div.ownerDocument.createElement('div');
        this.miniDiv.id= "mini_"+this.id;
        this.miniDiv.title= OpenLayers.i18n(this.getDisplayClass()+"Mini");
        OpenLayers.Element.addClass(this.miniDiv, this.getDisplayClass()+"Mini");
        this.miniDiv.style.display= "none";
        OpenLayers.Event.observe(
            this.miniDiv,
            "click",
            OpenLayers.Function.bindAsEventListener(this.maximizeControl, this)
        );
	OpenLayers.Event.observe(
            this.miniDiv,
            "mouseup",
            OpenLayers.Function.bindAsEventListener(this.ignoreEvent, this)
        );
	OpenLayers.Event.observe(
            this.miniDiv,
            "mousedown",
            OpenLayers.Function.bindAsEventListener(this.ignoreEvent, this)
        );
        this.div.appendChild(this.miniDiv);
    },

    /**
     * APIMethod: updateSize
     * This function should be called by any external code which dynamically
     *     changes the size of the control div.
     */
    updateSize: function() {
        if (this.controls) {
            for (var i= 0, l= this.controls.length; i<l; i++) {
                var c= this.controls[i];
                if (c.updateSize) {
                    c.updateSize();
                }
            }
        }
    },

    /**
     * APIMethod: getSize
     * Return or compute the control's size.
     *
     * Parameters:
     * force - {Boolean} when true always compute the size.
     *
     * Returns:
     * {OpenLayers.Size}
     */
    getSize: function(force) {
        if (!this.controlSize || force===true) {
            this.controlSize= new OpenLayers.Size(
                this.div.offsetWidth,
                this.div.offsetHeight
            );
        }
        return this.controlSize.clone();
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.Information"*
     */
    CLASS_NAME: "Geoportal.Control.Information"
});
