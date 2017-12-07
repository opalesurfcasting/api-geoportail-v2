/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/AbstractAddress.js
 * @requires Geoportal/OLS/StreetAddress.js
 * @requires Geoportal/OLS/Place.js
 * @requires Geoportal/OLS/PostalCode.js
 */
/**
 * Class: Geoportal.OLS.Address
 * The Geoportal framework Open Location Service support Address class.
 *
 * Inherits from:
 *  - <Geoportal.OLS.AbstractAddress>
 */
Geoportal.OLS.Address=
    OpenLayers.Class(Geoportal.OLS.AbstractAddress, {

    /**
     * APIProperty: name
     * {String} An unstructured free form address.
     *      Either name or streetAddress must be filled.
     */
    name: null,

    /**
     * APIProperty: postalCode
     * {<Geoportal.OLS.PostalCode>} A zipcode or international postal code as
     * defined by the governing postal authority.
     */
    postalCode: null,

    /**
     * APIProperty: streetAddress
     * {<Geoportal.OLS.StreetAddress>} The location on a street.
     */
    streetAddress: null,

    /**
     * APIProperty: places
     * {Array(<Geoportal.OLS.Place>)} Place represents a hierarchical set of
     * geographic regions/placenames: country subdivision, country secondary
     * subdivision, municipality, and municipality subdivision.
     */
    places: null,

    /**
     * Constructor: Geoportal.OLS.Address
     *
     * Parameters:
     * countryCode - {String} ISO 3166 Alpha-2 Country Codes.
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(countryCode,options) {
        this.name= null;
        this.postalCode= null;
        this.streetAddress= null;
        this.places= [];
        Geoportal.OLS.AbstractAddress.prototype.initialize.apply(this,arguments);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.name= null;
        if (this.postalCode) {
            this.postalCode.destroy();
            this.postalCode= null;
        }
        if (this.streetAddress) {
            this.streetAddress.destroy();
            this.streetAddress= null;
        }
        if (this.places) {
            for (var i= 0, len= this.places.length; i<len; i++) {
                this.places[i].destroy();
                this.places[i]= null;
            }
            this.places= null;
        }
        Geoportal.OLS.AbstractAddress.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: clone
     * Create a clone of this address.
     *
     * Returns:
     * {<Geoportal.OLS.Address>} A clone.
     */
    clone: function() {
        var obj= new Geoportal.OLS.Address(this.countryCode);
        obj.addressee= this.addressee;
        obj.language = this.language;
        obj.name= this.name;
        if (this.postalCode) {
            obj.postalCode= this.postalCode.clone();
        }
        if (this.streetAddress) {
            obj.streetAddress= this.streetAddress.clone();
        }
        if (this.places) {
            for (var i= 0, len= this.places.length; i<len; i++) {
                obj.places.push(this.places[i].clone());
            }
        }
        if (this.restrictedExtent) {
            obj.restrictedExtent= this.restrictedExtent.clone();
        }
        return obj;
    },

    /**
     * APIMethod: addPlace
     * Add a place.
     *
     * Parameters:
     * place - {<Geoportal.OLS.Place>} a place.
     */
    addPlace: function(place) {
        if (!this.places) {
            this.places= [];
        }
        if (place) {
            this.places.push(place);
        }
    },

    /**
     * APIMethod: getNbPlaces
     * Return the number of places.
     *
     * Returns:
     * {Integer}
     */
    getNbPlaces: function() {
        return this.places? this.places.length : 0;
    },

    /**
     * APIMethod: getPlaces
     * Return all places.
     *
     * Returns:
     * {Array({<Geoportal.OLS.Place>})} or null
     */
    getPlaces: function() {
        return this.places? this.places : null;
    },

    /**
     * APIMethod: toString
     * Stringification of an address.
     *
     * Parameters:
     * excludedClassifications - {Array({String})} optionnal classifications to not stringify.
     *
     * Returns:
     * {String}
     */
    toString: function(excludedClassifications) {
        var str= '';
        if (!this.streetAddress) {//freeFormAddress
            str+= this.name || '';
        } else {//streetAddress
            var sl= this.streetAddress._streetLocation;
            if (sl) {
                if (sl instanceof Geoportal.OLS.Building) {
                    // TODO: buildingName
                    if (sl.num) {
                        str+= sl.num;
                    }
                    if (sl.subdivision) {
                        str+= sl.subdivision;
                    }
                    str+= ', ';
                }
            }
            for (var j= 0, jlen= this.streetAddress.getNbStreets(); j<jlen; j++) {
                var street= this.streetAddress.getStreets()[j];
                var sn= '';
                if (street.name!=null) {
                    sn= street.name;
                } else {
                    sn= (street.typePrefix? street.typePrefix + ' ': '') +
                        (street.officialName? street.officialName + ' ': '') +
                        (street.typeSuffix? street.typeSuffix : '') ;
                }
                if (sn) {
                    str+= sn + ', ';
                }
            }
        }
        var isEmpty= str.length==0;
        var plen= this.getNbPlaces();
        if (plen>0) {
            for (var p= 0; p<plen; p++) {
                var place= this.getPlaces()[p];
                if (place.classification && excludedClassifications &&
                        OpenLayers.Util.indexOf(excludedClassifications,place.classification.toUpperCase())!=-1) {
                    continue;
                }
                if (place.classification || place.name) {
                    if (place.name) {
                        //if (!isEmpty) {
                        //    str+= ' ['+place.name+']';
                        //} else {
                            str+= ' '+place.name;
                        //}
                    }
                    if (place.classification && !isEmpty) {
                        //str+= ' '+OpenLayers.i18n(place.classification);
                        str+= ' ['+OpenLayers.i18n(place.classification)+']';
                    }
                    str+= ', ';
                }
            }
        }
        if (this.postalCode && this.postalCode.name) {
            //if (!isEmpty) {
            //    str+= ' ['+this.postalCode.name+']';
            //} else {
                str+= ' '+this.postalCode.name;
            //}
        }
        str= str.replace(/^(\s*,)+/,'').replace(/(\s*,)+$/,'');
        return str;
    },

    /**
     * APIMethod: toHTMLString
     * HTML stringification of an address.
     *
     * Returns:
     * {String}
     */
    toHTMLString: function() {
        var str= '';
        if (!this.streetAddress) {//freeFormAddress
            if (this.name) {
                str+= '<b>' + this.name + '</b>';
            }
        } else {//streetAddress
            var sl= this.streetAddress._streetLocation;
            if (this.streetAddress._streetLocation) {
                if (sl instanceof Geoportal.OLS.Building) {
                    // TODO: buildingName
                    if (sl.num) {
                        str+= sl.num;
                    }
                    if (sl.subdivision) {
                        str+= sl.subdivision;
                    }
                    str+= ',&nbsp;';
                }
            }
            for (var i= 0, ilen= this.streetAddress.getNbStreets(); i<ilen; i++) {
                var street= this.streetAddress.getStreets()[i];
                var sn= '';
                if (street.name) {
                    sn= street.name;
                } else {
                    sn= (street.typePrefix? street.typePrefix + ' ': '') +
                        (street.officialName? street.officialName + ' ': '') +
                        (street.typeSuffix? street.typeSuffix : '');
                }
                if (sn) {
                    str+= '<b>' + sn + '</b><br/>';
                }
            }
        }
        var isEmpty= str.length==0;
        var ilen= this.getNbPlaces();
        if (ilen>0) {
            //str+= OpenLayers.i18n('geocoded.address.popup.places')+'&nbsp;:<br/>';
            for (var i= 0; i<ilen; i++) {
                var place= this.getPlaces()[i];
                if (place.classification || place.name) {
                    if (place.classification && !isEmpty) {
                        str+= ' '+ OpenLayers.i18n(place.classification);
                    }
                    if (place.name) {
                        str+= ' <b>'+place.name+'</b>';
                    }
                    str+= '<br/>';
                }
            }
        }
        if (this.postalCode && this.postalCode.name) {
            if (!isEmpty) {
                str+= OpenLayers.i18n('geocoded.address.popup.postalCode')+'&nbsp;: ';
            }
            str+= '<b>'+this.postalCode.name+'</b>';
        }
        return str;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.Address"*
     */
    CLASS_NAME:"Geoportal.OLS.Address"
});
