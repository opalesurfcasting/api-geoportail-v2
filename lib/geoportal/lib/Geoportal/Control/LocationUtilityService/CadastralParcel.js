/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/LocationUtilityService.js
 * @requires Geoportal/Control/AutoComplete.js
 */
/**
 * Class: Geoportal.Control.LocationUtilityService.CadastralParcel
 * Control for talking with an OpenLS Location Utility service for searching
 * addresses.
 *
 * Inherits from:
 * - <Geoportal.Control.LocationUtilityService>
 */
Geoportal.Control.LocationUtilityService.CadastralParcel= OpenLayers.Class( Geoportal.Control.LocationUtilityService, {

    /**
     * APIProperty: fields
     * {Object} Names of input fields (q), submit button (s).
     * Defaults to
     * *{'q0':'departement','q1':'insee','q2':'absorbee','q3':'section','q4':'feuille','q5':'numero','q6':'freeformparcel','c':'cancel','s':'search','w':'wait'}*
     *
     */
    fields: {
        'q0':'departement',/*nn*/
        'q1':'insee',      /*nnn*/
        'q2':'absorbee',   /*nnn -> 000*/
        'q3':'section',    /*nn*/
        // 'q4':'feuille',    /*nn -> 0*/
        'q5':'numero',     /*nnnn*/
        'q6':'freeformparcel',
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
     * Defaults to *Geoportal.Control.LocationUtilityService.CADASTRALPARCEL*.
     */
    countryCode: Geoportal.Control.LocationUtilityService.CADASTRALPARCEL,

    /**
     * APIProperty: setZoom
     * Returns the zoom from the <Geoportal.OLS.Address> object.
     *      Defaults to map's numZoomLevels-5.
     *      Expect a feature parameter that holds search results.
     */
    setZoom: function(f) { return this.map.getNumZoomLevels() - 4; },

    /**
     * Constructor: Geoportal.Control.LocationUtilityService.CadastralParcel
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
     * <label id='lbldepartement{#Id}' for='departement{#Id}'>{#displayClass}.departement</label>
     * <input id='departement{#Id}' name='departement{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='{#fld.length}' disabled='{#fld.disabled}'/>
     * <br/>
     * <span id='helpdepartement{#Id}' class='gpFormSmall'>{#displayClass}.departement.help</span>
     * <br/>
     * <label id='lblinsee{#Id}' for='insee{#Id}'>{#displayClass}.insee</label>
     * <input id='insee{#Id}' name='insee{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='{#fld.length}' disabled='{#fld.disabled}'/>
     * <br/>
     * <span id='helpinsee{#Id}' class='gpFormSmall'>{#displayClass}.insee.help</span>
     * <br/>
     * <label id='lblabsorbee{#Id}' for='absorbee{#Id}'>{#displayClass}.absorbee</label>
     * <input id='absorbee{#Id}' name='absorbee{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='{#fld.length}' disabled='{#fld.disabled}'/>
     * <br/>
     * <span id='helpabsorbee{#Id}' class='gpFormSmall'>{#displayClass}.absorbee.help</span>
     * <br/>
     * <label id='lblsection{#Id}' for='section{#Id}'>{#displayClass}.section</label>
     * <input id='section{#Id}' name='section{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='{#fld.length}' disabled='{#fld.disabled}'/>
     * <br/>
     * <span id='helpsection{#Id}' class='gpFormSmall'>{#displayClass}.section.help</span>
     * <br/>
     * <label id='lblfeuille{#Id}' for='feuille{#Id}'>{#displayClass}.feuille</label>
     * <input id='feuille{#Id}' name='feuille{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='{#fld.length}' disabled='{#fld.disabled}'/>
     * <br/>
     * <span id='helpfeuille{#Id}' class='gpFormSmall'>{#displayClass}.feuille.help</span>
     * <br/>
     * <label id='lblnumero{#Id}' for='numero{#Id}'>{#displayClass}.numero</label>
     * <input id='numero{#Id}' name='numero{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='{#fld.length}' disabled='{#fld.disabled}'/>
     * <br/>
     * <span id='helpnumero{#Id}' class='gpFormSmall'>{#displayClass}.numero.help</span>
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
     * <label id='lblfreeformparcel{#Id}' for='freeformparcel{#Id}'>{#displayClass}.freeformparcel</label>
     * <input id='freeformparcel{#Id}' name='freeformparcel{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='{#fld.length}' disabled='{#fld.disabled}'/>
     * <br/>
     * <span id='helpfreeformparcel{#Id}' class='gpFormSmall'>{#displayClass}.freeformparcel.help</span>
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
            this.inputs[this.fields.q6]= this.buildInputTextField(form,{
                id:this.fields.q6,
                mandatory:true,
                size:16,
                length:20,
                callbacks:[
                    {evt:'click',func:this.onSearchClick}
                ]});
            this.autoCompleteOptions.inputText= this.inputs[this.fields.q6];
        } else {
            // DEP
            this.inputs[this.fields.q0]= this.buildInputTextField(form,{
                id:this.fields.q0,
                mandatory:true,
                size:2,
                length:2,
                callbacks:[
                    {evt:'click',func:this.onSearchClick}
                ]});
            // COMM
            this.inputs[this.fields.q1]= this.buildInputTextField(form,{
                id:this.fields.q1,
                mandatory:true,
                size:3,
                length:3,
                callbacks:[
                    {evt:'click',func:this.onSearchClick}
                ]});
            // COMM ABSORBEE
            this.inputs[this.fields.q2]= this.buildInputTextField(form,{
                id:this.fields.q2,
                size:3,
                length:4,  // on autorise 4 caractères pour insérer un 
                           // # de feuille pour êtrecompatible avec la 
                           // future ancienne version du service.
                value:'000',
                callbacks:[
                    {evt:'click',func:this.onSearchClick}
                ]});
            // SECTION
            this.inputs[this.fields.q3]= this.buildInputTextField(form,{
                id:this.fields.q3,
                size:2,
                length:2,
                callbacks:[
                    {evt:'click',func:this.onSearchClick}
                ]});
            // PARCELLE
            this.inputs[this.fields.q5]= this.buildInputTextField(form,{
                id:this.fields.q5,
                size:4,
                length:4,
                callbacks:[
                    {evt:'click',func:this.onSearchClick}
                ]});
        }
        Geoportal.Control.LocationUtilityService.prototype.loadContent.apply(this,arguments);
    },

    /**
     * Method: initFocus
     * Initialize the focus of an input field in the form.
     */
    initFocus: function() {
        Geoportal.Control.Form.focusOn(this.inputs[this.autoCompleteOptions? this.fields.q6 : this.fields.q0]);
    },

    /**
     * Method: geocode
     * Launch the geocoding request.
     */
    geocode: function() {
        var a= new Geoportal.OLS.Address(this.countryCode);
        if (this.autoCompleteOptions) {
            var v= OpenLayers.String.trim(this.inputs[this.fields.q6].value);
            if (v=='') { return null; }
            v= this.onAutoCompleteResultClick(v);
            if (v==null) {
                return null;
            }
            a.name= v;
        } else {
            // on concatène les champs saisis pour faire une recherche freeform
            // (y a que ça qui marche pour l'instant...
            // DEP (2 caracteres)
            var v= OpenLayers.String.trim(this.inputs[this.fields.q0].value);
            if (v=='') { return null; }
            if (v.length==1) v='0'+v ;
            a.name= v;
            // INSEE (3 caracteres)
            v= OpenLayers.String.trim(this.inputs[this.fields.q1].value);
            if (v=='') { return null; }
            while (v.length<3) v='0'+v ;
            a.name+= v;
            // ABSORBEE (3 caractères)
            v= OpenLayers.String.trim(this.inputs[this.fields.q2].value);
            if (v=='') v='000' ;
            while (v.length<3) v='0'+v ;
            a.name+= v;
            // SECTION (2)
            v= OpenLayers.String.trim(this.inputs[this.fields.q3].value);
            if (v=='') v= '00' ;
            while (v.length<2) v='0'+v ;
            a.name+= v;
            // FEUILLE => OUT
            // PARCELLE (4)
            v= OpenLayers.String.trim(this.inputs[this.fields.q5].value);
            if (v=='') v= '0000' ;
            while (v.length<4) v='0'+v ;
            a.name+= v;
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
     * {String} *"Geoportal.Control.LocationUtilityService.CadastralParcel"*
     */
    CLASS_NAME:"Geoportal.Control.LocationUtilityService.CadastralParcel"
});

