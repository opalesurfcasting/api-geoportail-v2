/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/UI.js
 */
/**
 * Class: Geoportal.Control
 * The Geoportal framework controlers base class.
 *
 * Inherits from:
 * - <OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>
 */
Geoportal.Control= OpenLayers.Class( OpenLayers.Control, {

    /**
     * Property: uis
     * {Array(String)} List of supported UI classes.  Add to this list to
     * add support for additional uis. This list is ordered :
     * the first ui which returns true for the  'supported()'
     * method will be used, if not defined in the 'ui' option.
     */
    uis: ["Geoportal.UI"],

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control"*
     */
    CLASS_NAME:"Geoportal.Control"
});

/*
 * If Geoportal Minimum API provides overloads :
 */
if (OpenLayers.UI && !OpenLayers.UI.Panel) {//minimum API

    Geoportal.Control= OpenLayers.overload(Geoportal.Control, {

        initialize:function(options) {
            // We do this before the extend so that instances can override className in options.
            this.displayClass= this.CLASS_NAME.replace("Geoportal.","gp").replace(/\./g,"");

            OpenLayers.Util.extend(this,options);
            this.events = new OpenLayers.Events(this, null, this.EVENT_TYPES);
            if(this.eventListeners instanceof Object) {
                this.events.on(this.eventListeners);
            }
            if (this.id==null) {
                this.id= OpenLayers.Util.createUniqueID(this.CLASS_NAME+"_");
            }
        }
        
    });

}

/**
 * APIFunction: selectFeature
 * Default Geoportal behavior function when selecting feature : a popup is
 * created.
 *
 * Parameters:
 * feature - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>} the selected feature.
 */
Geoportal.Control.selectFeature= function(feature) {
    if (feature) {
        if (!feature.popup) {
            feature.createPopup();
        }
        if (feature.layer && feature.layer.map && feature.popup) {
            feature.layer.map.addPopup(feature.popup);
        }
    }
};

/**
 * APIFunction: renderFeatureAttributes
 * Default Geoportail behavior fonction to render a feature as a table of its
 * attributes.
 *
 * Parameters:
 * feature - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>} the feature to render.
 * skip - Array({String}) the attributes name in lowercase not to render.
 *
 * Returns:
 * Array({String}) the header and table.
 */
Geoportal.Control.renderFeatureAttributes= function(feature, skip) {
    if (!feature) { return ['',''];}
    if (!skip) { skip= []; }
    skip.unshift('styleUrl');//prevent it!

    var tempText= '<table border="1" cellspacing="0" cellpadding="0">';
    var name= '';
    for (var k in feature.attributes) {
        if (feature.attributes.hasOwnProperty(k) &&
            (OpenLayers.Array.filter(skip,function(item){return new RegExp("^"+k+"$","i").test(item)})).length==0) {
            if (k.toLowerCase()=='name') {
                if (feature.attributes[k] && typeof(feature.attributes[k])=='object') {
                    name= feature.attributes[k].value;
                } else {
                    name= feature.attributes[k];
                }
                name= name || '';
            }
            tempText+=
                '<tr>'+
                    '<td class="gpAttName">'+k+'</td>'+
                    '<td class="gpAttValue">'+
                        (feature.attributes[k] && typeof(feature.attributes[k])=='object'?
                            feature.attributes[k].value
                        :   feature.attributes[k]) || ''+
                    '</td>'+
                '</tr>';
        }
    }
    tempText+= '</table>';
    return [name, tempText];
};

/**
 * APIFunction: hoverFeature
 * Default Geoportal behavior function when hovering feature : a popup is
 * created.
 *
 * Parameters:
 * feature - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>} the hovered feature.
 */
Geoportal.Control.hoverFeature= function(feature) {
    if (feature) {
        if (!feature.popup) {
            var T= Geoportal.Control.renderFeatureAttributes(feature);
            if (!feature.popupClass) {//FIXME for parameters ...
                feature.popupClass=
                    feature.layer && feature.layer.formatOptions && feature.layer.formatOptions.popupClass?
                    feature.layer.formatOptions.popupClass
                :   typeof(OpenLayers.Popup)!='undefined' && typeof(OpenLayers.Popup.FramedCloud)!='undefined'?
                    OpenLayers.Popup.FramedCloud
                :   null;
            }
            if (feature.popupClass) {
                feature.popup= new feature.popupClass(
                    "chicken",
                    feature.geometry.getBounds().getCenterLonLat(),
                    null,
                    '<div class="gpPopupHead">' + T[0] + '</div>' +
                    '<div class="gpPopupBody">' + T[1] + '</div>',
                    null,
                    false
                );
                Geoportal.Popup.completePopup(feature.popup,{
                    maxSize:new OpenLayers.Size(300,300),
                    overflow:'auto'});
            } else {
                feature.popup= null;
            }
        }
        if (feature.layer && feature.layer.map && feature.popup) {
            feature.layer.map.addPopup(feature.popup,true);
        }
    }
};

/**
 * APIFunction: unselectFeature
 * Default Geoportal behavior function when unselecting feature : the popup is
 * removed and destroyed.
 *
 * Parameters:
 * feature - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>} the feature that got unselected.
 */
Geoportal.Control.unselectFeature= function(feature) {
    if (feature) {
        if (feature.popup) {
            feature.popup.destroy();
            feature.popup= null;
        }
    }
};

/**
 * APIFunction: mapMouseOut
 * Helper callback for controls that need to trigger a "mapmouseout" event.
 * Usefull for having a listener to a "mouseover" event for such controls.
 * Parameters:
 * evt - {Event} the browser event
 */
Geoportal.Control.mapMouseOut= function(evt) {
    if (this.map && this.map.events) {
        this.map.events.triggerEvent("mapmouseout");
        if (evt!=null) {
            OpenLayers.Event.stop(evt);
        }
    }
};

/**
 * APIFunction: mapMouseOver
 * Helper callback for controls that need to trigger a "mapmouseover" event.
 * Usefull for having a listener to a "mouseout" event for such controls.
 * Parameters:
 * evt - {Event} the browser event
 */
Geoportal.Control.mapMouseOver= function(evt) {
    if (this.map && this.map.events) {
        this.map.events.triggerEvent("mapmouseover");
        if (evt!=null) {
            OpenLayers.Event.stop(evt);
        }
    }
};
