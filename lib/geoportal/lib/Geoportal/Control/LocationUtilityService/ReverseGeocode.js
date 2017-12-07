/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/LocationUtilityService.js
 */
/**
 * Class: Geoportal.Control.LocationUtilityService.ReverseGeocode
 * Control for talking with an OpenLS Location Utility service for searching
 * addresses around a location.
 *
 * Inherits from:
 * - <Geoportal.Control.LocationUtilityService>
 */
Geoportal.Control.LocationUtilityService.ReverseGeocode= OpenLayers.Class( Geoportal.Control.LocationUtilityService, {

    /**
     * APIProperty: maxRadius
     * {Number} : max value for circle based search
     */
    maxRadius:0,

    /**
     * APIProperty: maxSize
     * {Number} : max value for rectangle based search
     */
    DEFAULT_MAX_SIZE:0,

    /**
     * APIProperty: fields
     * {Object} Root names of cancel button (c), submit button (s).
     * Defaults to *{'q0':'longitude','q1':'latitude','q3':'countrycode','c':'cancel','s':'search','w':'wait'}*
     *
     */
    fields: {
        'q0':'longitude',
        'q1':'latitude',
        'q2':'countrycode',
        'c':'cancel',
        's':'search',
        'w':'wait',
        'f0':'extent'
    },

    /**
     * APIProperty: accuracy
     * {Number} 10**number of significative figures.
     *      Defaults to *1000000* (30 cm accuracy in geographical coordinates).
     */
    accuracy: 1000000,

    /**
     * Constructor: Geoportal.Control.LocationUtilityService.ReverseGeocode
     * Build a button for searching an OpenLS Location Utility service.
     *
     * Parameters:
     * layer - {<Geoportal.Layer.OpenLS.Core.LocationUtilityService>}
     * options - {Object} options to build this control. Options are :
     *      * reverseOptions - {Object} options for the location of the
     *      reverse search :
     *          * marker - {String} path to the marker used to locate the
     *          centrer of the search. Defaults to
     *          *Geoportal.Util.getImagesLocation()+'xy-target.png'*;
     *          * radius - {Number} the size of the marker. Defaults to *16*
     *          * style - {<OpenLayers.Style>} the style to apply to the search
     *          * styleMap - {<OpenLayers.StyleMap>} the style map to apply to
     *          the search.
     *          * maxRadius - {Number} max radius for circle based search
     *          * maxSize - {Number} max size for rectangle based search
     */
    initialize: function(layer, options) {
        Geoportal.Control.LocationUtilityService.prototype.initialize.apply(this, arguments);
        this.autoCompleteOptions= null;
        if (options && options.maxRadius) {
            this.maxRadius= options.maxRadius
        } else {
            this.maxRadius= Geoportal.Control.LocationUtilityService.ReverseGeocode.DEFAULT_MAX_RADIUS ;
        }
        if (options && options.maxSize) {
            this.maxSize= options.maxSize ;
        } else {
            this.maxSize= Geoportal.Control.LocationUtilityService.ReverseGeocode.DEFAULT_MAX_SIZE ;
        }
    },

    /**
     * Method: activate
     * Add the form to query locations and install the callback for getting
     * responses back.
     *      The form is as follows :
     *
     * (start code)
     * <form id='__searchlus__{#Id}' name='__searchlus__{#Id}' action='javascript:void(null)'>
     * </form>
     * (end)
     *
     * Returns:
     * {Boolean}  True if the control was successfully activated or
     *            false if the control was already active.
     */
    activate: function() {
        Geoportal.Control.LocationUtilityService.prototype.activate.apply(this,arguments);
        if (this.lusVl) {
            // add observers on input fields :
            var lonFld= this.inputs[this.fields.q0];
            var latFld= this.inputs[this.fields.q1];
            OpenLayers.Event.observe(lonFld,"change",OpenLayers.Function.bind(this.updateLocation,this,lonFld,latFld));
            OpenLayers.Event.observe(latFld,"change",OpenLayers.Function.bind(this.updateLocation,this,lonFld,latFld));
            var geometry= new OpenLayers.Geometry.Point(this.map.getCenter().lon,this.map.getCenter().lat);
            var feature= new OpenLayers.Feature.Vector(geometry);
            this.lusVl.addFeatures([feature]);
            this.lusVl.slctCntrl.activate();
            //this.enableNavigation();
        }
        return true;
    },

    /**
     * Method: addAutoCompleteControl
     * Add the autoComplete control to the map and update its position when
     * form is dragged. Does nothing.
     */
    addAutoCompleteControl: function() {
    },

    /**
     * APIMethod: deactivate
     * Terminate and clean the form.
     *
     * Returns:
     * {Boolean}  True if the control was successfully deactivated or
     *            false if the control was already inactive.
     */
    deactivate: function() {
        if (this.circleControl) {
            this.circleControl.deactivate();
            this.map.removeControl(this.circleControl);
            this.circleControl= null;
        }
        return Geoportal.Control.LocationUtilityService.prototype.deactivate.apply(this,arguments);
    },

    /**
     * Method: loadContent
     * Build the form, send the ReverseGeocodeRequest and display results
     * (list of locations).
     *      The form's structure is as follows :
     *
     * (start code)
     * <label id="lblgeoFilter{#Id}" for="geoFilter{#Id}">{#displayClass}.geoFilter
     * <select id="geoFilter{#Id}" name="geoFilter{#Id}">
     *      <option {#fld.options[].value}' selected='{#fld.options[].selected}'>{#fld.options[].text}</option>
     * </select>
     * <br/>
     * <span id="helpgeoFilter{#Id}" class="gpFormSmall">{#displayClass}.geoFilter.help</span>
     * <br/>
     * </label>
     * <label id='lbllongitude{#Id}' for='longitude{#Id}'>{#displayClass}.longitude</label>
     * <input id='longitude{#Id}' name='longitude{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='{#fld.length}' disabled='{#fld.disabled}'/>
     * <br/>
     * <span id='helplongitude{#Id}' class='gpFormSmall'>{#displayClass}.longitude.help</span>
     * <br/>
     * <label id='lbllatitude{#Id}' for='latitude{#Id}'>{#displayClass}.latitude</label>
     * <input id='latitude{#Id}' name='latitude{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='{#fld.length}' disabled='{#fld.disabled}'/>
     * <br/>
     * <span id='helplatitude{#Id}' class='gpFormSmall'>{#displayClass}.latitude.help</span>
     * <br/>
     * <label id="lblstreetAddress{#Id}" for="streetAddress{#Id}">{#displayClass}.streetAddress
     * <input id="streetAddress{#Id}" name="streetAddress{#Id}" type="checkbox" value="streetAddress{#Id}">
     * <br/>
     * <span id="helpstreetAddress{#Id}" class="gpFormSmall">{#displayClass}.streetAddress.help</span>
     * <br/>
     * </label>
     * <label id="lblpositionOfInterest{#Id}" for="positionOfInterest{#Id}">{#displayClass}.positionOfInterest
     * <input id="positionOfInterest{#Id}" name="positionOfInterest{#Id}" type="checkbox" value="positionOfInterest{#Id}">
     * <br/>
     * <span id="helppositionOfInterest{#Id}" class="gpFormSmall">{#displayClass}.positionOfInterest.help</span>
     * <br/>
     * </label>
     * <input class='{#displayClass}Button' type='button' id='cancel{#Id}' name='cancel{#Id}'
     *      value='{#displayClass}.button.cancel'/>
     * <input class='{#displayClass}Button' type='button' id='search{#Id}' name='search{#Id}'
     *      value='{#displayClass}.button.search'/>
     * <input class='{#displayClass}Image' type='image' id='wait{#Id}' name='wait{#Id}'
     *      alt='{#displayClass}.imageButton.wait' title='{#displayClass}.imageButton.wait'
     *      src='{#geoportal.img}loading.gif' style="display:none;'/>
     * <div class='{#displayClass}Results' id='results{#Id}' name='results{#Id}' style='display:none;'></div>
     * (end)
     *
     * Parameters:
     * form - {DOMElement} the HTML form.
     */
    loadContent: function(form) {
        var geometry= new OpenLayers.Geometry.Point(this.map.getCenter().lon,this.map.getCenter().lat);
        geometry.transform(this.map.getProjection(), OpenLayers.Projection.CRS84);
        this.inputs[this.fields.q0]=this.buildInputTextField(form,{
                id:this.fields.q0,
                mandatory:true,
                size:12,
                length:12,
                callbacks:[
                    {evt:'click',func:this.onSearchClick}
                ],
                value:geometry.x
        });
        this.inputs[this.fields.q1]=this.buildInputTextField(form,{
                id:this.fields.q1,
                mandatory:true,
                size:12,
                length:12,
                callbacks:[
                    {evt:'click',func:this.onSearchClick}
                ],
                value:geometry.y
        });

        // type    : ReverseGeocode
        // country : PositionOfInterest
        //   ex PositionOfInterest:OPENLS;ReverseGeocode
        var split_layer = this.layer.name.split(new RegExp("[:;]+", "g"));
        var type_geocode = split_layer.pop();
        var country_code = split_layer.shift();
        var current_type = this.CLASS_NAME.split('.').pop();
        
        if (current_type !== type_geocode) {
            console.log("Error : The layer must be a " + type_geocode + " resource ?!");
            return;  
        }
        
        switch(country_code) {
            case Geoportal.Control.LocationUtilityService.POSITIONOFINTEREST:
            case Geoportal.Control.LocationUtilityService.STREETADDRESS:
            case Geoportal.Control.LocationUtilityService.CADASTRALPARCEL:
            case Geoportal.Control.LocationUtilityService.GEODETICFIXEDPOINT:
                // it's the countryCode by default !
                this.countryCode = country_code;
                break;
            default :
                console.log("Error on " + type_geocode + " ?!");
                return;  
        }
        
        // for extend the research ...
        if (this.layer.allowSearchType) {
            
            // check Right Management !!!
            var checkRightManagement = function(name) {
                // ex PositionOfInterest:OPENLS;ReverseGeocode
                var type    = "ReverseGeocode";
                var service = "OPENLS";
                var layer   = name + ":" + service + ";" + type;
                var isAvailable = window.gGEOPORTALRIGHTSMANAGEMENT[window.gGEOPORTALRIGHTSMANAGEMENT.apiKey].resources[layer];
                if (isAvailable == null) { return false; }
                return true;
            };
            
            var opts= [];
            var supportedTypes= Geoportal.Control.LocationUtilityService.COUNTRYCODES;
            for (var i= 0, len= supportedTypes.length; i<len; i++) {
                if (checkRightManagement(supportedTypes[i])) {
                    var o= {
                        value: supportedTypes[i],
                        selected: false,
                        text: this.getDisplayClass()+'.type.'+supportedTypes[i]
                    };
                    opts.push(o);
                }   
            }
            var size = opts.length + 1;
            if (size > 1) {
                
                this.inputs[this.fields.q2]= this.buildSelectField(form,{
                    id:this.fields.q2,
                    multiple:true,
                    length:size,
                    options:opts,
                    callbacks:[
                        {evt:'change',func:this.onChangeCountryCode}
                    ]});
            }
        
        }

        Geoportal.Control.LocationUtilityService.prototype.loadContent.apply(this,arguments);
    },

    /**
     * Method: addAutoCompletion
     * Build the {<Geoportal.Control.AutoComplete>} control if necessary.
     * Does nothing.
     */
    addAutoCompletion: function() {
    },

    /**
     * Method: addFilters
     * Add filters to the form.
     *
     * Parameters:
     * form - {DOMElement} the HTML form.
     */
    addFilters: function(form) {
        var opts= [];
        var rvgcModes= ['Point','Circle','Extent'];
        for (var i= 0, len= rvgcModes.length; i<len; i++) {
            var o= {
                value: rvgcModes[i],
                selected: (i==0),
                text: this.getDisplayClass()+'.type.'+rvgcModes[i]
            };
            opts.push(o);
        }
        this.inputs[this.fields.f0]= this.buildSelectField(form,{
            id:this.fields.f0,
            options:opts,
            callbacks:[
                {evt:'change',func:this.onChangeGeoFilter}
            ]});
    },

    /**
     * Method: onChangeCountryCode
     * An option of the resource type select has been selected.
     *
     * Parameters:
     * element - {<DOMElement>} the element receiving the event.
     * evt - {Event} the fired event.
     */
    onChangeCountryCode: function(element,evt) {
        this.countryCode= '';
        for (var i= 0, l= element.length; i<l; i++) {
            if (!element[i].selected) { continue; }
            var value= element[i].value;
            switch (value) {
            case Geoportal.Control.LocationUtilityService.STREETADDRESS     :
            case Geoportal.Control.LocationUtilityService.POSITIONOFINTEREST:
            case Geoportal.Control.LocationUtilityService.CADASTRALPARCEL   :
            case Geoportal.Control.LocationUtilityService.GEODETICFIXEDPOINT:
                if(this.countryCode) {this.countryCode+=","}
                this.countryCode+= value;
                break;
            default:
                break;
            }
        }
    },

    /**
     * Method: onChangeGeoFilter
     * Change the reverse geocode search mode (around a point, in a circle or in a rectangle.
     *
     * Parameters:
     * element - {<DOMElement>} the element receiving the event.
     * evt - {Event} the fired event.
     */
    onChangeGeoFilter: function(element,evt) {
        var value= element.value;
        if (!this.circleControl) {
            this.circleControl= new OpenLayers.Control.DrawFeature(this.lusVl,
                OpenLayers.Handler.RegularPolygon,
                {
                    handlerOptions: {
                        sides: 50
                    }
                });
            this.map.addControl(this.circleControl);
        }
        if (!this.rectangleControl) {
            this.rectangleControl= new OpenLayers.Control.DrawFeature(this.lusVl,
                OpenLayers.Handler.RegularPolygon,
                {
                    handlerOptions: {
                        sides: 4,
                        irregular: true
                    }
                });
            this.map.addControl(this.rectangleControl);
        }
        var lonFld= this.inputs[this.fields.q0];
        var latFld= this.inputs[this.fields.q1];
        lonFld.parentNode.style.display= 'none';
        latFld.parentNode.style.display= 'none';
        this.rectangleControl.deactivate();
        this.circleControl.deactivate();
        switch (value) {
            case 'Point':
                lonFld.parentNode.style.display= 'block';
                latFld.parentNode.style.display= 'block';
                var feature= this.lusVl.features[0];
                if (!feature) {
                    var geometry= new OpenLayers.Geometry.Point(this.map.getCenter().lon,this.map.getCenter().lat);
                    feature= new OpenLayers.Feature.Vector(geometry);
                    this.lusVl.addFeatures([feature]);
                }
                this.updateLocation(lonFld,latFld);
                break;
            case 'Circle':
                this.lusVl.destroyFeatures();
                this.circleControl.activate();
                break;
            case 'Extent':
                this.lusVl.destroyFeatures();
                this.rectangleControl.activate();
                break;
        }
    },

    /**
     * Method: geocode
     * Launch the reverse-geocoding request.
     */
    geocode: function() {
        if ((this.circleControl && this.circleControl.active) || (this.rectangleControl && this.rectangleControl.active)) {
            var feature= this.lusVl.features[0];
            if (!feature) {
                return ;
            }
            var featBounds= feature.geometry.getBounds() ; 
            var center= (featBounds.getCenterLonLat().clone()).transform(this.map.getProjection(), OpenLayers.Projection.CRS84);
            var ll= new OpenLayers.Geometry.Point(center.lon,center.lat);
            p= new Geoportal.OLS.Position(ll);
            var width= featBounds.getWidth() ;
            if (this.rectangleControl && this.rectangleControl.active) {
                // si les cotes du rectangle dépassent la longueur max
                // du service, alors on les redimensionne.
                var left= featBounds.left ;
                var right= featBounds.right ;
                var top= featBounds.top ;
                var bottom= featBounds.bottom ;
                var needsResize= false ;
                if (width>=this.maxSize) {
                    left= (left+right-this.maxSize)/2 ;
                    right= (left+right+this.maxSize)/2 ;
                    needsResize= true ;
                }
                var height= featBounds.getHeight() ;
                if (height>= this.maxSize) {
                    top= (top+bottom+this.maxSize)/2 ;
                    bottom= (top+bottom-this.maxSize)/2 ;
                    needsResize= true ;
                }
                var rectangleGeom= feature.geometry.clone() ;
                if (needsResize) {
                    console.log("INFO : initial rectangle (width:"+width+"m, height:"+height+"m) was resized to be within service limits.") ;
                    rectangleGeom= new OpenLayers.Geometry.Polygon([
                        new OpenLayers.Geometry.LinearRing([
                            new OpenLayers.Geometry.Point(left,top),
                            new OpenLayers.Geometry.Point(right,top),
                            new OpenLayers.Geometry.Point(right,bottom),
                            new OpenLayers.Geometry.Point(left,bottom),
                            new OpenLayers.Geometry.Point(left,top)
                        ])
                    ]) ;
                }
                p._aoi= rectangleGeom.transform(this.map.getProjection(), OpenLayers.Projection.CRS84);
            } else { // circleControl
                var radius= width/2;
                // si le rayon est supérieur à 1000m (limitation du service)
                // on le majore à 999m
                if (radius >= this.maxRadius) {
                    console.log("INFO : initial circle radius ("+radius+") limited to "+this.maxRadius+"m.") ;
                    radius= this.maxRadius ;
                }
                p._aoi= {
                    radius: radius,
                    center: center
                };
            }
        } else {
            var lonFld= this.inputs[this.fields.q0];
            var latFld= this.inputs[this.fields.q1];
            if (!lonFld || !latFld) {
                return ;
            }
            var lon= parseFloat(lonFld.value);
            var lat= parseFloat(latFld.value);
            if (isNaN(lon) || isNaN(lat)) {
                return ;
            }
            var ll= new OpenLayers.Geometry.Point(lon,lat);
            p= new Geoportal.OLS.Position(ll);
        }

        if (this.wImg) {
            this.wImg.style.display= '';
        }
        var options= {
            onSuccess: this.LUSSuccess,
            onFailure: this.LUSFailure,
            scopeOn: this
        };
        var preferences= [];
        if (!this.countryCode) {
            // FIXME : by default, countrycode is the name of the layer !
            // so it's never empty...
            preferences.push(Geoportal.Control.LocationUtilityService.STREETADDRESS);
            preferences.push(Geoportal.Control.LocationUtilityService.POSITIONOFINTEREST);
        } else {
            preferences.push(this.countryCode);
        }
        options.preferences = preferences;
        this.layer.REVERSE_GEOCODE(p, options);
        p.destroy();
        p= null;
    },

    /**
     * Method: LUSSuccess
     * Called when the Ajax request returns a response for a Location Utility
     * service request.
     *
     * Parameters:
     * request - {XmlNode} request to server.
     *
     * Returns:
     * {Boolean} true if processing went well, false otherwise.
     */
    LUSSuccess: function(request) {
        if (Geoportal.Control.LocationUtilityService.prototype.LUSSuccess.apply(this,arguments)===false) {
            return false;
        }
        var features= this.layer.queriedAddresses[0].features;
        this.layer.destroyFeatures();
        this.layer.addFeatures(features);
        this.layer.selectCntrl.activate();
        if (this.circleControl) {
            this.circleControl.deactivate();
            this.map.removeControl(this.circleControl);
        }
        this.circleControl= null;
        if (this.rectangleControl) {
            this.rectangleControl.deactivate();
            this.map.removeControl(this.rectangleControl);
        }
        this.rectangleControl= null;
        this.closeForm();
        return true;
    },

    /**
     * Method: updateLLForm
     * The icon of the location has been dragged, update the form.
     *
     * Parameters:
     * feature - {OpenLayers.Feature.Vector} the location.
     * pixel - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} The pixel location of the mouse.
     */
    updateLLForm: function(feature, pixel) {
        if (!feature || !feature.geometry  || !feature.geometry.x) {
            return;
        }
        var ll= new OpenLayers.Geometry.Point(feature.geometry.x, feature.geometry.y);
        ll.transform(this.map.getProjection(), OpenLayers.Projection.CRS84);
        var lonFld= OpenLayers.Util.getElement('longitude' + this.id);
        lonFld.value= Math.round(ll.x*this.accuracy)/this.accuracy;
        var latFld= OpenLayers.Util.getElement('latitude' + this.id);
        latFld.value= Math.round(ll.y*this.accuracy)/this.accuracy;
    },

    /**
     * Method: updateLocation
     * The form has been updated, update the icon's position on the map.
     *
     * Parameters:
     * lonFld - {DOMElement} The input field holding longitude.
     * latFld - {DOMElement} The inout field holding latitude.
     * evt - {Event} The fired event.
     */
    updateLocation: function(lonFld,latFld,evt) {
        if (evt || window.event) OpenLayers.Event.stop(evt? evt : window.event);
        var feature= this.lusVl.features[0];
        if (!feature || !lonFld || !latFld) {
            return true;
        }
        var lon= parseFloat(lonFld.value);
        var lat= parseFloat(latFld.value);
        if (!isNaN(lon) && !isNaN(lat)) {
            this.lusVl.destroyFeatures();
            var geometry= new OpenLayers.Geometry.Point(lon,lat);
            geometry.transform(OpenLayers.Projection.CRS84, this.map.getProjection());
            feature= new OpenLayers.Feature.Vector(geometry);
            this.lusVl.addFeatures([feature]);
            this.map.setCenter(new OpenLayers.LonLat(geometry.x, geometry.y), this.map.getZoom());
        }
        return true;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.LocationUtilityService.ReverseGeocode"*
     */
    CLASS_NAME:"Geoportal.Control.LocationUtilityService.ReverseGeocode"
});


    /**
     * Constant: DEFAULT_MAX_RADIUS
     * {Number} *1000*
     */
    Geoportal.Control.LocationUtilityService.ReverseGeocode.DEFAULT_MAX_RADIUS= 1000 ;

    /**
     * Constant: DEFAULT_MAX_SIZE
     * {Number} *1000*
     */
    Geoportal.Control.LocationUtilityService.ReverseGeocode.DEFAULT_MAX_SIZE= 1000 ;

