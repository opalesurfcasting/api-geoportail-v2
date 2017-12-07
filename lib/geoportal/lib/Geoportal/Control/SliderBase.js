/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 */
/**
 * Class: Geoportal.Control.SliderBase
 * The Geoportal framework slider base class.
 *
 * The control's structure is as follows :
 *
 * (start code)
 *   <div id="#{Id}" class="gpControlSliderBase">
 *     <div id="SliderBase#{Id}" style="background-image:">
 *     <div id="SliderBaseHandle#{Id}>
 *       <img/>
 *     </div>
 *   </div>
 * (end)
 *
 * Inherits from:
 *  - <Geoportal.Control>
 */
Geoportal.Control.SliderBase=
    OpenLayers.Class(Geoportal.Control, {

    /**
     * APIProperty: axis
     * {String} either *'vertical'* (default) or 'horizontal'.
     */
    axis: 'vertical',

    /**
     * Property: isVertical
     * {Boolean} *true* if axis holds 'vertical', false otherwise.
     */
    isVertical: true,

    /**
     * APIProperty: levelBarImgWidth
     * {Integer} level bar image width in pixels.
     *      Default to *O*
     */
    levelBarImgWidth: 0,

    /**
     * APIProperty: levelBarImgHeight
     * {Integer} level bar image height in pixels.
     *      Default to *O*
     */
    levelBarImgHeight: 0,

    /**
     * APIProperty: levelBarImg
     * {String} level bar image URL
     */
    levelBarImg: null,

    /**
     * Property: levelBarIntervalLength
     * {Number} number of intervals on level bar (ration between a dimension of
     * the level bar and the total number of levels).
     *      Default to *O*
     */
    levelBarIntervalLength: 0,

    /**
     * Property: levelBarDiv
     * {DOMElement} the level bar.
     */
    levelBarDiv: null,

    /**
     * Property: levelBarDivEvents
     * {<Events>} events managed on levelBarDiv.
     */
    levelBarDivEvents: null,

    /**
     * APIProperty: sliderImgWidth
     * {Integer} slider's handle image width in pixels.
     *      Default to *O*
     */
    sliderImgWidth: 0,

    /**
     * APIProperty: sliderImgHeight
     * {Integer} slider's handle image height in pixels.
     *      Default to *O*
     */
    sliderImgHeight: 0,

    /**
     * APIProperty: sliderImg
     * {String} slider's handle image URL
     */
    sliderImg: null,

    /**
     * Property: slider
     * {DOMElement} the slider's handle.
     */
    slider: null,

    /**
     * Property: sliderEvents
     * {<Events>} events managed on slider.
     */
    sliderEvents: null,

    /**
     * Property: sliderTopLeft
     * {String} the slider 'top' or 'left' attribute depending upon axis
     * value. Default to *'top'*
     */
    sliderTopLeft: 'top',

    /**
     * APIProperty: initialLevel
     * {Number} Initial level used for the draw() method. Default is to use
     * *getLevel()* method.
     */
    initialLevel: Number.NaN,

    /**
     * APIProperty: getLevel
     * {Function} Returns the current level. Defaults to returning -1.
     * Must be overidden by sub-class.
     */
    getLevel: function() { return -1; },

    /**
     * APIProperty: getMaxAbsoluteLevels
     * {Function} Returns the maximum level available for this level bar.
     *      Defaults to returning *null*
     *      Must be overidden by sub-class.
     */
    getMaxAbsoluteLevels: function() { return null; },

    /**
     * APIProperty: getMinSelectableLevel
     * {Function} Returns the minimum allowed level for this level bar.
     * Defaults to returning *0*
     */
    getMinSelectableLevel: function() { return 0; },

    /**
     * APIProperty: getMaxSelectableLevel
     * {Function} Returns the maximum allowed level.
     * Defaults to *-1*
     */
    getMaxSelectableLevel: function() { return -1; },

    /**
     * APIProperty: onDraw
     * {Function} Define this function if you want to do something before
     * draw() returns. The function should expect to receive one argument:
     * the current level.
     */
    onDraw: function(level) {},

    /**
     * APIProperty: onSliderMove
     * {Function} Define this function if you want to do something before
     * moveSlider() returns. The function should expect to receive one
     * argument: the current level.
     */
    onSliderMove: function(level) {},

    /**
     * APIProperty: downEventStart
     * {Event} clone of the "mousedown" event.
     */
    downEventStart: null,

    /**
     * Constructor: Geoportal.Control.SliderBase
     * Build a slider
     */
    initialize: function() {
        Geoportal.Control.prototype.initialize.apply(this, arguments);
        if (this.axis=='horizontal') {
            this.sliderTopLeft= 'left';
        }
        this.isVertical= this.axis=='vertical';
    },

    /**
     * APIMethod: destroy
     * Delete the slider
     */
    destroy: function() {
        if (this.div) {
            if (this.slider) {
                if (this.slider.parentNode) {
                    this.slider.parentNode.removeChild(this.slider);
                }
                this.slider= null;
            }
            if (this.levelBarDiv) {
                if (this.levelBarDiv.parentNode) {
                    this.levelBarDiv.parentNode.removeChild(this.levelBarDiv);
                }
                this.levelBarDiv= null;
            }
            this.div= null;
        }

        if (this.sliderEvents) {
            this.sliderEvents.destroy();
            this.sliderEvents= null;
        }

        if (this.levelBarDivEvents) {
            this.levelBarDivEvents.destroy();
            this.levelBarDivEvents= null;
        }

        Geoportal.Control.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: setMap
     * Set the map and compute the slider sub-divisions
     *
     * Parameters:
     * map - {<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>}
     */
    setMap: function(map) {
        Geoportal.Control.prototype.setMap.apply(this, arguments);
        if (!this.isVertical) {
            if (this.getMaxAbsoluteLevels()>1) {
                this.levelBarIntervalLength= this.levelBarImgWidth/(this.getMaxAbsoluteLevels()-1);
            } else {
                this.levelBarIntervalLength= this.levelBarImgWidth;
            }
        } else {//vertical
            if (this.getMaxAbsoluteLevels()>1) {
                this.levelBarIntervalLength= this.levelBarImgHeight/(this.getMaxAbsoluteLevels()-1);
            } else {
                this.levelBarIntervalLength= this.levelBarImgHeight;
            }
        }
    },

    /**
     * Method: redraw
     * clear the div and start over.
     */
    redraw: function() {
        var ui= this.getUI();
        var px= null;
        if (ui != null) {
            px= ui.getPosition();
            ui.reset();
        }
        this.draw(px);
    },

    /**
     * Method: draw
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

        //TODO: Geoportal.UI.SliderBase
        var centered= null;
        if (!px) {
            centered= new OpenLayers.Pixel(0,0);//left, top
        } else {
            centered= px.clone();
        }
        var sz= new OpenLayers.Size();
        if (this.isVertical) {
            sz.w= this.levelBarImgWidth;
            sz.h= this.levelBarIntervalLength * (this.getMaxAbsoluteLevels() - 1);
        } else {
            sz.w= this.levelBarIntervalLength * (this.getMaxAbsoluteLevels() - 1);
            sz.h= this.levelBarImgHeight;
        }
        var levelBarDivId= OpenLayers.Util.createUniqueID("SliderBase");
        this.levelBarDiv= OpenLayers.Util.createDiv(
                            levelBarDivId,
                            centered,
                            sz,
                            this.levelBarImg,
                            "relative",
                            null,null,null);
        this.levelBarDiv.style.backgroundRepeat= 'no-repeat';//bug IE
        this.levelBarDiv.appendChild(document.createTextNode(" "));//hack IE
        this.levelBarDivEvents= new OpenLayers.Events(this, this.levelBarDiv, null, true, {includeXY: true});
        this.levelBarDivEvents.on({
            "mousedown": this.singleClick,
            "mousemove": this.passEventToSlider,
            "mouseover": this.displayInfo,
            "dblclick": this.doubleClick,
            "click": this.doubleClick
        });
        this.div.appendChild(this.levelBarDiv);

        sz.w= this.sliderImgWidth;
        sz.h= this.sliderImgHeight;
        var level;
        if (isNaN(this.initialLevel)) {
            level= this.getLevel();
        } else {
            level= this.initialLevel;
            this.initialLevel= Number.NaN;//never use initialLevel again ...
        }
        if (this.isVertical) {
            centered= centered.add(-Math.round(centered.x/2), this.levelToPos(level));
        } else {
            centered= centered.add(this.levelToPos(level), -Math.round(centered.y/2));
        }
        var sliderId= OpenLayers.Util.createUniqueID("SliderBaseHandle");
        this.slider= OpenLayers.Util.createAlphaImageDiv(
                        sliderId,
                        centered,
                        sz,
                        this.sliderImg,
                       "absolute"
        );
        this.div.appendChild(this.slider);
        this.slider.className= 'gpControlSliderBaseHandle';
        if (this.isVertical) {
            this.slider.style.position= "relative";
            //OpenLayers.Util.getElement(sliderId+"_innerImage").style.position= 'absolute';
            this.slider.childNodes[0].style.position= 'absolute';
        }
        this.sliderEvents= new OpenLayers.Events(this, this.slider, null, true, {includeXY: true});
        this.sliderEvents.on({
            "mousedown": this.sliderDown,
            "mousemove": this.sliderDrag,
            "mouseup": this.sliderUp,
            "dblclick": this.doubleClick,
            "click": this.doubleClick
        });

        this.onDraw(level);

        return this.div;
    },

    /**
     * Method: passEventToSlider
     * This function is used to pass events that happen on the div, or the map,
     * through to the slider, which then does its moving thing.
     *
     * Parameters:
     * evt - {Event} the browser event.
     */
    passEventToSlider:function(evt) {
        this.sliderEvents.handleBrowserEvent(evt);
    },

    /**
     * Method: doubleClick
     * Always turned off
     *
     * Parameters:
     * evt - {Event} the browser event.
     *
     * Returns:
     * {Boolean} *false*
     */
    doubleClick: function (evt) {
        OpenLayers.Event.stop(evt);
        return false;
    },

    /**
     * Method: singleClick
     * Picks up on clicks directly on the level bar div
     *     and sets the level appropriately.
     * Must be overriden by sub-class.
     *
     * Parameters:
     * evt - {Event} the browser event.
     */
    singleClick: function (evt) {
    },

    /**
     * Method: displayInfo
     * Allow displaying information depending on the mouse position.
     * Should be overriden by sub-class.
     *
     * Parameters:
     * evt - {Event} the browser event.
     */
    displayInfo: function (evt) {
    },

    /**
     * Method: sliderDown
     * Event listener for clicks on the slider. The event is saved in
     * <Geoportal.Control.SliderBase.mouseDragStart>. Stores the position of
     * the "mousedown" event in <Geoportal.Control.SliderBase.downEventStart>.
     * Could be extended by sub-class.
     *
     * Parameters:
     * evt - {Event} the browser event.
     */
    sliderDown:function(evt) {
        if (!OpenLayers.Event.isLeftClick(evt)) {
            return;
        }
        this.map.events.on({
            "mousemove": this.passEventToSlider,
            "mouseup": this.passEventToSlider,
            scope: this
        });
        OpenLayers.Event.observe(window,"mouseup",OpenLayers.Function.bindAsEventListener(this.sliderUp,this));
        this.mouseDragStart= evt.xy.clone();
        this.downEventStart= evt.xy.clone();
        this.slider.className= 'gpControlSliderBaseHandleDown';
        OpenLayers.Event.stop(evt);
    },

    /**
     * Method: sliderDrag
     * This is what happens when a click has occurred, and the client is
     * dragging.  Here we must ensure that the slider doesn't go beyond the
     * bottom/top (or left/right) of the level bar div, as well as moving the
     * slider to its new visual location.
     * Must be overriden by sub-class.
     *
     * Parameters:
     * evt - {Event} the browser event.
     */
    sliderDrag:function(evt) {
    },

    /**
     * Method: sliderUp
     * Perform cleanup when a mouseup event is received -- discover new
     * level and switch to it.
     * Must be overriden by sub-class.
     *
     * Parameters:
     * evt - {Event} the browser event.
     */
    sliderUp:function(evt) {
    },

   /**
    * Method: moveSlider
    * Change the location of the slider to match the current level.
    */
    moveSlider:function() {
        var level= this.getLevel();
        var newPx= this.levelToPos(level);
        this.updateSlider(newPx);

        this.onSliderMove(level);
    },

    /**
     * Method: levelToPos
     * Compute the position value on the level bar for a given level.
     *
     * Parameters:
     * level - {Integer} the level
     * Returns:
     * {Integer}
     */
    levelToPos: function(level) {
        var position= 0;
        if (this.isVertical) {
            position= (level - this.getMaxAbsoluteLevels() + 1) * this.levelBarIntervalLength;
            position-= this.sliderImgHeight/2;
        } else {
            position= (level                                  ) * this.levelBarIntervalLength;
            position-= this.sliderImgWidth/2;
        }
        return position;
    },

    /**
     * Method: posToLevel
     * Compute the level for a given position value on the level bar
     *
     * Parameters:
     * position - {Number}
     *
     * Returns:
     * {Integer}
     */
    posToLevel: function(position) {
        var level= 0;
        if (this.isVertical) {
            level= position + this.sliderImgHeight/2;
            level= Math.floor(
                    (level / this.levelBarIntervalLength) + this.getMaxAbsoluteLevels() - 1
            );
        } else {
            level= position + this.sliderImgWidth/2;
            level= Math.floor(
                    (level / this.levelBarIntervalLength)
            );
        }
        level= this.adjustLevel(level);
        return level;
    },

    /**
     * Method: adjustLevel
     * Make sure level is between minimum and maximum allowed values.
     *
     * Parameters:
     * level - {Integer} the level to adjust
     *
     * Returns:
     * {Integer}
     */
    adjustLevel: function(level) {
        var alevel= Math.min(Math.max(level, this.getMinSelectableLevel()), this.getMaxSelectableLevel());
        return alevel;
    },

    /**
     * Method: updateSlider
     * Update the handle position.
     *
     * Parameters:
     * position - {Integer}
     */
    updateSlider: function(position) {
        if (this.slider) {
            this.slider.style[this.sliderTopLeft]= position + "px";
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.SliderBase"*
     */
    CLASS_NAME: "Geoportal.Control.SliderBase"
});
