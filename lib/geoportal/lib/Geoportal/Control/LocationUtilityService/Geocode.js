/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/LocationUtilityService.js
 * @requires Geoportal/Control/AutoComplete.js
 */
/**
 * Class: Geoportal.Control.LocationUtilityService.Geocode
 * Control for talking with an OpenLS Location Utility service for searching
 * addresses.
 *
 * Inherits from:
 * - <Geoportal.Control.LocationUtilityService>
 */
Geoportal.Control.LocationUtilityService.Geocode= OpenLayers.Class( Geoportal.Control.LocationUtilityService, {

    /**
     * APIProperty: fields
     * {Object} Names of input fields (q), submit button (s).
     * Defaults to *{'q0':'address','q1':'municipality','q2':'postalcode','q3':'quality','q3':'quality','q3':'quality','q4':'freeformaddress','c':'cancel','s':'search','w':'wait'}*
     *
     */
    fields: {
        'q0':'address',
        'q1':'municipality',
        'q2':'postalcode',
        'q3':'quality',
        'q4':'freeformaddress',/* StreetAddress + AutoCompletion */
        'c' :'cancel',
        's' :'search',
        'w' :'wait',
        'f0':'extent',
        'f1':'territory',
        'f2':'region',
        'f3':'department'
    },

    /**
     * APIProperty: countryCode
     * {String} comma-separated codes to specify the reference table used to geocode an address.
     * Defaults to *Geoportal.Control.LocationUtilityService.STREETADDRESS*.
     */
    countryCode: Geoportal.Control.LocationUtilityService.STREETADDRESS,

    /**
     * APIProperty: setZoom
     * Returns the zoom from the <Geoportal.OLS.Address> object.
     *      Expect a feature parameter that holds search results.
     *      Defaults to map's numZoomLevels-5.
     */
    setZoom: function(f) { return this.map.getNumZoomLevels() - 5; },

    /**
     * Constructor: Geoportal.Control.LocationUtilityService.Geocode
     * Build a button for searching an OpenLS Location Utility service.
     *
     * Parameters:
     * layer - {<Geoportal.Layer.OpenLS.Core.LocationUtilityService>}
     * options - {Object} options to build this control.
     */
    initialize: function(layer, options) {
        Geoportal.Control.LocationUtilityService.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: loadContent
     * Build the form, send the GeocodeRequest and display results (list of
     * addresses).
     *      The form's structure is as follows :
     *
     * (start code)
     * <label id='lbladdress{#Id}' for='address{#Id}'>{#displayClass}.address</label>
     * <input id='address{#Id}' name='address{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='{#fld.length}' disabled='{#fld.disabled}'/>
     * <br/>
     * <span id='helpaddress{#Id}' class='gpFormSmall'>{#displayClass}.address.help</span>
     * <br/>
     * <label id='lblmunicipality{#Id}' for='municipality{#Id}'>{#displayClass}.municipality</label>
     * <input id='municipality{#Id}' name='municipality{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='{#fld.length}' disabled='{#fld.disabled}'/>
     * <br/>
     * <span id='helpmunicipality{#Id}' class='gpFormSmall'>{#displayClass}.municipality.help</span>
     * <br/>
     * <label id='lblpostalcode{#Id}' for='postalcode{#Id}'>{#displayClass}.postalcode</label>
     * <input id='postalcode{#Id}' name='postalcode{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='{#fld.length}' disabled='{#fld.disabled}'/>
     * <br/>
     * <span id='helppostalcode{#Id}' class='gpFormSmall'>{#displayClass}.postalcode.help</span>
     * <br/>
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
     *  Whenever the AutoComplete option is given, then the form's structure
     *  becomes :
     *
     * (start code)
     * <label id='lblfreeformaddress{#Id}' for='freeformaddress{#Id}'>{#displayClass}.freeformaddress</label>
     * <input id='freeformaddress{#Id}' name='freeformaddress{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='{#fld.length}' disabled='{#fld.disabled}'/>
     * <br/>
     * <span id='helpfreeformaddress{#Id}' class='gpFormSmall'>{#displayClass}.freeformaddress.help</span>
     * <br/>
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
        if (this.autoCompleteOptions) {
            this.inputs[this.fields.q4]= this.buildInputTextField(form,{
                id:this.fields.q4,
                mandatory:true,
                size:50,
                length:80,
                callbacks:[
                    {evt:'click',func:this.onSearchClick}
                ]});
            this.autoCompleteOptions.inputText= this.inputs[this.fields.q4];
        } else {
            this.inputs[this.fields.q0]= this.buildInputTextField(form,{
                id:this.fields.q0,
                size:50,
                length:80,
                callbacks:[
                    {evt:'click',func:this.onSearchClick}
                ]});
            this.inputs[this.fields.q1]= this.buildInputTextField(form,{
                id:this.fields.q1,
                mandatory:true,
                size:30,
                length:50,
                callbacks:[
                    {evt:'click',func:this.onSearchClick}
                ]});
            this.inputs[this.fields.q2]= this.buildInputTextField(form,{
                id:this.fields.q2,
                size:5,
                length:5,
                callbacks:[
                    {evt:'click',func:this.onSearchClick}
                ]});
        }
        Geoportal.Control.LocationUtilityService.prototype.loadContent.apply(this,arguments);
    },

    /**
     * Method: addFilters
     * Add filters to the form.
     *
     * Parameters:
     * form - {DOMElement} the HTML form.
     */
    addFilters: function(form) {
        if (this.filtersOptions===null) { return ; }
        // FIXME : select -> options !
        this.inputs[this.fields.q3]= this.buildInputTextField(form,{
            id:this.fields.q3,
            mandatory:false,
            size:20,
            length:20,
            callbacks:[
                {evt:'click',func:this.onSearchClick}
            ]});
        Geoportal.Control.LocationUtilityService.prototype.addFilters.apply(this,arguments);
    },

    /**
     * Method: initFocus
     * Initialize the focus of an input field in the form.
     */
    initFocus: function() {
        Geoportal.Control.Form.focusOn(this.inputs[this.autoCompleteOptions? this.fields.q4 : this.fields.q0]);
    },

    /**
     * Method: geocode
     * Launch the geocoding request.
     */
    geocode: function() {
        var a= new Geoportal.OLS.Address(this.countryCode);
        if (this.autoCompleteOptions) {
            var v= OpenLayers.String.trim(this.inputs[this.fields.q4].value);
            if (v=='') { return null; }
            v= this.onAutoCompleteResultClick(v);
            if (v==null) {
                return null;
            }
            a.name= v;
        } else {
            var v= OpenLayers.String.trim(this.inputs[this.fields.q0].value);
            //if (v=='') { return ; }  //DGR, 2010-11-16: give the opportunity to only query municipality
            var s= new Geoportal.OLS.Street();
            s.name= v;
            v= OpenLayers.String.trim(this.inputs[this.fields.q1].value);
            if (v=='') { return null; }
            var sa= new Geoportal.OLS.StreetAddress();
            sa.addStreet(s);
            a.streetAddress= sa;
            var p= new Geoportal.OLS.Place({
                'classification':'Municipality',
                'name':v
            });
            a.addPlace(p);
            v= OpenLayers.String.trim(this.inputs[this.fields.q2].value);
            a.postalCode= new Geoportal.OLS.PostalCode({'name':v});
        }
        a= this.geocodeWithFilters(a);
        if (this.wImg) {
            this.wImg.style.display= '';
        }
        this.layer.GEOCODE(
            [a],
            {
                onSuccess: this.LUSSuccess,
                onFailure: this.LUSFailure,
                scopeOn: this
            });
        a.destroy();
        a= null;
    },

    /**
     * Method: geocodeWithFilters
     * Utility method to add filters to geocoding request.
     * Eventually, the filters concern the following place's type :
     *      * Quality : See {<Geoportal.Control.LocationUtilityService.Geocode.PRECISION>}
     *
     * Parameters:
     * a - {<Geoportal.OLS.Address>} an OpenLS address used to build the
     *      query.
     *
     * Returns:
     * {<Geoportal.OLS.Address>} the modified OpenLS address.
     */
    geocodeWithFilters: function(a) {
        if (this.filtersOptions===null) { return a; }
        // filters :
        // FIXME : only one at a time is being applied on service side ...
        v= OpenLayers.String.trim(this.inputs[this.fields.q3].value);
        if (v!='') {
            var p= new Geoportal.OLS.Place({
                'classification':'Quality',
                'name':v
            });
            a.addPlace(p);
        }

        return Geoportal.Control.LocationUtilityService.prototype.geocodeWithFilters.apply(this, [a]);
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
        this.resultDiv.style.display= 'none';
        for (var i= 0, ilen= features.length; i<ilen; i++) {
            var f= features[i];
            var state= this.keepFeature(f);
            if (state==-1) { break; } // skip remaining features
            if (state==0)  { continue; } // skip current feature
            // FIXME: only take features belonging to the baselayers ?
            var r= this.div.ownerDocument.createElement('div');
            r.className= 'gpLUSResult';
            if ((i%2)==1) {
                r.className+= 'Alternate';
            }
            if (f.attributes.geocodeMatchCode) {
                var score= this.div.ownerDocument.createElement('div');
                score.className= 'gpGeocodeMatchCode';
                if (f.attributes.geocodeMatchCode<=0.25) {
                    score.className+= 'Accuracy000to025';
                } else if (f.attributes.geocodeMatchCode<=0.50) {
                    score.className+= 'Accuracy025to050';
                } else if (f.attributes.geocodeMatchCode.accuracy<=0.75) {
                    score.className+= 'Accuracy050to075';
                } else if (f.attributes.geocodeMatchCode.accuracy<=1.00) {
                    score.className+= 'Accuracy075to100';
                }
                var img= this.div.ownerDocument.createElement('img');
                img.className= 'gpGeocodeMatchCodeMatchType';
                img.i18nKey= f.attributes.geocodeMatchCode.matchType;
                img.alt= img.title= '';
                img.src= Geoportal.Util.getImagesLocation()+'OLSnone.gif';
                if (img.i18nKey) {
                    if (this.matchTypes) {
                        var key= '';
                        for (var j= 0, len=this.matchTypes.length; j<len; j++) {
                            if (!this.matchTypes[j].re ||
                                (key= img.i18nKey.match(this.matchTypes[j].re))) {
                                key= key[0];
                                img.i18nKey= this.getDisplayClass()+'.matchType.'+key;
                                img.src= this.matchTypes[j].src;
                                break;
                            }
                        }
                    }
                    img.alt= img.title= OpenLayers.i18n(img.i18nKey);
                }
                score.appendChild(img);
                r.appendChild(score);
            }// FIXME: f.attributes.measure ?
            var s= this.div.ownerDocument.createElement('span');
            s.style.cursor= 'pointer';
            var context= {
                cntrl: this,
                feature: f
            };
            var ga= f.attributes.address;
            var excludedClassifications= ['BBOX'];
            s.innerHTML= ga.toString(excludedClassifications);
            context.zoom= this.setZoom(f);
            OpenLayers.Event.observe(
                    s,
                    "click",
                    OpenLayers.Function.bindAsEventListener(this.onResultClick,context));
            r.appendChild(s);
            this.resultDiv.appendChild(r);
        }
        this.resultDiv.style.display= '';
        return true;
    },

    /**
     * Method: onResultClick
     * Center the map on the address. If the 'Ctrl-Key' has been pressed the
     * results panel is not removed, allowing the user to control-click on
     * various locations to choose the most relevant.
     *
     * Parameters:
     * evt - {Event}
     *
     * Context:
     * cntrl - {<Geoportal.Control.LocationUtilityService>}
     * zoom - {Integer}
     * feature - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>}
     */
    onResultClick: function(evt) {
        Geoportal.Control.LocationUtilityService.prototype.onResultClick.apply(this,arguments);
        if (evt && evt.ctrlKey && evt.altKey && this.feature.attributes.geocodeMatchCode.matchType.match(/city/i)) {
            // refine search ...
            var p= this.feature.attributes.address.getPlaces()[0];
            var z= this.feature.attributes.address.postalCode;
            this.cntrl.inputs[this.fields.q1].value= p.name;
            this.cntrl.inputs[this.fields.q2].value= z.name;
            this.cntrl.geocode();
        }
    },

    /**
     * Method: onAutoCompleteResultClick
     * Center the map on the autocompleted geoname (if the autocomplete result has coordinates).
     *
     * Parameters:
     * v - {String} the current text value of the autocomplete field.
     *
     * Returns:
     * {String} the autocomplete field value or null if the map is directly centered.
     */
    onAutoCompleteResultClick: function(v) {
        var acc= this.autoCompleteControl;
        if (acc && acc.results && acc.highlightIndex) {
            var acResult= acc.results[acc.highlightIndex-1];
            /* city, classification, country, fulltext, kind, street, x, y, zipcode */
            if (v==acResult.fulltext) {
                if (acResult.x!=0 && acResult.y!=0) {
                    var point= new OpenLayers.Geometry.Point(acResult.x, acResult.y).transform(
                        OpenLayers.Projection.CRS84, this.map.getProjection()
                    );
                    var atts= {
                        'address':new Geoportal.OLS.Address(),
                        'geocodeMatchCode':new Geoportal.OLS.GeocodeMatchCode()
                    };
                    var a= atts.address;
                    a.countryCode= acResult.country;
                    a.streetAddress= new Geoportal.OLS.StreetAddress();
                    var s= new Geoportal.OLS.Street();
                    s.name= acResult.street;
                    a.streetAddress.addStreet(s);
                    var p= new Geoportal.OLS.Place();
                    p.classification= 'Municipality';
                    p.name= acResult.city;
                    a.addPlace(p);
                    a.postalCode= new Geoportal.OLS.PostalCode({name: acResult.zipcode});
                    a= atts.geocodeMatchCode;
                    a.accuracy= 1.0;
                    a.matchType= 'Street number';
                    var f= new OpenLayers.Feature.Vector(
                        point,
                        atts,
                        null
                    );
                    var context= {
                        cntrl: this,
                        feature: f,
                        zoom: this.setZoom(f)
                    };
                    this.onResultClick.apply(context);
                    return null;
                }
                v= acResult.zipcode+' '+(acResult.street==''? acResult.city : acResult.street);
            }
        }
        return v;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.LocationUtilityService.Geocode"*
     */
    CLASS_NAME:"Geoportal.Control.LocationUtilityService.Geocode"
});

