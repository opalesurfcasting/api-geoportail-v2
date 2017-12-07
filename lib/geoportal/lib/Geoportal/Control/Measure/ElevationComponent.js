/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/* 
 * @requires Geoportal/Control/MeasureToolbar.js
 * @requires Geoportal/Control/Measure/Elevation.js
 * @requires Geoportal/Control/Measure/ElevationPath.js
 */
/**
 * Class: Geoportal.Control.Measure.ElevationComponent
 * Management class altimetry components
 * 
 */
Geoportal.Control.Measure.ElevationComponent= OpenLayers.Class({
    
    // FIXME : JPB inutile...
    // Geoportal.Control.Measure.ElevationComponent= OpenLayers.Class(Geoportal.Control.Panel, {    
    
    /**
     * Property: controlsElevation (internal)
     * List of controls
     */
    controlsElevation: [],
    
    /**
     * Constructor: Geoportal.Control.Measure.ElevationComponent
     *
     * Parameters:
     * options - {Object}
     */
    initialize: function(options) {

        // on verifie toujours les droits sur la ressource alti...
        if (! this.checkRightManagement()) {
            console.log("No right to load Service Alti !");
            return;
        }
        
        // check options
        if (!options) {options = {};}
        
        if (typeof options.elevationOptions === 'undefined' ||
            typeof options.elevationPathOptions === 'undefined' ) {
        
            // Par defaut, si aucunes options n'est renseignées, on active les controles 
            // et affichage des resultats dans un controle flottant !
            var elevation_options = {
                
                elevationOptions: {
                    active: true,
                    targetElement: null,
                    url: null,
                    mode: "jsonp"
                },
                elevationPathOptions: {
                    active: true,
                    sampling : 50,
                    targetElement: null,
                    url: null,
                    mode: "jsonp"
                }
                
            };
            
            OpenLayers.Util.extend(options, elevation_options);
        }
        
        // FIXME : JPB inutile...
        // Geoportal.Control.Panel.prototype.initialize.apply(this, [options]);
        
        var style= (options.style || Geoportal.Control.MeasureToolbar.DEFAULTSTYLE).clone();
        
        // service point alti
        if (options.elevationOptions.active) {
            // FIXME : JPB si l'Url est renseignée, on ne teste pas sa validité ...
            // url du service
            if (this.isEmpty(options.elevationOptions.url)) {
                options.elevationOptions.url = this.getServiceAltiUrl(Geoportal.Control.Measure.ElevationComponent.POINT);
            }
            
            // FIXME : JPB commenté car par defaut, on est en mode json-p
            // afin d'eviter de passer par un proxy
//            if (this.isEmpty(options.elevationOptions.mode)) {
//                options.elevationOptions.mode = 'json-p';
//            }
            
            // ajout du composant
            this.controlsElevation.push(
                    new Geoportal.Control.Measure.Elevation(
                        OpenLayers.Handler.Point,
                        OpenLayers.Util.extend({
                            handlerOptions:{
                                style: "default",
                                layerOptions: {
                                    styleMap: new OpenLayers.StyleMap({"default":style.clone()})
                                },
                                persist: true
                            },
                            type: OpenLayers.Control.TYPE_TOGGLE,
                            title: 'gpControlMeasureElevation.title',
                            displayClass: 'gpControlMeasureElevation',
                            targetElement: options.targetElement
                        },
                        options.elevationOptions)
                    )
            );
    
        }
        
        // service profil alti
        if (options.elevationPathOptions.active) {
            // FIXME : JPB si l'Url est renseignée, on ne teste pas sa validité ...
            // url du service
            if (this.isEmpty(options.elevationPathOptions.url)) {
                options.elevationPathOptions.url = this.getServiceAltiUrl(Geoportal.Control.Measure.ElevationComponent.PROFIL);  
            }
            
            // FIXME : JPB pas de sampling par defaut...
            if (this.isEmpty(options.elevationPathOptions.sampling)) {
                options.elevationPathOptions.sampling = 0;  
            }
            
            // FIXME : JPB commenté car par defaut, on est en mode json-p 
            // afin d'eviter de passer par un proxy
//            if (this.isEmpty(options.elevationPathOptions.mode)) {
//                options.elevationPathOptions.mode = 'json-p';
//            }
            
            // ajout du composant
            this.controlsElevation.push(
                new Geoportal.Control.Measure.ElevationPath(
                    OpenLayers.Handler.Path,
                    OpenLayers.Util.extend({
                        handlerOptions:{
                            style: "default",
                            layerOptions: {
                                styleMap: new OpenLayers.StyleMap({"default":style.clone()})
                            },
                            persist: true
                        },
                        type: OpenLayers.Control.TYPE_TOGGLE,
                        title: 'gpControlMeasureElevationPath.title',
                        displayClass: 'gpControlMeasureElevationPath',
                        targetElement: options.targetElement
                    },
                    options.elevationPathOptions)
                )
            );
        }
        
        // return this;
    },
    
    /**
     * Method: getControlsElevation
     * List controls
     */
    getControlsElevation: function() {
        return this.controlsElevation;
    },
    
    /**
     * Method: checkRightManagement
     * Management service
     */
    checkRightManagement: function() {
        
        // FIXME : JPB c'est un peu lourd !...
        
        var key_profil = window.gGEOPORTALRIGHTSMANAGEMENT
                    [window.gGEOPORTALRIGHTSMANAGEMENT.apiKey].
                        resources[Geoportal.Control.Measure.ElevationComponent.RESOURCE+':'+
                                  Geoportal.Control.Measure.ElevationComponent.SERVICE+';'+
                                  Geoportal.Control.Measure.ElevationComponent.PROFIL];
        
        var key_point = window.gGEOPORTALRIGHTSMANAGEMENT
                    [window.gGEOPORTALRIGHTSMANAGEMENT.apiKey].
                        resources[Geoportal.Control.Measure.ElevationComponent.RESOURCE+':'+
                                  Geoportal.Control.Measure.ElevationComponent.SERVICE+';'+
                                  Geoportal.Control.Measure.ElevationComponent.POINT];
        
        if (key_profil == null || key_point == null) {
            return false;
        }
        return true;
    },
    
    /**
     * Method: getServiceUrl
     * Management service url
     */
    getServiceAltiUrl: function(type) {
        
        // FIXME : JPB c'est un peu lourd !...
        
        if (this.isEmpty(window.gGEOPORTALRIGHTSMANAGEMENT)){
            console.log("gGEOPORTALRIGHTSMANAGEMENT !?");
        }
        
        switch (type)
        {
            case Geoportal.Control.Measure.ElevationComponent.PROFIL:
            case Geoportal.Control.Measure.ElevationComponent.POINT: 
                return window.gGEOPORTALRIGHTSMANAGEMENT[window.gGEOPORTALRIGHTSMANAGEMENT.apiKey].
                        resources[Geoportal.Control.Measure.ElevationComponent.RESOURCE+':'+
                                  Geoportal.Control.Measure.ElevationComponent.SERVICE +';'+ type].url;
                break;
            default: 
                console.log("Le type ou URL sur le Service Altimétrique est inconnu !?");
                break;
        }
        
        return null;
    },
    
    /**
     * Method: isEmpty
     * 
     */
    isEmpty: function(string) {
        return (!string || 0 === string.length);
    },
    
    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.Measure.ElevationComponent"*
     */
    CLASS_NAME: "Geoportal.Control.Measure.ElevationComponent"
});
    
/**
 * Constant: Geoportal.Control.Measure.ElevationComponent
 * {String} 
 */
Geoportal.Control.Measure.ElevationComponent.SERVICE = "Elevation";
Geoportal.Control.Measure.ElevationComponent.POINT   = "Elevation";
Geoportal.Control.Measure.ElevationComponent.PROFIL  = "ElevationLine";
Geoportal.Control.Measure.ElevationComponent.RESOURCE  = "SERVICE_CALCUL_ALTIMETRIQUE";
