/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/* 
 * @requires Geoportal/Format/GASR.js
 */
/**
 * Class: Geoportal.Control.Measure.ElevationRequest
 * Management request
 * 
 */
Geoportal.Control.Measure.ElevationRequest= OpenLayers.Class({
    
    /**
     * Property: options
     *  url     : url of altimetric service (see <http://api.ign.fr/tech-docs-js/fr/developpeur/alti.html> )
     *  mode    : {String} value among "json", "json-p", "json-x", "xml",
     *  scope   : {object},
     *  success : {Function} callback for result handling,
     *  failure : {Function} callback for failure handling,
     *  sampling: {Number} sampling parameter for elevationPath service
     */
    options: null,
    
    /**
     * Property: parser
     * Parser for Geoportal Altimetric Service Response
     */
    parser: null,
    
    /**
     * Constructor: Geoportal.Control.Measure.ElevationRequest
     * Parameters:
     * options - {Object} :
     * 
     *      Properties (transmitted parameters)
     *      - url     : url of altimetric service (see <http://api.ign.fr/tech-docs-js/fr/developpeur/alti.html> )
     *      - mode    : {String} value among "json", "json-p", "json-x", "xml"
     *      - scope   : {object}
     *      - success : {Function} callback for result handling
     *      - failure : {Function} callback for failure handling
     *      - sampling: {Number} sampling parameter for elevationPath service
     */
    initialize: function(options) {
        this.options = options;
        this.parser  = new Geoportal.Format.GASR(); 
    },
    
    /**
     * Method: destroy
     * The destroy method is used to perform any clean up before the control
     * is dereferenced.  Typically this is where event listeners are removed
     * to prevent memory leaks.
     */
    destroy: function() {
        this.options = null;
        this.parser  = null;
    },
    
    /**
     * Method: getElevation
     * Makes an elevation request for a list of discrete locations. 
     */
    getElevation: function(geometries) {

        var params = { lon :  [], lat : [] };
        for (var i=0,len=geometries.length; i<len; i++) {
            params.lon.push(geometries[i].lon);
            params.lat.push(geometries[i].lat);
        }

        // request
        var protocole = null;
        
        // options
        var loptions = {
            url : this.options.url, 
            params : {
                lon : params.lon.join('|'),
                lat : params.lat.join('|')
            },
            handleResponse : function(response, options) {
                // Si besoin d'un parser particulier, on surcharge...
                // FIXME on devrait tester les exceptions !
                var response_xml = response.priv.responseText;
                var elevations = null;
                if (response_xml) {
                    elevations = this.parser.read(response_xml);
                }
                options.callback.call(options.scope, elevations);
            },
            // callback : 
            success : this.options.success,
            failure : this.options.failure,
            callback : function(response) {
                if (response) {
                    loptions.success.apply(this, [response]);
                } else {
                    // reponse 'null', on envoie un message générique...
                    loptions.failure.apply(this, ["pas de reponse du service !?"]);
                }
            },
            scope : this.options.scope
        };
        
        // ajout de la reference du parser
        OpenLayers.Util.extend(loptions, {parser: this.parser});
        
        // ajout de l'option de profil : sampling
        if (this.options.sampling) {
            loptions.params.sampling = this.options.sampling;
        }
        
        switch (this.options.mode) {
            
            case Geoportal.Control.Measure.ElevationRequest.MODE.XML  :
                
                protocole = new OpenLayers.Protocol.HTTP(loptions);
                break;
                
            case Geoportal.Control.Measure.ElevationRequest.MODE.JSON :
                
                // on surcharge car on a besoin d'un parser JSON
                loptions.url=loptions.url.replace("xml","json"); 
                OpenLayers.Util.extend(loptions, {
                    handleResponse: function(response, options) {
                        var response_json = null;
                        if (response.priv.responseText) {
                            var parser_json = new OpenLayers.Format.JSON().read(response.priv.responseText);
                            response_json = parser_json.elevations;
                        }
                        options.callback.call(options.scope, response_json);
                   }
               });
                protocole = new OpenLayers.Protocol.HTTP(loptions);
                break;
                
            case Geoportal.Control.Measure.ElevationRequest.MODE.JSONX :
                
                // on surcharge car on a besoin d'un parser JSON
                loptions.params.output="json"; 
                OpenLayers.Util.extend(loptions, {
                    handleResponse: function(response, options) {
                        var elevations = null;
                        if (response.priv.responseText) {
                            var parser_json = new OpenLayers.Format.JSON().read(response.priv.responseText);
                            var response_xml = parser_json.xml;
                            elevations = this.parser.read(response_xml);
                        }
                        options.callback.call(options.scope, elevations);
                   }
               });
                protocole = new OpenLayers.Protocol.HTTP(loptions);
                break;
                
            case Geoportal.Control.Measure.ElevationRequest.MODE.JSONP :
            
            default :
                
                // on surcharge car la reponse est differente en jsonp
                loptions.params.output="json";
                OpenLayers.Util.extend(loptions, {
                    handleResponse: function(response, options) {
                        this.destroyRequest(response.priv);
                        var elevations = null;
                        if (response.data.http.status == 200 &&
                            response.data.http.error == null) {
                            var response_xml = response.data.xml;
                            elevations = this.parser.read(response_xml);
                        }
                        options.callback.call(options.scope, elevations);
                   }
                });
                protocole = new OpenLayers.Protocol.Script(loptions);
        }
        
        protocole.read();
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.Measure.ElevationRequest"*
     */
    CLASS_NAME:"Geoportal.Control.Measure.ElevationRequest"
});

/**
 * Constant: Geoportal.Control.Measure.ElevationRequest
 * {String} 
 */
Geoportal.Control.Measure.ElevationRequest.MODE = {
    JSON : "json",
    JSONP: "json-p",
    JSONX: "json-x",
    XML  : "xml"
};
