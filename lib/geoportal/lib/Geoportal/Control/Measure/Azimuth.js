/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/**
 * @requires Geoportal/Control/Measure.js
 */
/**
 * Class: Geoportal.Control.Measure.Azimuth
 * Calculates path direction (azimuth) given starting and ending coordinates.
 *
 * Inherits from:
 *  - <Geoportal.Control.Measure>
 */
Geoportal.Control.Measure.Azimuth= OpenLayers.Class( Geoportal.Control.Measure, {

    /**
     * APIProperty: unit
     * {String} unit of measurement.
     *      Defaults to *this.displaySystemUnits[this.displaySystem][0]*
     */
    unit: null,

    /**
     * APIProperty: accuracies
     * {HashTable({Integer})} number of figures to display for measurements
     * based on the units.
     *      See  <Geoportal.Control.MeasureToolbar.ACCURACIES>
     */
    accuracies: {
        'dd' :2,
        'rad':4,
        'gon':2,
        'mi' :3,
        'ft' :2,
        'in' :1,
        'km' :3,
        'm'  :0
    },

    /**
     * Constructor: Geoportal.Control.Measure.Azimuth
     *
     * Parameters:
     * handler - {<Geoportal.Handler>}
     * options - {Object}
     */
    initialize: function(handler, options) {
        Geoportal.Control.Measure.prototype.initialize.apply(this,arguments);
        this.displaySystem= 'geographic';
        this.geodesic= true;
        if (!this.unit) {
            this.unit= this.displaySystemUnits[this.displaySystem][0];
        }
    },

    /**
     * Method: destroy
     * The destroy method is used to perform any clean up before the control
     * is dereferenced.  Typically this is where event listeners are removed
     * to prevent memory leaks.
     */
    destroy: function() {
        this.targetElement= null;
        this.distanceElement= null;
        Geoportal.Control.Measure.prototype.destroy.apply(this,arguments);
    },

    /**
     * Method: addOutputPanel
     * Build the form and add the specified fields for the measurement.
     *      The form's structure is as follows :
     *
     * (start code)
     * <label id='lbldistance{#Id}' for='distance{#Id}' style='font-weight:bold;'>
     *      {#displayClass}.distance
     *      <input id='distance{#Id}' name='distance{#Id}' type='text' value=''
     *             maxLength='20' size='20' class='gpControlMeasureAzimuthAzimuthInput'
     *             disabled='disabled'/>
     * </label>
     * <br/>
     * <span id='helpdistance{#Id}' class='gpFormSmall'>{#displayClass}.distance.help</span>
     * <br/>
     * <label id='lblazimuth{#Id}' for='azimuth{#Id}' style='font-weight:bold;'>
     *      {#displayClass}.azimuth
     *      <input id='azimuth{#Id}' name='azimuth{#Id}' type='text' value=''
     *             maxLength='20' size='20' class='gpControlMeasureAzimuthAzimuthInput'
     *             disabled='disabled'/>
     * </label>
     * <br/>
     * <span id='helpazimuth{#Id}' class='gpFormSmall'>{#displayClass}.azimuth.help</span>
     * <br/>
     * (end)
     *
     * Parameters:
     * form - {DOMElement} the HTML form.
     */
    addOutputPanel: function(form) {
        this.distanceElement= this.buildInputTextField(form,{
            id:'distance',
            mandatory:false,
            disabled:true,
            size:20,
            length:20,
            css:'gpControlMeasureAzimuthAzimuthInput',
            value:''
        });
        this.targetElement= this.buildInputTextField(form,{
            id:'azimuth',
            mandatory:false,
            disabled:true,
            size:20,
            length:20,
            css:'gpControlMeasureAzimuthAzimuthInput',
            value:''
        });
    },

    /**
     * APIFunction: getMeasure
     * Calculate measurement on geometry (azimuth).
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry-js.html>}
     *
     * Returns:
     * {Object} Measurement information:
     *      * measure: measurement value;
     *      * units: measurement unit;
     *      * order: 3 for azimuth, -1 otherwise;
     *      * distance : length between the 2 points;
     *      * distanceUnits : length unit;
     *      * geometry: geometry used for measuring.
     */
    getMeasure: function(geometry) {
        var stat= [0, this.unit], dist= [0, 'm'], order= -1;
        if (geometry.components.length==2) {
            stat= this.getBestAzimuth(geometry);
            var saveDisplaySystem= this.displaySystem;
            var mapproj= this.map.getProjection();
            if (mapproj && mapproj.getProjName()=='longlat') {
                this.displaySystem= 'geographic';
            } else {
                var dsu= this.displaySystemUnits['metric'];
                if (dsu) {
                    this.displaySystem= 'metric';
                }
                // else keep as it is ...
            }
            dist= this.getBestLength(geometry);
            this.displaySystem= saveDisplaySystem;
            order= 3;//azimuth
        }
        return {
            'measure': stat[0],
            'units': stat[1],
            'order': order,
            'distance': dist[0],
            'distanceUnits': dist[1],
            'geometry': geometry
        };
    },

    /**
     * Method: getBestAzimuth
     * Returns the path direction (azimuth) given starting and ending
     * coordinates.
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry-js.html>}
     *
     * Returns:
     * {Array([Float, String])}  Returns a two item array containing the
     *     direction and the units abbreviation.
     */
    getBestAzimuth: function(geometry) {
        var azimuth= this.getAzimuth(geometry, this.unit);
        return [azimuth, this.unit];
    },

    /**
     * Method: getAzimuth
     * Calculates the path direction.
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry-js.html>}
     * units - {String} Unit abbreviation
     *
     * Returns:
     * {Float} The geometry direction in the given units.
     */
    getAzimuth: function(geometry, unit) {
        // would be better to get geographical CRS, but ...
        var p0= geometry.components[0].clone().transform(
            this.map.getProjection(), OpenLayers.Projection.CRS84);
        p0.x= OpenLayers.Util.rad(p0.x);
        p0.y= OpenLayers.Util.rad(p0.y);
        var p1= geometry.components[1].clone().transform(
            this.map.getProjection(), OpenLayers.Projection.CRS84);
        p1.x= OpenLayers.Util.rad(p1.x);
        p1.y= OpenLayers.Util.rad(p1.y);
        var azimuth= Math.atan2(
            Math.sin(p1.x - p0.x) * Math.cos(p1.y),
            Math.cos(p0.y) * Math.sin(p1.y) - Math.sin(p0.y) * Math.cos(p1.y) * Math.cos(p1.x - p0.x));
        if (azimuth<0) {
            azimuth+= 6.283185307179586477;
        }
        switch(unit) {
        case 'rad':
            break;
        case 'gon':
            azimuth= OpenLayers.Util.gon(azimuth);
            break;
        case 'dms':
            azimuth= Geoportal.Util.degToDMS(azimuth,null,1,"%d.%02d%02d");
            break;
        default:
            azimuth= OpenLayers.Util.deg(azimuth);
            break;
        }
        return azimuth;
    },

    /**
     * APIMethod: handleMeasurements
     * Prepare the informations for displaying the measure.
     *
     * Parameters:
     * evt - {Event} triggered by OpenLayers.Control.Measure.measure method.
     *      event context is (event.object being the underneath measure control):
     *      * measure : azimuth so far measured;
     *      * units : units of azimuth;
     *      * distance : length of the two points supporting the azimuth computation;
     *      * distanceUnits : units of the length measurement;
     *      * order : 3;
     *      * geometry : the path of measurement.
     *
     * Returns:
     * {Array({Object})} an array with the informations on the azimuth :
     *      * distance between points ;
     *      * angle.
     */
    handleMeasurements: function(evt) {
        if (!evt) {
            return;
        }
        var die= (this.distanceElement && this.distanceElement.style.display!='none'?
                this.distanceElement
            :   null);
        var tge= (this.targetElement && this.targetElement.style.display!='none'?
                this.targetElement
            :   null);
        var key= (!(0<=evt.order &&
                    evt.order< (this.measurementLabels || Geoportal.Control.MeasureToolbar.LABELS).length) ||
                  evt.measure===0?
            'wait'
        :   (die && tge?
                'targetElement'
            :   'default'));
        var order= (key=='wait'? 0 : evt.order);
        var lastMeasurement= [{
            'order':1,
            'measure':evt.distance,
            'unit':evt.distanceUnits,
            'key':key,
            'label':(this.measurementLabels || Geoportal.Control.MeasureToolbar.LABELS)[1],
            'targetFormat':(this.targetFormat || Geoportal.Control.MeasureToolbar.TARGETFORMAT)[key],
            'targetElement':die,
            'accuracy':(this.accuracies || Geoportal.Control.MeasureToolbar.ACCURACIES)[evt.distanceUnits] || '',
            'dimension':''
        },{
            'order':order,
            'measure':evt.measure,
            'unit':evt.units,
            'key':key,
            'label':(this.measurementLabels || Geoportal.Control.MeasureToolbar.LABELS)[order],
            'targetFormat':(this.targetFormat || Geoportal.Control.MeasureToolbar.TARGETFORMAT)[key],
            'targetElement':tge,
            'accuracy':(this.accuracies || Geoportal.Control.MeasureToolbar.ACCURACIES)[evt.units] || '',
            'dimension':''
        }];
        return lastMeasurement;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.Measure.Azimuth"*
     */
    CLASS_NAME:"Geoportal.Control.Measure.Azimuth"
});
