/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/**
 * Class: Geoportal.OLS
 * The Geoportal framework Open Location Service support abstract base class.
 */
Geoportal.OLS= OpenLayers.Class({

    /**
     * Property: id
     * {String}
     */
    id: null,

    /**
     * Constructor: Geoportal.OLS
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        OpenLayers.Util.extend(this,options);
        if (this.id == null) {
            this.id= OpenLayers.Util.createUniqueID(this.CLASS_NAME + "_");
        }
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.id= null;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS"*
     */
    CLASS_NAME:"Geoportal.OLS"
});
