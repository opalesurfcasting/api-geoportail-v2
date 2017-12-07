/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Layer/OpenLS/Core.js
 * @requires Geoportal/OLS/XLS.js
 * @requires Geoportal/OLS/Address.js
 * @requires Geoportal/OLS/RequestHeader.js
 * @requires Geoportal/OLS/Request.js
 * @requires Geoportal/OLS/LUS/GeocodeRequest.js
 * @requires Geoportal/Util.js
 */
/**
 * Class: Geoportal.Layer.OpenLS.Core.LocationUtilityService
 * The Geoportal framework Open Location Core Service LocationUtilityService support class.
 *
 * Inherits from:
 * - {<Geoportal.Layer.OpenLS.Core>}
 */
Geoportal.Layer.OpenLS.Core.LocationUtilityService=
    OpenLayers.Class( Geoportal.Layer.OpenLS.Core, {

    /**
     * Constant: XML_PARAM_NAME
     * {String} Name of parameter containing the encoded XML request when
     * using GET method.
     */
    XML_PARAM_NAME:"xls",

    /**
     * APIProperty: queriedAddresses
     * {Array({Object})} Array of queried addresses and theirs responses.
     *      The object holds the free form address used for querying under the
     *      'hash' key and the array of geocodedAddresses under the 'address' key.
     *      FIXME : Could be used as a client cache ?
     */
    queriedAddresses: null,

    /**
     * APIProperty: popupClass
     * {<OpenLayers.Class at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Class-js.html>} The class which will be used to instantiate
     *     a new Popup. Default is to look at formatOptions.popupClass, then
     *     <Geoportal.Popup.Anchored>, then
     *     <OpenLayers.Popup.AnchoredBubble at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Popup/AnchoredBubble-js.html>
     *     (see {<OpenLayers.Feature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature-js.html>}).
     */
    popupClass: null,

    /**
     * Property: olsRqst
     * {<OpenLayers.Request at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Request-js.html>} the current Ajax request.
     */
    olsRqst: null,
    /**
     * Property: isAvailable
     * Check if layer is available (RightManagement) 
     */
    isAvailable: true,

    /**
     * Constructor: Geoportal.Layer.OpenLS.Core.LocationUtilityService
     * Create a new Open Location Core Utility Service Layer.
     *
     * Parameters:
     * name - {String} The layer name.
     * options - {Object} Hashtable of extra options to tag onto the layer.
     *      Valid options are all options avaible for {<OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html>}.
     *      Some hints are :
     *      * requestOptions - {Object} hash of request options. See
     *          <OpenLayers.Request at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Request-js.html> for more information. Most relevant options
     *          are :
     *          * method - {String} GET (default value) or POST,
     *          * url - {String},
     *          * headers - {Object}.
     *      * formatOptions - {Object} hash of format options. See
     *          <Geoportal.Format.XLS> for more information. Most relevant options are :
     *          * version - {String},
     *          * coreService - {String} Defaults to "LocationUtilityService",
     *          * externalProjection - {String} Defaults to "EPSG:4326".
     *      * marker - {String} the URL of the image displayed for locating the place. Defaults to *xy-target.png*
     *      * radius - {Integer} the width/height of the image when marker is given. Defaults to *8*
     *      * clientName - {String}
     *      * clientPassword - {String}
     *      * MSID - {String}
     *      * maximumResponses - {Integer} Defaults to "10".
     */
    initialize: function(name, options) {
        if (! this.checkRightManagement(name)) {
            console.log("No right to load this layer !");
            return;
        }
        Geoportal.Layer.OpenLS.Core.prototype.initialize.apply(this, [name, options]);
        this.formatOptions.coreService= "LocationUtilityService";
        this.queriedAddresses= [];
        this.reportError= false;
        if (!(this.style || options.styleMap)) {
            this.applyStyles(options);
        }
        if (!options || !options.onFeatureInsert) {
            this.onFeatureInsert= this.createPopupForAddress;
        }
        this.selectCntrl= new OpenLayers.Control.SelectFeature(this,{
            onSelect: Geoportal.Control.selectFeature,
            onUnselect: Geoportal.Control.unselectFeature,
            hover:true
        });
    },

    checkRightManagement: function(layer) {
        var isAvailable = window.gGEOPORTALRIGHTSMANAGEMENT[window.gGEOPORTALRIGHTSMANAGEMENT.apiKey].resources[layer];
        if (isAvailable == null) { this.isAvailable=false; }
        return this.isAvailable;
    },

    /**
     * Method: applyStyles
     * Change the default look'n feel.
     *
     * Parameters:
     * options - {Object}
     */
    applyStyles: function(options) {
        var img= options.marker || Geoportal.Util.getImagesLocation()+'xy-target.png';
        var radius= options.marker? options.radius || 16 : 8;
        this.styleMap.styles['default'].defaultStyle=
            OpenLayers.Util.applyDefaults({
                externalGraphic:img,
                graphicOpacity:1.0,
                pointRadius:radius
            },
            this.styleMap.styles['default'].defaultStyle);
        this.styleMap.styles['select'].defaultStyle=
            OpenLayers.Util.applyDefaults({
                externalGraphic:img,
                graphicOpacity:1.0,
                pointRadius:2*radius
            },
            this.styleMap.styles['select'].defaultStyle);
        this.styleMap.styles['temporary'].defaultStyle=
            OpenLayers.Util.applyDefaults({
                externalGraphic:img,
                graphicOpacity:1.0,
                pointRadius:radius
            },
            this.styleMap.styles['temporary'].defaultStyle);
    },

    /**
     * APIMethod: destroy
     * Clean up the OpenLS layer.
     */
    destroy: function() {
        this.abortRequest();
        this.cleanQueries();
        this.selectCntrl= null;
        Geoportal.Layer.OpenLS.Core.prototype.destroy.apply(this,arguments); 
    },

    /**
     * APIMethod: setMap
     * The layer has been added to the map.
     *
     * Parameters:
     * map - {<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>}
     */
    setMap: function(map) {
        if (map) {
            Geoportal.Layer.OpenLS.prototype.setMap.apply(this, arguments);
            if (this.selectCntrl) {
                map.addControl(this.selectCntrl);
            }
            // Adding GeoRM to the layer :
            if (map.apiKey && map.catalogue) {
                var k, o;
                for (var i= 0, l= map.apiKey.length; i<l; i++) {
                    k= map.apiKey[i];
                    if (map.catalogue[k].layers[this.name]) {
                        o= {
                            eventListeners:{
                                'tokenloaded':this.onTokenLoaded,
                                'scope':this
                            }
                        };
                        o.transport= map.catalogue[k].transport;
                        if (map.catalogue[k][o.transport]) {
                            o[o.transport]= map.catalogue[k][o.transport];
                        }
                        this.GeoRM= this.options.GeoRM=
                            Geoportal.GeoRMHandler.addKey(
                                k,
                                map.catalogue[k].tokenServer.url,
                                map.catalogue[k].tokenServer.ttl,
                                map,
                                o
                            );
                        break;
                    }
                }
            }
        }
    },

    /**
     * Method: onTokenLoaded
     * When the token is returned valid, check if a GEOCODE or REVERSE_GEOCODE
     * query is awaiting. If so, issue it!
     *
     * Parameters:
     * evt - {Event} the "tokenloaded" event (see
     * <Geoportal.GeoRMHandler.Updater>).
     *
     * Context:
     *      object: the token
     *
     * Returns:
     * {Boolean} true to keep propagating the event, false otherwise.
     */
    onTokenLoaded: function(evt) {
        if (this.wait!=null && typeof(this.wait)=='object') {
            this.wait.clbk.apply(this,this.wait.args);
            this.wait= null;
            //return false;
        }
        return true;
    },

    /**
     * APIMethod: GEOCODE
     * Query the OpenLS Core service with the GEOCODE method and
     * return the XML for OpenLS object.
     *
     * Parameters:
     * adr - {Array({<Geoportal.OLS.Address})} Addresses to search.
     * options - {Object} Optional object for configuring the request.
     *      User callback are expected to be in onSuccess, onFailure options.
     *      The scopeOn option is used to specify the scope when calling
     *      onSuccess and onFailure callbacks.
     */
    GEOCODE: function(adr,options) {
        if (!(OpenLayers.Util.isArray(adr))) {
            adr= [adr];
        }
        var params= new Geoportal.OLS.LUS.GeocodeRequest();
        if (!this.queriedAddresses) {
            this.queriedAddresses= [];
        }
        for (var i= 0, len= adr.length; i<len; i++) {
            this.queriedAddresses[i]= {'hash':adr[i].toString(), 'features':null};//wait for replies
            params.addAddress(adr[i].clone());
        }
        var xls= new Geoportal.OLS.XLS({
            version:this.format.version,
            _header:new Geoportal.OLS.RequestHeader({
                        sessionID:''
                    })
        });
        xls.addBody(
            new Geoportal.OLS.Request(
                'GeocodeRequest',
                this.format.version,
                '',//FIXME: OpenLayers.createUniqueID() ?
                {
                    maximumResponses:this.maximumResponses,
                    _requestParameters:params
                })
        );
        var node= this.format.write(xls);
        var body= OpenLayers.Format.XML.prototype.write.apply(this.format,[node]);
        node= null;
        xls.destroy();
        xls= null;
        params= null;
        var loptions= OpenLayers.Util.applyDefaults(options, this.requestOptions);
        //using url parameter to pass token :
        if (this.GeoRM) {
            if (this.map) {
                loptions.url= this.map.catalogue[this.GeoRM.GeoRMKey].layers[this.name].url;
            } else {
                loptions.url= window.gGEOPORTALRIGHTSMANAGEMENT[this.GeoRM.GeoRMKey].resources[this.name].url;
            }
            loptions.params= OpenLayers.Util.extend({}, this.GeoRM.token);
            if (this.GeoRM.transport=='referrer') {
                OpenLayers.Util.extend(loptions.params, Geoportal.GeoRMHandler.getCookieReferrer((this.map? this.map.div :null),true));
            }
        }
        this.options.onSuccess= loptions.onSuccess;
        this.options.scopeOn= loptions.scopeOn;
        loptions.success= function(request) {
            this.requestOptions.scope.GcSuccess.apply(this.requestOptions.scope,[request]);
            if (this.options.scopeOn && this.options.onSuccess) {
                this.options.onSuccess.apply(this.options.scopeOn,[request]);
            }
        };
        this.options.onFailure= loptions.onFailure;
        this.options.scopeOn= loptions.scopeOn;
        loptions.failure= function(request) {
            this.requestOptions.scope.LUSFailure.apply(this.requestOptions.scope,[request]);
            if (this.options.scopeOn && this.options.onFailure) {
                this.options.onFailure.apply(this.options.scopeOn,[request]);
            }
        };

        if (loptions.method==='POST') {
            this.olsRqst= OpenLayers.Request.POST(
                OpenLayers.Util.applyDefaults({
                    'data'   :body,
                    'headers':{'Content-Type': 'text/xml'}
                },loptions));
        } else {
            loptions.params= OpenLayers.Util.extend(loptions.params, {output:'json'});
            var q= {};
            q[this.XML_PARAM_NAME]= escape(body);
            q= OpenLayers.Util.extend(q,loptions.params);
            var ops= new OpenLayers.Protocol.Script({
                url:loptions.url,
                params:q,
                format:new OpenLayers.Format(),//dummy format
                createRequest: function(url, params, callback) {
                    var id = OpenLayers.Protocol.Script.register(callback);
                    var name = "OpenLayers.Protocol.Script.registry.regId" + id;
                    params = OpenLayers.Util.extend({}, params);
                    params[this.callbackKey] = this.callbackPrefix + name;
                    var paramsArray= [];
                    for (var key in params) {
                        var value = params[key];
                        paramsArray.push(encodeURIComponent(key) + "=" + value);
                    }
                    params= paramsArray.join('&');
                    url = OpenLayers.Util.urlAppend(
                        url, params
                    );
                    var script = document.createElement("script");
                    script.type = "text/javascript";
                    script.src = url;
                    script.id = "OpenLayers_Protocol_Script_" + id;
                    this.pendingRequests[script.id] = script;
                    var head = document.getElementsByTagName("head")[0];
                    head.appendChild(script);
                    return script;
                },
                handleResponse:function(resp,opts) {
                    if (resp.data) {
                        resp.responseText= resp.data.xml;
                        resp.code= OpenLayers.Protocol.Response.SUCCESS;
                    } else {
                        resp.status= resp.data.http? resp.data.http.code || 400 : 400;
                        resp.statusText= resp.data.http? resp.data.http.error || '' : '';
                        resp.code= OpenLayers.Protocol.Response.FAILURE;
                    }
                    this.destroyRequest(resp.priv);
                    opts.callback.call(opts.scope, resp);
                },
                callback:function(r) {
                    if (r.code===OpenLayers.Protocol.Response.FAILURE) {
                        loptions.failure.apply(this, [r]);
                    } else {
                        loptions.success.apply(this, [r]);
                    }
                },
                scope:this
            });
            this.olsRqst= {
                'protocol': ops,
                'response': ops.read()
            };
        }
    },

    /**
     * APIMethod: REVERSE_GEOCODE
     * Query the OpenLS Core service with the REVERSE_GEOCODE method and
     * return the XML for OpenLS object.
     *
     * Parameters:
     * pos - {Geoportal.OLS.Position} the searched location.
     * options - {Object} Optional object for configuring the request.
     *      User callback are expected to be in onSuccess, onFailure options.
     *      The scopeOn option is used to specify the scope when calling
     *      onSuccess and onFailure callbacks.
     */
    REVERSE_GEOCODE: function(pos,options) {
        var params= new Geoportal.OLS.LUS.ReverseGeocodeRequest(pos);
        if (options && options.preferences) {
            for (var i= 0, len= options.preferences.length; i<len; i++) {
                params.addPreference(new Geoportal.OLS.LUS.ReverseGeocodePreference(options.preferences[i]));
            }
        } else {
            params.addPreference(new Geoportal.OLS.LUS.ReverseGeocodePreference('StreetAddress'));
        }
        if (!this.queriedAddresses) {
            this.queriedAddresses= [];
        }
        this.queriedAddresses[0]= {'hash':pos.toString(), 'features':null};//wait for replies
        var xls= new Geoportal.OLS.XLS({
            version:this.format.version,
            _header:new Geoportal.OLS.RequestHeader({
                        sessionID:''
                    })
        });
        xls.addBody(
            new Geoportal.OLS.Request(
                'ReverseGeocodeRequest',
                this.format.version,
                '',//FIXME: OpenLayers.createUniqueID() ?
                {
                    maximumResponses:this.maximumResponses,
                    _requestParameters:params
                })
        );
        var node= this.format.write(xls);
        var body= OpenLayers.Format.XML.prototype.write.apply(this.format,[node]);
        node= null;
        xls.destroy();
        xls= null;
        params= null;
        var loptions= OpenLayers.Util.applyDefaults(options, this.requestOptions);
        //using url parameter to pass token :
        if (this.GeoRM) {
            loptions.url= this.map.catalogue[this.GeoRM.GeoRMKey].layers[this.name].url;
            loptions.params= OpenLayers.Util.extend({}, this.GeoRM.token);
            if (this.GeoRM.transport=='referrer') {
                OpenLayers.Util.extend(loptions.params, Geoportal.GeoRMHandler.getCookieReferrer((this.map? this.map.div :null),true));
            }
        }
        this.options.onSuccess= loptions.onSuccess;
        this.options.scopeOn= loptions.scopeOn;
        loptions.success= function(request) {
            this.requestOptions.scope.RvGcSuccess.apply(this.requestOptions.scope,[request]);
            if (this.options.scopeOn && this.options.onSuccess) {
                this.options.onSuccess.apply(this.options.scopeOn,[request]);
            }
        };
        this.options.onFailure= loptions.onFailure;
        this.options.scopeOn= loptions.scopeOn;
        loptions.failure= function(request) {
            this.requestOptions.scope.LUSFailure.apply(this.requestOptions.scope,[request]);
            if (this.options.scopeOn && this.options.onFailure) {
                this.options.onFailure.apply(this.options.scopeOn,[request]);
            }
        };


        if (loptions.method!=='GET') {
            this.olsRqst= OpenLayers.Request.POST(
                OpenLayers.Util.applyDefaults({
                    'data'   :body,
                    'headers':{'Content-Type': 'text/xml'}
                },loptions));
        } else {
            loptions.params= OpenLayers.Util.extend(loptions.params, {output:'json'});
            var q= {};
            q[this.XML_PARAM_NAME]= body;
            q= OpenLayers.Util.extend(q,loptions.params);
            var ops= new OpenLayers.Protocol.Script({
                url:loptions.url,
                params:q,
                format:new OpenLayers.Format(),//dummy format
                handleResponse:function(resp,opts) {
                    if (resp.data) {
                        resp.responseText= resp.data.xml;
                        resp.code= OpenLayers.Protocol.Response.SUCCESS;
                    } else {
                        resp.status= resp.data.http? resp.data.http.code || 400 : 400;
                        resp.statusText= resp.data.http? resp.data.http.error || '' : '';
                        resp.code= OpenLayers.Protocol.Response.FAILURE;
                    }
                    this.destroyRequest(resp.priv);
                    opts.callback.call(opts.scope, resp);
                },
                callback:function(r) {
                    if (r.code===OpenLayers.Protocol.Response.FAILURE) {
                        loptions.failure.apply(this, [r]);
                    } else {
                        loptions.success.apply(this, [r]);
                    }
                },
                scope:this
            });
            this.olsRqst= {
                'protocol': ops,
                'response': ops.read()
            };
        }
    },

    /**
     * Method: GcSuccess
     * Called when the Ajax request returns a response for a Geocoding request.
     *
     * Parameters:
     * request - {XmlNode} request to server.
     */
    GcSuccess: function(request) {
        this.success(request);
        this.olsRqst= null;
        if (!this.ols) {
            this.queriedAddresses= null;
            return;
        }
        // we have one query => one body
        var b= this.ols.getBodies()[0];
        if (!b) {
            this.queriedAddresses= null;
        } else {
            var rp= b.getResponseParameters();
            if (!rp || rp.getNbGeocodeResponseList()<=0) {
                this.queriedAddresses= null;
            } else {
                for (var i= 0, ilen= rp.getNbGeocodeResponseList(); i<ilen; i++) {
                    var grl= rp.getGeocodeResponseList()[i];
                    //each query => a list of responses in the body
                    if (!grl || grl.getNbGeocodedAddresses()<=0) {
                        this.queriedAddresses= null;
                    } else {
                        for (var j= 0, jlen= grl.getNbGeocodedAddresses(); j<jlen; j++) {
                            var ga= grl.getGeocodedAddresses()[j];
                            if (!ga || !ga.address || !(ga.address.name || ga.address.streetAddress)) {
                                continue;
                            }
                            var feature= new OpenLayers.Feature.Vector(
                                    ga.lonlat,
                                    {
                                        'address':ga.address.clone(),
                                        'geocodeMatchCode':ga.geocodeMatchCode.clone()
                                    },
                                    null
                            );//FIXME: style
                            if (!this.queriedAddresses[i].features) {
                                this.queriedAddresses[i].features=[];
                            }
                            this.queriedAddresses[i].features.push(feature);
                        }
                        // DON'T addFeatures() otherwise all addresses will be drawn ...
                    }
                }
            }
        }
        this.ols.destroy();
        this.ols= null;
    },

    /**
     * Method: RvGcSuccess
     * Called when the Ajax request returns a response for a Reverse Geocoding
     * request.
     *
     * Parameters:
     * request - {XmlNode} request to server.
     */
    RvGcSuccess: function(request) {
        this.success(request);
        this.olsRqst= null;
        if (!this.ols) {
            this.queriedAddresses= null;
            return;
        }
        // we have one query => one body
        var b= this.ols.getBodies()[0];
        if (!b) {
            this.queriedAddresses= null;
        } else {
            var rp= b.getResponseParameters();
            if (!rp || rp.getNbReverseGeocodedLocations()<=0) {
                this.queriedAddresses= null;
            } else {
                for (var i= 0, ilen= rp.getNbReverseGeocodedLocations(); i<ilen; i++) {
                     var rgl= rp.getReverseGeocodedLocations()[i];
                     if (!rgl || !rgl.lonlat || !rgl.address) {
                         continue;
                     }
                     var feature= new OpenLayers.Feature.Vector(
                            rgl.lonlat,
                            {
                                'address':rgl.address.clone(),
                                'measure':(rgl.measure? rgl.measure.clone(): null)
                            },
                            null
                     );//FIXME: style
                     if (!this.queriedAddresses[0].features) {
                         this.queriedAddresses[0].features=[];
                     }
                     this.queriedAddresses[0].features.push(feature);
                    // DON'T addFeatures() otherwise all addresses will be drawn ...
                }
            }
        }
        this.ols.destroy();
        this.ols= null;
    },

    /**
     * Method: LUSFailure
     * Called when the Ajax request fails.
     *
     * Parameters:
     * request - {XmlNode} request to server
     */
    LUSFailure: function(request) {
        OpenLayers.Console.warn(request.status+' : '+request.statusText);
        this.queriedAddresses= null;
        this.olsRqst= null;
    },

    /**
     * APIMethod: createPopupForAddress
     * Create function for Geocoded based feature.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>}
     */
    createPopupForAddress: function(feature) {
        var createPopup= function() {
            if (!this.popupClass) {
                this.popupClass=
                    this.layer && this.layer.formatOptions && this.layer.formatOptions.popupClass?
                    this.layer.formatOptions.popupClass
                :   typeof(Geoportal.Popup)!='undefined' && typeof(Geoportal.Popup.Anchored)!='undefined'?
                    Geoportal.Popup.Anchored
                :   typeof(OpenLayers.Popup)!='undefined' && typeof(OpenLayers.Popup.AnchoredBubble)!='undefined'?
                    OpenLayers.Popup.AnchoredBubble
                :   null;
            }
            if (this.popupClass) {
                var htmlPopup= '<div class="gpPopupBody">';
                var ga= this.attributes.address;
                htmlPopup+= ga.toHTMLString();
                if (this.attributes.measure) {
                    m= this.attributes.measure ;
                    if (m.value) {
                        htmlPopup+= "<br/> " + OpenLayers.i18n("geocoded.address.popup.searchCenterDistance");
                        htmlPopup+= " <b>" + m.value+"</b>";
                        htmlPopup+= " " + (m.uom===null?"":m.uom) ;
                        htmlPopup+= "<br/>" ;
                    }
                }
                htmlPopup+= '</div>';
                var popup= new this.popupClass(//FIXME for parameters ...
                    "chicken",
                    this.geometry.getBounds().getCenterLonLat(),
                    new OpenLayers.Size(80,40),
                    htmlPopup,
                    null,
                    false,//no need when hover= true
                    '#ffffff',
                    0.75,
                    null, //no need when hover=true: Geoportal.Popup.onPopupClose,
                    feature
                );
                this.popup= popup;
            } else {
                this.popup= null;
            }
        };
        feature.createPopup= OpenLayers.Function.bind(createPopup,feature);
    },

    /**
     * APIMethod: cleanQueries
     * Clean queries results.
     */
    cleanQueries: function() {
        if (this.queriedAddresses) {
            for (var i= 0, len= this.queriedAddresses.length; i<len; i++) {
                var qa= this.queriedAddresses[i];
                if (qa.features) {
                    qa.features= null;
                }
                this.queriedAddresses[i]= null;
            }
            this.queriedAddresses= null;
        }
    },

    /**
     * APIMethod: abortRequest
     * Stops the current request against the underlaying OpenLS service.
     */
    abortRequest: function() {
        if (this.olsRqst) {
            if (this.olsRqst.abort) {
                this.olsRqst.abort();
            } else if (this.olsRqst.protocol) {
                this.olsRqst.protocol.abort(this.olsRqst.response);
            }
            this.olsRqst= null;
        }
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Layer.OpenLS.Core.LocationUtilityService"*
     */
    CLASS_NAME:"Geoportal.Layer.OpenLS.Core.LocationUtilityService"
});
