/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/**
 * @requires Geoportal/Control/Measure.js
 * @requires Geoportal/Control/Measure/ElevationRequest.js
 */
/**
 * Class: Geoportal.Control.Measure.ElevationPath
 * Calculates path elevation given coordinates.
 *
 * Inherits from:
 *  - <Geoportal.Control.Measure>
 */
Geoportal.Control.Measure.ElevationPath= OpenLayers.Class( Geoportal.Control.Measure, {
    
    /**
     * Property: pointsIntermediate (internal)
     * List points intermediate
     */
    pointsIntermediate: [],
    
    /**
     * Constructor: Geoportal.Control.Measure.ElevationPath
     *
     * Parameters:
     * handler - {<Geoportal.Handler>}
     * options - {Object} :
     * 
     *      Properties (transmitted parameters)
     *      - url
     *      - sampling
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
     * Method: destroy
     * The destroy method is used to perform any clean up before the control
     * is dereferenced.  Typically this is where event listeners are removed
     * to prevent memory leaks.
     */
    destroy: function() {
        this.targetElement      = null;
        this.pointsIntermediate = [];
        Geoportal.Control.Measure.prototype.destroy.apply(this,arguments);
    },

    /**
     * Method: measureComplete
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry-js.html>}
     * eventType - {String}
     */
    measureComplete: function(geometry) {
        var points= [];
        for (var i=0, l=geometry.components.length; i<l; i++) {
            points.push(new OpenLayers.LonLat(geometry.components[i].x,geometry.components[i].y).transform(this.map.getProjection(),OpenLayers.Projection.CRS84));
        }
        
        var options= {
            url     : this.url,
            sampling: this.sampling,
            mode    : this.mode,
            scope   : this,
            success : function(elevations) {
        
                if (elevations) {
                        
                    if (this.needsForm===true) {
                            
//                            // Clean old measure !
//                            var nodelist = this.targetElement.getElementsByTagName("option");
//                            for (var j=0, count=nodelist.length; j<count; j++) {
//                                var node = nodelist[0];
//                                this.targetElement.removeChild(node);
//                            }
//
//                            // FIXME : JPB formatage de la liste de points ?
//                            for (var i=0, len=elevations.length; i<len; i++) {
//
//                                var value = ' { id: ' + i + ' , lon: ' + elevations[i].lon + ' , lat: ' + elevations[i].lat + ' , z: ' + elevations[i].z + ' } ';
//
//                                var balise_option = document.createElement("option");
//                                balise_option.text  = value;
//                                balise_option.value = i;
//                                this.targetElement.appendChild(balise_option);
//                            }

                            this.targetElement.value = "Altitudes : ";
                            this.targetElement.value += '{\n';
                            for (var i=0, len=elevations.length; i<len; i++) {
                                var value = '{  id: '  + i + ', lon: ' + elevations[i].lon + ', lat: ' + elevations[i].lat + ', z: '   + elevations[i].z   + ' },\n';
                                this.targetElement.value += value;
                            }
                            this.targetElement.value += '}';
                        }

                        this.events.triggerEvent("measure", elevations);
                }
            }
        };
        
        // requete sur le service et transmission via callback des resultats
        var request = new Geoportal.Control.Measure.ElevationRequest(options);
        request.getElevation(points);
        
    },

    /**
     * Method: measureIntermediate
     * 
     * Parameters:
     * geometry - {<OpenLayers.Geometry at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry-js.html>}
     * eventType - {String}
     */
    measure: function(geometry, eventType) {
        // FIXME 
        // l'ensemble des points intermediaires devrait figuré dans la liste des
        // resultats dans le cas où l'on souhaite un profil plus précis... 
        // sauf si sampling = 0 !
        
        var index = geometry.components.length - 1;
        this.pointsIntermediate.push(
                new OpenLayers.LonLat(geometry.components[index].x, geometry.components[index].y).transform(this.map.getProjection(),OpenLayers.Projection.CRS84)
        );
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
    handleMeasurements: function() { return null; },

    /**
     * Method: addOutputPanel
     * Build the form and add the specified fields for the measurement.
     * Should be overridden by sub-classes.
     *
     * Parameters:
     * form - {DOMElement} the HTML form.
     */
    addOutputPanel: function(form) {

        // liste de points dans un champ SelectField
//        this.targetElement = this.buildSelectField(form,{
//              id:'alti',
//              mandatory:false,
//              size:20,
//              css:'gpControlMeasureAzimuthAzimuthInput',
//              options:[{
//                            value:"0",
//                            selected:true,
//                            disabled:false,
//                            text:"Altitudes",
//                            css:""
//                        }]
//          });
          
          // liste de points dans un champ TextAera 
          this.targetElement = this.buildInputTextField(form,{
              id:'alti',
              mandatory:false,
              size:-1, // FIXME ???
              rows:10,
              cols:50,
              css:'gpControlMeasureAzimuthAzimuthInput',
              type: 'textarea',
              value:"Altitudes : "
          });
          
    },
    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.Measure.ElevationPath"*
     */
    CLASS_NAME:"Geoportal.Control.Measure.ElevationPath"
});
