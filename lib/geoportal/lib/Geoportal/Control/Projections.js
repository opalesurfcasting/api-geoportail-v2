/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 */
/**
 * Class: Geoportal.Control.Projections
 * The Geoportal framework projections chooser panel class.
 *      Contribution of gfilliere for UTM zones handling.
 *
 * The control's structure is as follows :
 *
 * (start code)
 * <div id='#{id}' class='gpControlProjections'>
 *   <form id="__fslpj__{#Id}" name="__fslpj__{#Id}" action="javascript:void(null)">
 *     <select id="__slpj__{#Id}" name="__slpj__{#Id}" class="gpSelectProjections">
 *       <option value="0">xxx</option>
 *       <option value="1">yyy</option>
 *       <option value="2">zzz</option>
 *       ...
 *       <option value="__MGRS_UTM__">UTM</option>
 *     </select>
 *   </form>
 * </div>
 * (end)
 *
 * Inherits from:
 *  - {<Geoportal.Control>}
 */
Geoportal.Control.Projections=
    OpenLayers.Class( Geoportal.Control, {

    /**
     * APIProperty: displayProjections
     * {Array({<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>})} List of selectable display
     * projections.
     */
    displayProjections: null,

    /**
     * Property: displayProjection
     * {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} current display projection in case of MGRS
     * projections.
     */
    displayProjection: null,

    /**
     * Property: selectProjs
     * {DOMElement} the projections selector.
     */
    selectProjs: null,

    /**
     * APIMethod: destroy
     * Unregister and delete the control
     */
    destroy: function() {
        if (this.map) {
            this.map.events.unregister("controldeleted", this, this.onControlRemoved);
            this.map.events.unregister("changebaselayer", this, this.changeDisplayProjections);
            // Unregister mousemove and moveend if needed
            if (this.displayProjection && this.displayProjection.isUTMZoneProjection()) {
                this.map.events.unregister("mousemove", this, this.updateDisplayProjections);
                this.map.events.unregister("moveend", this, this.updateDisplayProjections);
            }
        }
        if (this.selectProjs) {
            OpenLayers.Event.stopObservingElement(this.selectProjs);
            this.selectProjs= null;
        }
        this.displayProjections= null;
        Geoportal.Control.prototype.destroy.apply(this, arguments);
    },

    /**
     * APIMethod: setMap
     * Set the map property for the control.
     *
     * Parameters:
     * map - {<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>}
     */
    setMap: function(map) {
        Geoportal.Control.prototype.setMap.apply(this,arguments);
        this.map.events.register("changebaselayer", this, this.changeDisplayProjections);
        this.map.events.register("controldeleted", this, this.onControlRemoved);
    },

    /**
     * Method: changeDisplayProjections
     * Redraw the control after the base layer changed in case of the display
     * projections have changed.
     *
     * Parameters:
     * evt - {Event} event fired
     *     evt.displayProjection holds the new projection
     */
    changeDisplayProjections: function(evt) {
        if (!evt) { return; }
        if (this.map && this.map.baseLayer) {
            if (!this.displayProjections) {
                var mp= this.map.displayProjection || this.map.getProjection();
                var mp= evt.layer.displayProjection?
                        evt.layer.displayProjection.clone()
                    :   evt.layer.getNativeProjection().clone();
                this.displayProjections= mp;
                for (var i= 0, len= this.displayProjections.length; i<len; i++) {
                    var dp= this.displayProjections[i];
                    if (typeof(dp) == 'string') {
                        this.displayProjections[i]= new OpenLayers.Projection(dp);
                    }
                }
                this.redraw();
            }
        }
    },

    /**
     * Method: onControlRemoved
     * Checks whether the keyboard control has been removed from the map or
     * not.
     *
     * Parameters:
     * evt - {Event} event fired
     *     evt.control holds the almost removed control
     */
    onControlRemoved: function(evt) {
        if (!evt) { return; }
        if (this.selectProjs && this.selectProjs.kbControl && this.selectProjs.kbControl===evt.control) {
            this.selectProjs.kbControl= null;
        }
    },

    /**
     * Method: updateDisplayProjections
     * Called on mousemove and moveend. Updates the displayProjection based on
     * the current bounds. For instance, UTM projections have specific area of
     * interest.
     *
     * Parameters:
     * evt - {Event} event fired
     */
    updateDisplayProjections: function(evt) {
        if (this.displayProjection && this.displayProjection.isUTMZoneProjection()) {
            // standard UTM zone
            this.updateMGRS(evt);
            return;
        }
        return;
    },

    /**
     * Method: updateMGRS
     * Called on mousemove and moveend. Updates the displayProjection
     * with the correct UTM zone if needed and found.
     *
     * Parameters:
     * evt - {Event} the browser event
     *
     * Author: gfilliere
     */
    updateMGRS: function(evt) {
        // get coordinates :
        var lonLat= null;
        if (evt==null || evt.xy==undefined) {
            lonLat= this.map.getCenter();
            if (!lonLat) {
                lonLat= new OpenLayers.LonLat(0,0);
            }
        } else {
            lonLat= this.map.getLonLatFromPixel(evt.xy);
        }
        if (!lonLat) {
            return;
        }
        // in geographic coordinates :
        lonLat.transform(this.map.getProjection(),OpenLayers.Projection.CRS84);
        // Before searching for a new zone let's see if we're still in the
        // same one :
        if (this.displayProjection && !this.displayProjection.domainOfValidity.containsLonLat(lonLat)) {
            // The zone has changed, we search the new one and update
            var dp= this.lookupUTMZone(lonLat);
            if (dp!=null) {
                this.displayProjection= dp;
                this.map.displayProjection= dp;
                this.map.events.triggerEvent("changedisplayprojection", {displayProjection: dp});
            }
        }
    },

    /**
     * APIMethod: redraw
     * Clear the div and start over.
     */
    redraw: function() {
        if (this.div != null) {
            this.div.innerHTML= "";
        }
        this.draw();
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

        var f= this.div.ownerDocument.createElement('form');
        f.id= '__fslpj__'+this.id;
        f.name= f.id;
        f.action= 'javascript:void(null)';
        this.selectProjs= this.div.ownerDocument.createElement('select');
        this.selectProjs.id= '__slpj__'+this.id;
        this.selectProjs.name= this.selectProjs.id;
        this.selectProjs.className= 'gpSelectProjections';
        f.appendChild(this.selectProjs);
        var utmZones= -1;
        for (var i= 0, n= this.displayProjections.length; i<n; i++) {
            var dp= this.displayProjections[i];
            var label= OpenLayers.String.trim(dp.getTitle({force:true}));
            if (label.length==0) {
                continue;
            }
            var value= i;
            // filter UTM projections
            if (dp.isUTMZoneProjection()) {
                // if UTM zones are available then we create only one entry in the
                // projections list selector.
                if (utmZones!=-1) {
                    continue;
                }
                utmZones= i;
                value= Geoportal.Control.Projections.MGRS_UTM;
                label= OpenLayers.i18n('utm.zone');
            }
            var o= this.div.ownerDocument.createElement('option');
            o.value= value;
            o.appendChild(this.div.ownerDocument.createTextNode(label));
            this.selectProjs.appendChild(o);
        }
        //FIXME: check domainOfValidity with map's extent ?
        this.selectProjs.hasFocus= false;
        this.selectProjs.kbControl=
            this.map.getControlsByClass(OpenLayers.Control.KeyboardDefaults.prototype.CLASS_NAME)[0];
        OpenLayers.Event.observe(
            this.selectProjs,
            "click",
            OpenLayers.Function.bind(this.onProjectionClick,this,this.selectProjs)
        );
        OpenLayers.Event.observe(
            this.selectProjs,
            "change",
            OpenLayers.Function.bind(this.onProjectionChange,this,this.selectProjs)
        );
        this.div.appendChild(f);

        return this.div;
    },

    /**
     * Method: onProjectionClick
     * A new display projection has been clicked.
     *
     * Parameters:
     * elm - {DOMElement} the select element.
     * evt - {<OpenLayers.Event at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Event-js.html>} the fired event.
     */
    onProjectionClick: function(elm, evt) {
        if (evt || window.event) OpenLayers.Event.stop(evt? evt : window.event);
        if (elm.kbControl) {
            if (elm.kbControl.active) {
                elm.kbControl.deactivate();
            }
        }
        elm.hasFocus= true;
        elm.focus();
    },

    /**
     * Method: onProjectionChange
     * A new display projection has been selected.
     *
     * Parameters:
     * elm - {DOMElement} the select element.
     * evt - {<OpenLayers.Event at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Event-js.html>} the fired event.
     */
    onProjectionChange: function(elm, evt) {
        if (evt || window.event) OpenLayers.Event.stop(evt? evt : window.event);
        /*
         * find out whether we are in UTM or not :
         */
        if (elm.options[elm.selectedIndex].value != Geoportal.Control.Projections.MGRS_UTM) {
            // If the current display projection is a UTM one, we unregister
            // the mouse events
            if (this.displayProjection && this.displayProjection.isUTMZoneProjection()) {
                this.map.events.unregister("mousemove", this, this.updateDisplayProjections);
                this.map.events.unregister("moveend", this, this.updateDisplayProjections);
            }
            this.displayProjection= this.displayProjections[elm.options[elm.selectedIndex].value];
        } else {
            // UTM zone, find the relevant one ...
            var dp= this.lookupUTMZone(
                this.map.getCenter().transform(this.map.getProjection(),OpenLayers.Projection.CRS84)
            );
            if (dp!=null) {
                if (this.displayProjection && !this.displayProjection.isUTMZoneProjection()) {
                    // We register the mousemove and movend events in order to
                    // change the zone when the mouse is moved around
                    this.map.events.register("mousemove", this, this.updateDisplayProjections);
                    this.map.events.register("moveend", this, this.updateDisplayProjections);
                }
                this.displayProjection= dp;
            } else {
                // keep current projection (no UTM found) :
                var title= OpenLayers.String.trim(this.displayProjection.getTitle());
                for (var i= 0, l= elm.options.length; i<l; i++) {
                    var o= elm.options[i];
                    if (OpenLayers.String.trim(o.text)==title) {
                        elm.selectedIndex= i;
                        break;
                    }
                }
            }
        }
        this.map.displayProjection= this.displayProjection;
        this.map.events.triggerEvent("changedisplayprojection", {displayProjection: this.displayProjection});
        if (elm.kbControl) {
            if (!elm.kbControl.active) {
                elm.kbControl.activate();
            }
        }
        elm.hasFocus= false;
        elm.blur();
    },

    /**
     * APIMethod: setDisplayProjection
     * Change the display projection.
     *
     * Parameters:
     * p - {String | OpenLayers.Projection} the projection's identifier.
     *      Could be EPSG:nnnn or IGNF:cccc or any other kind of identifier
     *      supported by <OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>.
     */
    setDisplayProjection: function(p) {
        if (!this.selectProjs) { return; }
        if (typeof(p)=='string') {
            p= new OpenLayers.Projection(p);
            if (p==null) { return; }
        }
        var o= null, ip= -1, dp= null, code= p.getCode(), utm= p.isUTMZoneProjection();
        // check if projection is in projection list ...
        for (var i= 0, n= this.displayProjections.length; i<n; i++) {
            dp= this.displayProjections[i];
            if (code==dp.getCode()) {
                ip= i;
                break;
            }
        }
        if (ip==-1) { return; }
        // find out option ...
        if (utm) {
            ip= Geoportal.Control.Projections.MGRS_UTM;
        } else {
            ip= ''+ip;
        }
        for (var i= 0, n= this.selectProjs.options.length; i<n; i++) {
            o= this.selectProjs.options[i];
            if (o.value==ip) {
                if (this.selectProjs.selectedIndex==i) {
                    // already selected !
                    return;
                }
                this.selectProjs.selectedIndex= i;
                this.onProjectionChange(this.selectProjs);
                return;
            }
        }
    },

    /**
     * Method: lookupUTMZone
     * Find out the UTM projection which zone covers the passed coordinates.
     *
     * Parameters:
     * lonLat - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>} location used to find the zone. Must be
     *      in geographic longitude, latitude (CRS:84).
     *
     * Returns:
     * {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the UTM zone or null if no UTM zones have
     * been found.
     *
     * Author: gfilliere
     */
    lookupUTMZone: function(lonLat) {
        var defD= Number.NaN, defDp= null, d= Number.NaN, dp= null, gdp= null, ll= new OpenLayers.Geometry.Point(lonLat.lon, lonLat.lat);
        for (var i= 0, n= this.displayProjections.length; i<n; i++) {
            dp= this.displayProjections[i];
            if (!dp.isUTMZoneProjection()) { continue; }
            if (dp.domainOfValidity.containsLonLat(lonLat)) {
                return dp;
            }
            gdp= dp.domainOfValidity.toGeometry();
            d= ll.distanceTo(gdp);
            if (isNaN(defD) || d<defD) {
                defD= d;
                defDp= dp;
            }
            gdp= null;
        }
        // none found, use nearest
        return defDp;
    },

    /**
     * APIMethod: changeLang
     * Assigns the current language
     *
     * Parameters:
     * evt - {<OpenLayers.Event at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Event-js.html>} event fired
     *               evt.lang holds the new language
     */
    changeLang: function(evt) {
        if (this.selectProjs) {
            for (var i= 0, l= this.selectProjs.options.length; i<l; i++) {
                var o= this.selectProjs.options[i];
                if (o.value!=Geoportal.Control.Projections.MGRS_UTM) {
                    o.innerHTML= this.displayProjections[o.value].getTitle();
                }
            }
        }
    },

    /**
     * APIMethod: updateSize
     * This function should be called by any external code which dynamically
     *     changes the size of the control div.
     */
    updateSize: function() {
        if (this.div.parentNode) {
            var parentSize= Geoportal.Util.getComputedStyle(this.div.parentNode,'width',true);
            if (!parentSize) { return; }
            var currentSize= Geoportal.Util.getComputedStyle(this.selectProjs,'width',true);
            if (!currentSize) { return; }
            var ratio= Math.abs(parentSize-currentSize)/(2.0*parentSize) + 0.01;
            this.div.style.left= (100.0*ratio).toFixed(0) + '%';
            this.redraw();
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.Projections"*
     */
    CLASS_NAME: "Geoportal.Control.Projections"
});

/**
 * Constant: MGRS_UTM
 * {String} value for all UTM projections in the projections selector.
 *      Defaults to *"__MGRS_UTM__"*
 */
Geoportal.Control.Projections.MGRS_UTM= "__MGRS_UTM__";
