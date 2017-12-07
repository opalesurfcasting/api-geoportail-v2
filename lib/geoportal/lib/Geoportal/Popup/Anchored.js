/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Popup.js
 */
/**
 * Class: Geoportal.Popup.Anchored
 * The Geoportal framework anchored popup class.
 *
 * Inherits from:
 * - {<Geoportal.Popup>}
 * - {<OpenLayers.Popup.Anchored>}
 */
Geoportal.Popup.Anchored= OpenLayers.Class(Geoportal.Popup, {

    /** 
     * Parameter: relativePosition
     * {String} Relative position of the popup ("br", "tr", "tl" or "bl").
     */
    relativePosition: null,

    /**
     * APIProperty: keepInMap 
     * {Boolean} If panMapIfOutOfView is false, and this property is true, 
     *     contrain the popup such that it always fits in the available map
     *     space. By default, this is set. If you are creating popups that are
     *     near map edges and not allowing pannning, and especially if you
     *     have
     *     a popup which has a fixedRelativePosition, setting this to false
     *     may
     *     be a smart thing to do.
     *   
     *     For anchored popups, default is true, since subclasses will
     *     usually want this functionality.
     */
    keepInMap: true,

    /**
     * Parameter: anchor
     * {Object} Object to which we'll anchor the popup. Must expose a 
     *     'size' (<OpenLayers.Size>) and 'offset' (<OpenLayers.Pixel>).
     */
    anchor: null,

    /**
     * Constructor: Geoportal.Popup.Anchored
     * Build a popup linked with a feature.
     *
     * Parameters:
     * id - {String}
     * lonlat - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>}
     * contentSize - {<OpenLayers.Size at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Size-js.html>}
     * contentHTML - {String}
     * anchor - {Object} Object to which we'll anchor the popup. Must expose
     *     a 'size' (<OpenLayers.Size at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Size-js.html>)
     *     and 'offset' (<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>)
     *     (Note that this is generally an <OpenLayers.Icon at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Icon-js.html>).
     * closeBox - {Boolean}
     * backgroundColor - {Integer}
     * opacity - {Float}
     * closeBoxCallback - {Function} Function to be called on closeBox click.
     * feature - {<OpenLayers.Feature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature-js.html>} the feature linked with this popup.
     */
    initialize:function(id, lonlat, contentSize, contentHTML, anchor, closeBox, backgroundColor, opacity, closeBoxCallback, feature) {
        var newArguments= [id, lonlat, contentSize, contentHTML, closeBox, closeBoxCallback, feature];
        Geoportal.Popup.prototype.initialize.apply(this, newArguments);
        this.anchor= (anchor != null?
            anchor
        :   {
                size: new OpenLayers.Size(0,0),
                offset: new OpenLayers.Pixel(0,0)
        });

        this.setBorder("2px solid #000000");
        this.backgroundColor= backgroundColor || this.backgroundColor;
        this.opacity= opacity || this.opacity;
        this.panMapIfOutOfView= feature &&
                                feature.layer &&
                                feature.layer.options &&
                                feature.layer.options.panMapIfOutOfView || false;
    },

    /**
     * APIMethod: destroy
     * Clean the popup.
     */
    destroy: function() {
        this.anchor= null;
        this.relativePosition= null;

        Geoportal.Popup.prototype.destroy.apply(this, arguments);
    },

    /**
     * APIMethod: show
     * Overridden from Popup since user might hide popup and then show() it
     *     in a new location (meaning we might want to update the relative
     *     position on the show)
     */
    show: function() {
        this.updatePosition();
        Geoportal.Popup.prototype.show.apply(this, arguments);
    },

    /**
     * APIMethod: moveTo
     * Since the popup is moving to a new px, it might need also to be moved
     *     relative to where the marker is. We first calculate the new
     *     relativePosition, and then we calculate the new px where we will
     *     put the popup, based on the new relative position.
     *
     *     If the relativePosition has changed, we must also call
     *     updateRelativePosition() to make any visual changes to the popup
     *     which are associated with putting it in a new relativePosition.
     *
     * Parameters:
     * px - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} location to move to
     */
    moveTo: function(px) {
        var oldRelativePosition= this.relativePosition;
        this.relativePosition= this.calculateRelativePosition(px);

        var newPx= this.calculateNewPx(px);
        Geoportal.Popup.prototype.moveTo.apply(this,[newPx]);

        //if this move has caused the popup to change its relative position,
        // we need to make the appropriate cosmetic changes.
        if (this.relativePosition != oldRelativePosition) {
            this.updateRelativePosition();
        }
    },

    /**
     * APIMethod: setSize
     * Assign the size to the popup and move it around accordingly.
     *
     * Parameters:
     * contentSize - {<OpenLayers.Size at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Size-js.html>}
     */
    setSize:function(contentSize) {
        Geoportal.Popup.prototype.setSize.apply(this, arguments);

        if ((this.lonlat) && (this.map)) {
            var px= this.map.getLayerPxFromLonLat(this.lonlat);
            this.moveTo(px);
        }
    },

    /** 
     * Method: calculateRelativePosition
     * 
     * Parameters:
     * px - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>}
     * 
     * Returns:
     * {String} The relative position ("br" "tr" "tl" "bl") at which the popup
     *     should be placed.
     */
    calculateRelativePosition:function(px) {
        var lonlat= this.map.getLonLatFromLayerPx(px);

        var extent= this.map.getExtent();
        var quadrant= extent.determineQuadrant(lonlat);

        return OpenLayers.Bounds.oppositeQuadrant(quadrant);
    },

    /**
     * Method: updateRelativePosition
     * The popup has been moved to a new relative location, so we may want to 
     *     make some cosmetic adjustments to it. 
     * 
     *     Note that in the classic Anchored popup, there is nothing to do 
     *     here, since the popup looks exactly the same in all four positions.
     *     Subclasses such as the AnchoredBubble and Framed, however, will 
     *     want to do something special here.
     */
    updateRelativePosition: function() {
        //to be overridden by subclasses
    },

    /** 
     * Method: calculateNewPx
     * 
     * Parameters:
     * px - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>}
     * 
     * Returns:
     * {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} The new px position of the popup on the screen
     *     relative to the passed-in px.
     */
    calculateNewPx:function(px) {
        var newPx= px.offset(this.anchor.offset);

        //use contentSize if size is not already set
        var size= this.size || this.contentSize;

        var top= (this.relativePosition && this.relativePosition.charAt(0) == 't');
        newPx.y += (top) ? -size.h : this.anchor.size.h;

        var left= (this.relativePosition && this.relativePosition.charAt(1) == 'l');
        newPx.x += (left) ? -size.w : this.anchor.size.w;

        return newPx;
    },

//    /**
//     * Method: panIntoView
//     * Pan the map such that the popup is at the map's center (eventually).
//     */
//    panIntoView: function() {
//        if (this.map) {
//            var differenceX= 0;
//            var differenceY= 0;
//            var ll= this.map.getCenter();
//            var mx= this.map.getLayerPxFromLonLat(ll);
//            var msw= this.map.getSize().w;
//            var msh= this.map.getSize().h;
//            var px= this.map.getLayerPxFromLonLat(this.lonlat);
//            var psw= this.div.style['width'];
//            psw= parseInt(psw.replace('px',''));
//            var psh= this.div.style['height'];
//            psh= parseInt(psh.replace('px',''));
//            // if popup size is greater than map size, try best :
//            if (msw < psw || msh < psh) {
//                this.panIntoView();
//                return;
//            }
// 
//            differenceX= px.x - mx.x + (psw/2);
//            differenceY= px.y - mx.y - (psh/2);
//            // if a significant difference has been assigned call the Shift Method
//            if (Math.abs(differenceX)>50 || Math.abs(differenceY)>50) {
//                this.map.pan(differenceX,differenceY);
//            }
//        }
//    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Popup.Anchored"*
     */
    CLASS_NAME: "Geoportal.Popup.Anchored"
});

