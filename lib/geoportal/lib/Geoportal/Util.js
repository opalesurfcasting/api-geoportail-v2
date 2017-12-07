/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/**
 * Header: Geoportal Utilities
 * Geoportal functions for handling Geoportal theme, degrees convertions and
 * cookies.
 */
/**
 * Namespace: Geoportal.Util
 * Convenience methods for the Geoportal API.
 */
Geoportal.Util= {

    /**
     * Property: _imagesLocation
     * {String} Path of theme's images.
     */
    _imagesLocation: null,

    /**
     * APIFunction: getImagesLocation
     * Return the path to the Geoportal theme images.
     *
     * Returns:
     * {String} The fully formatted image location string
     */
    getImagesLocation: function() {
        if (!Geoportal.Util._imagesLocation) {
            Geoportal.Util._imagesLocation= Geoportal._getScriptLocation() + "theme/geoportal/img/";
        }
        return Geoportal.Util._imagesLocation;
    },

    /**
     * APIFunction: setTheme
     * Assign the theme name.
     *
     * Parameters:
     * thName - {String} the theme name. When not set, defaults to *geoportal*.
     */
    setTheme: function(thName) {
        if (!thName) { thName= 'geoportal'; }
        Geoportal.Util._imagesLocation= Geoportal._getScriptLocation() + "theme/"+thName+"/img/";
    },

    /**
     * APIFunction: convertToPixels
     * Compute a dimension of an element (e.g., width or height).
     * Based on http://blog.stchur.com/2006/09/20/converting-to-pixels-with-javascript/
     *
     * Parameters:
     * s - {String} the style string.
     * w - {Boolean} compute against width, not height.
     * c - {DOMElement} the parent node. If none, document.documentElement will be used.
     *
     * Returns:
     * {Integer} the computed dimension or undefined.
     */
    convertToPixels: function(s,w,c) {
        if (!s) { return undefined; }
        if (w==undefined) { w= false; }
        if (/px$/.test(s)) { return parseInt(s); }
        var doc= OpenLayers.getDoc();
        var tmp= doc.createElement('div');
        tmp.style.display= '';// give 0 on elements with display none
        tmp.style.visibility= 'hidden';// this element never shows up on the page
        tmp.style.position= 'absolute';// the element won't shift other elements around on the page.
        tmp.style.lineHeight= '0';// because IE will add mysterious white-space to our element that will throw
                                  // off our measurement if we don't.
        if (!c) { c= doc.body; }
        if (/%$/.test(s)) {
            c= c.parentNode || c;
            tmp.style[w? 'width':'height']= s;
        } else {
            tmp.style.borderStyle= 'solid';
            if (w) {
                tmp.style.borderBottomHeight= '0';
                tmp.style.borderTopHeight= s;
            } else {
                tmp.style.borderBottomWidth= '0';
                tmp.style.borderTopWidth= s;
            }
        }
        c.appendChild(tmp);
        var px= w? tmp.offsetWidth : tmp.offsetHeight;
        c.removeChild(tmp);
        return px;
    },

    /**
     * APIFunction: getComputedStyle
     * Return the element style property.
     *
     * Parameters:
     * el - {DOMElement}
     * prop - {String} CSS property name (e.g, "border-left-width").
     * asInt - {Boolean} return CSS property value as integer if true (defaults to
     *                   false).
     *
     * Returns:
     * {String} the CSS property value or null or 0.
     */
    getComputedStyle: function(el,prop,asInt) {
        var d= OpenLayers.getDoc();
        var v;
        if (el.currentStyle) {
            v= el.currentStyle[OpenLayers.String.camelize(prop)];
        } else if (d.defaultView.getComputedStyle) {
            var s= d.defaultView.getComputedStyle(el,null);
            if(s) {
                v= s.getPropertyValue(prop);
            }
        } else {
            v= null;
        }
        // See http://blog.stchur.com/2006/09/20/converting-to-pixels-with-javascript/2/
        var nonPixels= /(em|ex|pt|%)$/;
        var useWidth= /(width)/i;
        v= asInt?
            v?
                nonPixels.test(v)?
                    this.convertToPixels(v,useWidth.test(v),el.parentNode)
                :   parseInt(v) || 0
            :   0
        :   v;
        return v;
    },

    /**
     * Method: loadJS
     * Load a JS through the <script> tag.
     *
     * Parameters:
     * url - {String} hyper-link to the javascript resource.
     * id - {String} the script identifier.
     *      If none, use url value.
     * anchor - {String} id of the node where to insert the script node.
     *      If none, insertion occurs before the first script node found.
     * onloadClbk - {Function} optionnal callback for 'onload' event.
     *
     * Returns:
     * {Array({DOMElement}, {Boolean})} the <script> element, either created or found existing and
     * a flag indicating creation when true, otherwise found existing when false.
     */
    loadJS: function(url,id,anchor,onloadClbk) {
        id= id || url;
        var jsNode= OpenLayers.Util.getElement(id);
        if (jsNode!=null) {
            return [jsNode, false];
        }
        // check existing links for equivalent url
        var doc= OpenLayers.getDoc();
        var nodes= doc.getElementsByTagName('script'), n, n0;
        var i, l;
        for (i= 0, l= nodes.length; i<l; ++i) {
            if (OpenLayers.Util.isEquivalentUrl(nodes.item(i).src,url)) {
                nodes.item(i).setAttribute('id', id);
                return [nodes.item(i), false];
            }
        }
        nodes= doc.getElementsByTagName('head');
        var head= nodes.length>0? nodes[0] : doc.body;
        var anchorNode= anchor && anchor!=''? OpenLayers.Util.getElement(anchor): null;
        jsNode= doc.createElement('script');
        jsNode.setAttribute('type', 'text/javascript');
        jsNode.setAttribute('src', url);
        jsNode.setAttribute('charset', 'UTF-8');
        jsNode.setAttribute('id', id);
        if (onloadClbk!=undefined) {
            jsNode.onload= function() {
                if (jsNode.readyState && jsNode.readyState!='loaded' && jsNode.readyState!='complete') {
                    return;
                }
                jsNode.onreadystatechange= jsNode.onload= null;
                onloadClbk();
            };
            if (navigator.appName!='Opera') {
                jsNode.onreadystatechange= jsNode.onload;
            }
        }
        if (anchorNode!=null) {
            var anchorNode= OpenLayers.Util.getElement(anchor);
            OpenLayers.Element.insertAfter(jsNode,anchorNode);
        } else {
            nodes= head.childNodes;
            n0= null;
            for (i= nodes.length-1; i>=0; i--) {
                n= nodes[i];
                if (n.nodeType!=1) {
                    continue;
                }
                switch (n.tagName.toLowerCase()) {
                case 'script' :
                    if (n.getAttribute('type').toLowerCase()=='text/javascript') {
                        n0= n;
                    }
                    break;
                default     :
                    break;
                }
                if (n0!=null) {
                    break;
                }
            }
            if (n0==null) {
                head.appendChild(jsNode);
            } else {
                OpenLayers.Element.insertAfter(jsNode,n0);
            }
        }

        return [jsNode, true];
    },

    /**
     * Method: loadCSS
     * Load a CSS through the <link> tag.
     *
     * Parameters:
     * url - {String} hyper-reference to the css resource.
     * id - {String} the link identifier.
     *      If none, use url value.
     * anchor - {String} id of the node where to insert the link node.
     *      If none, insertion occurs before the first link/style node found.
     *      '' force appending to the head.
     *
     * Returns:
     * {Array({DOMElement}, {Boolean})} the <link> element, either created or found existing and
     * a flag indicating creation when true, otherwise found existing when false.
     */
    loadCSS: function(url,id,anchor) {
        id= id || url;
        var cssNode= OpenLayers.Util.getElement(id);
        if (cssNode!=null) {
            return [cssNode, false];
        }
        // check existing links for equivalent url
        var doc= OpenLayers.getDoc();
        var nodes= doc.getElementsByTagName('link'), n, n0;
        var i, l;
        for (i= 0, l= nodes.length; i<l; ++i) {
            if (OpenLayers.Util.isEquivalentUrl(nodes.item(i).href,url)) {
                nodes.item(i).setAttribute('id', id);
                return [nodes.item(i), false];
            }
        }
        nodes= doc.getElementsByTagName('head');
        var head= nodes.length>0? nodes[0] : doc.body;
        cssNode= doc.createElement('link');
        cssNode.setAttribute('rel', 'stylesheet');
        cssNode.setAttribute('type', 'text/css');
        cssNode.setAttribute('href', url);
        cssNode.setAttribute('id', id);
        if (anchor=='') {
            head.appendChild(cssNode);
            return [cssNode, true];
        }
        var anchorNode= anchor? OpenLayers.Util.getElement(anchor): null;
        if (anchorNode!=null) {
            OpenLayers.Element.insertAfter(cssNode,anchorNode);
            return [cssNode, true];
        }
        nodes= head.childNodes;
        n0= null;
        for (i= 0, l= nodes.length; i<l; i++) {
            n= nodes[i];
            if (n.nodeType!=1) {
                continue;
            }
            switch (n.tagName.toLowerCase()) {
            case 'link' :
                if (n.getAttribute('rel').toLowerCase()=='stylesheet' ||
                    n.getAttribute('type').toLowerCase()=='text/css') {
                    n0= n;
                }
                break;
            case 'style':
                n0= n;
                break;
            default     :
                break;
            }
            if (n0!=null) {
                break;
            }
        }
        if (n0==null) {
            head.appendChild(cssNode);
        } else {
            n0.parentNode.insertBefore(cssNode,n0);
        }

        return [cssNode, true];
    },

    /**
     * Function: cleanContent
     * Attempt to clean a HTML content as it comes from outside world !
     *      * remove html tag;
     *      * remove head content;
     *      * remove body tag;
     *      * comment script tag;
     *
     * Parameters:
     * content - {String}
     *
     * Returns:
     * {String}
     */
    cleanContent: function(content) {
        var s= content.replace(/[\r\n]?/gi,"");//one-line content
        s= s.replace(/<[\/]?html[^>]*>/gi,"");
        s= s.replace(/<head[^>]*>.*<\/head>/gi,"");
        s= s.replace(/<[\/]?body[^>]*>/gi,"");
        s= s.replace(/<script[^>]*>.*<\/script>/gi,"");
        return s;
    },

    /**
     * APIFunction: getMaxDimensions
     * Retrieve the maximum available width and height.
     *
     * Returns:
     * {OpenLayers.Size}
     */
    getMaxDimensions: function() {
        var w= 0, h= 0;
        var d= OpenLayers.getDoc();
        if (d.innerHeight>h) {
            w= d.innerWidth;
            h= d.innerHeight;
        }
        if (d.documentElement && d.documentElement.clientHeight>h) {
            w= d.documentElement.clientWidth;
            h= d.documentElement.clientHeight;
        }
        if (d.body && d.body.clientHeight>h) {
            w= d.body.clientWidth;
            h= d.body.clientHeight;
        }
        return new OpenLayers.Size(w, h);
    },

    /**
     * APIFunction: getCSSRule
     * Retrieve a CSS rule.
     *
     * Parameters:
     * ruleName - {String} the CSS rule name (e.g., ".xxx")
     *
     * Returns:
     * {Object} the rule or null if none found.
     */
    getCSSRule: function(ruleName) {
        ruleName= ruleName.toLowerCase();
        if (document.styleSheets) {
            for (var i= 0, l= document.styleSheets.length; i<l; i++) {
                var sS= document.styleSheets[i];
                var rs= [];
                for (var ks in {'rules':'', 'imports':'', 'cssRules':''}) {
                    try {
                        // The error, in FF, is caused by requesting the rules
                        // before ending the function.
                        rs= sS[ks];
                        if (rs!=undefined) {
                            for (var ii= 0, li= rs.length; ii<li; ii++) {
                                var r= rs[ii];
                                if (r && r.selectorText && r.selectorText.toLowerCase()==ruleName) {
                                    return r;
                                }
                            }
                        }
                        break;
                    } catch (e) {
                        //OpenLayers.Console.log(e);
                    }
                }
            }
        }
        return null;
    },

     /**
     * APIFunction: dmsToDeg
     * Convert a string representation of a sexagecimal degree into a numeric
     * representation of decimal degree.
     *
     * Parameters:
     * dms - {String} a sexagecimal value. The supported syntax is :
     *
     * (start code)
     *      \s?-?(\d{1,3})[.,°d]?\s?(\d{0,2})['′]?\s?(\d{0,2})[.,]?(\d{0,})(?:["″]|[']{2})?
     *      |
     *        \s?(\d{1,3})[.,°d]?\s?(\d{0,2})['′]?\s?(\d{0,2})[.,]?(\d{0,})(?:["″]|[']{2})?\s?([NSEW])?
     * (end)
     *
     * Returns:
     * {Number} the decimal value or Number.NaN if error occurs.
     */
    dmsToDeg: function(dms) {
        if (!dms) {
            return Number.NaN;
        }
        var neg= dms.match(/(^\s?-)|(\s?[SW]\s?$)/)!=null? -1.0 : 1.0;
        dms= dms.replace(/(^\s?-)|(\s?[NSEW]\s?)$/,'');
        dms= dms.replace(/\s/g,'');
        var parts= dms.match(/(\d{1,3})[.,°d]?(\d{0,2})['′]?(\d{0,2})[.,]?(\d{0,})(?:["″]|[']{2})?/);
        if (parts==null) {
            return Number.NaN;
        }
        // parts:
        // 0 : degree
        // 1 : degree
        // 2 : minutes
        // 3 : secondes
        // 4 : fractions of seconde
        var d= (parts[1]?         parts[1]  : '0.0')*1.0;
        var m= (parts[2]?         parts[2]  : '0.0')*1.0;
        var s= (parts[3]?         parts[3]  : '0.0')*1.0;
        var r= (parts[4]? ('0.' + parts[4]) : '0.0')*1.0;
        var dec= (d + (m/60.0) + (s/3600.0) + (r/3600.0))*neg;
        return dec;
    },

    /**
     * APIMethod: degToDMS
     * Convert decimal degrees number into sexagecimal degrees string.
     *
     * Parameters:
     * dec - {Number} decimal degrees
     * locals - {Array} the axis direction (N, S) or (E, W).
     *      If undefined, null or empty, the leading minus will prefix the
     *      decimal degrees string.
     * numDigits - {Number} number of figures in tenth of second.
     *      Default to *1*
     * format - {String} the format for rendering the sexagecimal degrees.
     *      Defaults to *%4d° %02d' %02d*
     *      The tenth of second are by default rendered using ".%0*d\"" in
     *      this case, otherwise they are rendered using "%0d".
     *
     * Returns:
     * {String} the sexagecimal value whose syntax conforms with
     *      <Geoportal.Util.dmsToDeg>() function.
     */
    degToDMS: function(dec, locals, numDigits, format) {
        var positive_degrees= Math.abs(dec);
        var degrees= Math.round(positive_degrees + 0.5) - 1;
        var decimal_part= 60*(positive_degrees - degrees);
        var minutes= Math.round(decimal_part + 0.5) - 1;
        decimal_part= 60*(decimal_part - minutes);
        var seconds= Math.round(decimal_part + 0.5) - 1;
        if (numDigits===undefined || numDigits<0) {
            numDigits= 1;
        }
        var k= Math.pow(10, numDigits);
        var remains= k * (decimal_part - seconds);
        remains= Math.round(remains + 0.5) - 1;
        if (remains>=k) {
            seconds= seconds+1;
            remains= 0;
        }
        if (seconds==60) {
            minutes= minutes+1;
            seconds= 0;
        }
        if (minutes==60) {
            degrees= degrees+1;
            minutes= 0;
        }
        var dir= '';
        if (locals && !format && (OpenLayers.Util.isArray(locals)) && locals.length==2) {
            dir= ' ' + (dec > 0 ? locals[0] : locals[1]);
        } else {
            if (dec<0) {
                degrees= -1*degrees;
            }
        }

        var dmsFmt= "%4d° %02d' %02d", tosFmt= '.%0*d"';
        if (format) {
            dmsFmt= format;
            tosFmt= '%0*d';
        }
        var s= OpenLayers.String.sprintf(dmsFmt, degrees, minutes, seconds) +
           (numDigits>0?
                OpenLayers.String.sprintf(tosFmt, numDigits, remains)
            :   (format?
                    "\""
                :   "")) +
           dir;
        return s;
    }

};


