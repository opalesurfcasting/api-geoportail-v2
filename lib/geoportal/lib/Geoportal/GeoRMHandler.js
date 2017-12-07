/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Util.js
 * @requires Geoportal/Format/WMC/v1_1_0_AutoConf.js
 */
/*
 * Class: Geoportal.GeoRMHandler
 * The Geoportal framework GeoRM base class.
 */
Geoportal.GeoRMHandler= {};

//FIXME: for tiny API, just provide usefull OpenLayers classes and methods ?
//       where ? build an OpenLayersTiny.js ?
OpenLayers= OpenLayers || {};
if (!OpenLayers.getDoc) {
    /**
     * APIFunction: getDoc
     * Return the current working document.
     * IGNF: _addition_.
     *
     * Returns:
     * {DOMElement} the document
     */
    OpenLayers.getDoc= function() {
        return OpenLayers._document || document;
    };
}
OpenLayers.Util= OpenLayers.Util || {};
if (!OpenLayers.Util.extend) {
    /**
     * APIFunction: OpenLayers.Util.extend
     * Copy all properties of a source object to a destination object.  Modifies
     *     the passed in destination object.  Any properties on the source object
     *     that are set to undefined will not be (re)set on the destination
     *     object.
     *
     * Parameters:
     * destination - {Object} The object that will be modified
     * source - {Object} The object with properties to be set on the destination
     *
     * Returns:
     * {Object} The destination object.
     */
    OpenLayers.Util.extend = function(destination, source) {
        destination = destination || {};
        if(source) {
            for(var property in source) {
                var value = source[property];
                if(value !== undefined) {
                    destination[property] = value;
                }
            }

            /**
             * IE doesn't include the toString property when iterating over an
             * object's
             * properties with the for(property in object) syntax.  Explicitly
             * check if
             * the source has its own toString property.
             */

            /*
             * FF/Windows < 2.0.0.13 reports "Illegal operation on WrappedNative
             * prototype object" when calling hawOwnProperty if the source object
             * is an instance of window.Event.
             */

            var sourceIsEvt = typeof window.Event == "function"
                              && source instanceof window.Event;
            if(!sourceIsEvt
               && source.hasOwnProperty && source.hasOwnProperty('toString')) {
                destination.toString = source.toString;
            }
        }
        return destination;
    };

}

if (!OpenLayers.Util.getElement) {

    /**
     * Function: getElement
     * This is the old $() from prototype
     */
    OpenLayers.Util.getElement = function() {
        var elements = [];

        for (var i=0, len=arguments.length; i<len; i++) {
            var element = arguments[i];
            if (typeof element == 'string') {
                element = document.getElementById(element);
            }
            if (arguments.length == 1) {
                return element;
            }
            elements.push(element);
        }
        return elements;
    };

}

if (!OpenLayers.Util.applyDefaults) {

    /**
     * Function: applyDefaults
     * Takes an object and copies any properties that don't exist from
     *     another properties, by analogy with OpenLayers.Util.extend() from
     *     Prototype.js.
     *
     * Parameters:
     * to - {Object} The destination object.
     * from - {Object} The source object.  Any properties of this object that
     *     are undefined in the to object will be set on the to object.
     *
     * Returns:
     * {Object} A reference to the to object.  Note that the to argument is modified
     *     in place and returned by this function.
     */
    OpenLayers.Util.applyDefaults = function (to, from) {
        to = to || {};
        /*
         * FF/Windows < 2.0.0.13 reports "Illegal operation on WrappedNative
         * prototype object" when calling hawOwnProperty if the source object is an
         * instance of window.Event.
         */
        var fromIsEvt = typeof window.Event == "function"
                        && from instanceof window.Event;

        for (var key in from) {
            if (to[key] === undefined ||
                (!fromIsEvt && from.hasOwnProperty
                 && from.hasOwnProperty(key) && !to.hasOwnProperty(key))) {
                to[key] = from[key];
            }
        }
        /**
         * IE doesn't include the toString property when iterating over an object's
         * properties with the for(property in object) syntax.  Explicitly check if
         * the source has its own toString property.
         */
        if(!fromIsEvt && from && from.hasOwnProperty
           && from.hasOwnProperty('toString') && !to.hasOwnProperty('toString')) {
            to.toString = from.toString;
        }

        return to;
    };

}

if (!OpenLayers.Util.urlAppend) {

    /**
     * Function: urlAppend
     * Appends a parameter string to a url. This function includes the logic for
     * using the appropriate character (none, & or ?) to append to the url before
     * appending the param string.
     *
     * Parameters:
     * url - {String} The url to append to
     * paramStr - {String} The param string to append
     *
     * Returns:
     * {String} The new url
     */
    OpenLayers.Util.urlAppend = function(url, paramStr) {
        var newUrl = url;
        if(paramStr) {
            var parts = (url + " ").split(/[?&]/);
            newUrl += (parts.pop() === " " ?
                paramStr :
                parts.length ? "&" + paramStr : "?" + paramStr);
        }
        return newUrl;
    };

}