/**
 * Method: _creat4KML
 * Create function for KML based features.
 *      the calling context is the feature.
 *      Use *skipAttributes* property on {<OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html>} not to
 *      display the attributes set in this property ({Array({String})).
 *
 * Returns:
 * {<Geoportal.Popup.Anchored>} - the popup.
 */
Geoportal.Popup.Anchored._creat4KML= function() {
    var popup;
    var opts= OpenLayers.Util.extend({},this.layer.formatOptions);
    OpenLayers.Util.applyDefaults(
        opts,{
            size:null,
            closeBox:true,
            onPopupClose:Geoportal.Popup.onPopupClose,
            backgroundColor:'#ffffff',
            opacity:0.75
        });
    var popupClass= this.layer.formatOptions && this.layer.formatOptions.popupClass?
        this.layer.formatOptions.popupClass
    :   Geoportal.Popup.Anchored;
    var tempText;
    if (this.style) {
        // add style pop-up define in kml's file
        // user can use in kml's file variable like '$[name]'
        // which correspond to balise inside placemark like <name>,<description>,<adresses>
        tempText= this.style.balloonStyle;
        if (tempText != null) {
            var rx= /\$\{([a-zA-Z0-9_\-\.]*)\}/;
            while(tempText.match(rx)) {
                var test= RegExp.$1;
                test= (this.attributes[test]?
                    (this.attributes[test].value?
                        this.attributes[test].value
                    :   this.attributes[test])
                :   "");
                tempText= tempText.replace(rx,test);
            }
        } else {
/*
            tempText= (this.attributes.name? this.attributes.name+"<br/>":"")+
                      (this.attributes.description? this.attributes.description:"");
            tempText= Geoportal.Util.cleanContent(tempText);
 */
            var skip= this.layer.skipAttributes? this.layer.skipAttributes.slice(0) : [];
            var name= '';
            if (typeof(this.attributes.name)=='object') {
                name= this.attributes.name.value || '';
            } else {
                name= this.attributes.name || '';
            }
            if (name) { skip.push('name'); }
            if (typeof(this.attributes.description)=='object') {
                tempText= this.attributes.description.value || '';
            } else {
                tempText= this.attributes.description || '';
            }
            tempText= Geoportal.Util.cleanContent(tempText);
            if (tempText) { skip.push('description'); }
            var T= Geoportal.Control.renderFeatureAttributes(this,skip);
            name= name || T[0];
            if (tempText!='' && T[1]!='') {
                tempText+='<br/>';
            }
            tempText+= T[1];
            tempText= (name? name+"<br/>":"")+tempText;
        }

        popup= new popupClass(
            "chicken",
            this.geometry.getBounds().getCenterLonLat(),
            opts.size,
            this.style.textColor?
                "<div class='gpPopupBody gpKML' style='"+this.style.textColor+";'>"+tempText+"</div>"
            :
                "<div class='gpPopupBody gpKML'>"+tempText+"</div>",
            null,
            opts.closeBox,
            this.style.bgColor,
            this.style.bgColorOpacity,
            opts.onPopupClose,
            this
        );
    } else {
        //if there are no style defines in kml's file
        var skip= this.layer.skipAttributes? this.layer.skipAttributes.slice(0) : [];
        var name= '';
        if (typeof(this.attributes.name)=='object') {
            name= this.attributes.name.value || '';
        } else {
            name= this.attributes.name || '';
        }
        if (name) { skip.push('name'); }
        if (typeof(this.attributes.description)=='object') {
            tempText= this.attributes.description.value || '';
        } else {
            tempText= this.attributes.description || '';
        }
        tempText= Geoportal.Util.cleanContent(tempText);
        if (tempText) { skip.push('description'); }
        var T= Geoportal.Control.renderFeatureAttributes(this,skip);
        name= name || T[0];
        if (tempText!='' && T[1]!='') {
            tempText+='<br/>';
        }
        tempText+= T[1];
        popup= new popupClass(
            "chicken",
            this.geometry.getBounds().getCenterLonLat(),
            opts.size,
             "<div class='gpPopupHead gpKML'>" + name + "</div>" +
             "<div class='gpPopupBody gpKML'>" + tempText + "</div>",
            null,
            opts.closeBox,
            opts.backgroundColor,
            opts.opacity,
            opts.onPopupClose,
            this
        );
    }
    popup= Geoportal.Popup.completePopup(popup,this.layer.formatOptions);
    this.popup= popup;
    return this.popup;
};

