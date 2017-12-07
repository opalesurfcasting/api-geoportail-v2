/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS.js
 */
/**
 * Class: Geoportal.OLS.XLS
 * The Geoportal framework Open Location Service support main class.
 *
 * Inherits from:
 *  - <Geoportal.OLS>
 */
Geoportal.OLS.XLS=
    OpenLayers.Class( Geoportal.OLS, {

    /**
     * APIProperty: version
     * {String} Defaults to *"1.1"*
     */
    version: "1.1",

    /**
     * APIProperty: lang
     * {String}
     */
    lang: null,

    /**
     * APIProperty: _header
     * {<Geoportal.OLS.AbstractHeader>} Portion of a message that contains
     * header information.
     */
    _header: null,

    /**
     * APIProperty: _body
     * {Array(<Geoportal.OLS.AbstractBody>)} Portions of a message containing
     * information that is core to the message.
     */
    _body: null,

    /**
     * Constructor: Geoportal.OLS.XLS
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(options) {
        this.version= "1.1";
        this.lang= null;
        this._header= null;
        this._body= [];
        Geoportal.OLS.prototype.initialize.apply(this,arguments);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.version= null;
        this.lang= null;
        if (this._header) {
            this._header.destroy();
            this._header= null;
        }
        if (this._body) {
            for (var i= 0, len= this._body.length; i<len; i++) {
                this._body[i].destroy();
                this._body[i]= null;
            }
            this._body= null;
        }
        Geoportal.OLS.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: addBody
     * Add a <Geoportal.OLS.AbstractBody>.
     *
     * Parameters:
     * body - {<Geoportal.OLS.AbstractBody>} a street.
     */
    addBody: function(body) {
        if (!this._body) {
            this._body= [];
        }
        if (body) {
            this._body.push(body);
        }
    },

    /**
     * APIMethod: getNbBodies
     * Return the number of <Geoportal.OLS.AbstractBody>.
     *
     * Returns:
     * {Integer}
     */
    getNbBodies: function() {
        return this._body? this._body.length : 0;
    },

    /**
     * APIMethod: getBodies
     * Return all <Geoportal.OLS.AbstractBody>.
     *
     * Returns:
     * {Array({<Geoportal.OLS.AbstractBody>})} or null
     */
    getBodies: function() {
        return this._body? this._body : null;
    },

    /**
     * APIMethod: getErrors
     * Search for <Geoportal.OLS.Error> either in the header or in the bodies.
     *
     * Returns:
     * {Array({<Geoportal.OLS.Error>})} or null if no errors
     */
    getErrors: function() {
        var errs= [];
        if (this._header && this._header.errorList && this._header.errorList.getNbErrors()>0) {
            errs= errs.concat(this._header.errorList.getErrors());
        }
        for (var i= 0, len= this.getNbBodies(); i<len; i++) {
            var b= this.getBodies()[i];
            if (b.errorList && b.errorList.getNbErrors()>0) {
                errs= errs.concat(b.errorList.getErrors());
            }
        }
        if (errs.length==0) {
            errs= null;
        }
        return errs;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.XLS"*
     */
    CLASS_NAME:"Geoportal.OLS.XLS"
});