if (!OpenLayers.Util.indexOf) {

    /**
     * Function: indexOf
     * Seems to exist already in FF, but not in MOZ.
     *
     * Parameters:
     * array - {Array}
     * obj - {*}
     *
     * Returns:
     * {Integer} The index at, which the first object was found in the array.
     *           If not found, returns -1.
     */
    OpenLayers.Util.indexOf = function(array, obj) {
        // use the build-in function if available.
        if (typeof array.indexOf == "function") {
            return array.indexOf(obj);
        } else {
            for (var i = 0, len = array.length; i < len; i++) {
                if (array[i] == obj) {
                    return i;
                }
            }
            return -1;
        }
    };

}

/**
 * Class: Geoportal.GeoRMHandler.Updater
 * The Geoportal GeoRM Updater class.
 *      This class is deprecated in 2.0 API.
 */
/**
 * Constructor: Geoportal.GeoRMHandler.Updater
 * Geographic Rights Management utility class for getting/updating a GeoRM token.
 *
 * Parameters:
 * geoRMKey - {String} the license key
 * serverUrl - {String} the server url
 * ttl - {Integer} the time to live (in seconds)
 * options - {Object} An optional object whose properties will be set on
 *     this instance.
 *      Currently, the following options are supported :
 *      * transport : indicates the way geographic rights management
 *      information are interchanged with the GeoRM service. Values are :
 *          * json: default value - key is sent by HTTP GET method, result
 *          comes back in JSON. Referrer is sent by the browser as an HTTP
 *          header;
 *          * referrer: same as above, but the __rfrrric__=referrer is
 *          also put in a cookie (for HTTPS connexions);
 *          * all: same as above, but the key=token is also put in
 *          a cookie (Not yet implemented).
 */
Geoportal.GeoRMHandler.Updater= function(geoRMKey, serverUrl, ttl, options) {
    OpenLayers.Util.extend(this,options);
    this.maps= [];
    this.tgts= [];
    this.scripts= [];
    this.domHeads=[];
    this.GeoRMKey= geoRMKey;
    this.lastUpdate= 0;

    this.serverUrl= serverUrl || Geoportal.GeoRMHandler.getGeormServerUrl();
    if (this.serverUrl.charAt(this.serverUrl.length - 1) != '/') {
        this.serverUrl += '/';
    }
    if (ttl) {
        this.ttl= 1000 * ttl;
    }
    this.queryUrl= '';

    if (OpenLayers.Events) {
        this.events= new OpenLayers.Events(this, null, this.EVENT_TYPES);
    }
    if (this.eventListeners instanceof Object) {
        this.eventListeners= [];
    }
    this.addOptions(options);

    if (OpenLayers.Event) {
        OpenLayers.Event.observe(window, 'unload', this.destroy);
    }
};