/**
 * APIMethod: createPopUpForKMLFeature
 * Create function for KML based feature and give a style to the popup.
 * Used for OpenLayers.Format.KML on "featureadded" event through
 * <OpenLayers.Layer.Vector.onFeatureInsert at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html#OpenLayers.Layer.Vector.onFeatureInsert>() callback.
 *
 * Parameters:
 * feature - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>}
 */
Geoportal.Popup.Anchored.createPopUpForKMLFeature= function(feature) {
    feature.createPopup= OpenLayers.Function.bind(Geoportal.Popup.Anchored._creat4KML,feature);
};

/**
 * Method: _creat4GPX
 * Create function for GPX based features.
 *      the calling context is the feature.
 *
 * Returns:
 * {<Geoportal.Popup.Anchored>} - the popup.
 */
Geoportal.Popup.Anchored._creat4GPX= function() {
    var opts= OpenLayers.Util.extend({},this.layer.formatOptions);
    OpenLayers.Util.applyDefaults(
        opts,{
            size:this.layer.map.getSize(),
            closeBox:true,
            onPopupClose:Geoportal.Popup.onPopupClose,
            backgroundColor:'#ffffff',
            opacity:0.75
        });
    var popupClass= this.layer.formatOptions && this.layer.formatOptions.popupClass?
        this.layer.formatOptions.popupClass
    :   Geoportal.Popup.Anchored;
    var tempText= (this.attributes.desc? this.attributes.desc+"<br/>":"");
    tempText+= (this.attributes.cmt? this.attributes.cmt+"<br/>":"");
    tempText+= (this.attributes.ele? this.attributes.ele:"");
    tempText= Geoportal.Util.cleanContent(tempText);
    var popup= new popupClass(
        "chicken",
        this.geometry.getBounds().getCenterLonLat(),
        //taille devra s'adapter au contenu
        this.layer.map.getSize(),
         "<div class='gpPopupHead gpGPX'>" +
            (this.attributes.name? this.attributes.name:"") +
         "</div>" +
         "<div class='gpPopupBody gpGPX'>" +
            tempText +
         "</div>",
        null,
        opts.closeBox,
        opts.backgroundColor,
        opts.opacity,
        opts.onPopupClose,
        this
    );
    popup= Geoportal.Popup.completePopup(popup,this.layer.formatOptions);
    this.popup= popup;
    return this.popup;
};

