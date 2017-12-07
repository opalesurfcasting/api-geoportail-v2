/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Util.js
 * @requires Geoportal/Control.js
 * @requires Geoportal/Control/Form.js
 */
/**
 * Class: Geoportal.Control.MousePosition
 * The Geoportal framework mouse position display class.
 *      Contribution of gfilliere for UTM projections handling.
 *
 * Inherits from:
 * - {<Geoportal.Control>}
 */
Geoportal.Control.MousePosition= OpenLayers.Class( Geoportal.Control, {

    /**
     * APIProperty: prefix
     * {String} text before coordinates.
     *      Default *''*
     */
    prefix: '',

    /**
     * APIProperty: separator
     * {String} text between coordinates' members.
     *      Default *', '*
     */
    separator: ', ',

    /**
     * APIProperty: suffix
     * {String} text after coordinates.
     *      Default *''*
     */
    suffix: '',

    /**
     * APIProperty: numDigits
     * {Integer} number of digits for coordinates' members.
     *      Default *0*
     */
    numDigits: 0,

    /**
     * APIProperty: displayProjection
     * {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} A projection that the
     *     mousecontrol will display.
     */
    displayProjection: null,

    /**
     * Property: pssKey
     * {String} Give the kind of display projection (lonlat, proj).
     */
    pssKey: null,

    /**
     * Property: selectUnits
     * {DOMElement} the display coordinates units selector.
     */
    selectUnits: null,

    /**
     * Property: currentUnit
     * {Integer} the current selected unit for coordinates displaying.
     */
    currentUnit: Number.NaN,

    /**
     * Property: lonInput
     * {DOMElement} the longitude/Easting input field.
     */
    lonInput: null,

    /**
     * Property: latInput
     * {DOMElement} the latitude/Northing inpuy field.
     */
    latInput: null,

    /**
     * Property: zoneInput
     * {DOMElement} the UTM zone input field.
     */
    zoneInput: null,

    /**
     * APIProperty: pss
     * {Array({Object})} Prefixes, Separators and Suffixes depend upon display
     *      projection's kind. Only lonlat and projected 2D are supported.
     */
    pss: null,

    /**
     * Property: displaySystemUnits
     * {Object} Units for various measurement systems.  Values are arrays
     *     of unit abbreviations (from OpenLayers.INCHES_PER_UNIT) in decreasing
     *     order of length.
     */
    displaySystemUnits: {
        longlat: ['sexa', 'deg', 'gon', 'rad'],
        utm    : ['km', 'm', 'cm'],
        proj   : ['km', 'm', 'cm']
    },

    /**
     * Constructor: Geoportal.Control.MousePosition
     * Build the control
     *
     * Parameters:
     * options - {DOMElement} Options for control.
     */
    initialize: function(options) {
        Geoportal.Control.prototype.initialize.apply(this, arguments);
        this.pss= {};
        for (var x in Geoportal.Control.MousePosition.PSS) {
            if (Geoportal.Control.MousePosition.PSS.hasOwnProperty(x)) {
                this.pss[x]= {};
                for (var y in Geoportal.Control.MousePosition.PSS[x]) {
                    if (Geoportal.Control.MousePosition.PSS[x].hasOwnProperty(y)) {
                        if (typeof(Geoportal.Control.MousePosition.PSS[x][y])=='string') {
                            this.pss[x][y]= OpenLayers.String.format(Geoportal.Control.MousePosition.PSS[x][y],{
                                id:this.id,
                                lon:'${lon}',
                                lat:'${lat}',
                                zone:'${zone}'
                            });
                        } else {
                            this.pss[x][y]= Geoportal.Control.MousePosition.PSS[x][y];
                        }
                    }
                }
            }
        }
        this.pss.longlat.abscissa= this.getDisplayClass()+'.longitude';
        this.pss.longlat.ordinate= this.getDisplayClass()+'.latitude';

        this.pss.utm.abscissa= this.getDisplayClass()+'.easting';
        this.pss.utm.ordinate= this.getDisplayClass()+'.northing';
        this.pss.utm.zone= this.getDisplayClass()+'.utmZone';

        this.pss.proj.abscissa= this.getDisplayClass()+'.easting';
        this.pss.proj.ordinate= this.getDisplayClass()+'.northing';
        this.setPssKey();
        // keyMask must not be null ...
        if (!this.keyMask) {
            this.keyMask= OpenLayers.Handler.MOD_SHIFT | OpenLayers.Handler.MOD_CTRL;
        }
    },

    /**
     * APIMethod: destroy
     * Unregister and delete the control
     */
    destroy: function() {
        this.deactivate();
        if (this.map) {
            this.map.events.unregister("controldeleted", this, this.onControlRemoved);
            this.map.events.unregister("changebaselayer", this, this.changeBaseLayer);
            this.map.events.unregister("changedisplayprojection", this, this.changeDisplayProjection);
        }
        if (this.selectUnits!=null) {
            OpenLayers.Event.stopObservingElement(this.selectUnits);
            this.selectUnits= null;
        }
        this.lonInput= null;
        this.latInput= null;
        this.zoneInput= null;
        this.pss= null;
        Geoportal.Control.prototype.destroy.apply(this, arguments);
    },

    /**
     * APIMethod: activate
     */
    activate: function() {
        if (OpenLayers.Control.prototype.activate.apply(this, arguments)) {
            this.map.events.register('mousemove', this, this.redraw);
            //this.map.events.register('mouseout', this, this.reset);
            return true;
        } else {
            return false;
        }
    },

    /**
     * APIMethod: deactivate
     */
    deactivate: function() {
        if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
            this.map.events.unregister('mousemove', this, this.redraw);
            //this.map.events.unregister('mouseout', this, this.reset);
            return true;
        } else {
            return false;
        }
    },

    /**
     * APIMethod: draw
     * Call the default draw, and then draw the control.
     *
     * Parameters:
     * px - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} the position where to draw the control.
     *
     *
     * Returns:
     * {DOMElement} the control's div.
     */
    draw: function(px) {
        Geoportal.Control.prototype.draw.apply(this, arguments);
        //FIXME : ??? this.setClass();

        this.redraw();

        return this.div;
    },

    /**
     * APIMethod: redraw  
     * Re-draw the control
     *
     * Parameters:
     * evt - {Event} the browser event
     */
    redraw: function(evt) {
        var lonLat= null;
        if (evt==null || evt.xy==undefined) {
            lonLat= this.map.getCenter();
            if (!lonLat) {
                lonLat= new OpenLayers.LonLat(0,0);
            }
        } else {
            // Don't update position when key modifiers are hold !
            if (!(OpenLayers.Handler.prototype.checkModifiers.apply(this,[evt]))) {
                lonLat= this.map.getLonLatFromPixel(evt.xy);
            }
        }

        if (!lonLat) {
            return;
        }
        lonLat.transform(this.map.getProjection(),this.displayProjection);

        this.formatOutput(lonLat);
    },

    /**
     * Method: formatOutput
     * Override to provide custom display output.
     *
     * Parameters:
     * lonLat - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>} location to display
     */
    formatOutput:function(lonLat) {
        if (this.displayProjection && !this.pssKey) {
            this.setPssKey();
        }
        var s;
        switch (this.pssKey) {
        case 'longlat':
            if (this.units[this.currentUnit]=='sexa') {
                s= this.displayDMS(lonLat);
            } else {
                s= this.displayDEC(lonLat);//deg, gon, rad
            }
            break;
        case 'utm'    :
            s= this.displayMRGS(lonLat);
            break;
        default       :
            s= this.displayEN(lonLat);
            break;
        }
        if (typeof(s)=='string') {
            while (this.div.childNodes.length>0) {
                this.div.removeChild(this.div.firstChild);
            }
            // IE bug : from time to time assigning innerHTML to the this.div
            // breaks ! But using a inner div ...
            var idiv= this.div.ownerDocument.createElement('div');
            idiv.style.border= '0px';
            idiv.style.padding= '0px';
            idiv.style.margin= '0px';
            // ... seems ok !
            idiv.innerHTML= s;
            this.div.appendChild(idiv);
            var kbControl= this.map.getControlsByClass(OpenLayers.Control.KeyboardDefaults.prototype.CLASS_NAME)[0];
            this.selectUnits= OpenLayers.Util.getElement('__sdsu__'+this.id);
            if (this.selectUnits!=null) {
                this.selectUnits.hasFocus= false;
                this.selectUnits.kbControl= kbControl;
                OpenLayers.Event.observe(
                    this.selectUnits,
                    "click",
                    OpenLayers.Function.bind(this.onClick,this,this.selectUnits)
                );
                OpenLayers.Event.observe(
                    this.selectUnits,
                    "change",
                    OpenLayers.Function.bind(this.onChangeUnit,this,this.selectUnits)
                );
            }
            var ciControl=
                this.map.getControlsByClass(Geoportal.Control.Information.prototype.CLASS_NAME)[0];
            this.lonInput= OpenLayers.Util.getElement('__lon__'+this.id);
            if (this.lonInput!=null) {
                this.lonInput.hasFocus= false;
                this.lonInput.kbControl= kbControl;
                this.lonInput.ciControl= ciControl;
                OpenLayers.Event.observe(
                    this.lonInput,
                    "click",
                    OpenLayers.Function.bind(this.onClick,this,this.lonInput)
                );
                OpenLayers.Event.observe(
                    this.lonInput,
                    "focus",
                    OpenLayers.Function.bind(this.onClick,this,this.lonInput)
                );
                OpenLayers.Event.observe(
                    this.lonInput,
                    "change",
                    OpenLayers.Function.bind(this.onChangeLonLat,this,this.lonInput)
                );
                OpenLayers.Event.observe(
                    this.lonInput,
                    "blur",
                    OpenLayers.Function.bind(this.onChangeLonLat,this,this.lonInput)
                );
            }
            this.latInput= OpenLayers.Util.getElement('__lat__'+this.id);
            if (this.latInput!=null) {
                this.latInput.hasFocus= false;
                this.latInput.kbControl= kbControl;
                this.latInput.ciControl= ciControl;
                OpenLayers.Event.observe(
                    this.latInput,
                    "click",
                    OpenLayers.Function.bind(this.onClick,this,this.latInput)
                );
                OpenLayers.Event.observe(
                    this.latInput,
                    "focus",
                    OpenLayers.Function.bind(this.onClick,this,this.latInput)
                );
                OpenLayers.Event.observe(
                    this.latInput,
                    "change",
                    OpenLayers.Function.bind(this.onChangeLonLat,this,this.latInput)
                );
                OpenLayers.Event.observe(
                    this.latInput,
                    "blur",
                    OpenLayers.Function.bind(this.onChangeLonLat,this,this.latInput)
                );
            }
            this.zoneInput= OpenLayers.Util.getElement('__zone__'+this.id);
        } else {
            //update inputs :
            if (this.lonInput!=null) {
                this.lonInput.value= s.lon;
            }
            if (this.latInput!=null) {
                this.latInput.value= s.lat;
            }
            if (this.zoneInput!=null) {
                this.zoneInput.value= s.zone;
            }
        }
        if (this.units[this.currentUnit]=='sexa') {
            if (this.lonInput!=null) { this.lonInput.size= 16; }
            if (this.latInput!=null) { this.latInput.size= 16; }
        } else {
            if (this.lonInput!=null) { this.lonInput.size= 11; }
            if (this.latInput!=null) { this.latInput.size= 11; }
        }
    },

    /**
     * Method: setPssKey
     * Compute the prefix-separator-suffix key based on the display
     * projection.
     */
    setPssKey: function() {
        if (!this.displayProjection) {
            this.pssKey= null;
            return;
        }
        switch(this.displayProjection.getProjName()) {
        case 'longlat' :
        case 'utm'     :
            this.pssKey= this.displayProjection.getProjName();
            break;
        default        :
            this.pssKey= 'proj';
            break;
        }
        this.setPSS();
    },

    /**
     * Method: setPSS
     * Assign prefix, separator, suffix strings.
     */
    setPSS: function() {
        var pss= this.pss[this.pssKey];
        var lon= OpenLayers.i18n(pss.abscissa);
        var lat= OpenLayers.i18n(pss.ordinate);
        var zone= OpenLayers.i18n(pss.zone!==undefined? pss.zone:'');
        this.prefix= pss.prefix.replace(/@abscissa@/g,lon).replace(/@ordinate@/g,lat).replace(/@zone@/g,zone);
        this.separator= pss.separator.replace(/@abscissa@/g,lon).replace(/@ordinate@/g,lat).replace(/@zone@/g,zone);
        this.suffix= pss.suffix.replace(/@abscissa@/g,lon).replace(/@ordinate@/g,lat).replace(/@zone@/g,zone);
        this.units= this.displaySystemUnits[this.pssKey].slice(0);
        this.currentUnit= (isNaN(this.currentUnit)? pss.defaultUnit : this.currentUnit);
        if (this.selectUnits!=null) {
            OpenLayers.Event.stopObservingElement(this.selectUnits);
            this.selectUnits= null;
        }
        this.lonInput= null;
        this.latInput= null;
        this.zoneInput= null;
        if (this.div) {
            while (this.div.childNodes.length>0 ) {
                this.div.removeChild(this.div.firstChild);
            }
        }
    },

    /**
     * APIMethod: displayDMS
     * Format in sexagecimal degrees coordinates.
     *
     * Parameters:
     * lonLat - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>} decimal degrees to convert.
     *
     * Returns:
     * {String | Object} the final string or {lon:,lat:} object.
     */
    displayDMS: function(lonLat) {
        var N= OpenLayers.i18n(this.getDisplayClass()+'.north');
        var S= OpenLayers.i18n(this.getDisplayClass()+'.south');
        var E= OpenLayers.i18n(this.getDisplayClass()+'.east');
        var W= OpenLayers.i18n(this.getDisplayClass()+'.west');
        var lon= Geoportal.Util.degToDMS(lonLat.lon,[E,W]);
        var lat= Geoportal.Util.degToDMS(lonLat.lat,[N,S]);
        if (this.selectUnits==null) {
            var s= this.prefix + this.separator + this.getSuffix();
            s= OpenLayers.String.format(
                    s, {
                        'lon':lon.replace(/"/g,"&quot;").replace(/ /g,"&nbsp;"),
                        'lat':lat.replace(/"/g,"&quot;").replace(/ /g,"&nbsp;")});
            return s;
        }
        return {'lon':lon,'lat':lat};
    },

    /**
     * APIMethod: displayDEC
     * Format a string in decimal degrees, grades or radians.
     *
     * Parameters:
     * lonLat - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>} decimal degrees, grades or radians to format
     *
     * Returns:
     * {String | Object} the final string or {lon:,lat:} object.
     */
    displayDEC: function(lonLat) {
        var r= 1.0, w= 11, d= 6;
        if (this.units[this.currentUnit]=='gon') {
            r= 1.11111111111111111111;
        } else if (this.units[this.currentUnit]=='rad') {
            r= 0.01745329251994329577;
            d= 8;
        }
        var lon= OpenLayers.String.sprintf("%*.*f", w, d, lonLat.lon*r);
        var lat= OpenLayers.String.sprintf("%*.*f", w, d, lonLat.lat*r);
        if (this.selectUnits==null) {
            var s= this.prefix + this.separator + this.getSuffix();
            s= OpenLayers.String.format(s,{'lon':lon.replace(/ /g,"&nbsp;"), 'lat':lat.replace(/ /g,"&nbsp;")});
            return s;
        }
        return {'lon':lon,'lat':lat};
    },

    /**
     * APIMethod: displayEN
     * Format a string in easting, northing
     *
     * Parameters:
     * lonLat - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>} easting, northing to convert
     *
     * Returns:
     * {String | Object} the final string or {lon:,lat:} object.
     */
    displayEN: function(lonLat) {
        var r= 1.0;
        if (this.units[this.currentUnit]=='km') {
            r= 0.001;
        } else if (this.units[this.currentUnit]=='cm') {
            r= 100.0;
        }
        var lon= OpenLayers.String.sprintf("%*.*f", 10, this.numDigits, lonLat.lon*r);
        var lat= OpenLayers.String.sprintf("%*.*f", 10, this.numDigits, lonLat.lat*r);
        if (this.selectUnits==null) {
            var s= this.prefix + this.separator + this.getSuffix();
            s= OpenLayers.String.format(
                    s,
                    {
                        'lon':lon.replace(/ /g,"&nbsp;"),
                        'lat':lat.replace(/ /g,"&nbsp;")});
            return s;
        }
        return {'lon':lon,'lat':lat};
    },

    /**
     * APIMethod: displayMRGS
     * Format a string in UTM Zone and Band, easting, northing
     *
     * Parameters:
     * lonLat - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>} easting, northing to convert
     *
     * Returns:
     * {String | Object} the final string or {lon:,lat:,zone:} object.
     *
     * Author: gfilliere
     */
    displayMRGS: function(lonLat) {
        var r= 1.0;
        if (this.units[this.currentUnit]=='km') {
            r= 0.001;
        } else if (this.units[this.currentUnit]=='cm') {
            r= 100.0;
        }
        var lon= OpenLayers.String.sprintf("%*.*f", 10, this.numDigits, lonLat.lon*r);
        var lat= OpenLayers.String.sprintf("%*.*f", 10, this.numDigits, lonLat.lat*r);
        var zone= OpenLayers.Projection.getMGRSZone(
            this.displayProjection.getProperty('zone'),
            lonLat.clone().transform(this.map.getProjection(),OpenLayers.Projection.CRS84)
        );
        if (this.selectUnits==null) {
            var s= this.prefix + this.separator + this.getSuffix();
            s= OpenLayers.String.format(
                    s,
                    {
                        'lon' :lon.replace(/ /g,"&nbsp;"),
                        'lat' :lat.replace(/ /g,"&nbsp;"),
                        'zone':zone});
            return s;
        }
        return {'lon':lon,'lat':lat,'zone':zone};
    },

    /**
     * Method: changeLang
     * Assign the current language
     *
     * Parameters:
     * evt - {Event} event fired.
     *      evt.lang holds the new language
     */
    changeLang: function(evt) {
        this.setPSS();
        this.redraw();
    },

    /**
     * Method: changeBaseLayer
     * Assign the current displayProjection for the new base layer.
     *
     * Parameters:
     * evt - {Event} event fired.
     *      evt.layer.displayProjection holds the new displayProjection.
     */
    changeBaseLayer: function(evt) {
        if (evt) {
            if (!this.displayProjection) {
                this.displayProjection=
                    evt.layer.displayProjection?
                        evt.layer.displayProjection.clone()
                    :   evt.layer.getNativeProjection().clone();
                this.pssKey= null;
                this.redraw();
            }
        }
    },

    /**
     * Method: changeDisplayProjection
     * Assign the current displayProjection.
     *
     * Parameters:
     * evt - {Event} event fired.
     *      evt.displayProjection holds the new displayProjection.
     */
    changeDisplayProjection: function(evt) {
        if (evt) {
            if (!(
                  this.displayProjection.getProjName()==evt.displayProjection.getProjName() ||
                  (// utm and ups
                   this.displayProjection.isUTMZoneProjection() &&
                   evt.displayProjection.isUTMZoneProjection()
                  ))) {
                this.currentUnit= Number.NaN;
            }
            this.displayProjection= evt.displayProjection;
            this.pssKey= null;
            this.redraw();
            this.keepSelectedUnit= undefined;
        }
    },

    /**
     * Method: onClick
     * A DOM element has been clicked (gained focus).
     *
     * Parameters:
     * elm - {DOMElement} the DOM element.
     * evt - {<OpenLayers.Event at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Event-js.html>} the fired event.
     */
    onClick: function(elm, evt) {
        if (evt || window.event) OpenLayers.Event.stop(evt? evt : window.event);
        if (elm.hasFocus) { return; }
        Geoportal.Control.Form.focusOn(elm);
        if (elm==this.lonInput || elm==this.latInput) {
            if (elm.ciControl) {
                elm.ciControl.setSelectable();
            }
            var c= Geoportal.Util.getComputedStyle(elm,"color") || '#000000';
            var bc= Geoportal.Util.getComputedStyle(elm,"background-color") || '#FFFFFF';
            elm.style.color= bc;
            elm.style.backgroundColor= c;
        }
    },

    /**
     * Method: onChangeUnit
     * Assign the new unit.
     *
     * Parameters:
     * elm - {DOMElement} the select element.
     * evt - {Event} event fired.
     */
    onChangeUnit: function(elm,evt) {
        if (evt || window.event) OpenLayers.Event.stop(evt? evt : window.event);
        if (!elm.hasFocus) { return; }
        this.currentUnit= elm.selectedIndex;
        Geoportal.Control.Form.focusOff(elm);
        this.redraw();
    },

    /**
     * Method: onChangeLonLat
     * Either the abscissa or the ordinate input field has changed (lost
     * focus).
     *
     * Parameters:
     * elm - {DOMElement} the input element.
     * evt - {Event} event fired.
     */
    onChangeLonLat: function(elm,evt) {
        if (evt || window.event) OpenLayers.Event.stop(evt? evt : window.event);
        if (!elm.hasFocus) { return; }
        Geoportal.Control.Form.focusOff(elm);
        if (elm.ciControl) {
            elm.ciControl.setSelectable(false);
        }
        var c= Geoportal.Util.getComputedStyle(elm,"color") || '#FFFFFF';
        var bc= Geoportal.Util.getComputedStyle(elm,"background-color") || '#000000';
        elm.style.color= bc;
        elm.style.backgroundColor= c;
        var a= this.lonInput.value, o= this.latInput.value;
        if (this.units[this.currentUnit]!='sexa') {
            a= parseFloat(a);
            o= parseFloat(o);
        } else {
            a= Geoportal.Util.dmsToDeg(a);
            o= Geoportal.Util.dmsToDeg(o);
        }
        // depending on the selected unit, convert back to map's coordinates :
        if (!isNaN(a) && !isNaN(o)) {
            var r= 1.0;
            switch(this.units[this.currentUnit]) {
            case 'gon' :
                r= 1.11111111111111111111;
                break;
            case 'rad' :
                r= 0.01745329251994329577;
                break;
            case 'km'  :
                r= 0.001;
                break;
            case 'cm'  :
                r= 100.0;
                break;
            default    :
                break;
            }
            a/= r;
            o/= r;
            var ll= new OpenLayers.LonLat(a,o);
            ll.transform(this.displayProjection,this.map.getProjection());
            var resol= (this.map.getProjection()
                        ? this.map.getProjection().getProjName()=='longlat'? 0.000028:1.0
                        : undefined);
            if (!this.map.getCenter().equals(ll,resol)) {
                this.map.setCenter(ll);
            }
        }
    },

    /**
     * Method: getSuffix
     * Build HTML code for selecting projection unit and preprend it to the
     * suffix.
     *
     * Returns:
     * {String} the HTML code.
     */
    getSuffix: function() {
        var s= '<select id="__sdsu__${id}" name="__sdsu__${id}" size="1" class="gpSelectUnits">';
        s= OpenLayers.String.format(s,{id:this.id});
        for (var i= 0, l= this.units.length; i<l; i++) {
            s+=  '<option value="'+i+'"'+(i==this.currentUnit? ' selected="selected"':'')+'>'
                +OpenLayers.i18n(this.getDisplayClass()+'.'+this.units[i])
                +'</option>';
        }
        s   += '</select>';
        return s + this.suffix;
    },

    /**
     * APIMethod: setMap
     * Set the map and register events
     */
    setMap: function() {
        Geoportal.Control.prototype.setMap.apply(this, arguments);
        if (!this.displayProjection) {
            this.displayProjection= this.map.displayProjection || 'CRS:84';
        }
        if (typeof(this.displayProjection)=='string') {
            this.displayProjection= new OpenLayers.Projection(this.displayProjection);
        }
        this.map.events.register("changebaselayer", this, this.changeBaseLayer);
        this.map.events.register("changedisplayprojection", this, this.changeDisplayProjection);
        this.map.events.register("controldeleted", this, this.onControlRemoved);
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
        if (this.selectUnits && this.selectUnits.kbControl && this.selectUnits.kbControl===evt.control) {
            this.selectUnits.kbControl= null;
        }
        if (this.lonInput && this.lonInput.kbControl && this.lonInput.kbControl===evt.control) {
            this.lonInput.kbControl= null;
        }
        if (this.lonInput && this.lonInput.kbControl && this.lonInput.kbControl===evt.control) {
            this.lonInput.kbControl= null;
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
            var ratio= 1.0;
            var currentSize= Geoportal.Util.getComputedStyle(this.div,'width',true);
            if (!currentSize) { return; }
            while ((parentSize < currentSize) && ratio>0.1) {
                ratio-= 0.1;
                this.div.style.fontSize= ratio.toFixed(1)+"em";
                currentSize= Geoportal.Util.getComputedStyle(this.div,'width',true);
            }
            if (ratio<0.1) {
                this.div.style.fontSize= '0.5em';
                this.div.style.left= '5%';
            } else {
                this.div.style.left= (100*(parentSize - currentSize)/(2*parentSize)).toFixed(0) + '%';
            }
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.MousePosition"*
     */
    CLASS_NAME: "Geoportal.Control.MousePosition"
});

/**
 * Constant: Geoportal.Control.MousePosition.PSS
 * {Array({Object})} Prefixes, Separators and Suffixes depend upon display projection's
 *      kind. Only lonlat and projected 2D are supported.
 *      Contribution of gfilliere for UTM projections handling.
 */
Geoportal.Control.MousePosition.PSS= {
    longlat:{
        abscissa: '',
        ordinate: '',
        prefix: '<form id="__lamp__${id}" name="__lamp__${id}" action="javascript:void(null)"><b>@abscissa@ :</b> <input id="__lon__${id}" class="gpLong" type="text" value="${lon}" size="11"/>',
        separator: '&nbsp;&nbsp;<b>@ordinate@ :</b> <input id="__lat__${id}" class="gpLat" type="text" value="${lat}" size="11"/>',
        suffix: '</form>',
        defaultUnit: 1
    },
    utm :{
        abscissa: '',
        ordinate: '',
        prefix: '<form id="__lamp__${id}" name="__lamp__${id}" action="javascript:void(null)"><b>@zone@ :</b> <input id="__zone__${id}" class="gpZone" type="text" value="${zone}" size="3"/>&nbsp;&nbsp;<b>@abscissa@ :</b> <input id="__lon__${id}" class="gpLong" type="text" value="${lon}" size="11"/>',
        separator: '&nbsp;&nbsp;<b>@ordinate@ :</b> <input id="__lat__${id}" class="gpLat" type="text" value="${lat}" size="11"/>',
        suffix: '</form>',
        defaultUnit: 1
    },
    proj:{
        abscissa: '',
        ordinate: '',
        prefix: '<form id="__lamp__${id}" name="__lamp__${id}" action="javascript:void(null)"><b>@abscissa@ :</b> <input id="__lon__${id}" class="gpLong" type="text" value="${lon}" size="11"/>',
        separator: '&nbsp;&nbsp;<b>@ordinate@ :</b> <input id="__lat__${id}" class="gpLat" type="text" value="${lat}" size="11"/>',
        suffix: '</form>',
        defaultUnit: 1
    }
};
