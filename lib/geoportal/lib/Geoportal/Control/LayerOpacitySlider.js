/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/SliderBase.js
 */
/**
 * Class: Geoportal.Control.LayerOpacitySlider
 *
 * The control's structure is as follows :
 *
 * (start code)
 *   <div id="#{Id}" class="gpControlLayerOpacitySlider">
 *     <div id="SliderBase#{Id}" style="background-image:">
 *     <div id="SliderBaseHandle#{Id}>
 *       <img/>
 *     </div>
 *   </div>
 * (end)
 *
 * Inherits from:
 *  - <Geoportal.Control.SliderBase>
 */
Geoportal.Control.LayerOpacitySlider =
    OpenLayers.Class(Geoportal.Control.SliderBase, {

    /**
     * APIProperty: axis
     * {String} either 'vertical' or *'horizontal'* (default).
     */
    axis: 'horizontal',

    /**
     * Property: layer
     * {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the layer the opacity is watched
     */
    layer: null,

    /**
     * APIMethod: getLevel
     * Return the current percentage.
     *
     * Returns:
     * {Number}
     */
    getLevel: function() { return Math.round(this.layer.opacity*100); },

    /**
     * APIMethod: getMaxAbsoluteLevels
     * Return the maximum percentage available for this bar.
     * Defaults to returning *101%*
     *
     * Returns:
     * {Number} *101*
     */
    getMaxAbsoluteLevels: function() { return 101; },

    /**
     * APIMethod: getMaxSelectableLevel
     * Return the maximum allowed percentage.
     * Defaults to *100%*
     *
     * Returns:
     * {Number} *100*
     */
    getMaxSelectableLevel: function() { return 100; },

    /**
     * APIMethod: setOpacity
     * Refreshes the opacity value for the specified layer.
     *
     * Parameters:
     * level - {Integer} percentage of opacity.
     */
    setOpacity: function(level) {
        if (level==0) {
            level= 0.001;
        } else {
            level= level/100.0;
        }
        this.layer.setOpacity(level);
    },

    /**
     * Constructor: Geoportal.Control.LayerOpacitySlider
     * Build the opacity slider.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} The controlled layer.
     * options - {Object} Options for control.
     */
    initialize: function(layer, options) {
        Geoportal.Control.SliderBase.prototype.initialize.apply(this, [options]);
        this.layer= layer;
        if (this.layer && typeof(this.layer.opacity)==='number') {
            this.initialLevel= Math.round(this.layer.opacity * 100.0);
            if (this.initialLevel<0.0) { this.initialLevel= 0.0; }
            if (this.initialLevel>100.0) { this.initialLevel= 100.0; }
        }
    },

    /**
     * Method: singleClick
     * Picks up on clicks directly on the bar div
     *      and sets the percentage level appropriately.
     *
     * Parameters:
     * evt - {Event} the browser event.
     */
    singleClick: function (evt) {
        if (!OpenLayers.Event.isLeftClick(evt)) {
            return;
        }
        var level= evt.xy.x/this.levelBarIntervalLength;
        level= this.adjustLevel(level);
        this.setOpacity(level);
        this.moveSlider();
        OpenLayers.Event.stop(evt);
    },

    /**
     * Method: sliderDrag
     * This is what happens when a click has occurred, and the client is
     * dragging.  Here we must ensure that the slider doesn't go beyond the
     * left/right of the bar div, as well as moving the slider to its new
     * visual location
     *
     * Parameters:
     * evt - {Event} the browser event
     */
    sliderDrag:function(evt) {
        if (this.mouseDragStart != null) {
            var level= (this.mouseDragStart.x - evt.xy.x)/this.levelBarIntervalLength;
            this.mouseDragStart= evt.xy.clone();
            level= this.adjustLevel(this.getLevel() - level);
            this.setOpacity(level);
            this.updateSlider(this.levelToPos(level));
            this.onSliderMove(level);
			// If the cursor goes further outside the slidebar left, the slider movement is artificially ended
			var offsetX = evt.pageX - getPosition(evt.element).x;
			var offsetY = evt.pageY - getPosition(evt.element).y;
			if ( offsetX>6 || offsetX<1 || offsetY >10 || offsetY<0 ) {
				this.sliderUp(evt);
			}
            OpenLayers.Event.stop(evt);
        }
    },

    /**
     * Method: sliderUp
     * Perform cleanup when a mouseup event is received -- discover new
     * percentage level and switch to it.
     *
     * Parameters:
     * evt - {Event} the browser event
     */
    sliderUp:function(evt) {
        if (!OpenLayers.Event.isLeftClick(evt)) {
            return;
        }
        if (this.mouseDragStart) {
            if (evt.element){
                evt.element.className= 'gpControlSliderBaseHandle';
            } else {
                this.slider.className= 'gpControlSliderBaseHandle';
            }
            this.map.events.un({
                "mouseup": this.passEventToSlider,
                "mousemove": this.passEventToSlider,
                scope: this
            });
            OpenLayers.Event.stopObserving(window,"mouseup",OpenLayers.Function.bindAsEventListener(this.sliderUp,this));
            var level;
            if (evt.xy){
                level= (this.mouseDragStart.x - evt.xy.x)/this.levelBarIntervalLength;
                level= this.adjustLevel(this.getLevel() - level);
            } else {
                level = this.adjustLevel(this.getLevel());
            }
            this.setOpacity(level);
            this.moveSlider();
            this.mouseDragStart= null;
            OpenLayers.Event.stop(evt);
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.LayerOpacitySlider"*
     */
    CLASS_NAME: "Geoportal.Control.LayerOpacitySlider"
});

function getPosition(element) {
    var xPosition = 0;
    var yPosition = 0;
    while(element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
    return { x: xPosition, y: yPosition };
}