/**
 * APIFunction: createPopUpForGPXFeature
 * Create function for GPX based feature and give a style to the popup.
 * Used for OpenLayers.Format.GPX on "featureadded" event through
 * <OpenLayers.Layer.Vector.onFeatureInsert at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html#OpenLayers.Layer.Vector.onFeatureInsert>() callback.
 *
 * Parameters:
 * feature - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>}
 */
Geoportal.Popup.Anchored.createPopUpForGPXFeature= function(feature) {
    feature.createPopup= OpenLayers.Function.bind(Geoportal.Popup.Anchored._creat4GPX,feature);
};

/**
 * Method: _creat4GML
 * Create function for GML based features.
 *      the calling context is the feature.
 *
 * Returns:
 * {<Geoportal.Popup.Anchored>} - the popup.
 */
Geoportal.Popup.Anchored._creat4GML= function() {
    var opts= OpenLayers.Util.extend({},this.layer.formatOptions);
    OpenLayers.Util.applyDefaults(
        opts,{
            size:this.layer.map.getSize(),
            closeBox:true,
            onPopupClose:Geoportal.Popup.onPopupClose,
            backgroundColor:'#ffffff',
            opacity:0.75
        });
    var popupClass= this.layer.formatOptions && this.layer.formatOptions.popupClass?
        this.layer.formatOptions.popupClass
    :   Geoportal.Popup.Anchored;
    var T= Geoportal.Control.renderFeatureAttributes(this);
    var popup= new popupClass(
        "chicken",
        this.geometry.getBounds().getCenterLonLat(),
        //taille devra s'adapter au contenu
        opts.size,
        "<div class='gpPopupHead gpGML'>" + T[0] + "</div>" +
        "<div class='gpPopupBody gpGML'>" + T[1] + "</div>",
        null,
        opts.closeBox,
        opts.backgroundColor,
        opts.opacity,
        opts.onPopupClose,
        this
    );
    popup= Geoportal.Popup.completePopup(popup,this.layer.formatOptions);
    this.popup= popup;
    return this.popup;
};

