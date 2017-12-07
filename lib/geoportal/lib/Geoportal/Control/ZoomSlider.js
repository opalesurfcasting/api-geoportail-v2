/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/SliderBase.js
 */
/**
 * Class: Geoportal.Control.ZoomSlider
 *
 * The control's structure is as follows :
 *
 * (start code)
 *   <div id="#{Id}" class="gpControlLayerZoomSlider">
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
Geoportal.Control.ZoomSlider=
    OpenLayers.Class(Geoportal.Control.SliderBase, {

    /**
     * Property: minpos
     * {Integer} lowest pixel position of the zoom slider handle.
     */
    minpos: 0,

    /**
     * Property: maxpos
     * {Integer} highest pixel position of the zoom slider handle.
     */
    maxpos: 0,

    /**
     * APIProperty: getLevel
     * {Function} Returns the current zoom. Defaults to this.map.getZoom().
     */
    getLevel: function() {
        var zoom= this.map.getZoom();
        return zoom;
    },

    /**
     * APIProperty: getMaxAbsoluteLevels
     * {Function} Returns the maximum zoom available for this zoom bar.
     * Defaults to this.map.getNumZoomLevels().
     */
    getMaxAbsoluteLevels: function() { return this.map.getNumZoomLevels(); },

    /**
     * Constructor: Geoportal.Control.ZoomSlider
     * Build a zoombar.
     *      See <Geoportal.Control.SliderBase> for more informations.
     */
    initialize: function() {
        Geoportal.Control.SliderBase.prototype.initialize.apply(this, arguments);
    },

    /**
     * APIMethod: destroy
     * Unregister events and delete the zoombar.
     */
    destroy: function() {
        if (this.map) {
            this.map.events.un({
                "zoomend": this.moveSlider,
                "changebaselayer": this.changeBaseLayer,
                scope: this
            });
        }

        Geoportal.Control.SliderBase.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: setMap
     * Set the map and register "changebaselayer" event.
     *
     * Parameters:
     * map - {<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>}
     */
    setMap: function(map) {
        Geoportal.Control.SliderBase.prototype.setMap.apply(this, arguments);
        this.map.events.register("changebaselayer", this, this.changeBaseLayer);
    },

    /**
     * APIMethod: changeBaseLayer
     * Listener of the map's event 'changebaselayer'.
     *      Computes and sets properties for the slider.
     *
     * Parameters:
     * evt - {Event} the 'changebaselayer' event.
     */
    changeBaseLayer: function(evt) {
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
        this.redraw();
    },

    /**
     * Method: draw
     * Draw the zoombar and register "zoomend" event.
     *
     * Parameters:
     * px - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} the position where to draw the control.
     *
     * Returns:
     * {DOMElement} the control's div.
     */
    draw: function(px) {
        Geoportal.Control.SliderBase.prototype.draw.apply(this,arguments);
        var h= parseInt(this.levelBarDiv.style.height);
        this.minpos= h + this.levelToPos(this.getMinSelectableLevel()) + this.sliderImgHeight  ;// 0
        this.maxpos= h + this.levelToPos(this.getMaxSelectableLevel()) + 3*this.sliderImgHeight/2;// h

        this.map.events.register("zoomend", this, this.moveSlider);
        return this.div;
    },

    /**
     * Method: singleClick
     * Picks up on clicks directly on the zoombar div
     *      and sets the zoom level appropriately.
     *
     * Parameters:
     * evt - {Event} the browser event.
     */
    singleClick: function (evt) {
        if (!OpenLayers.Event.isLeftClick(evt)) {
            return;
        }
        var level= evt.xy.y/this.levelBarIntervalLength;
        if(!this.map.fractionalZoom) {
            level= Math.floor(level);
        }
        level= this.adjustLevel(level);
        this.map.zoomTo(level);
        this.moveSlider();
        OpenLayers.Event.stop(evt);
    },

    /**
     * Method: displayInfo
     * Set the title with the current approximative scale.
     *
     * Parameters:
     * evt - {Event} the browser event.
     */
    displayInfo: function (evt) {
        var level= evt.xy.y/this.levelBarIntervalLength;
        if(!this.map.fractionalZoom) {
            level= Math.floor(level);
        }
        this.div.title= OpenLayers.i18n('approx.scale')+this.map.getApproxScaleDenominator(level);
    },

    /**
     * Method: sliderDrag
     * This is what happens when a click has occurred, and the client is
     * dragging.  Here we must ensure that the slider doesn't go beyond the
     * bottom/top of the zoombar div, as well as moving the slider to its
     * new visual location.
     *
     * Parameters:
     * evt - {Event} the browser event.
     */
    sliderDrag:function(evt) {
        if (this.mouseDragStart != null) {
            var deltaY= this.mouseDragStart.y - evt.xy.y;
            var offsets= OpenLayers.Util.pagePosition(this.levelBarDiv);
            var epos= evt.clientY - offsets[1];
            if ((this.minpos <= epos) && (epos < this.maxpos)) {
                var ctop= parseInt(this.slider.style.top);
                this.updateSlider(ctop - deltaY);
                this.mouseDragStart= evt.xy.clone();
            }
            OpenLayers.Event.stop(evt);
        }
    },

    /**
     * Method: sliderUp
     * Perform cleanup when a mouseup event is received -- discover new zoom
     * level and switch to it.
     *
     * Parameters:
     * evt - {Event} the browser event.
     */
    sliderUp:function(evt) {
        if (!OpenLayers.Event.isLeftClick(evt)) {
            return;
        }
        if (this.downEventStart) {
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
            var deltaY;
            if (evt.xy){
                deltaY= this.mouseDragStart.y - evt.xy.y;
            } else {
                deltaY = 0;
            }
            var ctop= parseInt(this.slider.style.top);
            var position= ctop - deltaY;
            var level= this.posToLevel(position);
            if(!this.map.fractionalZoom) {
                level= Math.floor(level);
            }
            level= this.adjustLevel(level);
            this.map.zoomTo(level);
            this.moveSlider();
            this.mouseDragStart= null;
            this.downEventStart= null;
            OpenLayers.Event.stop(evt);
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.ZoomSlider"*
     */
    CLASS_NAME: "Geoportal.Control.ZoomSlider"
});
