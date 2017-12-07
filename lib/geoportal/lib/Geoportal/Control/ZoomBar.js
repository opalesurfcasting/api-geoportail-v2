/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/ZoomSlider.js
 * @requires Geoportal/Util.js
 */
/**
 * Class: Geoportal.Control.ZoomBar
 * The Geoportal framework pan and zoom widgets class.
 *
 * The control's structure is as follows :
 *
 * (start code)
 * <div id='#{nameScale}' class='nameScale'>
 *   <div>#{Monde}</div>
 *   <div>#{Pays}</div>
 *   <div>#{Dept}</div>
 *   <div>#{Ville}</div>
 *   <div>#{Rue}</div>
 *   <div>#{Maison}</div>
 * </div>
 * <div id='#{idZoomBar}' style='float:left;'></div>
 * (end)
 *
 * Inherits from:
 *  - {<Geoportal.Control>}
 */
Geoportal.Control.ZoomBar=
    OpenLayers.Class( Geoportal.Control, {

    /**
     * APIProperty: slider
     * {<Geoportal.Control.ZoomSlider>} zoom slider
     */
    slider: null,

    /**
     * APIProperty: scalesNames
     * {Array({String})} scales' names. These names are used to display
     * scale's name based on the following code :
     *
     * (start code)
     * var label= OpenLayers.i18n(this.getDisplayClass()+'.'+this.scalesNames[i]);
     * (end)
     *
     *      Defaults to *['world', 'state', 'country', 'town', 'street', 'house']*
     */
    scalesNames: ['world', 'state', 'country', 'town', 'street', 'house'],

    /**
     * Constructor: Geoportal.Control.ZoomBar
     * Build the complete zoom bar.
     */
    initialize: function() {
        Geoportal.Control.prototype.initialize.apply(this, arguments);
    },

    /**
     * APIMethod: destroy
     * Unregister events and delete the zoom bar.
     */
    destroy: function() {
        if (this.slider) {
            if (this.map) {
                this.map.removeControl(this.slider);
            }
            this.slider.destroy();
            this.slider= null;
        }
        if (this.levelsDivs) {
            for (var i= 0, l= this.levelsDivs.length; i<l; i++) {
                OpenLayers.Event.stopObservingElement(this.levelsDivs[i].div);
            }
            this.levelsDivs= null;
        }

        Geoportal.Control.prototype.destroy.apply(this, arguments);
    },

    /**
     * APIMethod: redraw
     * Clear the div and start over.
     */
    redraw: function() {
        if (this.div != null) {
            if (this.slider) {
                this.slider.destroy();
                this.slider= null;
            }
            this.div.innerHTML= "";
        }
        this.draw(this.position);
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
        // initialize our internal div
        Geoportal.Control.prototype.draw.apply(this, arguments);

        this._addZoomBar();
        return this.div;
    },

    /**
     * Method: _addZoomBar
     * Internal function for drawing the zoom bar
     */
    _addZoomBar:function() {
        var d1= this.div.ownerDocument.createElement('div');
        d1.id= OpenLayers.Util.createUniqueID("nameScale");
        d1.className= 'nameScale';
        this.div.appendChild(d1);
        this.levelsDivs= [];
        var d2;
        for (var i= 0, l= this.scalesNames.length; i<l; i++) {
            d2= this.div.ownerDocument.createElement('div');
            this.levelsDivs.push({
                'div'  :d2,
                'label':this.getDisplayClass()+'.'+this.scalesNames[i]
            });
            d2.innerHTML= OpenLayers.i18n(this.levelsDivs[this.levelsDivs.length-1].label);
            d1.appendChild(d2);
        }
        var sliderId= "Geoportal_Control_ZoomSlider" + this.map.id;
        d1= this.div.ownerDocument.createElement('div');
        d1.id= sliderId;
        if (d1.style.styleFloat==undefined) {
            d1.style.cssFloat= 'left';
        } else {
            d1.style.styleFloat= 'left';
        }
        this.div.appendChild(d1);
        var imgLocation= Geoportal.Util.getImagesLocation();
        this.slider= new Geoportal.Control.ZoomSlider({
            div:d1, //GEO: correction bug moveTo was: OpenLayers.Util.getElement(sliderId),
            levelBarImgWidth: 10,
            levelBarImgHeight: 130,
            levelBarImg: imgLocation+"bg_zoomVertical.gif",
            sliderImgWidth: 15,
            sliderImgHeight: 7,
            getMaxAbsoluteLevels: function() { return Geoportal.Control.ZoomBar.ZOOMRANGE; },
            getMinSelectableLevel: function() {
                if (this.map.baseLayer!=null) {
                    if (this.map.baseLayer instanceof Geoportal.Layer) {//Geoportal case
                        return 0;
                    }
                    if (this.map.baseLayer.minZoomLevel!=undefined) {
                        return this.map.baseLayer.minZoomLevel;
                    }
                }
                return 0;
            },
            getMaxSelectableLevel: function() {
                if (this.map.baseLayer!=null) {
                    if (this.map.baseLayer instanceof Geoportal.Layer) {//Geoportal case
                        if (this.map.baseLayer.name=='_WLD_world_') {
                            var c= this.map.getCenter()?this.map.getCenter():this.map.defaultCenter;
                            c= c.transform(this.map.getProjection(), OpenLayers.Projection.CRS84);
                            var t= this.map.catalogue.findTerritory(c);
                            if (t!='WLD') {
                                var tbl= this.map.getLayersByName('_'+t+'_territory_');
                                if (tbl.length>0) {
                                    return tbl[0].maxZoomLevel;
                                }
                            }
                        }
                        return this.map.baseLayer.maxZoomLevel;
                    }
                    if (this.map.baseLayer.maxZoomLevel!=undefined &&
                        this.map.baseLayer.maxZoomLevel!=this.map.baseLayer.minZoomLevel) {
                        return this.map.baseLayer.maxZoomLevel;
                    }
                }
                var nzl= this.map.getNumZoomLevels();
                if (nzl==null) { nzl= Geoportal.Control.ZoomBar.ZOOMRANGE; }
                return nzl - 1;
            }
        });
        this.map.addControl(this.slider,new OpenLayers.Pixel(10,0));
        var zoomRange= parseInt((this.slider.getMaxSelectableLevel()/(this.levelsDivs.length-1)).toFixed(0));
        d2= this.levelsDivs[0].div;
        OpenLayers.Event.observe(
            d2,
            "click",
            OpenLayers.Function.bindAsEventListener(this.onLabelClick,{'cntrl':this,'zoom':this.slider.getMinSelectableLevel()})
        );
        for (var i= 1, l= this.levelsDivs.length-1; i<l; i++) {
            d2= this.levelsDivs[i].div;
            OpenLayers.Event.observe(
                d2,
                "click",
                OpenLayers.Function.bindAsEventListener(this.onLabelClick,{'cntrl':this,'zoom':1+(zoomRange*i)})
            );
        }
        d2= this.levelsDivs[this.levelsDivs.length-1].div;
        OpenLayers.Event.observe(
            d2,
            "click",
            OpenLayers.Function.bindAsEventListener(this.onLabelClick,{'cntrl':this,'zoom':this.slider.getMaxSelectableLevel()})
        );
        this.changeLang();
    },

    /**
     * Method: onLabelClick
     * Change the map's zoom.
     *
     * Parameters:
     * e - {Event}
     *
     * Context:
     * cntrl - {<Geoportal.Control.ZoomBar>}
     * zoom - {Integer}
     */
    onLabelClick: function(e) {
        if (e != null) {
            OpenLayers.Event.stop(e);
        }
        this.cntrl.map.zoomTo(this.zoom);
    },

    /**
     * Method: changeLang
     * Assigns the current language
     *
     * Parameters:
     * evt - {Event} event fired.
     *      evt.lang holds the new language
     */
    changeLang: function(evt) {
        if (this.levelsDivs) {
            for (var i= 0, l= this.levelsDivs.length; i<l; i++) {
                this.levelsDivs[i].div.innerHTML=
                    OpenLayers.i18n(this.levelsDivs[i].label);
            }
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.ZoomBar"*
     */
    CLASS_NAME: "Geoportal.Control.ZoomBar"
});

/**
 * Constant: ZOOMRANGE
 * {Integer} Number of zooms managed by this control.
 * With Geoportal layers, zooms are between 0 and 20.
 * With Spherical Mercator, zooms are between 0 and 18-22 ...
 *      Default to *21*
 */
Geoportal.Control.ZoomBar.ZOOMRANGE= 21;