/**
 * APIFunction: createPopUpForGMLFeature
 * Create function for GML based feature and give a style to the popup.
 * Used for OpenLayers.Format.GML on "featureadded" event through
 * <OpenLayers.Layer.Vector.onFeatureInsert at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html#OpenLayers.Layer.Vector.onFeatureInsert>() callback.
 *
 * Parameters:
 * feature - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>}
 */
Geoportal.Popup.Anchored.createPopUpForGMLFeature= function(feature) {
    feature.createPopup= OpenLayers.Function.bind(Geoportal.Popup.Anchored._creat4GML,feature);
};

/**
 * Method: _creat4GeoRSS
 * Create function for GeoRSS based features.
 *      the calling context is the feature.
 *
 * Returns:
 * {<Geoportal.Popup.Anchored>} - the popup.
 */
Geoportal.Popup.Anchored._creat4GeoRSS= function() {
    var opts= OpenLayers.Util.extend({},this.layer.formatOptions);
    OpenLayers.Util.applyDefaults(
        opts,{
            size:this.layer.map.getSize(),
            closeBox:true,
            onPopupClose:Geoportal.Popup.onPopupClose,
            backgroundColor:'#ffffff',
            opacity:0.75
        });
    var popupClass= this.layer.formatOptions && this.layer.formatOptions.popupClass?
        this.layer.formatOptions.popupClass
    :   Geoportal.Popup.Anchored;
    var popup= new popupClass(
        "chicken",
        this.geometry.getBounds().getCenterLonLat(),
        //taille devra s'adapter au contenu
        opts.size,
        "<div class='gpPopupHead gpGeoRSS'>" +
            (this.attributes.link?
                "<a class='gpLink' href='"+this.attributes.link+"' target='_blank'>"
            :   "") +
            (this.attributes.title || "?") +
            (this.attributes.link?
                "</a>"
            :   "") +
        "</div>" +
        "<div class='gpPopupBody gpGeoRSS'>" +
            (this.attributes.description || "") +
            (this.attributes.pubDate && this.attributes.author?
                "<div class='gpGeoRSSOriginator'>" +
                    OpenLayers.i18n("lastUpdateDate") +
                    this.attributes.pubDate +
                    OpenLayers.i18n("by") +
                    this.attributes.author +
                "</div>"
            :   "") +
        "</div>",
        null,
        opts.closeBox,
        opts.backgroundColor,
        opts.opacity,
        opts.onPopupClose,
        this
    );
    popup= Geoportal.Popup.completePopup(popup,this.layer.formatOptions);
    this.popup= popup;
    return this.popup;
};

/**
 * APIFunction: createPopUpForGeoRSSFeature
 * Create function for GeoRSS based feature and give a style to the popup.
 * Used ofr OpenLayers.Format.GML on "featureadded" event through
 * <OpenLayers.Layer.Vector.onFeatureInsert at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html#OpenLayers.Layer.Vector.onFeatureInsert>() callback.
 *
 * Parameters:
 * feature - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>}
 */
Geoportal.Popup.Anchored.createPopUpForGeoRSSFeature= function(feature) {
    feature.createPopup= OpenLayers.Function.bind(Geoportal.Popup.Anchored._creat4GeoRSS,feature);
};