Geoportal.GeoRMHandler.Updater.prototype= {

    /**
     * APIProperty: GeoRMKey
     * {String} The Geographic Rights Management Key
     */
    GeoRMKey: null,

    /**
     * APIProperty: serverUrl
     * {String} The GeoRM service url exposing the getToken, tokenInfo and
     * releaseToken operations.
     *      Default to *Geoportal.GeoRMHandler.GEORM_SERVER_URL*
     */
    serverUrl: null,

    /**
     * APIProperty: ttl
     * {Integer} Time to live of the token in milliseconds. Default to *600000*
     * (10 minutes).
     */
    ttl: 600000,

    /**
     * APIProperty: token
     * {Object} The name of the unique elemnt of this object is the name
     *      of the url parameter of the token. The value {String} of this
     *      element is the token.
     */
    token: {},

    /**
     *  Property: maps
     *  {Array(<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>)} List of maps objects using this GeoRMKey
     */
    maps: null,

    /**
     *  Property: tgts
     *  {Array(<Document>)} List of HTML documents using this GeoRMKey
     */
    tgts: null,

    /**
     * Property: queryUrl
     * {String} The GeoRM service url with parameters
     */
    queryUrl: null,

    /**
     * Property: lastUpdate
     * {Integer} Time of the last token key update
     */
    lastUpdate: 0,

    /**
     * Property: status
     * {Integer} current state of the token
     *      Values are :
     *|  0 : valid token
     *| >0 : update in progress (number of requests)
     *| -1 : token updated and running queued moveTo calls
     */
    status: 0,

    /**
     * Property: domHeads
     * Array({DOMElement}) internal references to the document's heads.
     */
    domHeads: null,

    /**
     * Property: scripts
     * Array({DOMElement}) internal references to the script tag used to call
     * the jsonp token in different documents.
     */
    scripts: null,

    /**
     * Property: reload
     * {Boolean} indicate if we need to reload the map when receiving a new token
     *      We need to reload a map if the layer.moveTo calling function was
     *      cancelled due to a previously unavailable token.
     *      Default to *false*
     */
    reload: false,

    /**
     * Constant: EVENT_TYPES
     * {Array(String)} Supported application event types.  Register a listener
     *     for a particular event with the following syntax:
     * (code)
     * updater.events.register(type, obj, listener);
     * (end)
     *
     * Listeners will be called with a reference to an event object.  The
     *     properties of this event depends on exactly what happened.
     *
     * All event objects have at least the following properties:
     * object - {Object} A reference to Geoportal.GeoRMHandler.Updater element.
     *
     * Supported geoRM event types:
     * tokenupdatestart - Triggered when a geoRM token is to be updated.
     * tokenupdateend - Triggerend when the update process is completed
     *      whatever the state of the token is.
     * tokenloaded - Triggered when a valid geoRM token has been received.
     */
    EVENT_TYPES: [ "tokenupdatestart", "tokenupdateend", "tokenloaded" ],

    /**
     *  APIProperty: events
     * {<OpenLayers.Events at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Events-js.html>}
     */
    events: null,

    /**
     * APIProperty: onBeforeUpdateToken
     * {Function} Called before the GeoRM handler ask for creating/renewing the token.
     *      Does nothing by default.
     */
    onBeforeUpdateToken: function() {
    },

    /**
     * APIProperty: onUpdateTokenFailure
     * {Function} Called when the GeoRM handler failed in creating/renewing the token.
     *      Does nothing by default.
     */
    onUpdateTokenFailure: function() {
    },

    /**
     * APIProperty: onUpdateTokenSuccess
     * {Function} Called when the GeoRM handler succeeded in creating/renewing the token.
     *      Does nothing by default.
     */
    onUpdateTokenSuccess: function() {
    },

    /**
     * APIProperty: onTokenLoaded
     * {Function} Callback issued when the token is returned updated.
     *      This function expects an {<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>} as parameter.
     *      Called after <onUpdateTokenSuccess> for each registered maps.
     *
     *      Defaults to calling <OpenLayers.Map#setCenter>() with current center and zoom.
     */
    onTokenLoaded: function(map) {
        if (map && map.setCenter) {
            map.setCenter(map.getCenter(), map.getZoom(), false, true);
        }
    },

    /**
     * Method: addOptions
     * Process options given on the license key.
     *      Processed options :
     *      * eventListeners;
     *
     * Parameters:
     * options - {Object}
     */
    addOptions: function(options) {
        if (options) {
            if (options.eventListeners && options.eventListeners instanceof Object) {
                if (!this.eventListeners) {
                    this.eventListeners= [];
                }
                this.eventListeners.push(options.eventListeners);
                if (this.events) {
                    this.events.on(options.eventListeners);
                }
            }
        }
    },

    /**
     * APIMethod: addMap
     * Register a map using the license key
     *
     * Parameters:
     * map - {<Openlayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>}
     */
    addMap: function(map) {
        for (var i= 0, len= this.maps.length; i<len; i++) {
            if (this.maps[i] === map) {
                return;
            }
        }
        this.maps.push(map);
        var doc =(map ? map.div.ownerDocument : OpenLayers.getDoc());

        for (var i= 0, len= this.tgts.length; i<len; i++) {
            if (this.tgts[i]===doc) { return; }
        }
        this.tgts.push(doc);
        var head= (doc.getElementsByTagName("head").length ?
                      doc.getElementsByTagName("head")[0] :
                      doc.body);
        this.domHeads.push(head);
        // a new doc has been added :
        this.getToken();
    },

    /**
     * APIMethod: destroy
     * Release the token associated with the license key.
     */
    destroy: function() {
        if (OpenLayers.Event) {
            OpenLayers.Event.stopObserving(window, 'unload', this.destroy);
        }

        if (this.events) {
            if (this.eventListeners) {
                for (var i= 0, l= this.eventListeners.length; i<l; i++) {
                    this.events.un(this.eventListeners[i]);
                }
                this.eventListeners= null;
            }
            this.events.destroy();
            this.events = null;
        }
        if (this.GeoRMKey) { this.GeoRMKey= null; }
        if (this.serverUrl) { this.serverUrl= null; }
        if (this.token) { this.token= null; }
        if (this.maps) { this.maps= null; }
        if (this.tgts) { this.tgts= null; }
        if (this.scripts) { this.scripts= null; }
        if (this.domHeads) { this.domHeads= null; }
        if (this.queryUrl) { this.queryUrl= null; }
    },

    /**
     * APIMethod: getToken
     * Get a token associated with the license key.
     *
     * Returns:
     * {Object} an empy object.
     */
    getToken: function () {
        return this.token;
    },

    /**
     * Method: updateToken
     * Call the GeoRM service to update the current token.
     *      Does nothing in 2.0 API.
     */
    updateToken: function () {
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.GeoRMHandler.Updater"*
     */
    CLASS_NAME: "Geoportal.GeoRMHandler.Updater"
};



/**
 * APIFunction: Geoportal.GeoRMHandler.getGeormServerUrl
 * retrieves the protocol used (http or https)
 *
 * Returns:
 * {String} the autoconfiguration service url to use.
 */
Geoportal.GeoRMHandler.getGeormServerUrl= function() {
    return window.location.protocol+Geoportal.GeoRMHandler.GEORM_SERVER_URL.split(':')[1];
};

/**
 * APIFunction: Geoportal.GeoRMHandler.getCookieReferrer
 * Get the referrer of the current document.
 *
 * Parameters:
 * e - {DOMElement} a document element of the current document
 * asObj - {Boolean} indicate to return an object instead of a string
 *
 * Returns:
 * {String | Object} the value of the cookie to set.
 */
Geoportal.GeoRMHandler.getCookieReferrer= function(e, asObj) {
    var cr= asObj===true? {} : '';
    if (Geoportal.Cookies.cookiesEnabled()) {
        //send referrer as URL parameter to GetToken that will forge a
        //cookie back with the relevant path, domain and max-age ...
        var ref= Geoportal.Cookies.get(Geoportal.GeoRMHandler.GEORM_REFERRER_COOKIENAME);
        if (ref===undefined) {
            var d= e || OpenLayers.getDoc();
            d= d.ownerDocument || d;
            var w= d.defaultView || d.parentWindow;
            var o= w.opener;
            // popup's or plain page referrer:
            try {
                if (o) {
                    ref= o && o.location && o.location.href;
                } else {
                    ref= d.location.href;
                }
            } catch (e) {
                ref= d.location.href;
            }
            ref= 'referrer,' + encodeURIComponent(ref || 'http://localhost/');
        }
        cr= asObj===true? {cookie:ref} :'cookie=' + ref;
    } else {
        if (OpenLayers.Console) {
            OpenLayers.Console.warn(OpenLayers.i18n('cookies.not.enabled'));
        }
    }
    return cr;
};

/**
 * APIFunction: Geoportal.GeoRMHandler.getConfig
 * Retrieve the contract's config from the given key.
 *
 * Parameters:
 * geoRMKey - {Array({String}) | String} the api key(s).
 * callback  - {Function | String} the callback function's name to call
 *      when receiving the server's reply. If null, use
 *      <Geoportal.GeoRMHandler.getContract>.
 * serverUrl - {String} the url of the token server. If null, use
 *      <Geoportal.GeoRMHandler.GEORM_SERVER_URL>.
 * options - {Object} An optional object whose properties will be set on
 *     the rightsManagement key instance :
 *      * onContractsFail - {Function} callback to use when one of the
 *      contracts fails to load (timeout, aborted, etc ...);
 *      * onContractsComplete - {Function} callback to use when all contracts
 *      have been received. Scope is {<OpenLayers.Protocol.Script at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Protocol/Script-js.html>}.
 *      Only used when callback parameter is null;
 *      * capabilities - {Object} holds the following properties :
 *          * proxy - {String} JSON proxy Url, defaults to
 *          <Geoportal.JSON_PROXY_URL>;
 *          * callback - {Function | String} the callback function's name
 *          to call when receiving service's capabilities. If null, use
 *          <Geoportal.GeoRMHandler.getCapabilities>;
 *          * onCapabilitiesComplete - {Function} callback to use when all
 *          capabilities have been received.
 *          Only used when callback option is null.
 *
 * Returns:
 * {Integer} The number of contracts sent.
 */
Geoportal.GeoRMHandler.getConfig = function (geoRMKey, callback, serverUrl, options) {
    //FIXME: several getConfig with :
    //       * same key(s)
    //       * different key(s)
    if (window.gGEOPORTALRIGHTSMANAGEMENT===undefined) {
        gGEOPORTALRIGHTSMANAGEMENT= {
            pending: 0,
            apiKey: [],
            services: {}
        };
    }
    // check whether it is callback's return or user's call:
    if (!geoRMKey) {
        return 0;
    }
    if (typeof(geoRMKey)=='string') {
        geoRMKey= [geoRMKey];
    }
    if (geoRMKey.length==0) {
        return 0;
    }
    options= options || {};
    var gfn= function(f) {
        if (!f) { return null; }
        var fn= /\W*function\s+([\w\$]+)\(/.exec(f);
        if (!fn) { return null; }
        return fn[1];
    };
    var callbackName= !callback?
        'Geoportal.GeoRMHandler.getContract'
    :   typeof(callback)=='string'?
        callback
    :   gfn(callback);
    if (!callbackName) { return 0; }

    var keys= [];
    if (geoRMKey.length>1) {
        keys= geoRMKey.slice(1);
    }
    var params= {
        //// remove tick to allow caching !
        //tick : new Date().getTime(), //force reload ...
        output : 'json'
    };
    if (options.transport=='referrer') {
        params.cookie= options.referrer || 'http://localhost/';
    }
    if (keys.length>0) {
        params.keys= keys.join(',');
    }
    var callbackFn= !callback? Geoportal.GeoRMHandler.getContract : typeof(callback)=='string'? eval(callback) : callback;
    var autoConfAggregateUrl= (serverUrl || Geoportal.GeoRMHandler.getGeormServerUrl()).replace('$key$/',geoRMKey[0]+'/id/');
    var s= new OpenLayers.Protocol.Script({
        url: (serverUrl || Geoportal.GeoRMHandler.getGeormServerUrl()).replace('$key$',geoRMKey[0]),
        params: params,
        callback: OpenLayers.Function.bind(Geoportal.GeoRMHandler.parseAutoConf,null,geoRMKey.slice(),autoConfAggregateUrl,callbackFn),
        onError: options.onContractsFail || function() {
            OpenLayers.Console.warn('Geoportal.GeoRMHandler.getConfig failed');//FIXME i18n
        },
        handleResponse:function(response, options) {
            if (response.priv) {
                this.destroyRequest(response.priv);
            }
            options.callback.call(options.scope, response);
        }
    });
    ++gGEOPORTALRIGHTSMANAGEMENT.pending;
    if (!callback) {
        OpenLayers.Util.extend(gGEOPORTALRIGHTSMANAGEMENT, options);
    }
    s.read();

    return gGEOPORTALRIGHTSMANAGEMENT.pending;
};

/**
 * Function: Geoportal.GeoRMHandler.parseAutoConf
 * Wrapper for getConfig callback function used to add the calling context
 * (keys and auto-configuration URL for aggregated layers) to the
 * auto-configuration response.
 *
 * Parameters:
 * keys - {Array({String})} the api key(s).
 * aggregateUrl  - {String} the auto-configuration Url for aggregated layers.
 * callback - {Function} the callback function to call
 *      when receiving the server's reply. If null, use
 *      <Geoportal.GeoRMHandler.getContract>.
 * resp - {Object} the auto-configuration response.
 */
Geoportal.GeoRMHandler.parseAutoConf = function(keys, aggregateUrl, callback, resp) {
    var contract= {};
    if (resp.data.http.error) {
        contract.error= resp.data.http.error;
    } else {
        var wmc= new Geoportal.Format.WMC.v1_1_0_AutoConf();
        var conf= wmc.read(resp.data.xml);
        var general= conf.generalOptions;
        
        var domain='OGC', serviceType= 'WMTS', newservices= {};
        
        for (var service in general.services) {
            
            var t= service.split(':');

            domain= t.shift() || 'OGC';
            serviceType= t.pop() || 'WMTS';

            if (domain=='GPP') {
                newservices[service]=general.services[service];
            }
        }
        
        general.services= newservices;
        
        for (var service in general.services) {
            if (gGEOPORTALRIGHTSMANAGEMENT.services[general.services[service].url]===undefined) {
                gGEOPORTALRIGHTSMANAGEMENT.services[general.services[service].url]= {
                    id: '__'+general.services[service].url.replace(/[^a-z0-9.-]/gi,'_')+'__',
                    type: general.services[service].id,
                    caps: null
                };
            }
        }
        Geoportal.Catalogue.completeConfiguration(conf);
    }
    if (gGEOPORTALRIGHTSMANAGEMENT.pending>0) {
        gGEOPORTALRIGHTSMANAGEMENT.pending--;
        gGEOPORTALRIGHTSMANAGEMENT.pending+=keys.length;
    }
    
    for (var i= 0, len= keys.length; i<len; i++) {
        var key= keys[i];
        contract.key= key;
        if (!contract.error) {
            contract.boundingBox= {
                minx: -180, // FIXME use conf.bounds.left
                miny: -90,  // FIXME use conf.bounds.bottom
                maxx: 180,  // FIXME use conf.bounds.right
                maxy: 90    // FIXME use conf.bounds.top
            } ;
            contract.resources= [];
            for (var j= 0, jlen= conf.layersContext.length; j<jlen; j++) {
                var layer= conf.layersContext[j];
                if (layer.aggregate) {
                    layer.options.keys = {};
                    for (var ikey=0; ikey<len; ikey++) {
                        layer.options.keys[keys[ikey]] = aggregateUrl+layer.id;
                    }
                }
                if (layer.options.keys && layer.options.keys[key]) {
                    var layerName= layer.name;
                    var defType= Geoportal.Catalogue.DEFAULT_SERVICE_TYPE;
                    var serviceType= layer.metadata && layer.metadata.type?
                        layer.metadata.type.split(':').pop() || defType : '';
                    if (layer.aggregate) {
                        // GEOGRAPHICALGRIDSYSTEMS.MAPS$GEOPORTAIL:OGC:WMTS@aggregate
                        //serviceType= defType;
                        //layerName= layer.name.split('$')[0];
                        serviceType= 'aggregate';
                    }
                    var serviceSubType= (serviceType+';').split(';')[1];
                    var resource= {
                        name: layerName.split(';').shift(), // FIXME: OPENLS;* case
                        type: serviceType.split(';').shift(),
                        url : layer.options.keys[key],
                        version : layer.version
                    }
                    if (serviceSubType.length>0) {
                        // OPENLS;xxx case for instance :
                        resource.subType= ';'+serviceSubType;
                    }
                    contract.resources.push(resource);
                }
            }
            contract.services= general.services;
        }
        callback(contract);
        if (general.services && gGEOPORTALRIGHTSMANAGEMENT[key]) {
            for (var srv in general.services) {
                var srvT= srv.split(':')[1].replace(/OpenLS/,"OPENLS");// bug in autoconf
                switch(srv) {
                    case "GPP:Elevation"             :
                    case "GPP:PrintMap"              :
                    case "GPP:SearchLayers"          :
                        gGEOPORTALRIGHTSMANAGEMENT[key].allowedGeoportalLayers.push(srv);
                        gGEOPORTALRIGHTSMANAGEMENT[key].resources[srv]= {
                            name:srv,
                            type:srvT,
                            url :general.services[srv].url
                        };
                        break;
                    default                          :
                        break;
                }
            }
        }
    }
};

/**
 * APIFunction: Geoportal.GeoRMHandler.getContract
 * Build the contract object from the Geoportal API.
 *      Default callback for Geoportal.GeoRMHandler.getConfig() method.
 *
 * Parameters:
 * contract - {Object} information returned by the GeoRM service.
 *      The structure holding the key's contract is :
 *      * service - {String} the GeoRM service that has returned the contract;
 *      * key - {String} the API Key;
 *      * boundingBox - {Object} hold minx, miny, maxx, maxy values
 *      (longitudes, latitudes);
 *      * resources - {Array({Object})} hold all layers available for the
 *      key. Each object holds :
 *          * name - {String} name of layer;
 *          * type - {String} type of service for this layer (WMSC, ...);
 *          * url - {String} service's URL.
 *      * tokenTimeOut - {Integer} number of seconds for GeoRM time to
 *      live.
 *      If contract hold a 'error' property, the key has no contract!
 *
 * Returns:
 * {Object} information needed by the Geoportal API stored in a global
 * variable gGEOPORTALRIGHTSMANAGEMENT. This variable contains
 * a property 'pending' whose value is the number of awaiting contrats.
 * On error, the gGEOPORTALRIGHTSMANAGEMENT.apiKey.length is 0.
 */
Geoportal.GeoRMHandler.getContract = function(contract) {
    if (gGEOPORTALRIGHTSMANAGEMENT.pending>0) {
        gGEOPORTALRIGHTSMANAGEMENT.pending--;
        if (contract.error) {
            OpenLayers.Console.warn(contract.error);
        } else {

            var k= gGEOPORTALRIGHTSMANAGEMENT[contract.key];
            if (contract.resources.length>0 && 
                OpenLayers.Util.indexOf(gGEOPORTALRIGHTSMANAGEMENT.apiKey, contract.key)==-1) {
                gGEOPORTALRIGHTSMANAGEMENT.apiKey.push(contract.key);
                k= gGEOPORTALRIGHTSMANAGEMENT[contract.key]= {
                    tokenServer:{
                        url:contract.service,
                        ttl:contract.tokenTimeOut
                    },
                    tokenTimeOut:contract.tokenTimeOut,
                    bounds: contract.boundingBox?
                        [ contract.boundingBox.minx, contract.boundingBox.miny, contract.boundingBox.maxx, contract.boundingBox.maxy ]
                    :   [-180,-90,180,90],
                    allowedGeoportalLayers:[],
                    resources:{},
                    defaultGeoportalLayers:[],
                    services:contract.services||{}
                };
            } else {
                if (k && contract.boundingBox.minx<k.bounds[0]) {
                    k.bounds[0]= contract.boundingBox.minx;
                }
                if (k && contract.boundingBox.miny<k.bounds[1]) {
                    k.bounds[1]= contract.boundingBox.miny;
                }
                if (k && contract.boundingBox.maxx>k.bounds[2]) {
                    k.bounds[2]= contract.boundingBox.maxx;
                }
                if (k && contract.boundingBox.maxy>k.bounds[3]) {
                    k.bounds[3]= contract.boundingBox.maxy;
                }
            }
            for (var i= 0, l= contract.resources.length; i<l; i++) {
                var r= contract.resources[i], rz= r.name+':'+r.type+(r.subType||'');
                if (OpenLayers.Util.indexOf(k.allowedGeoportalLayers, rz)==-1) {
                    k.allowedGeoportalLayers.push(rz);
                    k.resources[rz]= OpenLayers.Util.extend({}, r);
                    delete k.resources[rz].subType;
                }
                if (gGEOPORTALRIGHTSMANAGEMENT.services[r.url]===undefined) {
                    gGEOPORTALRIGHTSMANAGEMENT.services[r.url]= {
                        id: '__'+r.url.replace(/[^a-z0-9.-]/gi,'_')+'__',
                        type: r.type,
                        caps: null
                    };
                }
            }

            if (k) {
                var all= k.allowedGeoportalLayers.slice();
                for (var i= all.length-1; i>=0; i--) {
                    // for all territories, keep only defaultLayers !
                    var isD= false;
                    for (var t in Geoportal.Catalogue.TERRITORIES) {
                        var ter= Geoportal.Catalogue.TERRITORIES[t];
                        var ln= all[i].split(':')[0];
                        var lt= all[i].split(':')[1];
                        var l= Geoportal.Catalogue.LAYERNAMES[ln];
                        if (!l) { continue; }
                        var lk= l.key;
                        l= ter.defaultLayers[lk];
                        if (l && l.isDefault===true && (lk && lk.indexOf(lt)!=-1)) {
                            isD= true;
                            break;
                        }
                    }
                    if (!isD) {
                        all.splice(i,1) ;
                    }
                }
                k.defaultGeoportalLayers= all;
            }
        }

        if (gGEOPORTALRIGHTSMANAGEMENT.pending==0) {
            if (typeof(gGEOPORTALRIGHTSMANAGEMENT.onContractsComplete)==='function') {
                gGEOPORTALRIGHTSMANAGEMENT.onContractsComplete();
            }
        }

    }

    return gGEOPORTALRIGHTSMANAGEMENT;
};

/**
 * APIFunction: Geoportal.GeoRMHandler.getServicesCapabilities
 *
 * Parameters:
 * services - {Object} holds the service definition :
 *      * id - {String} unique service identifier;
 *      * url - {String} service url for GetCapabilities;
 *      * type - {String} service's type (WMS, WFS, WMSC, WMTS, ...);
 *      * caps - {Object} null or empty at the begining FIXME
 *      If null, use gGEOPORTALRIGHTSMANAGEMENT.services;
 * callback  - {Array({String}) | String} the callback function's name to call
 *      when receiving the server's reply. If null, use
 *      <Geoportal.GeoRMHandler.getCapabilities>.
 * jsonProxyUrl - {String} the url of the JSON proxy service. If null, use
 *      <Geoportal.JSON_PROXY_URL>.
 * options - {Object} An optional object whose properties will be set on
 *     the rightsManagement key instance :
 *      * onCapabilitiesComplete : callback to use when all capabilities have been received.
 *      Only used when callback parameter is null;
 *
 * The returned JSON object contains the following properties :
 *      * http - {Object} contains :
 *          * code - {Integer} the HTTP code of the request;
 *          * url - {String} the proxied service Url;
 *      * xml - {String} the service's capabilities as an XML string.
 *
 * Returns:
 * {Object} the services informations.
 */
Geoportal.GeoRMHandler.getServicesCapabilities = function (services, callback, jsonProxyUrl, options) {
    if (window.gGEOPORTALRIGHTSMANAGEMENT===undefined) {
        gGEOPORTALRIGHTSMANAGEMENT= {};
    }
    if (!services) {
        if (!gGEOPORTALRIGHTSMANAGEMENT.services) {
            return null;
        }
        services= gGEOPORTALRIGHTSMANAGEMENT.services;
    }
    options= options || {};
    OpenLayers.Util.applyDefaults(options, gGEOPORTALRIGHTSMANAGEMENT.capabilities);
    var gfn= function(f) {
        if (!f) { return null; }
        var fn= /\W*function\s+([\w\$]+)\(/.exec(f);
        if (!fn) { return null; }
        return fn[1];
    };
    var callbackName= !callback?
            (options.callback?
                options.callback
            :   'Geoportal.GeoRMHandler.getCapabilities')
        :   (typeof(callback)=='string'?
            callback
        :   gfn(callback));
    if (!callbackName) { return null; }
    for (var u in services) {
        var srv= services[u];
        var stp= srv.type;
        switch (srv.type) {
        case 'WFS'   :             break;
        case 'WMTS'  :             break;
        case 'WMSC'  : stp= 'WMS'; break;
        case 'WMS'   :             break;
        default      :
            srv.caps= {};
            continue;
        }
        var doc= OpenLayers.getDoc();
        var head= (doc.getElementsByTagName("head").length ?
            doc.getElementsByTagName("head")[0]
        :   doc.body);
        var s= OpenLayers.Util.getElement(srv.id);
        if (s && s.parentNode ) { s.parentNode.removeChild(s); }
        s= doc.createElement('script');
        s.id= srv.id;
        s.setAttribute('type', 'text/javascript');
        var sUrl= jsonProxyUrl || options.proxy || Geoportal.JSON_PROXY_URL;
        sUrl= OpenLayers.Util.urlAppend(sUrl,
                'url=' + encodeURIComponent(OpenLayers.Util.urlAppend(u, 'SERVICE=' + stp + '&REQUEST=GetCapabilities&')) + '&' +
                'callback=' + callbackName + '&');
        s.setAttribute('src', sUrl);
        head.appendChild(s);
    }

    if (!callback) {
        //FIXME: chain getConfig() then getServicesCapabilities()
        if (options.onCapabilitiesComplete) {
            gGEOPORTALRIGHTSMANAGEMENT.onCapabilitiesComplete= options.onCapabilitiesComplete;
        }
    }

    return services;
};

/**
 * APIFunction: Geoportal.GeoRMHandler.getCapabilities
 * Awaits for service's capabilities to be loaded, then call onCapabilitiesComplete
 * callback when all loaded to finish loading the page.
 *
 * Parameters:
 * obj - {Object} the returned JSON object
 */
Geoportal.GeoRMHandler.getCapabilities = function(obj) {
    if (!obj) { obj= {}; }
    if (!obj.http) { obj.http= {}; }
    if (!obj.http.code) { obj.http.code= 400; }
    if (!obj.http.url) { obj.http.url= 'http://localhost/?'; }
    if (!obj.xml) { obj.xml= ''; }
    var u= obj.http.url.split('?')[0];
    var srv= gGEOPORTALRIGHTSMANAGEMENT.services[u];
    if (obj.http.code!=200) {
        OpenLayers.Console.warn(OpenLayers.i18n('url.error',{'url':obj.http.url,'msg':''}));
    } else {
        if (srv) {
            var doc= OpenLayers.Format.XML.prototype.read.call({},[obj.xml]);
            //TODO  utility function for mapping type and parser ?
            var fmt= null;
            switch (srv.type) {
            case 'WFS'   : fmt= OpenLayers.Format? OpenLayers.Format.WFSCapabilities  : null; break;
            case 'WMTS'  : fmt= OpenLayers.Format? OpenLayers.Format.WMTSCapabilities : null; break;
            case 'WMSC'  :
            case 'WMS'   : fmt= OpenLayers.Format? OpenLayers.Format.WMSCapabilities  : null; break;
            default      :                                                                    break;
            }
            if (fmt) {
                var capsFmt= new fmt();
                var caps= null;
                try {
                    caps= capsFmt.read(doc);
                } catch (er) {
                    OpenLayers.Console.warn('url.error',{'url':obj.http.url,'msg':''});
                } finally {
                    if (caps && caps.exceptions) {//Service Exception
                        var msg= '';
                        for (var i= 0, l= caps.exceptions.length; i<l; i++) {
                            msg+= caps.exceptions[i]+'\n';
                        }
                        OpenLayers.Console.warn('url.error',{'url':obj.http.url,'msg':msg});
                    } else {
                        srv.caps= caps;
                    }
                }
            }
            var s= OpenLayers.Util.getElement(srv.id);
            if (s && s.parentNode ) { s.parentNode.removeChild(s); }
        }
    }
    if (srv && !srv.caps) {
        srv.caps= {};//prevent infinite loop!
    }
    for (var srv in gGEOPORTALRIGHTSMANAGEMENT.services) {
        if (gGEOPORTALRIGHTSMANAGEMENT.services[srv].caps===null) {
            return;
        }
    }
    // all capabilities loaded:
    if (typeof(gGEOPORTALRIGHTSMANAGEMENT.onCapabilitiesComplete)==='function') {
        gGEOPORTALRIGHTSMANAGEMENT.onCapabilitiesComplete();
    }
};

/**
 * APIFunction: Geoportal.GeoRMHandler.addKey
 * Returns a token for a api Key.
 * Returns null if any problem (invalid key)
 *
 * Parameters:
 * geoRMKey - {Integer} the api key.
 * serverUrl - {String} the url of the token server.
 * ttl - {Integer} time to live of a token in seconds.
 * map - {<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>} the map to protect.
 * options - {Object} An optional object whose properties will be set on
 *     the rightsManagement key instance.
 *
 * Returns:
 * {Object} the rightsManagement key
 */
Geoportal.GeoRMHandler.addKey = function (geoRMKey, serverUrl, ttl, map, options) {
    //         all except IE<=8
    var doc= OpenLayers.getDoc();
    var base= (doc.defaultView || doc.parentWindow).Geoportal.GeoRMHandler;
    if (!base["U" + geoRMKey]) {
        base["U" + geoRMKey]= new Geoportal.GeoRMHandler.Updater(geoRMKey, serverUrl, ttl, options);
        base["U" + geoRMKey].getToken();
    } else {
        base["U" + geoRMKey].addOptions(options);
    }
    base["U" + geoRMKey].addMap(map);
    return base["U" + geoRMKey];
};

/**
 * Constant: Geoportal.GeoRMHandler.GEORM_REFERRER_COOKIENAME
 * {String} *"__rfrrric__"*
 */
Geoportal.GeoRMHandler.GEORM_REFERRER_COOKIENAME= "__rfrrric__";

/**
 * Constant: Geoportal.GeoRMHandler.GEORM_SERVER_URL
 * {String} *"http://wxs.ign.fr/$key$/autoconf/"*
 */
Geoportal.GeoRMHandler.GEORM_SERVER_URL= window.location.protocol+"//wxs.ign.fr/$key$/autoconf/";

/**
 * Constant: Geoportal.JSON_PROXY_URL
 * {String} *"http://api.ign.fr/geoportail/api/xmlproxy?output=json"*
 */
Geoportal.JSON_PROXY_URL= "http://api.ign.fr/geoportail/api/xmlproxy?output=json";
