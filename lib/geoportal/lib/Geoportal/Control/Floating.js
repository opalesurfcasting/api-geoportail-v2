/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 * @requires Geoportal/Util.js
 */
/**
 * Class: Geoportal.Control.Floating
 * The Geoportal framework floating controlers base class.
 * 
 * Inherits from:
 *  - <Geoportal.Control>
 */
Geoportal.Control.Floating= OpenLayers.Class( Geoportal.Control, {

    /**
     * Constant: handlesSuffixes
     * Array({String}) Hold the name of the 8 handles.
     *      Defaults to *['tl', 'tm', 'tr', 'ml', 'mr', 'bl', 'bm', 'br']*
     */
    handlesSuffixes:['tl', 'tm', 'tr', 'ml', 'mr', 'bl', 'bm', 'br'],

    /**
     * APIProperty: contentControler
     * {Object} the object managing the content of the bodyDiv.
     *      If none, the floating control has no "close" button.
     */
    contentControler: null,

    /**
     * Property: headDiv
     * {DOMElement} the head div for making the control moving around.
     */
    headDiv: null,

    /**
     * APIProperty: headTitle
     * {String} the title of the head div.
     */
    headTitle: null,

    /**
     * Property: headDivEvents
     * {<OpenLayers.Events at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Events-js.html>} the events handler for making the control moving
     * around.
     */
    headDivEvents: null,

    /**
     * Property: closeDiv
     * {DOMElement} The close div of the control.
     */
    closeDiv: null,

    /**
     * Property: closeDivEvents
     * {<OpenLayers.Events at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Events-js.html>} the events handler for the close button.
     */
    closeDivEvents: null,

    /**
     * Property: bodyDiv
     * {DOMElement} The body of the control.
     */
    bodyDiv: null,

    /**
     * Property: bodyDivEvents
     * {<OpenLayers.Events at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Events-js.html>} the events handler for the content of the control.
     */
    bodyDivEvents: null,

    /**
     * Property: divEvents
     * {<OpenLayers.Events at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Events-js.html>} the events handler for the div of the control.
     */
    divEvents: null,

    /**
     * APIProperty: movingForm
     * {Boolean} Is the form be able to be moved around ?
     *      Defaults to *true*
     */
    movingForm: true,

    /**
     * APIProperty: size
     * {<OpenLayers.Size at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Size-js.html>} the control's div width and height, when defined.
     *      Defaults to *null*
     */
    size: null,

    /**
     * Property: _mouseDragStart
     * {Object} Hold the last mouse position (x and y properties).
     */
    _mouseDragStart: null,

    /**
     * Property: _downEventStart
     * {Object} Hold the mouse position (x and y properties) when the
     * "mousedown" event was fired.
     */
    _downEventStart: null,

    /**
     * Property: _handles
     * Array({DOMElement}) The handles
     */
    _handles:null,

    /**
     * Property: _size
     * {<OpenLayers.Size at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Size-js.html>} the size of the control when the "mousedown" is
     * fired.
     */
    _size: null,

    /**
     * Property: _minSize
     * {<OpenLayers.Size at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Size-js.html>} the original size of the control below which is
     * cannot be resized.
     */
    _minSize: null,

    /**
     * Property: _pos
     * {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} the position of the control when the "mousedown"
     * is fired.
     */
    _pos: null,

    /**
     * APIProperty: onMaximize
     * {Function} Optional function called when the maximize button is hit.
     *
     * Parameters:
     * evt - {Event} the fired event.
     */
    onMaximize: function(evt) {},

    /**
     * APIProperty: onMinimize
     * {Function} Optional function called when the minimize button is hit.
     *
     * Parameters:
     * evt - {Event} the fired event.
     */
    onMinimize: function(evt) {},

    /**
     * APIProperty: onClose
     * {Function} Optional function called when the close button is hit.
     *      This function should release the control.
     *
     * Parameters:
     * evt - {Event} the fired event.
     *
     * Context:
     * contentControler - {<Object>} the object that created this control.
     */
    onClose: function(evt) {},

    /**
     * APIProperty: onSelect
     * {Function} Optional function called when the control is selected.
     *
     * Parameters:
     * evt - {Event} the fired event.
     */
    onSelect:function(evt) {},

    /**
     * APIProperty: onUnselect
     * {Function} Optional function called when the control is unselected.
     *
     * Parameters:
     * evt - {Event} the fired event.
     */
    onUnselect:function(evt) {},

    /**
     * APIProperty: onDrag
     * {Function} Optional function called when the control is moved.
     *
     * Parameters:
     * evt - {Event} the fired event.
     */
    onDrag:function(evt) {},

    /**
     * APIProperty: onDragStop
     * {Function} Optional function called when the control is released after
     * being moved.
     *
     * Parameters:
     * evt - {Event} the fired event.
     */
    onDragStop:function(evt) {},

    /**
     * APIProperty: onHandleSelect
     * {Function} Optional function called when a handle is selected.
     *
     * Parameters:
     * evt - {Event} the fired event.
     */
    onHandleSelect:function(evt) {},

    /**
     * APIProperty: onResize
     * {Function} Optional function called when the control is resized.
     *
     * Parameters:
     * evt - {Event} the fired event.
     * opts - {Object} Hold information about the control and the selected
     * handle :
     *      * suffix : the name of the handle;
     *      * dx : the last resize on the x axis;
     *      * dy : the last resize on the y axis.
     *
     * Context:
     * contentControler - {<Object>} the object that created this control.
     */
    onResize:function(evt,opts) {},

    /**
     * APIProperty: onResizeStop
     * {Function} Optional function called when the control has been resized.
     *
     * Parameters:
     * evt - {Event} the fired event.
     */
    onResizeStop:function(evt) {},

    /**
     * Constructor: Geoportal.Control.FloatingControl
     * Create a Geoportal floating Control.  The options passed as a parameter
     * directly extend the control.  For example passing the following:
     *
     * > var control = new Geoportal.Control.Floating(null,{div: myDiv});
     *
     * Overrides the default div attribute value of null.
     *
     * Parameters:
     * ctrl - {<Object>} the master control.
     * options - {Object}
     */
    initialize:function(ctrl, options) {
        Geoportal.Control.prototype.initialize.apply(this, [options]);
        this.contentControler= ctrl;
    },

    /**
     * APIMethod: destroy
     * Unregister events and delete control
     */
    destroy: function() {
        this.clearAll();
        Geoportal.Control.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: clearAll
     * Unregister events and clean children elements.
     */
    clearAll: function() {
        if (this.closeDivEvents) {
/*
            this.closeDivEvents.un({
                "click"   : this.closeControl,
                "dblclick": this.dblClick
            });
 */
            this.closeDivEvents.destroy();
            this.closeDivEvents= null;
        }
        if (this.closeDiv) {
            this.closeDiv= null;
        }
        if (this.headDivEvents) {
/*
            this.headDivEvents.un({
                "click"    : this.ignoreEvent,
                "dblclick" : this.clickOnLabel
            });
            if (this.movingForm) {
                this.headDivEvents.un({
                    "mousedown": this.dragStart,
                    "mousemove": this.drag,
                    "mouseup"  : this.dragStop
                });
            }
 */
            this.headDivEvents.destroy();
            this.headDivEvents= null;
        }
        if (this.headDiv) {
            this.headDiv.innerHTML= '';
            this.headDiv= null;
        }
        if (this.bodyDivEvents) {
/*
            this.bodyDivEvents.un({
                "click"    : this.passthroughEvent,
                "dblclick" : this.passthroughEvent
            });
            if (this.movingForm) {
                this.bodyDivEvents.un({
                    "mousedown": this.passthroughEvent,
                    "mousemove": this.passthroughEvent,
                    "mouseup"  : this.passthroughEvent
                });
            }
 */
            this.bodyDivEvents.destroy();
            this.bodyDivEvents= null;
        }
        if (this.bodyDiv) {
            this.bodyDiv.innerHTML= '';
            this.bodyDiv= null;
        }
        if (this._handles) {
            for (var id in this._handles) {
                var hndl= this._handles[id];
                if (hndl.events) {
                    hndl.events.destroy();
                    hndl.events= null;
                }
                OpenLayers.Element.remove(hndl.div);
                hndl.div.innerHTML= '';
                hndl.div= null;
            }
            this._handles= null;
        }
        this._mouseDragStart= null;
        this._downEventStart= null;
        this._size= null;
        this._minSize= null;
        this._pos= null;
        if (this.size) {
            this.size= null;
        }
        if (this.div) {
/*
            this.divEvents.un({
                "dblclick" : this.ignoreEvent,
                "mousedown": this.ignoreEvent,
                "mouseup"  : this.ignoreEvent,
                "mouseover": Geoportal.Control.mapMouseOut,
                "mouseout" : Geoportal.Control.mapMouseOver
            });
 */
            this.divEvents.destroy();
            this.divEvents= null;
            this.div.innerHTML= '';
            if (this.div.parentNode) {
                this.div.parentNode.removeChild(this.div);
            }
            this.div= null;
        }
        this.contentControler= null;
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

        // create layout divs
        this.loadContents();

        // set mode to maximize
        if (OpenLayers.Element.visible(this.bodyDiv)) {
            this.maximizeControl();
        }

        return this.div;
    },

    /**
     * APIMethod: clickOnLabel
     * In case of double click on the label, open or close it.
     *
     * Parameters:
     * evt - {Event} the browser event
     */
    clickOnLabel: function(evt) {
        var minimize= OpenLayers.Element.visible(this.bodyDiv);
        this.showControls(minimize);
        this.ignoreEvent(evt);
    },

    /**
     * APIMethod: dblClick
     * In case of double click on the minimize/maximize div, do nothing
     *
     * Parameters:
     * evt - {Event} the browser event
     */
    dblClick: function(evt) {
        this.ignoreEvent(evt);
    },

    /**
     * APIMethod: maximizeControl
     * Show all the contents of the control, add the minimize icon.
     *     Call the onMaximize() callback.
     *
     * Parameters:
     * evt - {Event} the browser event
     */
    maximizeControl: function(evt) {
        this.ignoreEvent(evt);
        this.showControls(false);
        this.onMaximize(evt);
    },

    /**
     * APIMethod: minimizeControl
     * Hide all the contents of the control, shrink the size,
     *     add the maximize icon.
     *     Call the onMinimize() callback.
     *
     * Parameters:
     * evt - {Event} the browser event
     */
    minimizeControl: function(evt) {
        this.ignoreEvent(evt);
        this.showControls(true);
        this.onMinimize(evt);
    },

    /**
     * APIMethod: showControls
     * Hide/Show all LayerSwitcher controls depending on whether we are
     *     minimized or not.
     *
     * Parameters:
     * minimize - {Boolean}
     */
    showControls: function(minimize) {
        if (minimize) {
            // save width to prevent resizing !
            this.headDiv.style.width= this.headDiv.offsetWidth+'px';
            this.setResizeHandles(false);
            // if resized save w/h
            if (this._size) {
                this.div.style.width= this.div.style.height= '';
            }
        } else {
            this.headDiv.style.width= 'auto';
            // restore w/h
            if (this._size) {
                this.div.style.width= this._size.w+'px';
                this.div.style.height= this._size.h+'px';
            }
        }
        this.bodyDiv.style.display= minimize? 'none' : '';
    },

    /**
     * APIMethod: closeControl
     * Close the control. Call the onClose() callback.
     *
     * Parameters:
     * evt - {Event} the browser event
     */
    closeControl: function(evt) {
        this.ignoreEvent(evt);
        if (this.contentControler) {
            this.onClose.apply(this.contentControler,[evt]);
        }
    },

    /**
     * Method: dragStart
     * Event listener for clicks on the div's title.
     *
     * Parameters:
     * evt - {Event} the browser event.
     */
    dragStart: function(evt) {
        if (OpenLayers.Event.isLeftClick(evt)) {
            if (!this.downEventStart) {
                this.mouseDragStart= {x:evt.xy.x, y:evt.xy.y};
                this.downEventStart= {x:evt.xy.x, y:evt.xy.y};
                this.headDiv.style.cursor= 'move';
                //save zIndex:
                this._zIndex= this.div.style.zIndex;
                this.div.style.zIndex= 9998;
                if (OpenLayers.Element.visible(this.bodyDiv)) {
                    this.setResizeHandles(true);
                }
                if (!this._size) {
                    this._size= new OpenLayers.Size(this.div.offsetWidth, this.div.offsetHeight);
                    this._minSize= this._size.clone();
                }
                if (!this._pos) {
                    this._pos= new OpenLayers.Pixel(this.div.offsetLeft, this.div.offsetTop);
                }
                // special stuff :
                this.onSelect(evt);
            } else {
                if (OpenLayers.Element.visible(this.bodyDiv)) {
                    this.setResizeHandles(false);
                }
                //reset zIndex:
                this.div.style.zIndex= this._zIndex;
                this._zIndex= -1;
                this.headDiv.style.cursor= 'pointer';
                this.downEventStart= null;
                this.mouseDragStart= null;
                this.onUnselect();
            }
        }
        OpenLayers.Event.stop(evt);
    },

    /**
     * Method: drag
     * This is what happens when a click has occurred, and the client is
     * dragging.
     *
     * Parameters:
     * evt - {Event} the browser event.
     */
    drag: function(evt) {
        if (OpenLayers.Event.isLeftClick(evt) && this.downEventStart && this.mouseDragStart) {
            var deltaX= evt.xy.x - this.mouseDragStart.x;
            var deltaY= evt.xy.y - this.mouseDragStart.y;
            var newLeft= this._pos.x + deltaX;
            var newTop= this._pos.y + deltaY;
            if ((newLeft>0) && (newTop>0) &&
                (newLeft+this.div.clientWidth <this.div.parentNode.clientWidth) &&
                (newTop +this.div.clientHeight<this.div.parentNode.clientHeight)) {
                this._pos.x= newLeft;
                this._pos.y= newTop;
                if (this.position) {//FIXME
                    this.position.x= newLeft;
                    this.position.y= newTop;
                }
                this.div.style.left= newLeft+'px';
                this.div.style.top= newTop+'px';

                this.mouseDragStart.x= evt.xy.x;
                this.mouseDragStart.y= evt.xy.y;
                this.onDrag(evt);
            }
            OpenLayers.Event.stop(evt);
        }
    },

    /**
     * Method: dragStop
     * Perform cleanup when a mouseup event is received.
     *
     * Parameters:
     * evt - {Event} the browser event.
     */
    dragStop: function(evt) {
        if (OpenLayers.Event.isLeftClick(evt) && this.downEventStart && this.mouseDragStart) {
            this.mouseDragStart= null;
            this.headDiv.style.cursor= "pointer";
            this.onDragStop(evt);
        }
        OpenLayers.Event.stop(evt);
    },

    /**
     * APIMethod: ignoreEvent
     * Stop the given event.
     *
     * Parameters:
     * evt - {Event} the browser event
     */
    ignoreEvent: function(evt) {
        if (evt) {
            OpenLayers.Event.stop(evt);
        }
        return false;
    },

    /**
     * APIMethod: passthroughEvent
     * Stop the given event, but let the browser behaviour still on.
     *
     * Parameters:
     * evt - {Event} the browser event
     */
    passthroughEvent: function(evt) {
        if (evt) {
            OpenLayers.Event.stop(evt,true);
        }
    },

    /**
     * Method: setResizeHandles
     * Possibly build the handles if they don't exist. Show or Hide them.
     *
     * Parameters:
     * show - {Boolean} when true show handles, otherwise hide them.
     */
    setResizeHandles:function(show) {
        if (!this._handles) {
            this._handles= {};
            for (var i= 0, l= this.handlesSuffixes.length; i<l; i++) {
                var hndlDiv= this.div.ownerDocument.createElement('div');
                hndlDiv.suffix= this.handlesSuffixes[i];
                OpenLayers.Element.addClass(hndlDiv,this.getDisplayClass()+'Hndl');
                var id= this.getDisplayClass()+'Hndl-'+this.handlesSuffixes[i];
                OpenLayers.Element.addClass(hndlDiv,id);
                this._handles[id]= {};
                this._handles[id].div= this.div.appendChild(hndlDiv);
                this._handles[id].events= new OpenLayers.Events(this, hndlDiv, null, true, {includeXY: true});
            }
        }
        for (var i= 0, l= this.handlesSuffixes.length; i<l; i++) {
            var id= this.getDisplayClass()+'Hndl-'+this.handlesSuffixes[i];
            this._handles[id].div.style.visibility= show? 'inherit' : 'hidden';
            var func= show? OpenLayers.Events.prototype.on : OpenLayers.Events.prototype.un ;
            func.apply(this._handles[id].events,[{
                "mousedown":this.resizeStart,
                "mousemove":this.resize,
                "mouseout" :this.resizeStop,
                "mouseup"  :this.resizeStop,
                "dblclick" :this.ignoreEvent,
                "click"    :this.ignoreEvent
            }]);
        }
    },

    /**
     * Method: resizeStart
     * Record the start of resizing.
     *
     * Parameters:
     * evt - {Event} the browser event
     */
    resizeStart:function(evt) {
        if (OpenLayers.Event.isLeftClick(evt)) {
            if (!this._size) {
                this._size= new OpenLayers.Size(this.div.offsetWidth, this.div.offsetHeight);
                this._minSize= this._size.clone();
            }
            this.mouseDragStart= {x:evt.xy.x, y:evt.xy.y};
            this.onHandleSelect(evt);
        }
        OpenLayers.Event.stop(evt);
    },

    /**
     * Method: resize
     * Resize the control
     *
     * Parameters:
     * evt - {Event} the browser event
     */
    resize:function(evt) {
        if (OpenLayers.Event.isLeftClick(evt) && this.mouseDragStart) {
            var s= (evt.target || evt.srcElement).suffix;
            var deltaX= evt.xy.x - this.mouseDragStart.x;
            var deltaY= evt.xy.y - this.mouseDragStart.y;
            var x= this._pos.x, y= this._pos.y, w= this._size.w, h= this._size.h;
            if (s.indexOf('t')>=0) {
                if ((deltaY>0 && h-this._minSize.h>=deltaY) || deltaY<0) {
                    y+= deltaY;
                    h-= deltaY;
                } else {
                    deltaY= 0;
                }
            }
            if (s.indexOf('b')>=0) {
                if ((deltaY<0 && h-this._minSize.h>=-deltaY) || deltaY>0) {
                    h+= deltaY;
                } else {
                    deltaY= 0;
                }
            }
            if (s.indexOf('l')>=0) {
                if ((deltaX>0 && w-this._minSize.w>=deltaX) || deltaX<0) {
                    x+= deltaX;
                    w-= deltaX;
                } else {
                    deltaX= 0;
                }
            }
            if (s.indexOf('r')>=0) {
                if ((deltaX<0 && w-this._minSize.w>=-deltaX) || deltaX>0) {
                    w+= deltaX;
                } else {
                    deltaX= 0;
                }
            }
            var newLeft= x;
            var newTop= y;
            if ((newLeft>0) && (newTop>0) &&
                (newLeft+this.div.clientWidth <this.div.parentNode.clientWidth) &&
                (newTop +this.div.clientHeight<this.div.parentNode.clientHeight)) {
                this._pos.x= newLeft;
                this._pos.y= newTop;
                if (this.position) {//FIXME
                    this.position.x= newLeft;
                    this.position.y= newTop;
                }
                this.div.style.left= newLeft+'px';
                this.div.style.top= newTop+'px';

                this._size.w= w; this._size.h= h;
                this.div.style.width= this._size.w+'px';
                this.div.style.height= this._size.h+'px';
                this.mouseDragStart.x= evt.xy.x;
                this.mouseDragStart.y= evt.xy.y;
                var opts= {'suffix':s,'dx':deltaX,'dy':deltaY};
                if (this.contentControler) {
                    this.onResize.apply(this.contentControler,[evt,opts]);
                } else {
                    this.onResize(evt,opts);
                }
            }
        }
        OpenLayers.Event.stop(evt);
    },

    /**
     * Method: resizeStop
     * Stop the control resizing.
     *
     * Parameters:
     * evt - {Event} the browser event
     */
    resizeStop:function(evt) {
        if (OpenLayers.Event.isLeftClick(evt)) {
            this.mouseDragStart= null;
            this.onResizeStop(evt);
        }
        OpenLayers.Event.stop(evt);
    },

    /**
     * Method: loadContents
     * Set up the labels and divs for the control.
     */
    loadContents: function() {
        this.setClass();//FIXME: usefull ?

        // Head :
        this.headDiv= this.div.ownerDocument.createElement('div');
        this.headDiv.className= this.getDisplayClass()+'Head';
        // Title :
        var spanDiv= this.div.ownerDocument.createElement('span');
        spanDiv.id= 'spanTitle' + this.id;
        spanDiv.className= this.getDisplayClass()+'Head';
        spanDiv.appendChild(this.div.ownerDocument.createTextNode(OpenLayers.i18n(this.headTitle? this.headTitle:"???")));
        this.headDiv.appendChild(spanDiv);

        // Head's buttons:
        var imgLocation= Geoportal.Util.getImagesLocation();
        var szm= new OpenLayers.Size(11,11);
        var btnsDiv= this.div.ownerDocument.createElement('div');
        btnsDiv.className= this.getDisplayClass()+'HeadBtns';
        // close button :
        if (this.contentControler) {
            this.closeDiv= OpenLayers.Util.createDiv(this.id+"_CloseDiv",null,null,null,"relative");
            OpenLayers.Element.addClass(this.closeDiv, this.getDisplayClass()+'HeadBtnsClose');
            btnsDiv.appendChild(this.closeDiv);
        }
        if (!this.size) {
            this.headDiv.appendChild(btnsDiv);
        }
        this.headDiv.appendChild(btnsDiv);

        var wSize= this.size? new OpenLayers.Size(this.size.w, 0) : null;
        var realSize= OpenLayers.Util.getRenderedDimensions(
                        this.headDiv.innerHTML,
                        wSize,
                        {displayClass:this.headDiv.className});
        if (this.size) {
            wSize= null;
            this.headDiv.style.height= realSize.h+'px';
            realSize.w= this.size.w;
        }
        this.headDiv.style.width= realSize.w+'px';
        if (!this.position) {
            var w= this.map.div.clientWidth || this.map.div.offsetWidth || 800;
            this.div.style.left= (((w - realSize.w)*100)/(2*w))+'%';
        }
        realSize= null;
        if (this.size) {
            this.div.style.width= this.size.w+'px';
            this.div.style.height= this.size.h+'px';
        }

        this.headDivEvents= new OpenLayers.Events(this, this.headDiv, null, true, {includeXY: true});
        this.headDivEvents.on({
            "click"    : this.ignoreEvent,
            "dblclick" : this.clickOnLabel
        });
        if (this.movingForm) {
            this.headDivEvents.on({
                "mousedown": this.dragStart,
                "mousemove": this.drag,
                "mouseout" : this.dragStop,
                "mouseup"  : this.dragStop
            });
        }

        // Body :
        this.bodyDiv= this.div.ownerDocument.createElement('div');
        this.bodyDiv.id= this.id + '_Child';
        this.bodyDiv.className= this.getDisplayClass()+'Body';
        if (this.size) {
            this.bodyDiv.style.width= this.size.w+'px';
            this.bodyDiv.style.height= (this.size.h - parseInt(this.headDiv.style.height))+'px';
            this.bodyDiv.style.overflow= 'auto';
            this.bodyDiv.style.margin= '0px';
        }
        this.bodyDivEvents= new OpenLayers.Events(this, this.bodyDiv, null, true);
        this.bodyDivEvents.on({
            "click"    : this.passthroughEvent,
            "dblclick" : this.passthroughEvent
        });
        if (this.movingForm) {
            this.bodyDivEvents.on({
                "mousedown": this.passthroughEvent,
                "mousemove": this.passthroughEvent,
                "mouseout" : this.passthroughEvent,
                "mouseup"  : this.passthroughEvent
            });
        }
        // close button :
        if (this.contentControler) {
            this.closeDivEvents= new OpenLayers.Events(this, this.closeDiv, null);
            this.closeDivEvents.on({
                "click"   : this.closeControl,
                "dblclick": this.dblClick
            });
        }

        this.div.appendChild(this.headDiv);
        this.div.appendChild(this.bodyDiv);
        this.divEvents= this.divEvents || new OpenLayers.Events(this, this.div, null);
        this.divEvents.on({
            "dblclick" : this.ignoreEvent,
            "mousedown": this.ignoreEvent,
            "mouseup"  : this.ignoreEvent,
            "mouseover": Geoportal.Control.mapMouseOut,
            "mouseout" : Geoportal.Control.mapMouseOver
        });
    },

    /**
     * APIMethod: addContent
     * Append the HTML element to the body of the control's div.
     *
     * Parameters:
     * bContent - {DOMElement} the content of the body.
     */
    addContent: function(bContent) {
        if (this.bodyDiv && bContent) {
            if (!this.size) {
                // fix width of the head :
                var realSize= OpenLayers.Util.getRenderedDimensions(
                        bContent.innerHTML,
                        null,
                        {displayClass: this.bodyDiv.className, containerElement:this.bodyDiv});
                if (realSize.w > this.div.parentNode.clientWidth) {
                    realSize.w= 0.75*this.div.parentNode.clientWidth;
                }
                var hw= parseInt(this.headDiv.style.width);
                if (isNaN(hw) || realSize.w > hw) {
                    hw= realSize.w + 4;
                    this.headDiv.style.width= hw+'px';
                }
                this.bodyDiv.style.width= (hw - 4)+'px';
                if (!this.position) {
                    this.div.style.left= ( ((this.div.parentNode.clientWidth - hw)*100)
                                          /(2*this.div.parentNode.clientWidth))+'%';
                    this.div.style.top= ( ((this.div.parentNode.clientHeight - realSize.h)*100)
                                         /(8*this.div.parentNode.clientHeight))+'%';
                }
                // height ?
                realSize= null;
            }
            this.bodyDiv.appendChild(bContent);
            this.headDiv.style.width= 'auto';
            this.bodyDiv.style.width= 'auto';
        }
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
        if (this.getTitle()) {
            this.div.title= OpenLayers.i18n(this.getTitle());
        }
        if (this.headTitle) {
            var e= OpenLayers.Util.getElement('spanTitle'+this.id);
            if (e) {
                e.innerHTML= OpenLayers.i18n(this.headTitle);
            }
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.Floating"*
     */
    CLASS_NAME:"Geoportal.Control.Floating"
});