/**
 * Namespace: Geoportal.Cookies
 * Utility function for cookie handling.
 */
Geoportal.Cookies= {

    /**
     * Function: _get
     * Retrieve a cookie from the current document.
     *
     * Parameters:
     * key - {String} the cookie name.
     *
     * Returns:
     * {Object} the cookie components : name, value, path, domain, secure,
     *      null if not found.
     */
    _get: function(key) {
        var cs= OpenLayers.getDoc().cookie.split(';');
        var c= {
            'name':key,
            'value':null,
            'path':'',
            'domain':'',
            'ttl':0,
            'secure':false
        };
        for (var i= 0, l= cs.length; i<l; i++) {
            var nv= cs[i].split('=');
            var n= nv[0];
            var v= nv[1];
            if (OpenLayers.String.trim(n)===key) {
                c.value= decodeURIComponent(v);
               break;
            }
        }
        return (c.value===null? null : c);
    },

    /**
     * APIFunction: get
     * Retrieve a cookie from the current document.
     *
     * Parameters:
     * key - {String} the cookie name.
     * defaultValue - {String} optional default string returned if not retrieved.
     *
     * Returns:
     * {String} the cookie value.
     */
    get: function(key, defaultValue) {
        var c= Geoportal.Cookies._get(OpenLayers.String.trim(key));
        return (c? c.value : defaultValue);
    },

    /**
     * Function: expireDateToHours
     * Calculate the time to live from a Greenwich Mean Time.
     *
     * Parameters:
     * gmt - {String} GMT string.
     *
     * Returns:
     * {Number} hours remaining before expiration.
     */
    expireDateToHours: function(gmt) {
        var expires= new Date(gmt);
        if(isNaN(expires)) {
            return -1;
        }
        var now= new Date();
        var ttl= (expires.getTime() - now.getTime())/(60 * 60 * 1000);
        return ttl;
    },

    /**
     * APIFunction: set
     * Assign a cookie to the current document.
     *      If the cookie already exists, update it's value and max-age only.
     *
     * Parameters:
     * key - {String | Object} the key used to retrieve the cookie when
     * {String}, a cookie with relevant properties (See
     * <Geoportal.Cookies.get>).
     * content - {Object} the cookie content.
     *      May not be set.
     * ttl - {Number} the time to live in hours.
     *      When not set, expires when closing browser.
     * path - {String} path for which the cookie is effective.
     *      Defaults to *'/'*
     * domain - {String} internet address for which the cookie belongs to.
     *      Defaults to *location.hostname*
     * secure - {Boolean} Use with SSL.
     *      Default to *false*
     */
    set: function(key,content,ttl,path,domain,secure) {
        if (key==null) { return; }
        var cn= OpenLayers.String.trim(typeof(key)=='object'? key.name : key);
        var _c= Geoportal.Cookies._get(cn) || { name:'', value:null, ttl:0, path:'', domain:'', secure:false};
        var c;
        if (typeof(key)=='string') {
            c= {
                name:   cn,
                value:  typeof(content)==='undefined'?   _c.value || '' : content,
                ttl:    typeof(ttl)    ==='undefined'?   _c.ttl   || '' : ttl,
                path:   _c.path   || path     || '',
                domain: _c.domain || domain   || '',                              // FIXME: don't keep domain when setting cookie :
                secure: _c.secure || secure   || false
            };
        } else {
            c= {
                name:   cn,
                value:  typeof(key.value)==='undefined'? _c.value || '' : key.value,
                ttl:    typeof(key.ttl)  ==='undefined'? _c.ttl   || '' : key.ttl,
                path:   _c.path     || key.path   || '',
                domain: _c.domain   || key.domain || '',
                secure: _c.secure   || key.secure || false
            };
        }
        // Update existing cookie or set up a new one :
        OpenLayers.getDoc().cookie= Geoportal.Cookies.toString(c);
    },

    /**
     * APIFunction: remove
     * Make a cookie not any more effective.
     *      If path is set to something different from /, it prevents cookie
     *      deletion (FIXME).
     *
     * Parameters:
     * key - {String} the cookie name.
     */
    remove: function(key) {
        Geoportal.Cookies.set(key,'',-1);//one hour is the past
    },

    /**
     * APIFunction: toString
     * Stringify a cookie.
     *      FIXME: Setting a path up to a page under IE breaks the machine down.
     *
     * Parameters:
     * c - {Object} a cookie with relevant properties.
     *      See <Geoportal.Cookies.get>.
     * kd - {Boolean} keep domain property ?
     *      As setting domain cause the cookie not to be set (FIXME)
     *
     * Returns:
     * {String} cookie ready to be added to the current document.
     */
    toString: function(c,kd) {
        var _c= [];
        _c.push(c.name+'='+encodeURIComponent(''+c.value));//force toString() for value
        if (c.path) {
            _c.push('path='+c.path);
        }
        if (kd===true) {
            _c.push('domain='+(!c.domain? location.hostname:c.domain));
        }
        if (c.ttl && !isNaN(c.ttl)) {
            if (c.ttl<1) {
                _c.push("expires=Thu, 01-Jan-1970 00:00:01 GMT");
            } else {
                _c.push('max-age='+c.ttl*60*60);
            }
        }
        if (c.secure) {
            _c.push('secure');
        }
        var s= _c.join('; ');
        return s;
    },

    /**
     * APIFunction: cookiesEnabled
     * Checks if cookies are enabled.
     *
     * Returns:
     * {Boolean} true if cookies are enabled by the browser, false otherwise.
     */
    cookiesEnabled: function() {
        var ceo= {name: 'cookieEnabled', value: '1'};
        Geoportal.Cookies.set(ceo.name, ceo.value);
        var c= Geoportal.Cookies.get(ceo.name);
        var ce= !(c===undefined || c!=ceo.value);
        Geoportal.Cookies.remove(ceo.name);
        return ce;
    }

};
