/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/OLS/AbstractPosition.js
 * @requires Geoportal/OLS/QualityOfPosition.js
 * @requires Geoportal/OLS/UOM/Time.js
 * @requires Geoportal/OLS/UOM/Speed.js
 * @requires Geoportal/OLS/UOM/Angle.js
 */
/**
 * Class: Geoportal.OLS.Position
 * The Geoportal framework Open Location Service support position class.
 *
 * Inherits from:
 *  - <Geoportal.OLS.AbstractPosition>
 */
Geoportal.OLS.Position=
    OpenLayers.Class( Geoportal.OLS.AbstractPosition, {

    /**
     * APIProperty: levelOfConf
     * {String}
     */
    levelOfConf: null,

    /**
     * APIProperty: lonlat
     * {OpenLayers.Geometry.Point}
     */
    lonlat: null,

    /**
     * APIProperty: _aoi
     * {Object} Area of interest.
     */
    _aoi: null,

    /**
     * APIProperty: qop
     * {<Geoportal.OLS.QualityOfPosition>} QoP as defined by LIF.
     */
    qop: null,

    /**
     * APIProperty: time
     * {<Geoportal.OLS.UOM.Time>}
     */
    time: null,

    /**
     * APIProperty: speed
     * {<Geoportal.OLS.UOM.Speed>}
     */
    speed: null,

    /**
     * APIProperty: direction
     * {<Geoportal.OLS.UOM.Angle>}
     */
    direction: null,

    /**
     * Constructor: Geoportal.OLS.Position
     *
     * Parameters:
     * point - {OpenLayers.Geometry.Point} the position.
     * options - {Object} An optional object whose properties will be set on
     *     this instance.
     */
    initialize: function(point, options) {
        this.levelOfConf= null;
        this.lonlat= point;
        this._aoi= null;
        this.qop= null;
        this.time= null;
        this.speed= null;
        this.direction= null;
        Geoportal.OLS.AbstractPosition.prototype.initialize.apply(this,[options]);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up.
     */
    destroy: function() {
        this.levelOfConf= null;
        this.lonlat= null;
        this._aoi= null;
        if (this.qop) {
            this.qop.destroy();
            this.qop= null;
        }
        if (this.time) {
            this.time.destroy();
            this.time= null;
        }
        if (this.speed) {
            this.speed.destroy();
            this.speed= null;
        }
        if (this.direction) {
            this.direction.destroy();
            this.direction= null;
        }
        Geoportal.OLS.AbstractPosition.prototype.destroy.apply(this,arguments);
    },

    /**
     * APIMethod: toString
     * Stringification of a position.
     *      To be completed.
     *
     * Returns:
     * {String}
     */
    toString: function() {
        var str= '';
        str+= this.lonlat.toString();//WKT
        return str;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.OLS.Position"*
     */
    CLASS_NAME:"Geoportal.OLS.Position"
});
