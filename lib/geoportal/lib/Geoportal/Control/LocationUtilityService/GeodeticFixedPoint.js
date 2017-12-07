/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/LocationUtilityService.js
 * @requires Geoportal/Control/AutoComplete.js
 */
/**
 * Class: Geoportal.Control.LocationUtilityService.GeodeticFixedPoint
 * Control for talking with an OpenLS Location Utility service for searching
 * addresses.
 *
 * Inherits from:
 * - <Geoportal.Control.LocationUtilityService>
 */
Geoportal.Control.LocationUtilityService.GeodeticFixedPoint= OpenLayers.Class( Geoportal.Control.LocationUtilityService, {

    /**
     * APIProperty: fields
     * {Object} Names of input fields (q), submit button (s).
     * Defaults to *{'q0':'name','q1':'identifiant','q2':'type','q3':'freeformgeodesic','c':'cancel','s':'search','w':'wait'}*
     *
     */
    fields: {
        'q0':'name',//FIXME
        'q1':'identifiant',//FIXME
        'q2':'type',//FIXME
        'q3':'freeformgeodesic',
        'c' :'cancel',
        's' :'search',
        'w' :'wait',
        't' :'type',
        'f0':'extent',
        'f1':'territory',
        'f2':'region',
        'f3':'department'
    },

    /**
     * APIProperty: countryCode
     * {String} comma-separated codes to specify the reference table used to geocode an address.
     * Defaults to *Geoportal.Control.LocationUtilityService.GEODETICFIXEDPOINT*.
     */
    countryCode: Geoportal.Control.LocationUtilityService.GEODETICFIXEDPOINT,

    /**
     * APIProperty: setZoom
     * Returns the zoom from the <Geoportal.OLS.Address> object.
     *      Expect a feature parameter that holds search results.
     *      Defaults to map's numZoomLevels-5.
     */
    setZoom: function(f) { return this.map.getNumZoomLevels() - 5; },
    //FIXME: depends on f's type ?

    /**
     * Constructor: Geoportal.Control.LocationUtilityService.GeodeticFixedPoint
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
     * <label id='lblgeodeticname{#Id}' for='geodeticname{#Id}'>{#displayClass}.geodeticname</label>
     * <input id='geodeticname{#Id}' name='geodeticname{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='{#fld.length}' disabled='{#fld.disabled}'/>
     * <br/>
     * <span id='helpgeodeticname{#Id}' class='gpFormSmall'>{#displayClass}.geodeticname.help</span>
     * <br/>
     * <label id='lblgeodeticnumber{#Id}' for='geodeticnumber{#Id}'>{#displayClass}.geodeticnumber</label>
     * <input id='geodeticnumber{#Id}' name='geodeticnumber{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='{#fld.length}' disabled='{#fld.disabled}'/>
     * <br/>
     * <span id='helpgeodeticnumber{#Id}' class='gpFormSmall'>{#displayClass}.geodeticnumber.help</span>
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
     * <label id='lblfreeformgeodesic{#Id}' for='freeformgeodesic{#Id}'>{#displayClass}.freeformgeodesic</label>
     * <input id='freeformgeodesic{#Id}' name='freeformgeodesic{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='{#fld.length}' disabled='{#fld.disabled}'/>
     * <br/>
     * <span id='helpfreeformgeodesic{#Id}' class='gpFormSmall'>{#displayClass}.freeformgeodesic.help</span>
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
            this.inputs[this.fields.q3]= this.buildInputTextField(form,{
                id:this.fields.q3,
                mandatory:true,
                size:20,
                length:20,
                callbacks:[
                    {evt:'click',func:this.onSearchClick}
                ]});
            this.autoCompleteOptions.inputText= this.inputs[this.fields.q3];
        } else {
            this.inputs[this.fields.q0]= this.buildInputTextField(form,{
                id:this.fields.q0,
                mandatory:true,
                size:20,
                length:20,
                callbacks:[
                    {evt:'click',func:this.onSearchClick}
                ]});
            this.inputs[this.fields.q1]= this.buildInputTextField(form,{
                id:this.fields.q1,
                size:20,
                length:20,
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
        this.inputs[this.fields.q2]= this.buildInputTextField(form,{
            id:this.fields.q2,
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
        Geoportal.Control.Form.focusOn(this.inputs[this.autoCompleteOptions? this.fields.q3 : this.fields.q0]);
    },

    /**
     * Method: geocode
     * Launch the geocoding request.
     */
    geocode: function() {
        var a= new Geoportal.OLS.Address(this.countryCode);
        if (this.autoCompleteOptions) {
            var v= OpenLayers.String.trim(this.inputs[this.fields.q3].value);
            if (v=='') { return null; }
            v= this.onAutoCompleteResultClick(v);
            if (v==null) {
                return null;
            }
            a.name= v;
        } else {
            var v= OpenLayers.String.trim(this.inputs[this.fields.q0].value);
            if (v=='') { return null; }
            a.name= v;
            v= OpenLayers.String.trim(this.inputs[this.fields.q1].value);
            if (v!='') {
                var p= new Geoportal.OLS.Place({
                    'classification':'GeodeticNumber',
                    'name':v
                });
                a.addPlace(p);
            }
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
     *      * Type : See {<Geoportal.Control.LocationUtilityService.GeodeticFixedPoint.TYPE>}
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
        v= OpenLayers.String.trim(this.inputs[this.fields.q2].value);
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
                img.alt= img.title= '';
                img.src= Geoportal.Util.getImagesLocation()+'OLSnone.gif';
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

    //FIXME: onAutoCompleteResultClick

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.LocationUtilityService.GeodeticFixedPoint"*
     */
    CLASS_NAME:"Geoportal.Control.LocationUtilityService.GeodeticFixedPoint"
});

