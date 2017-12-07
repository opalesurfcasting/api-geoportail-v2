/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control/LocationUtilityService.js
 * @requires Geoportal/Control/AutoComplete.js
 */
/**
 * Class: Geoportal.Control.LocationUtilityService.GeoNames
 * Control for talking with an OpenLS Location Utility service for searching
 * geographical names.
 *
 * Inherits from:
 * - <Geoportal.Control.LocationUtilityService>
 */
Geoportal.Control.LocationUtilityService.GeoNames= OpenLayers.Class( Geoportal.Control.LocationUtilityService, {

    /**
     * Property: drawLocation
     * {Boolean} Draw result when clicking on result.
     *      Defaults to *false*
     */
    drawLocation: false,

    /**
     * Property: placesOptions
     * {Object} Places informations to display additionnaly in results list 
     *      Defaults to no additionnal information
     */
    placesOptions: {
        commune:false,
        departement:false,
        importance:false,
        territory:false
    },

    /**
     * APIProperty: fields
     * {Object} Names of input fields (q), submit button (s).
     * Defaults to *{'q0':'name','q1':'nature','q2':'importance','q3':'commune','c':'cancel','s':'search','w':'wait'}*
     *
     */
    fields: {
        'q0':'name',
        'q1':'nature',
        'q2':'importance',
        'q3':'commune',
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
     * Defaults to *Geoportal.Control.LocationUtilityService.POSITIONOFINTEREST*.
     */
    countryCode : Geoportal.Control.LocationUtilityService.POSITIONOFINTEREST,

    /**
     * APIProperty: setZoom
     * Returns the zoom from the <Geoportal.OLS.Address> object.
     *      Expect a feature parameter that holds search results.
     *      Defaults to map's numZoomLevels/2.
     */
    setZoom: function(f) { return Math.round(this.map.numZoomLevels/2); },

    /**
     * Constructor: Geoportal.Control.LocationUtilityService.GeoNames
     * Build a button for searching an OpenLS Location Utility service.
     *
     * Parameters:
     * layer - {<Geoportal.Layer.OpenLS.Core.LocationUtilityService>}
     * options - {Object} options to build this control.
     *      Amongst possible value, one can find :
     *      * placesOptions - {Object} what places are displayed in results list
     *      in addition to toponym values. Properties for this object are :
     *      * - departement - {Boolean} displays department - defaults to false
     *      * - commune - {Boolean} displays commune - defaults to false
     *      * - importance - {Boolean} displays importance - defaults to false
     *      * - territory - {Boolean} displays territory - defaults to false
     */
    initialize: function(layer, options) {
        Geoportal.Control.LocationUtilityService.prototype.initialize.apply(this, arguments);
        if (!this.order) {
            this.order= Geoportal.Control.LocationUtilityService.GeoNames.orderBDNyme;
        }
        if (options.placesOptions) {
            for (prop in options.placesOptions) {
                this.placesOptions[prop]= options.placesOptions[prop] ;
            }
        }
    },

    /**
     * Method: loadContent
     * Build the form, send the GeocodeRequest and display results (list of
     * places).
     *      The form's structure is as follows :
     *
     * (start code)
     * <label id='lblname{#Id}' for='name{#Id}'>{#displayClass}.name</label>
     * <input id='name{#Id}' name='name{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='{#fld.length}' disabled='{#fld.disabled}'/>
     * <br/>
     * <span id='helpname{#Id}' class='gpFormSmall'>{#displayClass}.name.help</span>
     * <br/>
     * <label id='lblnature{#Id}' for='nature{#Id}' style='font-weight:bold;'>{#displayClass}.nature
     *   <select id='nature{#Id}' name='nature{#Id}' class='{#fld.css}'>
     *     <option value='{#fld.options[].value}' selected='{#fld.options[].selected}' class='{#fld.css}'>{#fld.options[].text}</option>
     *   </select>
     * </label>
     * <br/>
     * <span id='helpnature{#Id}' class='gpFormSmall'>{#displayClass}.nature.help</span>
     * <br/>
     * <label id='lblimportance{#Id}' for='importance{#Id}' style='font-weight:bold;'>{#displayClass}.importance
     *   <select id='importance{#Id}' name='importance{#Id}' class='{#fld.css}'>
     *     <option value='{#fld.options[].value}' selected='{#fld.options[].selected}' class='{#fld.css}'>{#fld.options[].text}</option>
     *   </select>
     * </label>
     * <br/>
     * <span id='helpimportance{#Id}' class='gpFormSmall'>{#displayClass}.importance.help</span>
     * <br/>
     * <label id='lblcommune{#Id}' for='commune{#Id}'>{#displayClass}.commune</label>
     * <input id='commune{#Id}' name='commune{#Id}' type='text' value='{#fld.value}'
     *        maxLength='128' size='{#fld.length}' disabled='{#fld.disabled}'/>
     * <br/>
     * <span id='helpcommune{#Id}' class='gpFormSmall'>{#displayClass}.commune.help</span>
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
        this.inputs[this.fields.q0]= this.buildInputTextField(form,{
            id:this.fields.q0,
            mandatory:true,
            size:50,
            length:80,
            callbacks:[
                {evt:'click',func:this.onSearchClick}
            ]});
        if (this.autoCompleteOptions) {
            this.autoCompleteOptions.inputText= this.inputs[this.fields.q0];
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
        var opts= [{value:'',text:'',selected:true}];
        var nats= Geoportal.Control.LocationUtilityService.GeoNames.CODE_NAT;
        for (var n in nats) {
            var o= {
                value: n,
                text: n //FIXME: i18n?
            };
            opts.push(o);
        }
        this.inputs[this.fields.q1]= this.buildSelectField(form,{
            id:this.fields.q1,
            options:opts,
            callbacks:[
                {evt:'change',func:this.onSearchClick}
            ]});
        opts= [{value:'',text:'',selected:true}];
        var imps= Geoportal.Control.LocationUtilityService.GeoNames.IMPORTANCE;
        for (var i in imps) {
            var o= {
                value: i,
                text: i //FIXME: i18n?
            };
            opts.push(o);
        }
        this.inputs[this.fields.q2]= this.buildSelectField(form,{
            id:this.fields.q2,
            options:opts,
            callbacks:[
                {evt:'change',func:this.onSearchClick}
            ]});
        this.inputs[this.fields.q3]= this.buildInputTextField(form,{
            id:this.fields.q3,
            mandatory:false,
            size:50,
            length:80,
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
        Geoportal.Control.Form.focusOn(this.inputs[this.fields.q0]);
    },

    /**
     * Method: geocode
     * Launch the geocoding request.
     */
    geocode: function() {
        var a= new Geoportal.OLS.Address(this.countryCode);
        var v= OpenLayers.String.trim(this.inputs[this.fields.q0].value);
        if (v=='') { return ; }
        if (this.autoCompleteOptions) {
            v= this.onAutoCompleteResultClick(v);
            if (v == null) {
                return;
            }
        }
        a.name= v;
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
     *      * Importance : See {<Geoportal.Control.LocationUtilityService.GeoNames.IMPORTANCE>}
     *      * Nature : See {<Geoportal.Control.LocationUtilityService.GeoNames.CODE_NAT>}
     *      * Commune : commune's name
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
        v= OpenLayers.String.trim(this.inputs[this.fields.q1].value);
        if (v!='') {
            var p= new Geoportal.OLS.Place({
                'classification':'Nature',
                'name':v
            });
            a.addPlace(p);
        }
        v= OpenLayers.String.trim(this.inputs[this.fields.q2].value);
        if (v!='') {
            var p= new Geoportal.OLS.Place({
                'classification':'Importance',
                'name':v
            });
            a.addPlace(p);
        }
        v= OpenLayers.String.trim(this.inputs[this.fields.q3].value);
        if (v!='') {
            var p= new Geoportal.OLS.Place({
                'classification':'Commune',
                'name':v
            });
            a.addPlace(p);
        }

        return Geoportal.Control.LocationUtilityService.prototype.geocodeWithFilters.apply(this, [a]);
    },

    /**
     * APIProperty: order
     * {Function} Order results. Defaults is to call <orderBDNyme>().
     *      Expect two parameters of type {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>}
     *      returned by the OpenLS service.
     *      Returns an {Integer} used for the sort() function.
     */
    order: null,

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
        features.sort(this.order);
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
            var pl= ga.getNbPlaces()>0? (ga.getPlaces()[0]).name || '' : '?';
            var nature= Geoportal.Control.LocationUtilityService.GeoNames.getNature(ga,'?');
            // additionnal places Info
            var communeInfo= '' ;
            var deptInfo= '' ;
            var terrInfo= '' ;
            var impInfo= '' ;
            if (this.placesOptions) {
                var commune = '';
                if (ga && ga.getPlaces()) {
                    for (var n= 0, len= ga.getNbPlaces(); n<len; n++) {
                        var classificationUpc= ga.getPlaces()[n].classification.toUpperCase() ;
                        if (classificationUpc == 'COMMUNE' && this.placesOptions.commune) {
                            commune= ga.getPlaces()[n].name;
                            var postalCode= (ga && ga.postalCode? ga.postalCode.name : '');
                            communeInfo = " - "+postalCode+' '+commune;
                        }
                        if (classificationUpc == 'DEPARTEMENT' && this.placesOptions.departement) {
                            deptInfo= ' - '+ga.getPlaces()[n].name;
                        }
                        if (classificationUpc == 'TERRITOIRE' && this.placesOptions.territory) {
                            terrInfo= ' - '+ga.getPlaces()[n].name;
                        }
                        if (classificationUpc == 'IMPORTANCE' && this.placesOptions.importance) {
                            impInfo= ' - '+ga.getPlaces()[n].name;
                        }
                    }
                }
            }
            // additionnal departement Info
            s.innerHTML= pl+ ' ['+nature+']'+ communeInfo + deptInfo + terrInfo + impInfo;
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
                    a.streetAddress.addStreet(new Geoportal.OLS.Street());
                    var p= new Geoportal.OLS.Place();
                    p.classification= 'Municipality';
                    p.name= acResult.city;
                    a.addPlace(p);
                    p= new Geoportal.OLS.Place();
                    p.classification= 'Municipality';
                    p.name= acResult.kind;
                    a.addPlace(p);
                    a.postalCode= new Geoportal.OLS.PostalCode({name: acResult.zipcode});
                    a= atts.geocodeMatchCode;
                    a.accuracy= 1.0;
                    a.matchType= 'City';
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
     * {String} *"Geoportal.Control.LocationUtilityService.GeoNames"*
     */
    CLASS_NAME:"Geoportal.Control.LocationUtilityService.GeoNames"
});

/**
 * APIFunction: getNature
 * Get the 'nature' place classification value of the address.
 *
 * Parameters:
 * ad - {<Geoportal.OLS.Address>} an OpenLS address.
 * defaultValue - {String} default 'nature' value.
 *
 * Returns:
 * {String} the 'nature' place classification value of the address.
 */
Geoportal.Control.LocationUtilityService.GeoNames.getNature= function(ad, defaultValue) {
    var nature= (ad && ad.postalCode? ad.postalCode.name : '') || defaultValue;
    if (ad && ad.getPlaces()) {
        for (var i= 0, len= ad.getNbPlaces(); i<len; i++) {
            if (ad.getPlaces()[i].classification.toUpperCase() == 'NATURE') {
                nature= ad.getPlaces()[i].name;
                break;
            }
        }
    }
    return nature;
};

/**
 * APIFunction: orderBDNyme
 * Order toponyms based on their accuracy and weight.
 *
 * Parameters:
 * a - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>} an OpenLS feature.
 * b - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>} an OpenLS feature.
 *
 * Returns:
 * {Integer} used for sort() function.
 */
Geoportal.Control.LocationUtilityService.GeoNames.orderBDNyme= function(a,b) {
    var ba= b.attributes, aa= a.attributes;
    var n= ba.geocodeMatchCode.accuracy - aa.geocodeMatchCode.accuracy;
    if (n==0) {
        var ad= ba.address;
        var nature= Geoportal.Control.LocationUtilityService.GeoNames.getNature(ad,'NR');
        var o= Geoportal.Control.LocationUtilityService.GeoNames.CODE_NAT[nature];
        if (!o) { o= Geoportal.Control.LocationUtilityService.GeoNames.CODE_NAT['NR']; }
        var w2= o.weight;
        var n2= (ad && ad.places && ad.places.length>0? ad.places[0].name : '') || '';
        ad= aa.address;
        nature= Geoportal.Control.LocationUtilityService.GeoNames.getNature(ad,'NR');
        o= Geoportal.Control.LocationUtilityService.GeoNames.CODE_NAT[nature];
        if (!o) { o= Geoportal.Control.LocationUtilityService.GeoNames.CODE_NAT['NR']; }
        var w1= o.weight;
        var n1= (ad && ad.getNbPlaces()>0? ad.getPlaces()[0].name : '') || '';
        if (w2!=w1) {
            return w2 - w1;
        }
        return n1>n2? 1 : n1<n2? -1 : 0;
    }
    return 1000*n;
};

/**
 * APIFunction: setZoomForBDNyme
 * Returns the zoom from the <Geoportal.OLS.Address> object based on the
 * fact that the OpenLS postalCode response holds the NATURE field of the
 * BDNyme&reg; objects...
 *      The values are :
 *      * Château
 *      * Grange
 *      * Lieu-dit habité
 *      * Moulin
 *      * Quartier
 *      * Refuge
 *      * Enceinte militaire
 *      * Etablissement pénitentiaire
 *      * Maison forestière
 *      * Camping
 *      * Construction
 *      * Maison du parc
 *      * Menhir
 *      * Monument
 *      * Musée
 *      * Parc de loisirs
 *      * Parc des expositions
 *      * Parc zoologique
 *      * Village de vacances
 *      * Arbre
 *      * Bois
 *      * Parc
 *      * Enseignement supérieur
 *      * Science
 *      * Centrale électrique
 *      * Haras national
 *      * Zone industrielle
 *      * Clinique
 *      * Hôpital
 *      * Etablissement hospitalier
 *      * Etablissement thermal
 *      * Golf
 *      * Hippodrome
 *      * Stade
 *      * Aérodrome militaire
 *      * Aérodrome non militaire
 *      * Aéroport international
 *      * Aéroport quelconque
 *      * Capitale d'état
 *      * Préfecture de région
 *      * Préfecture
 *      * Sous-préfecture
 *      * Canton
 *      * Commune
 *      * Barrage
 *      * Croix
 *      * Tombeau
 *      * Digue
 *      * Dolmen
 *      * Espace public
 *      * Habitation troglodytique
 *      * Vestiges archéologiques
 *      * Lieu-dit non habité
 *      * Point de vue
 *      * Marais salants
 *      * Mine
 *      * Ouvrage militaire
 *      * Amer
 *      * Baie
 *      * Banc
 *      * Canal
 *      * Cascade
 *      * Embouchure
 *      * Espace maritime
 *      * Glacier
 *      * Lac
 *      * Marais
 *      * Pêcherie
 *      * Perte
 *      * Point d'eau
 *      * Rivière
 *      * Cap
 *      * Cirque
 *      * Col
 *      * Crête
 *      * Dépression
 *      * Dune
 *      * Escarpement
 *      * Gorge
 *      * Grotte
 *      * Ile
 *      * Isthme
 *      * Montagne
 *      * Pic
 *      * Plage
 *      * Plaine
 *      * Récif
 *      * Rochers
 *      * Sommet
 *      * Vallée
 *      * Versant
 *      * Volcan
 *      * Aire de repos
 *      * Aire de service
 *      * Carrefour
 *      * Chemin
 *      * Echangeur
 *      * Infrastructure routière
 *      * Péage
 *      * Parking
 *      * Pont
 *      * Port
 *      * Rond-point
 *      * Tunnel
 *      * Gare routière
 *      * Gare voyageurs uniquement
 *      * Gare voyageurs et fret
 *      * Gare fret uniquement
 *      * Téléphérique
 *      * Voie ferrée
 *
 * Parameters:
 * f - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>} the returned address.
 *
 * Returns:
 * {Integer} a zoom level.
 */
Geoportal.Control.LocationUtilityService.GeoNames.setZoomForBDNyme= function(f) {
    var ad= f.attributes.address;
    var cp= ad? ad.postalCode? ad.postalCode.name || 'NR' : 'NR' : 'NR';
    var o= Geoportal.Control.LocationUtilityService.GeoNames.CODE_NAT[cp];
    if (!o) { o= Geoportal.Control.LocationUtilityService.GeoNames.CODE_NAT['NR']; }
    var z= o.zoom;
    return z;
};

/**
 * Constant: Geoportal.Control.LocationUtilityService.GeoNames.CODE_NAT
 * {Object} Hold the name as key, a weight and a zoom as values.
 */
Geoportal.Control.LocationUtilityService.GeoNames.CODE_NAT= {
    "Capitale d'état"            : { weight: 500, zoom: 11},
    "Préfecture de région"       : { weight: 499, zoom: 12},
    "Préfecture"                 : { weight: 498, zoom: 13},
    "Sous-préfecture"            : { weight: 497, zoom: 14},
    "Canton"                     : { weight: 496, zoom: 14},
    "Commune"                    : { weight: 495, zoom: 15},
    "Lieu-dit habité"            : { weight: 301, zoom: 16},
    "Lieu-dit non habité"        : { weight: 300, zoom: 17},
    "Musée"                      : { weight: 299, zoom: 14},//FIXME for weights up to the end ...
    "Enceinte militaire"         : { weight: 298, zoom: 14},
    "Parc de loisirs"            : { weight: 297, zoom: 14},
    "Parc des expositions"       : { weight: 296, zoom: 14},
    "Parc zoologique"            : { weight: 295, zoom: 14},
    "Village de vacances"        : { weight: 294, zoom: 14},
    "Bois"                       : { weight: 293, zoom: 14},
    "Parc"                       : { weight: 292, zoom: 14},
    "Enseignement supérieur"     : { weight: 291, zoom: 14},
    "Science"                    : { weight: 290, zoom: 14},
    "Centrale électrique"        : { weight: 289, zoom: 14},
    "Haras national"             : { weight: 288, zoom: 14},
    "Zone industrielle"          : { weight: 287, zoom: 14},
    "Etablissement thermal"      : { weight: 286, zoom: 14},
    "Espace public"              : { weight: 285, zoom: 14},
    "Habitation troglodytique"   : { weight: 284, zoom: 14},
    "Marais salants"             : { weight: 283, zoom: 14},
    "Golf"                       : { weight: 282, zoom: 14},
    "Hippodrome"                 : { weight: 281, zoom: 14},
    "Stade"                      : { weight: 280, zoom: 14},
    "Aérodrome militaire"        : { weight: 279, zoom: 14},
    "Aérodrome non militaire"    : { weight: 278, zoom: 14},
    "Aéroport international"     : { weight: 277, zoom: 14},
    "Aéroport quelconque"        : { weight: 276, zoom: 14},
    "Gare routière"              : { weight: 275, zoom: 14},
    "Gare voyageurs uniquement"  : { weight: 274, zoom: 14},
    "Gare voyageurs et fret"     : { weight: 273, zoom: 14},
    "Gare fret uniquement"       : { weight: 272, zoom: 14},
    "Téléphérique"               : { weight: 271, zoom: 14},
    "Voie ferrée"                : { weight: 270, zoom: 14},
    "Château"                    : { weight: 269, zoom: 17},
    "Grange"                     : { weight: 268, zoom: 17},
    "Moulin"                     : { weight: 267, zoom: 17},
    "Quartier"                   : { weight: 266, zoom: 17},
    "Refuge"                     : { weight: 265, zoom: 17},
    "Etablissement pénitentiaire": { weight: 264, zoom: 17},
    "Maison forestière"          : { weight: 263, zoom: 17},
    "Camping"                    : { weight: 262, zoom: 17},
    "Construction"               : { weight: 261, zoom: 17},
    "Maison du parc"             : { weight: 260, zoom: 17},
    "Menhir"                     : { weight: 259, zoom: 17},
    "Monument"                   : { weight: 258, zoom: 17},
    "Arbre"                      : { weight: 257, zoom: 17},
    "Clinique"                   : { weight: 256, zoom: 17},
    "Hôpital"                    : { weight: 255, zoom: 17},
    "Etablissement hospitalier"  : { weight: 254, zoom: 17},
    "Barrage"                    : { weight: 253, zoom: 17},
    "Croix"                      : { weight: 252, zoom: 17},
    "Tombeau"                    : { weight: 251, zoom: 17},
    "Digue"                      : { weight: 250, zoom: 17},
    "Dolmen"                     : { weight: 249, zoom: 17},
    "Vestiges archéologiques"    : { weight: 248, zoom: 17},
    "Point de vue"               : { weight: 247, zoom: 17},
    "Mine"                       : { weight: 246, zoom: 17},
    "Ouvrage militaire"          : { weight: 245, zoom: 17},
    "Amer"                       : { weight: 244, zoom: 17},
    "Baie"                       : { weight: 243, zoom: 17},
    "Banc"                       : { weight: 242, zoom: 17},
    "Canal"                      : { weight: 241, zoom: 17},
    "Cascade"                    : { weight: 240, zoom: 17},
    "Embouchure"                 : { weight: 239, zoom: 17},
    "Espace maritime"            : { weight: 238, zoom: 17},
    "Glacier"                    : { weight: 237, zoom: 17},
    "Lac"                        : { weight: 236, zoom: 17},
    "Marais"                     : { weight: 235, zoom: 17},
    "Pêcherie"                   : { weight: 234, zoom: 17},
    "Perte"                      : { weight: 233, zoom: 17},
    "Point d'eau"                : { weight: 232, zoom: 17},
    "Rivière"                    : { weight: 231, zoom: 17},
    "Cap"                        : { weight: 230, zoom: 17},
    "Cirque"                     : { weight: 229, zoom: 17},
    "Col"                        : { weight: 228, zoom: 17},
    "Crête"                      : { weight: 227, zoom: 17},
    "Dépression"                 : { weight: 226, zoom: 17},
    "Dune"                       : { weight: 225, zoom: 17},
    "Escarpement"                : { weight: 224, zoom: 17},
    "Gorge"                      : { weight: 223, zoom: 17},
    "Grotte"                     : { weight: 222, zoom: 17},
    "Ile"                        : { weight: 221, zoom: 17},
    "Isthme"                     : { weight: 220, zoom: 17},
    "Montagne"                   : { weight: 219, zoom: 17},
    "Pic"                        : { weight: 218, zoom: 17},
    "Plage"                      : { weight: 217, zoom: 17},
    "Plaine"                     : { weight: 216, zoom: 17},
    "Récif"                      : { weight: 215, zoom: 17},
    "Rochers"                    : { weight: 214, zoom: 17},
    "Sommet"                     : { weight: 213, zoom: 17},
    "Vallée"                     : { weight: 212, zoom: 17},
    "Versant"                    : { weight: 211, zoom: 17},
    "Volcan"                     : { weight: 210, zoom: 17},
    "Aire de repos"              : { weight: 209, zoom: 17},
    "Aire de service"            : { weight: 208, zoom: 17},
    "Carrefour"                  : { weight: 207, zoom: 17},
    "Chemin"                     : { weight: 206, zoom: 17},
    "Echangeur"                  : { weight: 205, zoom: 17},
    "Infrastructure routière"    : { weight: 204, zoom: 17},
    "Péage"                      : { weight: 203, zoom: 17},
    "Parking"                    : { weight: 202, zoom: 17},
    "Pont"                       : { weight: 201, zoom: 17},
    "Port"                       : { weight: 200, zoom: 17},
    "Rond-point"                 : { weight: 199, zoom: 17},
    "Tunnel"                     : { weight: 198, zoom: 17},
    "NR"                         : { weight:   1, zoom: 17}
};

/**
 * Constant: Geoportal.Control.LocationUtilityService.GeoNames.IMPORTANCE
 * {Object} Hold the value as key, a weight (1) and a zoom (0) as values.
 */
Geoportal.Control.LocationUtilityService.GeoNames.IMPORTANCE= {
    "1"  : { weight: 1, zoom: 0},
    "2"  : { weight: 1, zoom: 0},
    "3"  : { weight: 1, zoom: 0},
    "4"  : { weight: 1, zoom: 0},
    "5"  : { weight: 1, zoom: 0},
    "6"  : { weight: 1, zoom: 0},
    "7"  : { weight: 1, zoom: 0},
    "8"  : { weight: 1, zoom: 0},
    "NC" : { weight: 1, zoom: 0},
    "NR" : { weight: 1, zoom: 0}
};

