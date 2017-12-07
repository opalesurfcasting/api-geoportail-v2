/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/**
 * @requires Geoportal/Control/Measure.js
 * @requires Geoportal/Control/Measure/ElevationRequest.js
 */
/**
 * Class: Geoportal.Control.Measure.Elevation
 * Calculates elevation given coordinates.
 *
 * Inherits from:
 *  - <Geoportal.Control.Measure>
 */
Geoportal.Control.Measure.Elevation= OpenLayers.Class( Geoportal.Control.Measure, {

    /**
     * Constructor: Geoportal.Control.Measure.Elevation
     *
     * Parameters:
     * handler - {<OpenLayers.Handler>}
     * options - {Object} :
     * 
     *      Properties (transmitted parameters)
     *      - url
     *      - targetElement (overwritten)
     *      
     *      Properties inherited from {<OpenLayers.Control>} :
     *      - type (ie. {<OpenLayers.Control.Panel>})
     *      - div
     *      - displayClass
     *      
     *      Properties inherited from {<OpenLayers.Control.Measure>} :
     *      - handlerOptions
     *      - displaySystem
     *      - persist
     *      - immediate
     *      
     *      Properties inherited from {<Geoportal.Control.MeasureToolbar>} :
     *      - targetElement
     */
    initialize: function(handler, options) {
        Geoportal.Control.Measure.prototype.initialize.apply(this,arguments);
    },

    /**
     * Method: measure
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry-js.html>}
     * eventType - {String}
     */
    measure: function(geometry, eventType) {
        var ll= new OpenLayers.LonLat(geometry.x, geometry.y).transform(this.map.getProjection(),OpenLayers.Projection.CRS84);
        var options= { 
            url    : this.url,
            mode   : this.mode,
            scope  : this,
            failure: function(response) {
                console.log("Error : " + response);
            },
            success: function(elevations) {
                    
                if (elevations) {
                        
                        var elevation= elevations[0].z;
                        var unit= this.displaySystemUnits[this.displaySystem][1];
                        if (this.needsForm===true) {
                            this.targetElement.value = elevation + ' ' + unit;
                        }
                        this.events.triggerEvent(eventType, {
                              measure: elevation,
                              order: 4,
                              units: unit
                        });
                }
            }
        };
        
        // requete sur le service et transmission via callback des resultats
        var request = new Geoportal.Control.Measure.ElevationRequest(options);
        request.getElevation([ll]);
    },

    /**
     * Method: destroy
     * The destroy method is used to perform any clean up before the control
     * is dereferenced.  Typically this is where event listeners are removed
     * to prevent memory leaks.
     */
    destroy: function() {
        this.targetElement= null;
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
        this.targetElement= this.buildInputTextField(form,{
            id:'alti',
            mandatory:false,
            disabled:true,
            size:20,
            length:20,
            css:'gpControlMeasureAzimuthAzimuthInput',
            value:''
        });
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.Measure.Elevation"*
     */
    CLASS_NAME:"Geoportal.Control.Measure.Elevation"
});
