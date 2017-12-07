/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license.
 */

/*
 * @requires OpenLayers/OverloadedOpenLayersMinimum.js
 */

/**
 * Header: Overloaded classes and methods (part II/III)
 *      OpenLayers extensions for the Geoportal standard API.
 */

/**
 * Function: __Geoportal$compatWrapperFunc
 * Monitor property change in Javascript Object.
 * See {<OpenLayers.UI>}
 *
 * Parameters:
 * propName - {String} the property being monitored
 * oldValue - {Object} the property's previous value
 * newValue - {Object} the property's new value
 */
var __Geoportal$compatWrapperFunc= function (propName, oldValue, newValue) {
    OpenLayers.Console.log(this.CLASS_NAME+', property '+propName+' changed from ['+oldValue+'] to ['+newValue+']');
    var ui= this.getUI();
    switch(propName) {
    case 'allowSelection':
        if (ui) {
            ui.setSelectable(!newValue);
        }
        break;
    default              :
        if (ui) {
            ui[propName]= newValue;
        }
        break;
    }
};

/**
 * Namespace: OpenLayers
 * IGNF: use different script names for loading OpenLayers
 */

    /**
     * Property: ProxyHostFQDN
     * Fully Qualified Domain Name of proxy host url. It also
     * contains the port.
     *  IGNF: _addition_
     */
    OpenLayers.ProxyHostFQDN= null;

    /**
     * Method: _getScriptLocation
     * Return the path to this script. This is also implemented in
     * OpenLayers.js
     *  IGNF: use different script names
     *
     * Returns:
     * {String} Path to this script
     */
    OpenLayers._getScriptLocation= (function() {
        /**
         * Search the script according to the regular expression
         * Returns the script's path or "" if none found.
         */
        var sl= function(r) {
            var s = OpenLayers.getDoc().documentElement.getElementsByTagName('script'),
                src, m, l = "";
            for(var i=0, len=s.length; i<len; i++) {
                src = s[i].getAttribute('src');
                if(src) {
                    var m = src.match(r);
                    if(m) {
                        l = m[1];
                        break;
                    }
                }
            }
            return l;
        };
        // FIXME: generalize this (array of path ?)
        //uncompressed:
        var r = new RegExp("(^|(.*?\\/))((lib\/OpenLayers\/SingleFile)\\.js)(\\?|$)");
        var l = sl(r);
        if (l==="") {
            //compressed:
            r = new RegExp("(^|(.*?\\/))((Geoportal(Gouv|Flash|Mobile|Standard|Extended)?)\\.js)(\\?|$)");
            l = sl(r);
        }
        return (function() { return l; });
    })();

/**
 * Namespace: Proj4js
 * IGNF: _change according to OpenLayers_
 */
if (Proj4js) {

    /**
     * Method: Proj4js.getScriptLocation
     * Return the path to PROJ4JS script.
     *
     * Returns:
     * {String} Path to this script
     */
    Proj4js.getScriptLocation= (function() {
        /**
         * Search the script according to the regular expression
         * Returns the script's path or "" if none found.
         */
        var sl= function(r) {
            var s = OpenLayers.getDoc().documentElement.getElementsByTagName('script'),
                src, m, l = "";
            for(var i=0, len=s.length; i<len; i++) {
                src = s[i].getAttribute('src');
                if(src) {
                    var m = src.match(r);
                    if(m) {
                        l = m[1];
                        break;
                    }
                }
            }
            return l;
        };
        // FIXME: generalize this (array of path ?)
        //uncompressed:
        var r = new RegExp("(^|(.*?\\/))((lib\/proj4js)\\.js)(\\?|$)");
        var l = sl(r);
        if (l==="") {
            //compressed:
            r = new RegExp("(^|(.*?\\/))((Geoportal(Gouv|Flash|Mobile|Standard|Extended)?)\\.js)(\\?|$)");
            l = sl(r);
        } else {
            // add lib:
            l+="lib/";
        }
        return (function() { return l; });
    })();

}

/**
 * Namespace: OpenLayers.Class
 * IGNF: add a function to create object with an array of arguments.
 */

    /**
     * APIFunction: newObject
     * Create an object using an OpenLayers class and an array of arguments.
     * > var ll= OpenLayers.Class.newObject(OpenLayers.LonLat,[0,0]);
     *
     * IGNF: _addition_
     *
     * Parameters:
     * clazz - {<OpenLayers.Class at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Class-js.html>} a constructor.
     * args - {Array({<Object>})} an array of arguments.
     *
     * Returns:
     * {Object} a newly created object.
     */
    OpenLayers.Class.newObject= function(clazz, args) {
        function C() {
            return clazz.prototype.initialize.apply(this, args);
        }
        C.prototype= clazz.prototype;
        return new C();
    };

    /**
     * APIFunction: getClass
     * Return the Javascript object or function that implements a class.
     *
     * (code)
     * var fc= OpenLayers.Class.getClass('OpenLayers.Format.XML');
     * if (f) {
     *      var f= new fc();
     *      //use f
     * }
     * (end)
     *
     * Parameters:
     * clName - {String} the class' name as found in CLASS_NAME property in
     * OpenLayers coding rules.
     *
     * Returns:
     * {Object|Function} the OpenLayers class or undefined if not found.
     */
    OpenLayers.Class.getClass= function(clName) {
        var clazz;
        try {
            clazz= eval(clName);
        } catch (e) {
            clazz= undefined;
        }
        return typeof(clazz)=='undefined'? undefined : clazz;
    };

    /**
     * APIFunction: watchObject
     * Allow to detect when an object's property has changed.
     *
     * See http://james.padolsey.com/javascript/monitoring-dom-properties
     * See http://blog.hydroprofessional.com/?p=84 (for better code, but
     * more complex)
     *
     * Parameters:
     * obj - {Object} the object to watch
     * prop - {String} the object's property to monitor
     * callback - {Function} the function to call when the property's
     * value has changed.
     *
     * Returns:
     * {Object} the object being watched
     */
    OpenLayers.Class.watchObject= function(obj, prop, callback) {
        if (!obj) { return; }
        if (!prop) { return; }
        if (obj[prop]===undefined) { return; }
        if (typeof(callback)!='function') { return; }

        if (!obj.__watchTimers) {
            obj.__watchTimers= {};
        } else {
            for (var p in obj.__watchTimers) {
                window.clearInterval(obj.__watchTimers[p]);
                obj.__watchTimers[p]= null;
            }
        }
        obj.__watchTimers[prop]= null;
        for (var p in obj.__watchTimers) {
            var ov= obj[p];
            (function(o,v,p) {
                o.__watchTimers[p]= setInterval(function() {
                    if (v!=o[p]) {
                        callback.call(o,p,v,o[p]);
                        v= o[p];
                    }
                },200);
            })(obj,ov,p);
        }
        return obj;
    };

    /**
     * APIFunction: unwatchObject
     * Release object's property change detection.
     *
     * Parameters:
     * obj - {Object} the object to unwatch
     * prop - {String} the object's property to stop monitoring. When not
     * defined, all currently watching properties are released.
     */
    OpenLayers.Class.unwatchObject= function(obj, prop) {
        if (!obj) { return; }
        if (!obj.__watchTimers) {
            return;
        }
        if (!prop) {
            for (var p in obj.__watchTimers) {
                OpenLayers.Class.unwatchObject(obj,p);
            }
            return;
        }
        if (obj[prop]===undefined) { return; }
        if (obj.__watchTimers[prop]===undefined) { return; }
        if (obj.__watchTimers[prop]!==null) {
            OpenLayers.Console.log('unwatching '+prop);
            window.clearInterval(obj.__watchTimers[prop]);
        }
        delete obj.__watchTimers[prop];
    };

/**
 * Header: Overloaded classes and methods (part II/III)
 *      OpenLayers extensions for the Geoportal standard API.
 */
if (OpenLayers.String) {

    /**
     * Method: preg_replace
     * Apply an array of regular expressions on a given string for replacing
     * them by given values.
     *      IGNF: _addition_
     *
     * Parameters:
     * s - {String}
     * patterns - {Array({String | RegExp})}
     * rpatterns - {Array({String})}
     *
     * Returns:
     * {String} the resulting string.
     */
    OpenLayers.String.preg_replace= function(s, patterns, rpatterns) {
        var ns= new String(s);
        for (var i= 0, l= patterns.length; i<l; i++) {
            if (patterns[i] && (patterns[i] instanceof String)) {
                patterns[i]= new RegExp(patterns[i], 'g');
            }
            var re= patterns[i];
            var v= rpatterns[i];
            ns= ns.replace(re, val);
        }
        return ns;
    };

    /**
     * Method: stripAccentedLetters
     * Remove accented letters from a string.
     *  IGNF: _addition_
     *
     * Parameters:
     * s - {String} the string where to remove accented letters.
     *
     * Returns:
     * {String} a new String without accented letters.
     */
    OpenLayers.String.stripAccentedLetters= (function() {
        var accentsReg= /[ÀÁÂÃÄÅÆàáâãäåæÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšÞþßŸÿýŽž]/g;
        var accentsMap= {
            'À':'A', 'Á':'A', 'Â':'A', 'Ã':'A', 'Ä':'A', 'Å':'A', 'Æ':'A',
            'à':'a', 'á':'a', 'â':'a', 'ã':'a', 'ä':'a', 'å':'a', 'æ':'a',
            'Ò':'O', 'Ó':'O', 'Ô':'O', 'Õ':'O', 'Õ':'O', 'Ö':'O', 'Ø':'O',
            'ò':'o', 'ó':'o', 'ô':'o', 'õ':'o', 'ö':'o', 'ø':'o',
            'œ': 'oe',
            'È':'E', 'É':'E', 'Ê':'E', 'Ë':'E',
            'è':'e', 'é':'e', 'ê':'e', 'ë':'e', 'ð':'e',
            'Ç':'C',
            'ç':'c',
            'Ð':'D',
            'Ì':'I', 'Í':'I', 'Î':'I', 'Ï':'I',
            'ì':'i', 'í':'i', 'î':'i', 'ï':'i',
            'Ù':'U', 'Ú':'U', 'Û':'U', 'Ü':'U',
            'ù':'u', 'ú':'u', 'û':'u', 'ü':'u',
            'Ñ':'n',
            'ñ':'n',
            'Š':'S',
            'š':'s',
            'Þ':'b',
            'þ':'b',
            'ß':'s',//FIXME: 'ss'
            'Ÿ':'Y',
            'ÿ':'y', 'ý':'y',
            'Ž':'Z',
            'ž':'z'
        };
        return function(s) {
            if (s) {
                return s.replace(accentsReg, function(match) {
                    return accentsMap[match];
                });
            }
            return s;
        }
    })();

    // Implementation of sprintf for Javascript :
    // See http://hexmen.com/blog/2007/03/printf-sprintf/ for original work :
    /**
     * License :
     *  This code is unrestricted: you are free to use it however you like.
     */

    /**
     * Namespace: OpenLayers.String
     *
     * APIMethod: sprintf
     * Formatting output function, Perl's sprintf based,
     * handling padding, truncation, floating-point numbers, left/right
     * alignment and re-ordered arguments functionalities.
     * Caveats: as noticed on the Ash Searle's blog
     * - Safari has some bizarre behaviour with Maths.abs(0).toFixed(6)
     *   resulting in "0.0000-0" instead of "0.000000";
     * - numbers are rounded off inconsistently across browsers.
     * - See also :
     *   http://hexmen.com/code/toFixed.js
     *   http://hexmen.com/code/toPrecision.js
     *   http://hexmen.com/code/toExponential.js
     *   http://hexmen.com/code/replace.js
     *
     * See http://perldoc.perl.org/functions/sprintf.html
     *
     * IGNF: _addition_
     *
     * Returns:
     * {String}
     */
    OpenLayers.String.sprintf= function ( ) {
        function pad(str, len, chr, leftJustify) {
            var padding = (str.length >= len) ? '' : Array(1 + len - str.length >>> 0).join(chr);
            return leftJustify ? str + padding : padding + str;
        }

        function justify(value, prefix, leftJustify, minWidth, zeroPad) {
            var diff = minWidth - value.length;
            if (diff > 0) {
                if (leftJustify || !zeroPad) {
                    value = pad(value, minWidth, ' ', leftJustify);
                } else {
                    value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
                }
            }
            return value;
        }

        function formatBaseX(value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
            // Note: casts negative numbers to positive ones
            var number = value >>> 0;
            prefix = prefix && number && {'2': '0b', '8': '0', '16': '0x'}[base] || '';
            value = prefix + pad(number.toString(base), precision || 0, '0', false);
            return justify(value, prefix, leftJustify, minWidth, zeroPad);
        }

        function formatString(value, leftJustify, minWidth, precision, zeroPad) {
            if (precision != null) {
                value = value.slice(0, precision);
            }
            return justify(value, '', leftJustify, minWidth, zeroPad);
        }

        var a = arguments, i = 0, format = a[i++];
        return format.replace(
            OpenLayers.String.sprintf.regex,
            function(substring, valueIndex, flags, minWidth, _, precision, type) {
                if (substring == '%%') return '%';
                // parse flags
                var leftJustify = false, positivePrefix = '', zeroPad = false, prefixBaseX = false;
                for (var j = 0; flags && j < flags.length; j++) switch (flags.charAt(j)) {
                    case ' ': positivePrefix = ' '; break;
                    case '+': positivePrefix = '+'; break;
                    case '-': leftJustify = true; break;
                    case '0': zeroPad = true; break;
                    case '#': prefixBaseX = true; break;
                }
                // parameters may be null, undefined, empty-string or real valued
                // we want to ignore null, undefined and empty-string values
                if (!minWidth) {
                    minWidth = 0;
                } else if (minWidth == '*') {
                    minWidth = +a[i++];
                } else if (minWidth.charAt(0) == '*') {
                    minWidth = +a[minWidth.slice(1, -1)];
                } else {
                    minWidth = +minWidth;
                }
                // Note: undocumented perl feature:
                if (minWidth < 0) {
                    minWidth = -minWidth;
                    leftJustify = true;
                }
                if (!isFinite(minWidth)) {
                    throw new Error('sprintf: (minimum-)width must be finite');
                }
                if (!precision) {
                    precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type == 'd') ? 0 : void(0);
                } else if (precision == '*') {
                    precision = +a[i++];
                } else if (precision.charAt(0) == '*') {
                    precision = +a[precision.slice(1, -1)];
                } else {
                    precision = +precision;
                }
                // grab value using valueIndex if required?
                var value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];
                switch (type) {
                    case 's':
                        return formatString(String(value), leftJustify, minWidth, precision, zeroPad);
                    case 'c':
                        return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
                    case 'b':
                        return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                    case 'o':
                        return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                    case 'x':
                        return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                    case 'X':
                        return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
                    case 'u':
                        return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                    case 'i':
                    case 'd': {
                        var number = parseInt(+value);
                        var prefix = number < 0 ? '-' : positivePrefix;
                        value = prefix + pad(String(Math.abs(number)), precision, '0', false);
                        return justify(value, prefix, leftJustify, minWidth, zeroPad);
                    }
                    case 'e':
                    case 'E':
                    case 'f':
                    case 'F':
                    case 'g':
                    case 'G': {
                        var number = +value;
                        var prefix = number < 0 ? '-' : positivePrefix;
                        var method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
                        var textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
                        value = prefix + Math.abs(number)[method](precision);
                        return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
                    }
                    default:
                        return substring;
                }
            }
        );
    };

    OpenLayers.String.sprintf.regex= /%%|%(\d+\$)?([-+#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuidfegEG])/g;

}

/**
 * Namespace: OpenLayers.Element
 * See http://www.quirksmode.org/dom/w3c_core.html
 */

    /**
     * ====================================================================
     * About Sarissa: http://dev.abiss.gr/sarissa
     * ====================================================================
     * Sarissa is an ECMAScript library acting as a cross-browser wrapper for native XML APIs.
     * The library supports Gecko based browsers like Mozilla and Firefox,
     * Internet Explorer (5.5+ with MSXML3.0+), Konqueror, Safari and Opera
     * @version 0.9.9.4
     * @author: Copyright 2004-2008 Emmanouil Batsis, mailto: mbatsis at users full stop sourceforge full stop net
     * ====================================================================
     * Licence
     * ====================================================================
     * Sarissa is free software distributed under the GNU GPL version 2 (see <a href="gpl.txt">gpl.txt</a>) or higher,
     * GNU LGPL version 2.1 (see <a href="lgpl.txt">lgpl.txt</a>) or higher and Apache Software License 2.0 or higher
     * (see <a href="asl.txt">asl.txt</a>). This means you can choose one of the three and use that if you like. If
     * you make modifications under the ASL, i would appreciate it if you submitted those.
     * In case your copy of Sarissa does not include the license texts, you may find
     * them online in various formats at <a href="http://www.gnu.org">http://www.gnu.org</a> and
     * <a href="http://www.apache.org">http://www.apache.org</a>.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
     * KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
     * WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE
     * AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
     * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
     * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
     * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
     */
    if (!window.Node || !Node.ELEMENT_NODE) {
        Node= {
            ELEMENT_NODE: 1,
            ATTRIBUTE_NODE: 2,
            TEXT_NODE: 3,
            CDATA_SECTION_NODE: 4,
            ENTITY_REFERENCE_NODE: 5,
            ENTITY_NODE: 6,
            PROCESSING_INSTRUCTION_NODE: 7,
            COMMENT_NODE: 8,
            DOCUMENT_NODE: 9,
            DOCUMENT_TYPE_NODE: 10,
            DOCUMENT_FRAGMENT_NODE: 11,
            NOTATION_NODE: 12
        };
    };

if (OpenLayers.Element) {

    /**
     * APIFunction: getElementsByTagName
     * Finds all nodes, children of the given node, named after the tag's
     * name.
     *      Derived from http://www.cross-browser.com/x/lib/view.php?s=xGetElementsByTagName
     *      Copyright (c) 2000-2010 Michael Foster
     *      Javascript distributed under the terms of the GNU LGPL
     *      (http://www.cross-browser.com/license.html)
     *
     * IGNF: _addition_
     *
     * Parameters:
     * tag - {String} the tag name to search.
     * node - {DOMElement} the parent node for where to start searching.
     *
     * Returns:
     * {Array({DOMElement})} Empty if none found.
     */
    OpenLayers.Element.getElementsByTagName= function(tag, node) {
        var nodes= null;
        if (!node) { node= OpenLayers.getDoc(); }
        if (typeof(node.getElementsByTagName)!= 'undefined') {
            nodes= node.getElementsByTagName(tag);
            if (tag=='*' && (!nodes || !nodes.length)) nodes= node.all; // IE5 '*' bug
        } else {
            // IE4 object model
            if (tag=='*') {
                nodes= node.all;
            } else {
                if (node.all && node.all.tags) {
                    nodes= nodes.all.tags(t);
                }
            }
        }
        return nodes || [];
    };

    /**
     * APIFunction: getElementsByClassName
     * Finds all nodes, children of the given node, having the given class
     * name as CSS.
     *      Derived from http://www.cross-browser.com/x/lib/view.php?s=xGetElementsByClassName
     *      Copyright (c) 2000-2010 Michael Foster
     *      Javascript distributed under the terms of the GNU LGPL
     *      (http://www.cross-browser.com/license.html)
     *
     * IGNF: _addition_
     *
     * Parameters:
     * classNames - {String} the class names to search (space separated).
     * tag - {String} the tag name to search.
     * node - {DOMElement} the parent node for where to start searching.
     *
     * Returns:
     * {Array({DOMElement})} Empty if none found.
     */
    OpenLayers.Element.getElementsByClassName= function(classNames, tag, node) {
        var hasGetElementsByClassNameFunc= function(classNames, tag, node) {
            var elements= node.getElementsByClassName(classNames);
            return elements || [];
        };
        var hasDocumentEvaluateFunc= function(cs, tag, node) {
            var elements= [];
            var xpExpr= "";
            for (var i= 0, l= cs.length; i<l; i++) {
                xpExpr+= "[contains(concat(' ', @class, ' '), ' "+cs[i]+" ')]";
            }
            var x= [];
            try {
                x= OpenLayers.getDoc().evaluate(".//"+tag+xpExpr,node,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
            } catch (e) {
                return null;
            }
            for (var i= 0, l= x.length; i<l; i++) {
                elements[elements.length]= x.snapshotItem(i);
            }
            return elements || [];
        };
        var defaultFunc= function(cs, tag, node) {
            var elements= [];
            for (var i= 0, l= cs.length; i<l; i++) {
                var re= new RegExp("\\b"+ cs[i].replace(/([(){}|*+?.,^$\[\]\\])/g, "\\\$1") + "\\b");
                var x= OpenLayers.Element.getElementsByTagName(tag, node);
                for (var j= 0, n= x.length; j<n; j++) {
                    if (re.test(x[j].className)) {
                        elements[elements.length]= x[j];
                    }
                }
            }
            return elements || [];
        };

        if (!node) { node= OpenLayers.getDoc(); }
        if (!tag) { tag= '*'; }
        if (!classNames) { return []; }
        if (node.getElementsByClassName) {
            return hasGetElementsByClassNameFunc(classNames,tag,node);
        }
        var elements= null;
        var cs= classNames.split(' ');
        if (OpenLayers.getDoc().evaluate) { // Firefox, Opera and Safari, Chrome ?
            elements= hasDocumentEvaluateFunc(cs,tag,node);
        }
        if (!elements) {
            elements= defaultFunc(cs,tag,node);
        }
        return elements || [];
    };

    /**
     * APIFunction: importNode
     * Clone a node that belongs to a different document than the target
     * document. Only ELEMENT_NODE, TEXT_NODE, CDATA_SECTION_NODE and
     * COMMENT_NODE are supported.
     *
     * IGNF: _addition_
     *
     * Parameters:
     * doc - {DOMElement} the target document.
     * externalNode - {DOMElement} the node to clone.
     * deepCopy - {Boolean} indicator of cloning inner nodes and attributes.
     *
     * Returns:
     * {DOMElement} the cloned node or null if not possible.
     */
    OpenLayers.Element.importNode= function(doc, externalNode, deepCopy) {
        if (doc.importNode) {
            // FF, Opera, Safari, Chrome :
            return doc.importNode(externalNode, deepCopy);
        }
        // IE
        var clonedNode= null, vmlNode= null, detached= false;
        // FIXME: should be a constant of OpenLayers.Renderer.VML :
        var shapes= ['shape','rect', 'oval', 'fill', 'stroke', 'imagedata', 'group','textbox'];
        switch (externalNode.nodeType) {
        case Node.ELEMENT_NODE:
            // FIXME: VML nodes are not properly copied ...
            if (deepCopy && externalNode.tagName && OpenLayers.Util.indexOf(shapes,externalNode.tagName)!=-1) {
                // VML node: detach it from the source document to get access all attributes :
                if (externalNode.__detached!==true) {//not yet detached
                    //OpenLayers.Console.log('===== detaching');
                    vmlNode= externalNode.ownerDocument.createElement('div');//dummy node
                    vmlNode.id= 'dummy_'+externalNode.id;
                    externalNode.parentNode.insertBefore(vmlNode,externalNode);
                    externalNode.parentNode.removeChild(externalNode);
                    externalNode.__detached= true;
                }
                detached= true;
                clonedNode= doc.createElement(externalNode.scopeName+':'+externalNode.tagName);
            } else {
                clonedNode= doc.createElement(externalNode.nodeName);
            }

            /* does the node have any attributes to add? */
            if (externalNode.attributes && externalNode.attributes.length>0) {
                for (var i= 0, il= externalNode.attributes.length; i<il; i++) {
                    var att= externalNode.attributes[i];
                    if (detached===true && att.nodeName==='__detached') { continue; }
                    clonedNode.setAttribute(att.nodeName, externalNode.getAttribute(att.nodeName));
                }
            }
            /* are we going after children too, and does the node have any? */
            if (deepCopy && externalNode.childNodes && externalNode.childNodes.length>0) {
                for (var i= 0, il= externalNode.childNodes.length; i<il; i++) {
                    var node= externalNode.childNodes[i];
                    if (detached===true) {
                        node.__detached= true;
                    }
                    clonedNode.appendChild(OpenLayers.Element.importNode(doc, node, deepCopy));
                    if (detached===true) {
                        node.removeAttribute('__detached');
                    }
                }
            }

            if (vmlNode) {
                // insert node back ...
                externalNode.removeAttribute('__detached');
                vmlNode.parentNode.insertBefore(externalNode,vmlNode);
                vmlNode.parentNode.removeChild(vmlNode);
                vmlNode= null;
            }
            break;
        case Node.TEXT_NODE:
        case Node.CDATA_SECTION_NODE:
            clonedNode= doc.createTextNode(externalNode.nodeValue);
            break;
        case Node.COMMENT_NODE:
            clonedNode= doc.createCommentNode(externalNode.nodeValue);
            break;
        default:
            OpenLayers.Console.error('OpenLayers.Element.importNode: unsupported '+externalNode.nodeType+'=['+externalNode.innerHTML+']');
            break;
        }
        return clonedNode;
    };

    /**
     * APIFunction: getStyle
     * IGNF: _aware of the current document_.
     *
     * Parameters:
     * element - {DOMElement}
     * style - {?}
     *
     * Returns:
     * {?}
     */
    OpenLayers.Element.getStyle= function(element, style) {
        element = OpenLayers.Util.getElement(element);

        var value = null;
        if (element && element.style) {
            value = element.style[OpenLayers.String.camelize(style)];
            if (!value) {
                if (element.ownerDocument.defaultView &&
                    element.ownerDocument.defaultView.getComputedStyle) {

                    var css = element.ownerDocument.defaultView.getComputedStyle(element, null);
                    value = css ? css.getPropertyValue(style) : null;
                } else if (element.currentStyle) {
                    value = element.currentStyle[OpenLayers.String.camelize(style)];
                }
            }

            var positions = ['left', 'top', 'right', 'bottom'];
            if (window.opera &&
                (OpenLayers.Util.indexOf(positions,style) != -1) &&
                (OpenLayers.Element.getStyle(element, 'position') == 'static')) {
                value = 'auto';
            }
        }

        return value == 'auto' ? null : value;
    };

    /**
     * Function: insertAfter
     * Insert a DOM node after a DOM node.
     *      IGNF: _addition_
     *
     * Parameters:
     * node - {DOMElement} the node to insert.
     * after - {DOMElement} the node after which the insertion is to be done.
     *
     * Returns:
     * {DOMElement} the inserted node or null when error.
     */
    OpenLayers.Element.insertAfter= function(node, after) {
        if (!after) {
            return null;
        }
        if (after.nextSibling) {
            return after.parentNode.insertBefore(node,after.nextSibling);
        }
        return after.parentNode.appendChild(node);
    };

    /**
     * Function: addCss
     * Insert a style node into the HEAD node.
     *      IGNF: _addition_
     *
     * Parameters:
     * code - {String} the definition to add (one per style node).
     *
     * Returns:
     * {DOMElement} the inserted node or null when error.
     */
    OpenLayers.Element.addCss= function(code) {
        var sNode= OpenLayers.getDoc().createElement("style");
        sNode.setAttribute('type', 'text/css');
        if (sNode.styleSheet) {
            sNode.styleSheet.cssText= code;
        } else {
            sNode.appendChild(OpenLayers.getDoc().createTextNode(code));
        }
        try {
            OpenLayers.getDoc().getElementsByTagName("head")[0].appendChild(sNode);
            return sNode;
        } catch (e) {
            return null;
        }
    };

}

/**
 * Namespace: OpenLayers.Lang
 * IGNF: adds translation to olControlDragPan.title, olControlZoomBox.title,
 * olControlZoomToMaxExtent.title, and XMLHTTPRequest messages.
 */

    /**
     * Namespace: OpenLayers.Lang["en"]
     * IGNF: _addition of messages not put in OpenLayers.Lang namespace_
     */
    OpenLayers.Util.extend(OpenLayers.Lang.en, {
        'olControlDragPan.title': 'Pan',
        'olControlZoomBox.title': 'Zoom in',
        'olControlZoomToMaxExtent.title': 'Zoom to max extent',
        'Document contains no parsing errors': 'Document contains no parsing errors',
        'Document is empty': 'Document is empty',
        'Not well-formed or other error': 'Not well-formed or other error',
        'xml.parse.error': "XML Parsing Error: ${reason}\nLocation: ${url}\nLine Number ${line}, Column ${linepos}:\n ${srcText}\n",
        'xml.setattributens': "setAttributeNS not implemented",
        'graticule': 'Graticule',
        'uiNotSupported': 'None of the declared User Interfaces is supported.  Currently declared User Interfaces are :\n${uis}',
        'wmc.version.not.supported': "Can't find a WMC parser for version ${v}"
    });

    /**
     * Namespace: OpenLayers.Lang["de"]
     * IGNF: _addition of messages not put in OpenLayers.Lang namespace_
     */
    OpenLayers.Util.extend(OpenLayers.Lang.de, {
        'olControlDragPan.title': OpenLayers.Lang.en['olControlDragPan.title'],
        'olControlZoomBox.title': OpenLayers.Lang.en['olControlZoomBox.title'],
        'olControlZoomToMaxExtent.title': OpenLayers.Lang.en['olControlZoomToMaxExtent.title'],
        'Document contains no parsing errors': OpenLayers.Lang.en['Document contains no parsing errors'],
        'Document is empty': OpenLayers.Lang.en['Document is empty'],
        'Not well-formed or other error': OpenLayers.Lang.en['Not well-formed or other error'],
        'xml.parse.error': OpenLayers.Lang.en['xml.parse.error'],
        'xml.setattributens': OpenLayers.Lang.en['xml.setattributens'],
        'graticule': 'Geografische Koordinaten',
        'uiNotSupported': 'Keine der angegebenen User Interfaces unterstützt.  Derzeit erklärte User Interfaces sind :\n${uis}',
        'wmc.version.not.supported': "Kann nicht finden eine WMC-Parser für Version ${v}"
    });

    /**
     * Namespace: OpenLayers.Lang["es"]
     * IGNF: _addition of messages not put in OpenLayers.Lang namespace_
     */
    OpenLayers.Util.extend(OpenLayers.Lang.es, {
        'olControlDragPan.title': OpenLayers.Lang.en['olControlDragPan.title'],
        'olControlZoomBox.title': OpenLayers.Lang.en['olControlZoomBox.title'],
        'olControlZoomToMaxExtent.title': OpenLayers.Lang.en['olControlZoomToMaxExtent.title'],
        'Document contains no parsing errors': OpenLayers.Lang.en['Document contains no parsing errors'],
        'Document is empty': OpenLayers.Lang.en['Document is empty'],
        'Not well-formed or other error': OpenLayers.Lang.en['Not well-formed or other error'],
        'xml.parse.error': OpenLayers.Lang.en['xml.parse.error'],
        'xml.setattributens': OpenLayers.Lang.en['xml.setattributens'],
        'graticule': 'Coordenadas geográficas',
        'uiNotSupported': 'Ninguna de las interfaces de usuario con el apoyo declarado. Actualmente declaró interfaces de usuario son los siguientes :\n${uis}',
        'wmc.version.not.supported': "No se puede encontrar un programa de análisis de la versión ${v} de WMC"
    });

    /**
     * Namespace: OpenLayers.Lang["fr"]
     * IGNF: _addition of messages not put in OpenLayers.Lang namespace_
     */
    OpenLayers.Util.extend(OpenLayers.Lang.fr, {
        'olControlDragPan.title': "Déplacer le fond de carte",
        'olControlZoomBox.title': "Se rapprocher",
        'olControlZoomToMaxExtent.title': "Voir l'emprise totale",
        'Document contains no parsing errors': "Le document ne contient aucune erreur d'analyse",
        'Document is empty': "Le document est vide",
        'Not well-formed or other error': "Le document n'est pas bien formé ou une autre erreur s'est produite",
        'xml.parse.error': "Erreur d'analyse XML : ${reason}\nLocalisation : ${url}\nNuméro de ligne ${line}, colonne ${linepos} :\n ${srcText}\n",
        'xml.setattributens': "setAttributeNS n'est pas implementé",
        'graticule': 'Repères géographiques',
        'uiNotSupported': "Aucune Interface Utilisateur déclarée n'est pas supportée. Les interfaces déclarées sont :\n${uis}",
        'wmc.version.not.supported': "Impossible de trouver un analyseur pour la version ${v} de WMC"
    });

    /**
     * Namespace: OpenLayers.Lang["it"]
     * IGNF: _addition of messages not put in OpenLayers.Lang namespace_
     */
    OpenLayers.Util.extend(OpenLayers.Lang.it, {
        'olControlDragPan.title': OpenLayers.Lang.en['olControlDragPan.title'],
        'olControlZoomBox.title': OpenLayers.Lang.en['olControlZoomBox.title'],
        'olControlZoomToMaxExtent.title': OpenLayers.Lang.en['olControlZoomToMaxExtent.title'],
        'Document contains no parsing errors': OpenLayers.Lang.en['Document contains no parsing errors'],
        'Document is empty': OpenLayers.Lang.en['Document is empty'],
        'Not well-formed or other error': OpenLayers.Lang.en['Not well-formed or other error'],
        'xml.parse.error': OpenLayers.Lang.en['xml.parse.error'],
        'xml.setattributens': OpenLayers.Lang.en['xml.setattributens'],
        'graticule': 'Coordinate geografiche',
        'uiNotSupported': 'Nessuna delle interfacce utente dichiarato è supportato. Interfacce utente attualmente dichiarati sono :\n${uis}',
        'wmc.version.not.supported': "Impossibile trovare un parser WMC per la versione ${v}"
    });

/**
 * Namespace: OpenLayers.Util
 * IGNF: mainly use of <OpenLayers.getDoc()>
 */

    /**
     * Property:
     * Set OpenLayers.Util.PRECISION to 0 (compatibility with OpenLayers < 2.8
     * cause using new value (14) cause problems when comparing bounds
     * (stricly equals) : the bounds to compare with is rounded and not the
     * bounds itself (IGNF: _set to 0_)!
     */
    OpenLayers.Util.DEFAULT_PRECISION= 0;

    /**
     * Function: getElement
     * This is the old $() from prototype.
     * IGNF: _aware of the current document_.
     */
    OpenLayers.Util.getElement = function() {
        var elements = [];

        for (var i=0, len=arguments.length; i<len; i++) {
            var element = arguments[i];
            if (typeof element == 'string') {
                element = OpenLayers.getDoc().getElementById(element);
            }
            if (arguments.length == 1) {
                return element;
            }
            elements.push(element);
        }
        return elements;
    };

    /**
     * Function: createDiv
     * Creates a new div and optionally set some standard attributes.
     * Null may be passed to each parameter if you do not wish to
     * set a particular attribute.
     * Note - zIndex is NOT set on the resulting div.
     * IGNF: _aware of the current document_.
     *
     * Parameters:
     * id - {String} An identifier for this element.  If no id is
     *               passed an identifier will be created
     *               automatically.
     * px - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} The element left and top position.
     * sz - {<OpenLayers.Size at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Size-js.html>} The element width and height.
     * imgURL - {String} A url pointing to an image to use as a
     *                   background image.
     * position - {String} The style.position value. eg: absolute,
     *                     relative etc.
     * border - {String} The the style.border value.
     *                   eg: 2px solid black
     * overflow - {String} The style.overflow value. Eg. hidden
     * opacity - {Float} Fractional value (0.0 - 1.0)
     *
     * Returns:
     * {DOMElement} A DOM Div created with the specified attributes.
     */
    OpenLayers.Util.createDiv = function(id, px, sz, imgURL, position,
                                         border, overflow, opacity) {

        var dom = OpenLayers.getDoc().createElement('div');

        if (imgURL) {
            dom.style.backgroundImage = 'url(' + imgURL + ')';
        }

        //set generic properties
        if (!id) {
            id = OpenLayers.Util.createUniqueID("OpenLayersDiv");
        }
        if (!position) {
            position = "absolute";
        }
        OpenLayers.Util.modifyDOMElement(dom, id, px, sz, position,
                                         border, overflow, opacity);

        return dom;
    };

    /**
     * Function: createImage
     * Creates an img element with specific attribute values.
     * IGNF: _aware of the current document_.
     *
     * Parameters:
     * id - {String} The id field for the img.  If none assigned one will be
     *               automatically generated.
     * px - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} The left and top positions.
     * sz - {<OpenLayers.Size at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Size-js.html>} The style.width and style.height values.
     * imgURL - {String} The url to use as the image source.
     * position - {String} The style.position value.
     * border - {String} The border to place around the image.
     * opacity - {Float} Fractional value (0.0 - 1.0)
     * delayDisplay - {Boolean} If true waits until the image has been
     *                          loaded.
     *
     * Returns:
     * {DOMElement} A DOM Image created with the specified attributes.
     */
    OpenLayers.Util.createImage = function(id, px, sz, imgURL, position, border,
                                           opacity, delayDisplay) {

        var image = OpenLayers.getDoc().createElement("img");

        //set generic properties
        if (!id) {
            id = OpenLayers.Util.createUniqueID("OpenLayersDiv");
        }
        if (!position) {
            position = "relative";
        }
        OpenLayers.Util.modifyDOMElement(image, id, px, sz, position,
                                         border, null, opacity);

        if (delayDisplay) {
            image.style.display = "none";
            function display() {
                image.style.display = "";
                OpenLayers.Event.stopObservingElement(image);
            }
            OpenLayers.Event.observe(image, "load", display);
            OpenLayers.Event.observe(image, "error", display);
        }

        //set special properties
        image.style.alt = id;
        image.galleryImg = "no";
        if (imgURL) {
            image.src = imgURL;
        }

        return image;
    };

    /**
     * Function: alphaHack
     * Checks whether it's necessary (and possible) to use the png alpha
     * hack which allows alpha transparency for png images under Internet
     * Explorer.
     * IGNF: _aware of the current document_.
     *
     * Returns:
     * {Boolean} true if the png alpha hack is necessary and possible, false
     * otherwise.
     */
    OpenLayers.Util.alphaHack = function() {
        if (OpenLayers.Util.alphaHackNeeded == null) {
            var arVersion = navigator.appVersion.split("MSIE");
            var version = parseFloat(arVersion[1]);
            var filter = false;

            // IEs4Lin dies when trying to access document.body.filters, because
            // the property is there, but requires a DLL that can't be provided. This
            // means that we need to wrap this in a try/catch so that this can
            // continue.

            try {
                filter = !!(OpenLayers.getDoc().body.filters);
            } catch (e) {}

            OpenLayers.Util.alphaHackNeeded = (filter &&
                                               (version >= 5.5) && (version < 7));
        }
        return OpenLayers.Util.alphaHackNeeded;
    };

    /**
     * Function: pagePositon
     * Calculates the position of an element on the page (see
     * http://code.google.com/p/doctype/wiki/ArticlePageOffset)
     *
     * OpenLayers.Util.pagePosition is based on Yahoo's getXY method, which is
     * Copyright (c) 2006, Yahoo! Inc.
     * All rights reserved.
     *
     * Redistribution and use of this software in source and binary forms, with or
     * without modification, are permitted provided that the following conditions
     * are met:
     *
     * * Redistributions of source code must retain the above copyright notice,
     *   this list of conditions and the following disclaimer.
     *
     * * Redistributions in binary form must reproduce the above copyright notice,
     *   this list of conditions and the following disclaimer in the documentation
     *   and/or other materials provided with the distribution.
     *
     * * Neither the name of Yahoo! Inc. nor the names of its contributors may be
     *   used to endorse or promote products derived from this software without
     *   specific prior written permission of Yahoo! Inc.
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
     * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
     * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
     * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
     * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
     * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
     * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
     * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
     * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
     * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
     * POSSIBILITY OF SUCH DAMAGE.
     *
     * IGNF: _aware of the current document_.
     *
     * Parameters:
     * forElement - {DOMElement}
     *
     * Returns:
     * {Array} two item array, L value then T value.
     */
    OpenLayers.Util.pagePosition = function(forElement) {
        // NOTE: If element is hidden (display none or disconnected or any the
        // ancestors are hidden) we get (0,0) by default but we still do the
        // accumulation of scroll position.

        var pos = [0, 0];
        var viewportElement = OpenLayers.Util.getViewportElement();
        if (!forElement || forElement == window || forElement == viewportElement) {
            // viewport is always at 0,0 as that defined the coordinate system for
            // this function - this avoids special case checks in the code below
            return pos;
        }

        var doc= OpenLayers.getDoc();//IGNF

        // Gecko browsers normally use getBoxObjectFor to calculate the position.
        // When invoked for an element with an implicit absolute position though it
        // can be off by one. Therefore the recursive implementation is used in
        // those (relatively rare) cases.
        var BUGGY_GECKO_BOX_OBJECT =
            OpenLayers.IS_GECKO && doc.getBoxObjectFor &&
            OpenLayers.Element.getStyle(forElement, 'position') == 'absolute' &&
            (forElement.style.top == '' || forElement.style.left == '');

        var parent = null;
        var box;

        if (forElement.getBoundingClientRect) { // IE
            box = forElement.getBoundingClientRect();
            var scrollTop = viewportElement.scrollTop;
            var scrollLeft = viewportElement.scrollLeft;

            pos[0] = box.left + scrollLeft;
            pos[1] = box.top + scrollTop;

        } else if (doc.getBoxObjectFor && !BUGGY_GECKO_BOX_OBJECT) { // gecko
            // Gecko ignores the scroll values for ancestors, up to 1.9.  See:
            // https://bugzilla.mozilla.org/show_bug.cgi?id=328881 and
            // https://bugzilla.mozilla.org/show_bug.cgi?id=330619

            box = doc.getBoxObjectFor(forElement);
            var vpBox = doc.getBoxObjectFor(viewportElement);
            pos[0] = box.screenX - vpBox.screenX;
            pos[1] = box.screenY - vpBox.screenY;

        } else { // safari/opera
            pos[0] = forElement.offsetLeft;
            pos[1] = forElement.offsetTop;
            parent = forElement.offsetParent;
            if (parent != forElement) {
                while (parent) {
                    pos[0] += parent.offsetLeft;
                    pos[1] += parent.offsetTop;
                    parent = parent.offsetParent;
                }
            }

            var browser = OpenLayers.BROWSER_NAME;

            // opera & (safari absolute) incorrectly account for body offsetTop
            if (browser == "opera" || (browser == "safari" &&
                OpenLayers.Element.getStyle(forElement, 'position') == 'absolute')) {
                pos[1] -= doc.body.offsetTop;
            }

            // accumulate the scroll positions for everything but the body element
            parent = forElement.offsetParent;
            while (parent && parent != doc.body) {//IGNF
                pos[0] -= parent.scrollLeft;
                // see https://bugs.opera.com/show_bug.cgi?id=249965
                if (browser != "opera" || parent.tagName != 'TR') {
                    pos[1] -= parent.scrollTop;
                }
                parent = parent.offsetParent;
            }
        }

        return pos;
    };

    /**
     * Function: createUrlObject
     * IGNF: _aware of the current document_.
     *
     * Parameters:
     * url - {String}
     * options - {Object} A hash of options.  Can be one of:
     *            ignoreCase: lowercase url,
     *            ignorePort80: don't include explicit port if port is 80,
     *            ignoreHash: Don't include part of url after the hash (#).
     *
     * Returns:
     * {Object} An object with separate url, a, port, host, and args parsed out
     *          and ready for comparison
     */
    OpenLayers.Util.createUrlObject = function(url, options) {
        options = options || {};

        // deal with relative urls first
        if(!(/^\w+:\/\//).test(url)) {
            var loc = window.location;
            var port = loc.port ? ":" + loc.port : "";
            var fullUrl = loc.protocol + "//" + loc.host.split(":").shift() + port;
            if(url.indexOf("/") === 0) {
                // full pathname
                url = fullUrl + url;
            } else {
                // relative to current path
                var parts = loc.pathname.split("/");
                parts.pop();
                url = fullUrl + parts.join("/") + "/" + url;
            }
        }

        if (options.ignoreCase) {
            url = url.toLowerCase();
        }

        var a = OpenLayers.getDoc().createElement('a');
        a.href = url;

        var urlObject = {};

        //host (without port)
        urlObject.host = a.host.split(":").shift();

        //protocol
        urlObject.protocol = a.protocol;

        //port (get uniform browser behavior with port 80 here)
        if(options.ignorePort80) {
            urlObject.port = (a.port == "80" || a.port == "0") ? "" : a.port;
        } else {
            urlObject.port = (a.port == "" || a.port == "0") ? "80" : a.port;
        }

        //hash
        urlObject.hash = (options.ignoreHash || a.hash === "#") ? "" : a.hash;

        //args
        var queryString = a.search;
        if (!queryString) {
            var qMark = url.indexOf("?");
            queryString = (qMark != -1) ? url.substr(qMark) : "";
        }
        urlObject.args = OpenLayers.Util.getParameters(queryString);

        //pathname (uniform browser behavior with leading "/")
        urlObject.pathname = (a.pathname.charAt(0) == "/") ? a.pathname : "/" + a.pathname;

        return urlObject;
    };

    /**
     * Method: getRenderedDimensions
     * Renders the contentHTML offscreen to determine actual dimensions for
     *     popup sizing. As we need layout to determine dimensions the content
     *     is rendered -9999px to the left and absolute to ensure the
     *     scrollbars do not flicker
     * IGNF: _aware of the current document_.
     *
     * Parameters:
     * contentHTML
     * size - {<OpenLayers.Size at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Size-js.html>} If either the 'w' or 'h' properties is
     *     specified, we fix that dimension of the div to be measured. This is
     *     useful in the case where we have a limit in one dimension and must
     *     therefore meaure the flow in the other dimension.
     * options - {Object}
     *     displayClass - {String} Optional parameter.  A CSS class name(s) string
     *         to provide the CSS context of the rendered content.
     *     containerElement - {DOMElement} Optional parameter. Insert the HTML to
     *         this node instead of the body root when calculating dimensions.
     *
     * Returns:
     * {OpenLayers.Size}
     */
    OpenLayers.Util.getRenderedDimensions = function(contentHTML, size, options) {

    var w, h;
    options= options || {} ; // IGNF

    // create temp container div with restricted size
    var container = (options.containerElement? options.containerElement.ownerDocument : OpenLayers.getDoc()).createElement("div");
    container.style.visibility = "hidden";

    var containerElement = (options.containerElement)
        ? options.containerElement : OpenLayers.getDoc().body;

    // Opera and IE7 can't handle a node with position:aboslute if it inherits
    // position:absolute from a parent.
    var parentHasPositionAbsolute = false;
    var superContainer = null;
    var parent = containerElement;
    while (parent && parent.tagName.toLowerCase()!="body") {
        var parentPosition = OpenLayers.Element.getStyle(parent, "position");
        if(parentPosition == "absolute") {
            parentHasPositionAbsolute = true;
            break;
        } else if (parentPosition && parentPosition != "static") {
            break;
        }
        parent = parent.parentNode;
    }
    if(parentHasPositionAbsolute && (containerElement.clientHeight === 0 ||
                                     containerElement.clientWidth === 0) ){
        superContainer = OpenLayers.getDoc().createElement("div");
        superContainer.style.visibility = "hidden";
        superContainer.style.position = "absolute";
        superContainer.style.overflow = "visible";
        superContainer.style.width = OpenLayers.getDoc().body.clientWidth + "px";
        superContainer.style.height = OpenLayers.getDoc().body.clientHeight + "px";
        superContainer.appendChild(container);
    }
    container.style.position = "absolute";

    //fix a dimension, if specified.
    if (size) {
        if (size.w) {
            w = size.w;
            container.style.width = w + "px";
        } else if (size.h) {
            h = size.h;
            container.style.height = h + "px";
        }
    }

    //add css classes, if specified
    if (options && options.displayClass) {
        container.className = options.displayClass;
    }

    // create temp content div and assign content
    var content = OpenLayers.getDoc().createElement("div");
    content.innerHTML = contentHTML;

    // we need overflow visible when calculating the size
    content.style.overflow = "visible";
    if (content.childNodes) {
        for (var i=0, l=content.childNodes.length; i<l; i++) {
            if (!content.childNodes[i].style) continue;
            content.childNodes[i].style.overflow = "visible";
        }
    }

    // add content to restricted container 
    container.appendChild(content);

    // append container to body for rendering
    if (superContainer) {
        containerElement.appendChild(superContainer);
    } else {
        containerElement.appendChild(container);
    }

    // calculate scroll width of content and add corners and shadow width
    if (!w) {
        w = parseInt(content.scrollWidth);

        // update container width to allow height to adjust
        container.style.width = w + "px";
    }
    // capture height and add shadow and corner image widths
    if (!h) {
        h = parseInt(content.scrollHeight);
    }

    // remove elements
    container.removeChild(content);
    if (superContainer) {
        superContainer.removeChild(container);
        containerElement.removeChild(superContainer);
    } else {
        containerElement.removeChild(container);
    }

    return new OpenLayers.Size(w, h);

/*
        var w, h;
        var options= options || {};//IGNF

        // create temp container div with restricted size
        var container = (options.containerElement? options.containerElement.ownerDocument : OpenLayers.getDoc()).createElement("div");
        container.style.visibility = "hidden";

        var containerElement = (options.containerElement)
            ? options.containerElement : OpenLayers.getDoc().body;

        //fix a dimension, if specified.
        if (size) {
            if (size.w) {
                w = size.w;
                container.style.width = w + "px";
            } else if (size.h) {
                h = size.h;
                container.style.height = h + "px";
            }
        }

        //add css classes, if specified
        if (options.displayClass) {
            container.className = options.displayClass;
        }

        // create temp content div and assign content
        var content = container.ownerDocument.createElement("div");
        content.innerHTML = contentHTML;

        // we need overflow visible when calculating the size
        content.style.overflow = "visible";
        if (content.childNodes) {
            for (var i=0, l=content.childNodes.length; i<l; i++) {
                if (!content.childNodes[i].style) continue;
                content.childNodes[i].style.overflow = "visible";
            }
        }

        // add content to restricted container
        container.appendChild(content);

        // append container to body for rendering
        containerElement.appendChild(container);

        // Opera and IE7 can't handle a node with position:aboslute if it inherits
        // position:absolute from a parent.
        var parentHasPositionAbsolute = false;
        var parent = container.parentNode;
        while (parent && parent.tagName.toLowerCase()!="body") {
            var parentPosition = OpenLayers.Element.getStyle(parent, "position");
            if(parentPosition == "absolute") {
                parentHasPositionAbsolute = true;
                break;
            } else if (parentPosition && parentPosition != "static") {
                break;
            }
            parent = parent.parentNode;
        }

        if(!parentHasPositionAbsolute) {
            container.style.position = "absolute";
        }

        // calculate scroll width of content and add corners and shadow width
        if (!w) {
            w = parseInt(content.scrollWidth);

            // update container width to allow height to adjust
            container.style.width = w + "px";
        }
        // capture height and add shadow and corner image widths
        if (!h) {
            h = parseInt(content.scrollHeight);
        }

        // remove elements
        container.removeChild(content);
        containerElement.removeChild(container);

        return new OpenLayers.Size(w, h);
*/
    };
    /**
     * APIFunction: getScrollbarWidth
     * This function has been modified by the OpenLayers from the original version,
     *     written by Matthew Eernisse and released under the Apache 2
     *     license here:
     *
     *     http://www.fleegix.org/articles/2006/05/30/getting-the-scrollbar-width-in-pixels
     *
     *     It has been modified simply to cache its value, since it is physically
     *     impossible that this code could ever run in more than one browser at
     *     once.
     * IGNF: _aware of the current document_.
     *
     * Returns:
     * {Integer}
     */
    OpenLayers.Util.getScrollbarWidth = function() {

        var scrollbarWidth = OpenLayers.Util._scrollbarWidth;

        if (scrollbarWidth == null) {
            var scr = null;
            var inn = null;
            var wNoScroll = 0;
            var wScroll = 0;
            var doc = OpenLayers.getDoc();

            // Outer scrolling div
            scr = doc.createElement('div');
            scr.style.position = 'absolute';
            scr.style.top = '-1000px';
            scr.style.left = '-1000px';
            scr.style.width = '100px';
            scr.style.height = '50px';
            // Start with no scrollbar
            scr.style.overflow = 'hidden';

            // Inner content div
            inn = doc.createElement('div');
            inn.style.width = '100%';
            inn.style.height = '200px';

            // Put the inner div in the scrolling div
            scr.appendChild(inn);
            // Append the scrolling div to the doc
            doc.body.appendChild(scr);

            // Width of the inner div sans scrollbar
            wNoScroll = inn.offsetWidth;

            // Add the scrollbar
            scr.style.overflow = 'scroll';
            // Width of the inner div width scrollbar
            wScroll = inn.offsetWidth;

            // Remove the scrolling div from the doc
            doc.body.removeChild(doc.body.lastChild);

            // Pixel width of the scroller
            OpenLayers.Util._scrollbarWidth = (wNoScroll - wScroll);
            scrollbarWidth = OpenLayers.Util._scrollbarWidth;
        }

        return scrollbarWidth;
    };

    /**
     * Function: invertRGBColor
     * Invert an hexadecimal RGB color
     * IGNF: _addition_
     *
     * Parameters:
     * rgb - {String} an RGB color (#rrggbb ou #rgb)
     * 
     * Returns:
     * {String} the inverted RGB color (#rrggbb)
     */
    OpenLayers.Util.invertRGBColor= function(rgb) {
        var m= rgb.match(/^#([0-9A-F]{3}([0-9A-F]{3})?)$/i);
        var r= 255, g= 255, b= 255;
        if (m) {
            if (m[1].length===6) { // 6-char notation
                r= parseInt(m[1].substr(0,2),16);
                g= parseInt(m[1].substr(2,2),16);
                b= parseInt(m[1].substr(4,2),16);
            } else {
                r= parseInt(m[1].charAt(0)+m[1].charAt(0),16);
                g= parseInt(m[1].charAt(1)+m[1].charAt(1),16);
                b= parseInt(m[1].charAt(2)+m[1].charAt(2),16);
            }
        }
        var pad2= function(n) {
            return (n.length<2)? ('0'+n) : n;
        };
        return '#' + pad2((255-r).toString(16)) + pad2((255-g).toString(16)) + pad2((255-b).toString(16));
    };






if (OpenLayers.Control) {

/**
 * Class: OpenLayers.UI
 * Base class for rendering OpenLayers' components (mainly
 * <OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>).
 *  IGNF: _addition_
 */
OpenLayers.UI = OpenLayers.Class({

    /**
     * APIProperty: allowSelection
     * {Boolean} By default, component do not allow selection, because
     * it may interfere with map dragging. If this is true, OpenLayers
     * will not prevent selection of the component.
     * Default is false.
     */
    allowSelection: false,

    /**
     * APIProperty: displayClass
     * {String}  This property is used for CSS related to the drawing of the
     * component.
     */
    displayClass: "",

    /**
     * APIProperty: title
     * {String}  This property is used for showing a tooltip over the
     * component.
     */
    title: "",

    /**
     * Property: position
     * {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} the top-left position of the component.
     */
    position: null,

    /**
     * APIProperty: container
     * {DOMElement} the element where the rendering is done.
     */
    container: null,

    /**
     * Property: component
     * {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>} the rendered component
     */
    component: null,

    /**
     * Constructor: OpenLayers.UI
     *
     * Parameters:
     * options - {Object} options for this User Interface. See subclasses for
     *     supported options.
     */
    initialize: function(options) {
        OpenLayers.Util.extend(this, options || {});
    },

    /**
     * APIMethod: destroy
     */
    destroy: function() {
        this.component= null;
        this.position= null;
        this.container= null;
    },

    /**
     * APIMethod: supported
     * This should be overridden by specific subclasses
     *
     * Returns:
     * {Boolean} Whether or not the browser supports the renderer class
     */
    supported: function() {
        return true;
    },

    /**
     * APIMethod: setSelectable
     * Set the component's content selectable/unselectable if the allowSelection
     * flag is off.
     *
     * Parameters:
     * on - {Boolean} when false set unselectable, otherwise selectable.
     */
    setSelectable: function(on) {
        if (this.container) {
            var unselVal= (on===false? "on" : "off");
            var onselFun= (on===false? OpenLayers.Function.False : OpenLayers.Function.True);
            OpenLayers.Element.removeClass(this.container, 'olControlNoSelect');
            if (on===false) {
                OpenLayers.Element.addClass(this.container, 'olControlNoSelect');
            }
            this.container.setAttribute("unselectable", unselVal, 0);
            this.container.onselectstart= onselFun;
            this.allowSelection= on || false;
        }
    },

    /**
     * Method: createContainer
     * Create the DOM element associated with the container.
     *  Assign the container's id to this element.
     *
     * Returns:
     * {DOMElement} A reference to the Document element containing the
     * component.
     */
    createContainer: function() {
        return OpenLayers.Util.createDiv(this.id);
    },

    /**
     * APIMethod: render
     * Build the component. This component is an empty div, its
     * position is absolute by default.
     *
     * Parameters:
     * options - {Object} component's rendering properties.
     *      Supports :
     *      * style - {Object} left, top, width, height,
     *          position, border, overflow.
     *      * force - {Boolean} when true, flush container first.
     *
     * Returns:
     * {DOMElement} A reference to the div DOMElement containing the
     * component.
     */
    render: function (options) {
        options= options || {};
        if (this.container==null) {
            this.container= this.createContainer();
            OpenLayers.Element.addClass(this.container, this.displayClass);
            if (!this.allowSelection) {
                this.setSelectable(false);
            }
        } else {
            if (options.force===true) {
                this.reset();
            }
            this.setSelectable(!!this.allowSelection);
        }
        var hasPosition= options.style && options.style.left && options.style.top;
        if (this.position) {
            if (!hasPosition) {
                options.style= {
                    left: this.position.x+"px",
                    top : this.position.y+"px"
                };
            }/* else hasPosition see below ! */
        }
        if (hasPosition) {
            this.position= new OpenLayers.Pixel(
                parseInt(options.style.left),
                parseInt(options.style.top)
            );
        }
        if (options.style) {
            for (var r in options.style) {
                if (typeof this.container.style === 'object') {
                    try {
                        this.container.style[r]= options.style[r];
                    } catch (e) {
                        ;
                    }
                }
            }
        }
        return this.container;
    },

    /**
     * APIMethod: draw
     * The draw method is called to render the component's content on the page.
     *
     * Returns:
     * {DOMElement} A reference to the div DOMElement containing the
     * component.
     */
    draw: function () {
        this.changeLang();
        return this.container;
    },

    /**
     * Method: reset
     * Reset component.
     */
    reset: function () {
        if (this.container) {
            this.container.innerHTML= '';
        }
    },

    /**
     * APIMethod: changeLang
     * Change the rendering when "changelang" has been triggered.
     *
     * Parameters:
     * evt - {Event} event fired, may be undefined (See
     *      <OpenLayers.Control.draw at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html#OpenLayers.Control.draw>).
     *      evt.lang holds the new language
     */
    changeLang: function(evt) {
        if (this.title != "" && this.container) {
            this.container.title = OpenLayers.i18n(this.title);
        }
    },

    /**
     * APIMethod: getComponent
     * Return the rendered component to the user interface.
     *
     * Returns:
     * {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>}
     */
    getComponent: function() {
        return this.component;
    },

    /**
     * APIMethod: setComponent
     * Assign the rendered component to the user interface.
     *
     * Parameters:
     * cntrl - {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>}
     */
    setComponent: function(cntrl) {
        this.component= cntrl;
        if (!this.displayClass) {
            this.displayClass =
                cntrl.CLASS_NAME.replace("OpenLayers.", "ol").replace(/\./g, "");
        }
    },

    /**
     * APIMethod: getDom
     * Return the rendered {DOMElement}.
     *
     * Returns:
     * {DOMElement} the rendered element.
     */
    getDom: function() {
        return this.container;
    },

    /**
     * APIMethod: getPosition
     * Return the top-left pixel position of the rendered component.
     *
     * Return:
     * {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} or null
     */
    getPosition: function() {
        return this.position;
    },

    /**
     * APIMethod: setTitle
     * Assign the title to the rendered component.
     *
     * Parameters:
     * t - {String} title value.
     */
    setTitle: function(t) {
        this.title= t;
        if (this.container) {
            this.container.title= t;
        }
    },

    /**
     * APIMethod: setClass
     * Assign the CSS class to the rendered component.
     *
     * Parameters:
     * c - {String} optional className value. If none given, the displayClass
     * property is used.
     */
    setClass: function(c) {
        if (c===undefined) {
            c= this.displayClass;
        }
        this.container.className= c;
    },

    /**
     * APIMethod: addClass
     * Add the CSS class to the rendered component.
     *
     * Parameters:
     * c - {String} className value.
     */
    addClass: function(c) {
        if (c!==undefined) {
            OpenLayers.Element.addClass(this.container, c);
        }
    },

    /**
     * Constant: OpenLayers.UI.CLASS_NAME
     *  Defaults to *OpenLayers.UI*
     */
    CLASS_NAME: "OpenLayers.UI"
});

/**
 * Class: OpenLayers.UI.JQuery
 * Specialized class for rendering OpenLayers' component using JQuery.
 * FIXME: JQuery UI (See http://jquery.com and http://jqueryui.com).
 */
OpenLayers.UI.JQuery = OpenLayers.Class(OpenLayers.UI, {
    /**
     * APIMethod: supported
     * This should be overridden by specific subclasses
     *
     * Returns:
     * {Boolean} Whether or not the browser supports the renderer class
     */
    supported: function() {
        //FIXME: jQuery.ui => OpenLayers.UI.JQueryUI ?
        //return typeof(window.jQuery)=='function' && typeof(window.jQuery.ui)=='object';
        return typeof(window.jQuery)=='function';
    },

    /**
     * Constant: OpenLayers.UI.JQuery.CLASS_NAME
     *  Defaults to *OpenLayers.UI.JQuery*
     */
    CLASS_NAME: "OpenLayers.UI.JQuery"
});

/**
 * Class: OpenLayers.UI.JQuery.Mobile
 * Specialized class for rendering OpenLayers' component using JQuery Mobile.
 * (See http://http://jquerymobile.com/).
 */
OpenLayers.UI.JQuery.Mobile = OpenLayers.Class(OpenLayers.UI.JQuery, {
    /**
     * APIMethod: supported
     * This should be overridden by specific subclasses
     *
     * Returns:
     * {Boolean} Whether or not the browser supports the renderer class
     */
    supported: function() {
        return typeof(window.jQuery)=='function' && typeof(window.jQuery.mobile)=='object';
    },

    /**
     * Constant: OpenLayers.UI.JQuery.Mobile.CLASS_NAME
     *  Defaults to *OpenLayers.UI.JQuery.Mobile*
     */
    CLASS_NAME: "OpenLayers.UI.JQuery.Mobile"
});

/**
 * Class: OpenLayers.Control
 * IGNF: adds activeOverMapOnly to OpenLayers.Control and new events
 * "mapmouseover" and "mapmouseout".
 */

//FIXME: checks for new controls ...

    OpenLayers.Control= OpenLayers.overload(OpenLayers.Control, {

    /**
     * APIProperty: activeOverMapOnly
     * {Boolean} The control is active only when the mouse is over the map,
     *     default is false.
     * IGNF: _addition_
     */
    activeOverMapOnly: false,

    /**
     * Property: uis
     * {Array(String)} List of supported UI classes.  Add to this list to
     * add support for additional uis. This list is ordered :
     * the first ui which returns true for the  'supported()'
     * method will be used, if not defined in the 'ui' option.
     */
    uis: ["OpenLayers.UI"],

    /**
     * Property: ui
     * {<OpenLayers.UI>} The UI used for rendering the control
     */
    ui: null,

    /**
     * Property: noUI
     * {Boolean} indicate whether the control has no a user interface.
     *      Defaults to *false*
     */
    noUI: false,

    /**
     * Constructor: OpenLayers.Control
     * Create an OpenLayers Control.  The options passed as a parameter
     * directly extend the control.  For example passing the following:
     *
     * > var control = new OpenLayers.Control({div: myDiv});
     *
     * Overrides the default div attribute value of null.
     *
     * Parameters:
     * options - {Object}
     */
    initialize: function (options) {
        options= options || {};
        options.uiOptions= options.uiOptions || {};
        OpenLayers.Util.extend(options.uiOptions,{
            allowSelection:options.uiOptions.allowSelection || options.allowSelection || false,
            displayClass:options.uiOptions.displayClass || options.displayClass || "",
            title:options.uiOptions.title || options.title || "",
            position:options.uiOptions.position || (options.position? options.position.clone() : null)
        });
        var watchNeeded= false;
        if (options.allowSelection!==undefined) { watchNeeded= true; delete options.allowSelection; }
        if (options.displayClass!==undefined) { watchNeeded= true; delete options.displayClass; }
        if (options.title!==undefined) { watchNeeded= true; delete options.title; }
        if (options.position!==undefined) { watchNeeded= true; delete options.position; }
        OpenLayers.Util.extend(this, options);

        this.events = new OpenLayers.Events(this, null, this.EVENT_TYPES);
        if(this.eventListeners instanceof Object) {
            this.events.on(this.eventListeners);
        }
        if (this.id == null) {
            this.id = OpenLayers.Util.createUniqueID(this.CLASS_NAME + "_");
        }
        // allow user-set ui, otherwise assign one
        if (!this.ui || !this.ui.supported()) {
            this.assignUI();
        }
        // if no valid ui found, display error
        if (!this.ui || !this.ui.supported()) {
            this.ui= null;
            OpenLayers.Console.userError(OpenLayers.i18n("uiNotSupported",
                                 {'uis':this.uis.join("\n")}));
        }

        //FIXME: remove allowSelection, position, displayClass, title from this ?
        // for the moment : watch deprecated properties ...
        if (watchNeeded) {
            OpenLayers.Class.watchObject(this,'allowSelection',__Geoportal$compatWrapperFunc);
            OpenLayers.Class.watchObject(this,'position',__Geoportal$compatWrapperFunc);
            OpenLayers.Class.watchObject(this,'displayClass',__Geoportal$compatWrapperFunc);
            OpenLayers.Class.watchObject(this,'title',__Geoportal$compatWrapperFunc);
        }
    },

    /**
     * APIMethod: setSelectable
     * Set the control contents selectable/unselectable if the allowSelection flag is off.
     *
     * Parameters:
     * on - {Boolean} when false set unselectable, otherwise selectable.
     */
    setSelectable: function(on) {
        if (!this.allowSelection) {
            this.ui && this.ui.setSelectable(on);
        }
    },

    /**
     * APIMethod: setDisplayClass
     * Set the displayClass of the control.
     *
     * Parameters:
     * c - {String} the CSS class name
     */
    setDisplayClass: function(c) {
        this.getUI().displayClass= c;
    },

    /**
     * APIMethod: getDisplayClass
     * Get the display class of the control
     *
     * Returns:
     * {String} the CSS class name
     */
    getDisplayClass: function() {
        return this.getUI().displayClass;
    },

    /**
     * APIMethod: setTitle
     * Set the title of the control.
     *
     * Parameters:
     * t - {String} the title
     */
    setTitle: function(t) {
        this.getUI().setTitle(t);
    },

    /**
     * APIMethod: getTitle
     * Get the title of the control.
     *
     * Returns:
     * {String} the control's title.
     */
    getTitle: function() {
        return this.getUI().title;
    },

    /**
     * Method: setClass
     * Assign the CSS class to the rendered component.
     *
     * Parameters:
     * c - {String} optional className value. If none given, the displayClass
     * property is used.
     */
    setClass: function(c) {
        this.getUI().setClass(c);
    },

    /**
     * Method: addClass
     * Add the CSS class to the rendered component.
     *
     * Parameters:
     * c - {String} className value.
     */
    addClass: function(c) {
        this.getUI().addClass(c);
    },

    /**
     * APIMethod: destroy
     * The destroy method is used to perform any clean up before the control
     * is dereferenced.  Typically this is where event listeners are removed
     * to prevent memory leaks.
     * IGNF: _takes care of activeOverMapOnly related functions_
     */
    destroy: function () {
        // unwatch deprecated properties ...
        OpenLayers.Class.unwatchObject(this);
        if (this.ui) {
            this.ui.destroy();
            this.ui= null;
        }

        if(this.events) {
            if(this.eventListeners) {
                this.events.un(this.eventListeners);
            }
            this.events.destroy();
            this.events = null;
        }
        this.eventListeners = null;

        // eliminate circular references
        if (this.handler) {
            this.handler.destroy();
            this.handler = null;
        }
        if (this.handlers) {
            for(var key in this.handlers) {
                if(this.handlers.hasOwnProperty(key) &&
                   typeof this.handlers[key].destroy == "function") {
                    this.handlers[key].destroy();
                }
            }
            this.handlers = null;
        }
        if (this.map) {
            if (this.activeOverMapOnly===true) {
                this.map.events.unregister('mapmouseover', this, this.onMouseOver);
                this.map.events.unregister('mapmouseout', this, this.onMouseOut);
            }
            this.map.events.unregister("changelang", this, this.changeLang);
            this.map.removeControl(this);
            this.map = null;
        }
        this.div = null;
    },

    /**
     * Method: onMouseOver
     * Activate the control. Only called when activeOverMapOnly is true.
     * IGNF: _addition_
     *
     * Parameters:
     * e - {<Event>}
     */
    onMouseOver: function() {
        this.activate();//don't return the status !
    },

    /**
     * Method: onMouseOut
     * Deactivate the control. Only called when activeOverMapOnly is true.
     * IGNF: _addition_
     *
     * Parameters:
     * e - {<Event>}
     */
    onMouseOut: function() {
        this.deactivate();//don't return the status !
    },

    /**
     * APIMethod: setMap
     * Set the map property for the control. This is done through an accessor
     * so that subclasses can override this and take special action once
     * they have their map variable set.
     * IGNF: _redesign due to activeOverMapOnly addition_
     *
     * Parameters:
     * map - {<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>}
     */
    setMap: function(map) {
        this.map = map;
        this.map.events.register("changelang", this, this.changeLang);
        if (this.activeOverMapOnly===true) {
            this.map.events.register('mapmouseover', this, this.onMouseOver);
            this.map.events.register('mapmouseout', this, this.onMouseOut);
        }
        if (this.handler) {
            this.handler.setMap(map);
        }
    },

    /**
     * APIMethod: draw
     * The draw method is called when the control is ready to be displayed
     * on the page.  If a div has not been created one is created.  Controls
     * with a visual component will almost always want to override this method
     * to customize the look of control.
     *  IGNF: _add {<OpenLayers.UI>} support_
     *
     * Parameters:
     * px - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} The top-left pixel position of the control
     *      or null.
     *
     * Returns:
     * {DOMElement} A reference to the DIV DOMElement containing the control
     */
    draw: function (px) {
        if (this.noUI===true) { return this.div || null; }
        var options= {};
        if (px!=null) {
            options.style= {
                left: px.x+'px',
                top : px.y+'px'
            };
        }
        this.div= this.ui.render(options);
        this.ui.draw();
        return this.div;
    },

    /**
     * APIMethod: changeLang
     * Assigns the current language
     *  IGNF: _addition_
     *
     * Parameters:
     * evt {Event}  - event fired
     * - evt.lang holds the new language
     */
    changeLang: function(evt) {
        this.ui.changeLang(evt);
    },

    /**
     * Method: assignUI
     * Iterates through the available UI implementations and selects
     * and assigns the first one whose "supported()" function returns true.
     *  IGNF: _add {<OpenLayers.UI>} support_
     */
    assignUI: function() {
        if (!this.uis) {
            this.uis= [];
            var cp= this.CLASS_NAME.split('.');
            cp[1]= "UI";// replace Control by UI
            while (cp.length>1) {
                this.uis.push(cp.join('.'));
                cp.pop();
            }
        }
        for (var i= 0, len= this.uis.length; i<len; i++) {
            var uiClass= this.uis[i];
            var ui= null
            if (typeof(uiClass)=="function") {
                ui= uiClass;
            } else {
                try {
                    ui= eval(uiClass);
                } catch (e) {
                    /*OpenLayers.Console.log(e)*/;
                }
                if (ui) {
                    // find out sub-class for rendering this control :
                    var cp= this.CLASS_NAME.split('.');
                    var cn= cp.shift();   // removes OpenLayers|Geoportal
                    cn= cp.shift();       // removes Control
                    while ((cn= cp.shift())) {
                        if (typeof(ui[cn])=="function") {
                            ui= ui[cn];
                        } else {
                            break;
                        }
                    }
                }
            }
            if (ui && ui.prototype.supported()) {
                OpenLayers.Util.extend(this.uiOptions,{
                    container: this.div || null,
                    id: this.id
                });
                this.ui= new ui(this.uiOptions);
                this.ui.setComponent(this);
                break;
            }
        }
    },

    /**
     * APIMethod: getUI
     * Return the underlaying user interface component.
     *  IGNF: _add {<OpenLayers.UI>} support_
     */
    getUI: function() {
        return this.ui;
    },

    /**
     * APIMethod: activate
     * Explicitly activates a control and it's associated
     * handler if one has been set.  Controls can be
     * deactivated by calling the deactivate() method.
     * 
     * Returns:
     * {Boolean}  True if the control was successfully activated or
     *            false if the control was already active.
     */
    activate: function () {
        if (this.active) {
            return false;
        }
        if (this.handler) {
            this.handler.activate();
        }
        this.active = true;
        if(this.map) {
            OpenLayers.Element.addClass(
                this.map.viewPortDiv,
                this.getDisplayClass().replace(/ /g, "") + "Active"
            );
        }
        this.events.triggerEvent("activate");
        return true;
    },
    
    /**
     * APIMethod: deactivate
     * Deactivates a control and it's associated handler if any.  The exact
     * effect of this depends on the control itself.
     * 
     * Returns:
     * {Boolean} True if the control was effectively deactivated or false
     *           if the control was already inactive.
     */
    deactivate: function () {
        if (this.active) {
            if (this.handler) {
                this.handler.deactivate();
            }
            this.active = false;
            if(this.map) {
                OpenLayers.Element.removeClass(
                    this.map.viewPortDiv,
                    this.getDisplayClass().replace(/ /g, "") + "Active"
                );
            }
            this.events.triggerEvent("deactivate");
            return true;
        }
        return false;
    }

    });

}

/**
 * Class: OpenLayers.Events
 * IGNF: implementation of event's ordering.
 */
if (OpenLayers.Events) {

    OpenLayers.Events= OpenLayers.overload(OpenLayers.Events, {

    /**
     * APIMethod: register
     * Register an event on the events object.
     *
     * When the event is triggered, the 'func' function will be called, in the
     * context of 'obj'. Imagine we were to register an event, specifying an
     * OpenLayers.Bounds Object as 'obj'. When the event is triggered, the
     * context in the callback function will be our Bounds object. This means
     * that within our callback function, we can access the properties and
     * methods of the Bounds object through the "this" variable. So our
     * callback could execute something like:
     * :    leftStr = "Left: " + this.left;
     *
     *                   or
     *
     * :    centerStr = "Center: " + this.getCenterLonLat();
     *
     * Parameters:
     * type - {String} Name of the event to register
     * obj - {Object} The object to bind the context to for the callback#.
     *                     If no object is specified, default is the Events's
     *                     'object' property.
     * func - {Function} The callback function. If no callback is
     *                        specified, this function does nothing.
     * priority - {Boolean|Object|Number} If true, adds the new listener to the
     *     *front* of the events queue instead of to the end.
     *
     * Valid options for priority:
     * extension - {Boolean} If true, then the event will be registered as
     *     extension event. Extension events are handled before all other
     *     events.
     *
     *      If priority is a number : how or where to register (IGNF : _addition_) :
     *      * 0 : add to the queue's head ;
     *      * any number between 1 and queue's length : insert it there;
     *      * otherwise : add to the queue's tail (default behavior).
     *
     */
    register: function (type, obj, func, priority) {

        if (type in OpenLayers.Events && !this.extensions[type]) {
            this.extensions[type] = new OpenLayers.Events[type](this);
        }
        if (func != null) {
            if (obj == null)  {
                obj = this.object;
            }
            var listeners = this.listeners[type];
            if (!listeners) {
                listeners = [];
                this.listeners[type] = listeners;
                this.extensionCount[type] = 0;
            }
            var listener = {obj: obj, func: func};
            if (typeof priority==="boolean" || typeof priority==="object") {
                if (priority) {
                    listeners.splice(this.extensionCount[type], 0, listener);
                    if (typeof priority === "object" && priority.extension) {
                        this.extensionCount[type]++;
                    }
                } else {
                    listeners.push(listener);
                }
            } else if (typeof priority==="number") { // IGNF
                if (priority<=0) {
                    // add on top:
                    listeners.unshift(listener);
                } else if (priority<listeners.length) {
                    // insert at where:
                    listeners.splice(priority,0,listener);
                } else {
                    // add below:
                    listeners.push(listener);
                }
            } else {
                listeners.push(listener);
            }
        }

    },


    /**
     * Method: getMousePosition
     * IGNF: _aware of the current document_.
     *
     * Parameters:
     * evt - {Event}
     *
     * Returns:
     * {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} The current xy coordinate of the mouse, adjusted
     *                      for offsets
     */
    getMousePosition: function (evt) {
        var doc= this.element.ownerDocument || OpenLayers.getDoc();
        if (!this.includeXY) {
            this.clearMouseCache();
        } else if (!this.element.hasScrollEvent) {
            OpenLayers.Event.observe(window, "scroll", this.clearMouseListener);
            this.element.hasScrollEvent = true;
        }

        if (!this.element.scrolls) {
            var viewportElement = OpenLayers.Util.getViewportElement();
            this.element.scrolls = [
                viewportElement.scrollLeft,
                viewportElement.scrollTop
            ];
        }

        if (!this.element.lefttop) {
            this.element.lefttop = [
                (doc.documentElement.clientLeft || 0),
                (doc.documentElement.clientTop  || 0)
            ];
        }

        if (!this.element.offsets) {
            this.element.offsets = OpenLayers.Util.pagePosition(this.element);
        }

        return new OpenLayers.Pixel(
            (evt.clientX + this.element.scrolls[0]) - this.element.offsets[0]
                         - this.element.lefttop[0],
            (evt.clientY + this.element.scrolls[1]) - this.element.offsets[1]
                         - this.element.lefttop[1]
        );
    }

    });

}

/**
 * Class: OpenLayers.Control.OverviewMap
 * IGNF: aware of the current document.
 */
if (OpenLayers.Control && OpenLayers.Control.OverviewMap) {

    OpenLayers.Control.OverviewMap= OpenLayers.overload(OpenLayers.Control.OverviewMap, {

    /**
     * APIMethod: destroy
     * Deconstruct the control
     * IGNF: _IE fix when childNodes.length==0_
     */
    destroy: function() {
        if (!this.mapDiv) { // we've already been destroyed
            return;
        }
        if (this.handlers.click) {
            this.handlers.click.destroy();
        }
        if (this.handlers.drag) {
            this.handlers.drag.destroy();
        }

        //IGNF: this.ovmap.viewPortDiv.childNodes.length==0 ? (IE)
        //IGNF: do not know why extentRectangle may not be a child of viewPortDiv ?
        if (this.ovmap && this.ovmap.viewPortDiv && this.ovmap.viewPortDiv.childNodes.length>0 &&
            this.extentRectangle && this.extentRectangle.parentNode===this.extentRectangle) {
            this.ovmap.viewPortDiv.removeChild(this.extentRectangle);
        }
        this.extentRectangle = null;

        if (this.rectEvents) {
            this.rectEvents.destroy();
            this.rectEvents = null;
        }

        if (this.ovmap) {
            this.ovmap.destroy();
            this.ovmap = null;
        }

        //IGNF: this.element.childNodes.length==0 ? (IE)
        if (this.element.childNodes.length>0) {
            this.element.removeChild(this.mapDiv);
        }
        this.mapDiv = null;

        //IGNF: this.div.childNodes.length==0 ? (IE)
        if (this.div.childNodes.length>0) {
            this.div.removeChild(this.element);
        }
        this.element = null;

        if (this.maximizeDiv) {
            //IGNF: this.div.childNodes.length==0 ? (IE)
            if (this.div.childNodes.length>0) {
                this.div.removeChild(this.maximizeDiv);
            }
            this.maximizeDiv = null;
        }

        if (this.minimizeDiv) {
            //IGNF: this.div.childNodes.length==0 ? (IE)
            if (this.div.childNodes.length>0) {
                this.div.removeChild(this.minimizeDiv);
            }
            this.minimizeDiv = null;
        }

        this.map.events.un({
            buttonclick: this.onButtonClick,
            moveend: this.update,
            changebaselayer: this.baseLayerDraw,
            scope: this
        });

        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: showToggle
     * Hide/Show the toggle depending on whether the control is minimized
     * IGNF: _take outsideViewport flag into account_
     *
     * Parameters:
     * minimize - {Boolean}
     */
    showToggle: function(minimize) {
        if (!this.outsideViewport) {//IGNF
            this.maximizeDiv.style.display = minimize ? '' : 'none';
            this.minimizeDiv.style.display = minimize ? 'none' : '';
        }
    },

    /**
     * Method: draw
     * Render the control in the browser.
     * IGNF: _aware of the current document_.
     */
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        if (this.layers.length === 0) {
            if (this.map.baseLayer) {
                var layer = this.map.baseLayer.clone();
                this.layers = [layer];
            } else {
                this.map.events.register("changebaselayer", this, this.baseLayerDraw);
                return this.div;
            }
        }

        // create overview map DOM elements
        this.element = this.div.ownerDocument.createElement('div');
        this.element.className = this.getDisplayClass() + 'Element';
        this.element.style.display = 'none';

        this.mapDiv = this.div.ownerDocument.createElement('div');
        this.mapDiv.style.width = this.size.w + 'px';
        this.mapDiv.style.height = this.size.h + 'px';
        this.mapDiv.style.position = 'relative';
        this.mapDiv.style.overflow = 'hidden';
        this.mapDiv.id = OpenLayers.Util.createUniqueID('overviewMap');

        this.extentRectangle = this.div.ownerDocument.createElement('div');
        this.extentRectangle.style.position = 'absolute';
        this.extentRectangle.style.zIndex = 1000;  //HACK
        this.extentRectangle.className = this.getDisplayClass()+'ExtentRectangle';

        this.element.appendChild(this.mapDiv);

        this.div.appendChild(this.element);

        // Optionally add min/max buttons if the control will go in the
        // map viewport.
        if(!this.outsideViewport) {
            this.div.className += " " + this.getDisplayClass() + 'Container';
            // maximize button div
            var img = OpenLayers.Util.getImageLocation('layer-switcher-maximize.png');
            this.maximizeDiv = OpenLayers.Util.createAlphaImageDiv(
                                        this.getDisplayClass() + 'MaximizeButton',
                                        null,
                                        null,
                                        img,
                                        'absolute');
            this.maximizeDiv.style.display = 'none';
            this.maximizeDiv.className = this.getDisplayClass() + 'MaximizeButton olButton';
            this.div.appendChild(this.maximizeDiv);

            // minimize button div
            var img = OpenLayers.Util.getImageLocation('layer-switcher-minimize.png');
            this.minimizeDiv = OpenLayers.Util.createAlphaImageDiv(
                                        'OpenLayers_Control_minimizeDiv',
                                        null,
                                        null,
                                        img,
                                        'absolute');
            this.minimizeDiv.style.display = 'none';
            this.minimizeDiv.className = this.getDisplayClass() + 'MinimizeButton olButton';
            this.div.appendChild(this.minimizeDiv);
            this.minimizeControl();
        } else {
            // show the overview map
            this.element.style.display = '';
        }
        if(this.map.getExtent()) {
            this.update();
        }

        this.map.events.on({
            buttonclick: this.onButtonClick,
            moveend: this.update,
            scope: this
        });

        if (this.maximized) {
            this.maximizeControl();
        }
        return this.div;
    },

    /**
     * Method updateOverview
     * Called by <update> if <isSuitableOverview> returns true
     *      IGNF: _BUGFIX in min/maxRatio handling_
     */
    updateOverview: function() {
        var mapRes = this.map.getResolution();
        var targetRes = this.ovmap.getResolution();
        var resRatio = targetRes / mapRes;
        if(resRatio > this.maxRatio) {
            // zoom in overview map
            // IGNF : OL was using minRatio in multiplication
            targetRes = this.maxRatio * mapRes;
        } else if(resRatio <= this.minRatio) {
            // zoom out overview map
            // IGNF : OL was using maxRatio in multiplication
            targetRes = this.minRatio * mapRes;
        }
        var center;
        if (this.ovmap.getProjection() != this.map.getProjection()) {
            center = this.map.center.clone();
            center.transform(this.map.getProjectionObject(),
                this.ovmap.getProjectionObject() );
        } else {
            center = this.map.center;
        }
        this.ovmap.setCenter(center, this.ovmap.getZoomForResolution(
            targetRes * this.resolutionFactor));
        this.updateRectToMap();
    },



    /**
     * Method: setRectPxBounds
     * Set extent rectangle pixel bounds.
     *      IGNF: _{<OpenLayers.UI>} changes_
     *
     * Parameters:
     * pxBounds - {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>}
     */
    setRectPxBounds: function(pxBounds) {
        var top = Math.max(pxBounds.top, 0);
        var left = Math.max(pxBounds.left, 0);
        var bottom = Math.min(pxBounds.top + Math.abs(pxBounds.getHeight()),
                              this.ovmap.size.h - this.hComp);
        var right = Math.min(pxBounds.left + pxBounds.getWidth(),
                             this.ovmap.size.w - this.wComp);
        var width = Math.max(right - left, 0);
        var height = Math.max(bottom - top, 0);
        if(width < this.minRectSize || height < this.minRectSize) {
            this.extentRectangle.className = this.getDisplayClass() + //IGNF
                                             this.minRectDisplayClass;
            var rLeft = left + (width / 2) - (this.minRectSize / 2);
            var rTop = top + (height / 2) - (this.minRectSize / 2);
            this.extentRectangle.style.top = Math.round(rTop) + 'px';
            this.extentRectangle.style.left = Math.round(rLeft) + 'px';
            this.extentRectangle.style.height = this.minRectSize + 'px';
            this.extentRectangle.style.width = this.minRectSize + 'px';
        } else {
            this.extentRectangle.className = this.getDisplayClass() + //IGNF
                                             'ExtentRectangle';
            this.extentRectangle.style.top = Math.round(top) + 'px';
            this.extentRectangle.style.left = Math.round(left) + 'px';
            this.extentRectangle.style.height = Math.round(height) + 'px';
            this.extentRectangle.style.width = Math.round(width) + 'px';
        }
        this.rectPxBounds = new OpenLayers.Bounds(
            Math.round(left), Math.round(bottom),
            Math.round(right), Math.round(top)
        );
    }

    });

}

///**
// * Class: OpenLayers.Style
// * IGNF: prevent conversion to numeric (e.g. '09E5' won't become 900000)
// */
//if (OpenLayers.Style) {
//
//    /**
//     * Function: createLiteral
//     * converts a style value holding a combination of PropertyName and Literal
//     * into a Literal, taking the property values from the passed features.
//     *
//     * Parameters:
//     * value - {String} value to parse. If this string contains a construct like
//     *         "foo ${bar}", then "foo " will be taken as literal, and "${bar}"
//     *         will be replaced by the value of the "bar" attribute of the passed
//     *         feature.
//     * context - {Object} context to take attribute values from
//     * feature - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>} optional feature to pass to
//     *           <OpenLayers.String.format at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/BaseTypes-js.html#OpenLayers.String.format>
//     *           for evaluating functions in the context.
//     * property - {String} optional, name of the property for which the literal is
//     *            being created for evaluating functions in the context.
//     *
//     * Returns:
//     * {String} the parsed value. In the example of the value parameter above, the
//     * result would be "foo valueOfBar", assuming that the passed feature has an
//     * attribute named "bar" with the value "valueOfBar".
//     */
//    OpenLayers.Style.createLiteral = function(value, context, feature, property) {
//        if (typeof value == "string" && value.indexOf("${") != -1) {
//            value = OpenLayers.String.format(value, context, [feature, property]);
//            //value = (isNaN(value) || !value) ? value : parseFloat(value);
//        }
//        return value;
//    };
//
//}

/**
 * Class: OpenLayers.Strategy.Filter
 * IGNF: bug fixed when changing baselayer and related projection.
 */
if (OpenLayers.Strategy && OpenLayers.Strategy.Filter) {

    OpenLayers.Strategy.Filter= OpenLayers.overload(OpenLayers.Strategy.Filter, {

    /**
     * APIMethod: activate
     * Activate the strategy.  Register any listeners, do appropriate setup.
     *     By default, this strategy automatically activates itself when a
     *     layer is added to a map.
     * IGNF: _aware of changebaselayer event_.
     *
     * Returns:
     * {Boolean} True if the strategy was successfully activated or false if
     *      the strategy was already active.
     */
    activate: function() {
        var activated = OpenLayers.Strategy.prototype.activate.apply(this, arguments);
        if (activated) {
            this.cache = [];
            this.layer.events.on({
                "beforefeaturesadded": this.handleAdd,
                "beforefeaturesremoved": this.handleRemove,
                scope: this
            });
            //IGNF:
            this.layer.map.events.on({
                "changebaselayer": this.changeBaseLayer,
                scope:this
            });
        }
        return activated;
    },

    /**
     * APIMethod: deactivate
     * Deactivate the strategy.  Clear the feature cache.
     * IGNF: _aware of changebaselayer event_.
     *
     * Returns:
     * {Boolean} True if the strategy was successfully deactivated or false if
     *      the strategy was already inactive.
     */
    deactivate: function() {
        this.cache = null;
        if (this.layer && this.layer.events) {
            this.layer.events.un({
                "beforefeaturesadded": this.handleAdd,
                "beforefeaturesremoved": this.handleRemove,
                scope: this
            });
            //IGNF:
            this.layer.map.events.on({
                "changebaselayer": this.changeBaseLayer,
                scope:this
            });
        }
        return OpenLayers.Strategy.prototype.deactivate.apply(this, arguments);
    },

    /**
     * APIMethod: transform
     * Reproject the strategy's cache.
     *  IGNF: _addition_
     *
     * Parameters:
     * source - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the source projection.
     * dest - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the destination projection.
     */
    transform: function(source, dest) {
        //reproject cache:
        if (this.cache) {
            for (var ii= 0, il= this.cache.length; ii<il; ii++) {
                var feature= this.cache[ii];
                feature.geometry.transform(source,dest);
            }
        }
    },

    /**
     * APIMethod: changeBaseLayer
     * Listener of the map's event 'changebaselayer'.
     *  IGNF: _addition_
     *
     * Parameters:
     * evt - {Event} the 'changebaselayer' event.
     *
     * Returns:
     * {Boolean} true to keep on, false to stop propagating the event.
     */
    changeBaseLayer: function(evt) {
        if (!this.layer.isBaseLayer && !this.caching) {
            var oldMapProj= evt.baseLayer? evt.baseLayer.getNativeProjection() : null;
            if (oldMapProj==null) { return false; }
            var mapProj= this.layer.map.getProjection();
            this.transform(oldMapProj, mapProj);
        }
        return true;
    }

    });

}

/**
 * Class: OpenLayers.Handler.Drag
 * IGNF: aware of the current document.
 */
if (OpenLayers.Handler && OpenLayers.Handler.Drag) {

    OpenLayers.Handler.Drag= OpenLayers.overload(OpenLayers.Handler.Drag, {

    /**
     * Method: dragstart
     * This private method is factorized from mousedown and touchstart methods
     * IGNF: _aware of the current document_.
     *
     * Parameters:
     * evt - {Event}
     *
     * Returns:
     * {Boolean} Let the event propagate.
     */
    dragstart: function (evt) {
        var propagate = true;
        this.dragging = false;
        if (this.checkModifiers(evt) &&
            (OpenLayers.Event.isLeftClick(evt) ||
             OpenLayers.Event.isSingleTouch(evt))) {
            this.started = true;
            this.start = evt.xy;
            this.last = evt.xy;
            OpenLayers.Element.addClass(
                this.map.viewPortDiv, "olDragDown"
            );
            this.down(evt);
            this.callback("down", [evt.xy]);

            OpenLayers.Event.stop(evt);

            var doc= this.map.div.ownerDocument || OpenLayers.getDoc();//IGNF
            if(!this.oldOnselectstart) {
                this.oldOnselectstart = (doc.onselectstart) ? doc.onselectstart : OpenLayers.Function.True;//IGNF
            }
            doc.onselectstart = OpenLayers.Function.False;//IGNF

            propagate = !this.stopDown;
        } else {
            this.started = false;
            this.start = null;
            this.last = null;
        }
        return propagate;
    },

    /**
     * Method: dragmove
     * This private method is factorized from mousemove and touchmove methods
     * IGNF: _aware of the current document_.
     *
     * Parameters:
     * evt - {Event}
     *
     * Returns:
     * {Boolean} Let the event propagate.
     */
    dragmove: function (evt) {
        this.lastMoveEvt = evt;
        if (this.started && !this.timeoutId && (evt.xy.x != this.last.x ||
                                                evt.xy.y != this.last.y)) {
            var doc= this.map.div.ownerDocument || OpenLayers.getDoc();//IGNF
            if(this.documentDrag === true && this.documentEvents) {
                if(evt.element === document) {
                    this.adjustXY(evt);
                    // do setEvent manually because the documentEvents are not
                    // registered with the map
                    this.setEvent(evt);
                } else {
                    this.destroyDocumentEvents();
                }
            }
            if (this.interval > 0) {
                this.timeoutId = setTimeout(
                    OpenLayers.Function.bind(this.removeTimeout, this),
                    this.interval);
            }
            this.dragging = true;

            this.move(evt);
            this.callback("move", [evt.xy]);
            if(!this.oldOnselectstart) {
                this.oldOnselectstart = doc.onselectstart;//IGNF
                doc.onselectstart = OpenLayers.Function.False;//IGNF
            }
            this.last = evt.xy;
        }
        return true;
    },

    /**
     * Method: dragend
     * This private method is factorized from mouseup and touchend methods
     * IGNF: _aware of the current document_.
     *
     * Parameters:
     * evt - {Event}
     *
     * Returns:
     * {Boolean} Let the event propagate.
     */
    dragend: function (evt) {
        if (this.started) {
            if(this.documentDrag === true && this.documentEvents) {
                this.adjustXY(evt);
                this.removeDocumentEvents();
            }
            var dragged = (this.start != this.last);
            this.started = false;
            this.dragging = false;
            OpenLayers.Element.removeClass(
                this.map.viewPortDiv, "olDragDown"
            );
            this.up(evt);
            this.callback("up", [evt.xy]);
            if(dragged) {
                this.callback("done", [evt.xy]);
            }
            var doc= this.map.div.ownerDocument || OpenLayers.getDoc();//IGNF
            doc.onselectstart = this.oldOnselectstart;//IGNF
        }
        return true;
    },

    /**
     * Method: mouseout
     * Handle mouseout events
     * IGNF: _aware of the current document_.
     *
     * Parameters:
     * evt - {Event}
     *
     * Returns:
     * {Boolean} Let the event propagate.
     */
    mouseout: function (evt) {
        if (this.started && OpenLayers.Util.mouseLeft(evt, this.map.viewPortDiv)) {
            var doc= this.map.div.ownerDocument || OpenLayers.getDoc();//IGNF
            if(this.documentDrag === true) {
                this.addDocumentEvents();
            } else {
                var dragged = (this.start != this.last);
                this.started = false;
                this.dragging = false;
                OpenLayers.Element.removeClass(
                    this.map.viewPortDiv, "olDragDown"
                );
                this.out(evt);
                this.callback("out", []);
                if(dragged) {
                    this.callback("done", [evt.xy]);
                }
                if(doc.onselectstart) {//IGNF
                    doc.onselectstart = this.oldOnselectstart;//IGNF
                }
            }
        }
        return true;
    },

    /**
     * Method: addDocumentEvents
     * Start observing document events when documentDrag is true and the mouse
     * cursor leaves the map viewport while dragging.
     */
    addDocumentEvents: function() {
        var doc= this.map.div.ownerDocument || OpenLayers.getDoc();//IGNF
        OpenLayers.Element.addClass(doc.body, "olDragDown");//IGNF
        this.documentEvents = true;
        OpenLayers.Event.observe(doc, "mousemove", this._docMove);//IGNF
        OpenLayers.Event.observe(doc, "mouseup", this._docUp);//IGNF
    },

    /**
     * Method: removeDocumentEvents
     * Stops observing document events when documentDrag is true and the mouse
     * cursor re-enters the map viewport while dragging.
     * IGNF: _aware of the current document_.
     */
    removeDocumentEvents: function() {
        var doc= this.map.div.ownerDocument || OpenLayers.getDoc();//IGNF
        OpenLayers.Element.removeClass(doc.body, "olDragDown");//IGNF
        this.documentEvents = false;
        OpenLayers.Event.stopObserving(doc, "mousemove", this._docMove);//IGNF
        OpenLayers.Event.stopObserving(doc, "mouseup", this._docUp);//IGNF
    }

    });

}

/**
 * Class: OpenLayers.Renderer
 * Adds the following to OpenLayers.Feature.Vector (patch 2312) :
 *       * labelXOffset - {Number} Pixel offset along the positive x axis for
 *       displacing the label.
 *       * labelYOffset - {Number} Pixel offset along the positive y axis for
 *       displacing the label.
 * Adds the following to OpenLayers.Feature.Vector (patch 2148) :
 *       * labelSelect - {Boolean} If set to true, labels will be selectable
 *       using SelectFeature or similar controls.
 * Adds the following to OpenLayers.Feature.Vector (patch 2349) :
 *       * labelBackgroundColor - {String}
 *       * labelBorderColor - {String}
 *       * labelBorderSize - {String}
 *       * labelPadding - {String}
 */
if (OpenLayers.Renderer) {

    OpenLayers.Renderer= OpenLayers.overload(OpenLayers.Renderer, {

    /**
     * Method: setExtent
     * Set the visible part of the layer.
     *
     * Resolution has probably changed, so we nullify the resolution
     * cache (this.resolution) -- this way it will be re-computed when
     * next it is needed.
     * We nullify the resolution cache (this.resolution) if resolutionChanged
     * is set to true - this way it will be re-computed on the next
     * getResolution() request.
     * IGNF: _test on extent added_
     *
     * Parameters:
     * extent - {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>}
     * resolutionChanged - {Boolean}
     */
    setExtent: function(extent, resolutionChanged) {
        this.extent = (extent? extent.clone(): new OpenLayers.Bounds(0,0,0,0));//IGNF test on extent parameter
        if (resolutionChanged) {
            this.resolution = null;
        }
    },

    /**
     * Method: getResolution
     * Uses cached copy of resolution if available to minimize computing
     * IGNF: _Patch due to IE4Linux that does not support rendering ..._
     *
     * Returns:
     * The current map's resolution
     */
    getResolution: function() {
        this.resolution = this.resolution || (this.map? this.map.getResolution() : null);//IGNF
        return this.resolution;
    }

    });

}

/**
 * Class: OpenLayers.Renderer.Canvas
 * IGNF: aware of the current document, patch 2965 (halo)
 */
if (OpenLayers.Renderer && OpenLayers.Renderer.Canvas) {

    OpenLayers.Renderer.Canvas= OpenLayers.overload(OpenLayers.Renderer.Canvas, {

    /**
     * Constant: HALO_ID_SUFFIX
     * {String}
     *  IGNF: _addition_ (See {<OpenLayers.Renderer.Elements at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Renderer/Elements-js.html>})
     */
    HALO_ID_SUFFIX: "_halo",

    /**
     * Constructor: OpenLayers.Renderer.Canvas
     * IGNF: _aware of the current document_.
     *
     * Parameters:
     * containerID - {<String>}
     * options - {Object} Optional properties to be set on the renderer.
     */
    initialize: function(containerID, options) {
        OpenLayers.Renderer.prototype.initialize.apply(this, arguments);
        this.root = OpenLayers.getDoc().createElement("canvas");
        this.container.appendChild(this.root);
        this.canvas = this.root.getContext("2d");
        this.features = {};
        if (this.hitDetection) {
            this.hitCanvas = document.createElement("canvas");
            this.hitContext = this.hitCanvas.getContext("2d");
        }
        this.geometryMap = {};
    },

    /**
     * APIMethod: supported
     * IGNF: _aware of the current document_.
     *
     * Returns:
     * {Boolean} Whether or not the browser supports the renderer class
     */
    supported: function() {
        var canvas = OpenLayers.getDoc().createElement("canvas");
        return !!canvas.getContext;
    },

    /**
     * Method: drawText
     * This method is only called by the renderer itself.
     * IGNF: _labelHaloColor and labelHaloWidth (patch 2965)_
     *
     * Parameters:
     * location - {<OpenLayers.Point at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Point-js.html>}
     * style    - {Object}
     */
    drawText: function(location, style) {
        var pt = this.getLocalXY(location);

        this.setCanvasStyle("reset");
        this.canvas.fillStyle = style.fontColor;
        this.canvas.globalAlpha = style.fontOpacity || 1.0;
        var fontStyle = [style.fontStyle ? style.fontStyle : "normal",
                         "normal", // "font-variant" not supported
                         style.fontWeight ? style.fontWeight : "normal",
                         style.fontSize ? style.fontSize : "1em",
                         style.fontFamily ? style.fontFamily : "sans-serif"].join(" ");
        var labelRows = style.label.split('\n');
        var numRows = labelRows.length;
        if (this.canvas.fillText) {
            // HTML5
            this.canvas.font = fontStyle;
            this.canvas.textAlign =
                OpenLayers.Renderer.Canvas.LABEL_ALIGN[style.labelAlign[0]] ||
                "center";
            this.canvas.textBaseline =
                OpenLayers.Renderer.Canvas.LABEL_ALIGN[style.labelAlign[1]] ||
                "middle";
            var vfactor =
                OpenLayers.Renderer.Canvas.LABEL_FACTOR[style.labelAlign[1]];
            if (vfactor == null) {
                vfactor = -0.5;
            }
            var lineHeight =
                this.canvas.measureText('Mg').height ||
                this.canvas.measureText('xx').width;
            pt[1] += lineHeight*vfactor*(numRows-1);
            for (var i = 0; i < numRows; i++) {
                // OL2.12 addition
                if (style.labelOutlineWidth) {
                    this.canvas.save();
                    this.canvas.strokeStyle = style.labelOutlineColor;
                    this.canvas.lineWidth = style.labelOutlineWidth;
                    this.canvas.strokeText(labelRows[i], pt[0], pt[1] + (lineHeight*i) + 1);
                    this.canvas.restore();
                }
                this.canvas.fillText(labelRows[i], pt[0], pt[1] + (lineHeight*i));
            }
            if (style.labelHaloColor) {//IGNF patch 2965
                this.canvas.strokeStyle = style.labelHaloColor;
                this.canvas.lineWidth = style.labelHaloWidth || 2;
                this.canvas.strokeText(style.label, pt[0], pt[1]);
            }
        } else if (this.canvas.mozDrawText) {
            // Mozilla pre-Gecko1.9.1 (<FF3.1)
            this.canvas.mozTextStyle = fontStyle;
            // No built-in text alignment, so we measure and adjust the position
            var hfactor =
                OpenLayers.Renderer.Canvas.LABEL_FACTOR[style.labelAlign[0]];
            if (hfactor == null) {
                hfactor = -0.5;
            }
            var vfactor =
                OpenLayers.Renderer.Canvas.LABEL_FACTOR[style.labelAlign[1]];
            if (vfactor == null) {
                vfactor = -.5;
            }
            var lineHeight = this.canvas.mozMeasureText('xx');
            pt[1] += lineHeight*(1 + (vfactor*numRows));
            for (var i = 0; i < numRows; i++) {
                var x = pt[0] + (hfactor*this.canvas.mozMeasureText(labelRows[i]));
                var y = pt[1] + (i*lineHeight);
                this.canvas.translate(x, y);
                this.canvas.mozDrawText(labelRows[i]);
                this.canvas.translate(-x, -y);
            }
        }
        this.setCanvasStyle("reset");
    }/*,*/

//    /**
//     * Method: drawExternalGraphic
//     * Called to draw External graphics. 
//     * IGNF: _graphicWidth, graphicHeight, graphicXOffset, graphicYOffset,
//     * graphicOpacity, fillOpacity string value fix_
//     * 
//     * Parameters: 
//     * geometry - {<OpenLayers.Geometry>}
//     * style    - {Object}
//     * featureId - {String}
//     */ 
//    drawExternalGraphic: function(geometry, style, featureId) {
//        var img = new Image();
//
//        if (style.graphicTitle) {
//            img.title = style.graphicTitle;           
//        }
//
//        var width = (style.graphicWidth || style.graphicHeight) * 1.0;//IGNF
//        var height = style.graphicHeight || style.graphicWidth;
//        width = width ? width : style.pointRadius * 2;
//        height = height ? height : style.pointRadius * 2;
//        var xOffset = (style.graphicXOffset != undefined) ?
//           (style.graphicXOffset * 1.0 ) : -(0.5 * width);//IGNF
//        var yOffset = (style.graphicYOffset != undefined) ?
//           (style.graphicYOffset * 1.0 ) : -(0.5 * height);//IGNF
//
//        var opacity = (style.graphicOpacity || style.fillOpacity) * 1.0;//IGNF
//        
//        var onLoad = function() {
//            if(!this.features[featureId]) {
//                return;
//            }
//            var pt = this.getLocalXY(geometry);
//            var p0 = pt[0];
//            var p1 = pt[1];
//            if(!isNaN(p0) && !isNaN(p1)) {
//                var x = (p0 + xOffset) | 0;
//                var y = (p1 + yOffset) | 0;
//                var canvas = this.canvas;
//                canvas.globalAlpha = opacity;
//                var factor = OpenLayers.Renderer.Canvas.drawImageScaleFactor ||
//                    (OpenLayers.Renderer.Canvas.drawImageScaleFactor =
//                        /android 2.1/.test(navigator.userAgent.toLowerCase()) ?
//                            // 320 is the screen width of the G1 phone, for
//                            // which drawImage works out of the box.
//                            320 / window.screen.width : 1
//                    );
//                canvas.drawImage(
//                    img, x*factor, y*factor, width*factor, height*factor
//                );
//                if (this.hitDetection) {
//                    this.setHitContextStyle("fill", featureId);
//                    this.hitContext.fillRect(x, y, width, height);
//                }
//            }
//        };
//
//        img.onload = OpenLayers.Function.bind(onLoad, this);
//        img.src = style.externalGraphic;
//    }

    });

}

/**
 * Class: OpenLayers.Format.XML
 * IGNF: adds support of XML errors parsing reporting.
 */
if (OpenLayers.Format && OpenLayers.Format.XML) {

    OpenLayers.Format.XML= OpenLayers.overload(OpenLayers.Format.XML, {

    /**
     * APIMethod: createElementNS
     * Create a new element with namespace.  This node can be appended to
     *     another node with the standard node.appendChild method.  For
     *     cross-browser support, this method must be used instead of
     *     document.createElementNS.
     *     IGNF: _aware of the current document_.
     *     IGNF: force prefix removal if it is the defaultPrefix
     *
     * Parameters:
     * uri - {String} Namespace URI for the element.
     * name - {String} The qualified name of the element (prefix:localname).
     *
     * Returns:
     * {Element} A DOM element with namespace.
     */
    createElementNS: function(uri, name) {
        var element;
        // force prefix removal if it is the defaultPrefix
        var prefix= name.split(":")[0] ;
        if (prefix!=name && prefix==this.defaultPrefix) {
          name= name.split(":")[1] ;
        }
        if(this.xmldom) {
            if(typeof uri == "string") {
                element = this.xmldom.createNode(1, name, uri);
            } else {
                element = this.xmldom.createNode(1, name, "");
            }
        } else {
            element = OpenLayers.getDoc().createElementNS(uri, name);
        }
        return element;
    },

    /**
     * APIMethod: createTextNode
     * Create a text node.  This node can be appended to another node with
     *     the standard node.appendChild method.  For cross-browser support,
     *     this method must be used instead of document.createTextNode.
     *     IGNF: _aware of the current document_.
     *
     * Parameters:
     * text - {String} The text of the node.
     *
     * Returns:
     * {DOMElement} A DOM text node.
     */
    createTextNode: function(text) {
        var node;
        if (typeof text !== "string") {
            text = String(text);
        }
        if(this.xmldom) {
            node = this.xmldom.createTextNode(text);
        } else {
            node = OpenLayers.getDoc().createTextNode(text);
        }
        return node;
    },

    /**
     * APIMethod: read
     * Deserialize a XML string and return a DOM node.
     * IGNF: _use of <OpenLayers.Request.getParseErrorText at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Request-js.html#OpenLayers.Request.getParseErrorText>()_
     *
     * Parameters:
     * text - {String} A XML string
     *
     * Returns:
     * {DOMElement} A DOM node
     */
    read: function(text) {
        var index = text.indexOf('<');
        if(index > 0) {
            text = text.substring(index);
        }
        var node = OpenLayers.Util.Try(
            OpenLayers.Function.bind((
                function() {
                    var xmldom;
                    /**
                     * Since we want to be able to call this method on the prototype
                     * itself, this.xmldom may not exist even if in IE.
                     */
                    if(window.ActiveXObject && !this.xmldom) {
                        xmldom = new ActiveXObject("Microsoft.XMLDOM");
                    } else {
                        xmldom = this.xmldom;

                    }
                    xmldom.loadXML(text);
                    return xmldom;
                }
            ), this),
            function() {
                return new DOMParser().parseFromString(text, 'text/xml');
            },
            function() {
                var req = new XMLHttpRequest();
                req.open("GET", "data:" + "text/xml" +
                         ";charset=utf-8," + encodeURIComponent(text), false);
                if(req.overrideMimeType) {
                    req.overrideMimeType("text/xml");
                }
                req.send(null);
                return req.responseXML;
            }
        );
        //IGNF:
        var pet= OpenLayers.Request.XMLHttpRequest.getParseErrorText(node);
        if (pet != OpenLayers.Request.XMLHttpRequest.PARSED_OK &&
            pet != OpenLayers.Request.XMLHttpRequest.PARSED_EMPTY) {
            alert(OpenLayers.i18n(pet));
        }

        if(this.keepData) {
            this.data = node;
        }

        return node;
    },

    /**
     * Method: readNode
     * Shorthand for applying one of the named readers given the node
     *     namespace and local name.  Readers take two args (node, obj) and
     *     generally extend or modify the second.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified (or a new one if none was
     * provided).
     */
    readNode: function(node, obj) {
        if(!obj) {
            obj = {};
        }
        if (!node) { return obj;}//IGNF
        var group = this.readers[node.namespaceURI ? this.namespaceAlias[node.namespaceURI]: this.defaultPrefix];
        if(group) {
            var local = node.localName || node.nodeName.split(":").pop();
            var reader = group[local] || group["*"];
            if(reader) {
                reader.apply(this, [node, obj]);
            }
        }
        return obj;
    },

    /**
     * Method: readChildNodes
     * Shorthand for applying the named readers to all children of a node.
     *     For each child of type 1 (element), <readSelf> is called.
     * IGNF: _check on node parameter_
     *
     * Parameters:
     * node - {DOMElement} The node to be read (required).
     * obj - {Object} The object to be modified (optional).
     *
     * Returns:
     * {Object} The input object, modified.
     */
    readChildNodes: function(node, obj) {
        if(!obj) {
            obj = {};
        }
        if (!node) { return obj;}//IGNF
        var children = node.childNodes;
        var child;
        for(var i=0, len=children.length; i<len; ++i) {
            child = children[i];
            if(child.nodeType == 1) {
                this.readNode(child, obj);
            }
        }
        return obj;
    }

    });

    // overwrite OpenLayers.Format.XML write method, to fix a bug in IE11 XMLSerializer
    var _class = OpenLayers.Format.XML;
    var originalWriteFunction = _class.prototype.write;
    var patchedWriteFunction = function()
    {
        var child = originalWriteFunction.apply( this, arguments );
        // NOTE: Remove the rogue namespaces as one block of text.
        //       The second fragment "NS1:" is too small on its own and could cause valid text (in, say, ogc:Literal elements) to be erroneously removed.
        child = child.replace(new RegExp('xmlns:NS\\d+="" NS\\d+:', 'g'), '');
        return child;
    }

    _class.prototype.write = patchedWriteFunction;

}

/**
 * Class: OpenLayers.Format.OSM
 * IGNF: see changes on <{OpenLayers.Format.XML}>
 */
if (OpenLayers.Format && OpenLayers.Format.OSM) {

    OpenLayers.Format.OSM= OpenLayers.overload(OpenLayers.Format.OSM, {

    readNode: OpenLayers.Format.XML.prototype.readNode,

    readChildNodes: OpenLayers.Format.XML.prototype.readChildNodes

    });

}

/**
 * Class: OpenLayers.Format.GML
 * IGNF: various fixes
 */
if (OpenLayers.Format && OpenLayers.Format.GML) {

    OpenLayers.Format.GML= OpenLayers.overload(OpenLayers.Format.GML, {

    readNode: OpenLayers.Format.XML.prototype.readNode,

    readChildNodes: OpenLayers.Format.XML.prototype.readChildNodes,

    /**
     * APIMethod: read
     * Read data from a string, and return a list of features.
     * IGNF: _handling of documentElement for fragment parsing_.
     *
     * Parameters:
     * data - {String} or {DOMElement} data to read/parse.
     *
     * Returns:
     * {Array(<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>)} An array of features.
     */
    read: function(data) {
        if(typeof data == "string") {
            data = OpenLayers.Format.XML.prototype.read.apply(this, [data]);
        }
        var root = data.nodeType == 9 ? data.documentElement : data;//IGNF: allow fragment parsing
        var featureNodes = this.getElementsByTagNameNS(root,
                                                       this.gmlns,
                                                       this.featureName);
        var features = [];
        for(var i = 0, len = featureNodes.length; i<len; i++) {
            var feature = this.parseFeature(featureNodes[i]);
            if(feature) {
                features.push(feature);
            }
        }
        return features;
    },

    /**
     * Method: createFeatureXML
     * Accept an OpenLayers.Feature.Vector, and build a GML node for it.
     * IGNF: _addition of srsName attribute on geometry_.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>}
     *           The feature to be built as GML.
     *
     * Returns:
     * {DOMElement} A node reprensting the feature in GML.
     */
    createFeatureXML: function(feature) {
        var geometry = feature.geometry;
        var geometryNode = this.buildGeometryNode(geometry);
        if (this.externalProjection) {//IGNF
            geometryNode.setAttribute("srsName",this.externalProjection.toString());
        }
        var geomContainer = this.createElementNS(this.featureNS,
                                                 this.featurePrefix + ":" +
                                                 this.geometryName);
        geomContainer.appendChild(geometryNode);
        var featureNode = this.createElementNS(this.gmlns,
                                               "gml:" + this.featureName);
        var featureContainer = this.createElementNS(this.featureNS,
                                                    this.featurePrefix + ":" +
                                                    this.layerName);
        var fid = feature.fid || feature.id;
        featureContainer.setAttribute("fid", fid);
        featureContainer.appendChild(geomContainer);
        for(var attr in feature.attributes) {
            var attrText = this.createTextNode(feature.attributes[attr]);
            var nodename = attr.substring(attr.lastIndexOf(":") + 1);
            var attrContainer = this.createElementNS(this.featureNS,
                                                     this.featurePrefix + ":" +
                                                     nodename);
            attrContainer.appendChild(attrText);
            featureContainer.appendChild(attrContainer);
        }
        featureNode.appendChild(featureContainer);
        return featureNode;
    },

    /**
     * Method: buildCoordinatesNode
     * Build the coordinates XmlNode.
     * IGNF: _xy property handling_.
     *
     * (code)
     * <gml:coordinates decimal="." cs="," ts=" ">...</gml:coordinates>
     * (end)
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry-js.html>}
     *
     * Returns:
     * {XmlNode} created xmlNode
     */
    buildCoordinatesNode: function(geometry) {
        var coordinatesNode = this.createElementNS(this.gmlns,
                                                   "gml:coordinates");
        coordinatesNode.setAttribute("decimal", ".");
        coordinatesNode.setAttribute("cs", ",");
        coordinatesNode.setAttribute("ts", " ");

        var parts = [];

        if(geometry instanceof OpenLayers.Bounds){
            parts.push(geometry.left + "," + geometry.bottom);
            parts.push(geometry.right + "," + geometry.top);
        } else {
            var points = (geometry.components) ? geometry.components : [geometry];
            //IGNF: take into account xy flag (needed in OpenLS)
            var x= this.xy? "x":"y", y= this.xy? "y":"x";
            for (var i=0, len= points.length; i<len; i++) {
                parts.push(points[i][x] + "," + points[i][y]);
            }
        }

        var txtNode = this.createTextNode(parts.join(" "));
        coordinatesNode.appendChild(txtNode);

        return coordinatesNode;
    }

    });

}

/**
 * Class: OpenLayers.Handler.Feature
 * IGNF: bug fix when map is not set.
 */
if (OpenLayers.Handler && OpenLayers.Handler.Feature) {

    OpenLayers.Handler.Feature= OpenLayers.overload(OpenLayers.Handler.Feature, {

    /**
     * Method: handleMapEvents
     * IGNF: _only moves layer to top if it is a RootContainer_
     * 
     * Parameters:
     * evt - {Object}
     */
    handleMapEvents: function(evt) {
        if (/*evt.type == "removelayer" || */evt.property == "order") {
          if (this.layer.CLASS_NAME=="OpenLayers.Layer.Vector.RootContainer") {
            
            this.moveLayerToTop();
          }
        }
    },



    /**
     * Method: moveLayerToTop
     * Moves the layer for this handler to the top, so mouse events can reach
     * it.
     * IGNF: _check for map to be set_
     */
    moveLayerToTop: function() {
        if (this.map) {//IGNF
            var index = Math.max(this.map.Z_INDEX_BASE['Feature'] - 1,
                this.layer.getZIndex()) + 1;
            this.layer.setZIndex(index);
        }
    },

    /**
     * Method: moveLayerBack
     * Moves the layer back to the position determined by the map's layers
     * array.
     * IGNF: _check for map to be set_
     */
    moveLayerBack: function() {
        if (this.map) {//IGNF
            var index = this.layer.getZIndex() - 1;
            if (index >= this.map.Z_INDEX_BASE['Feature']) {
                this.layer.setZIndex(index);
            } else {
                this.map.setLayerZIndex(this.layer,
                    this.map.getLayerIndex(this.layer));
            }
        }
    },

    /**
     * Method: triggerCallback
     * Call the callback keyed in the event map with the supplied arguments.
     *     For click and clickout, the <clickTolerance> is checked first.
     * IGNF: See http://www.mail-archive.com/users@op.../msg13401.html.
     *
     * Parameters:
     * type - {String}
     */
    triggerCallback: function(type, mode, args) {
        var key = this.EVENTMAP[type][mode];
        if(key) {
            if(type == 'click' && this.up && this.down) {
                // for click/clickout, only trigger callback if tolerance is met
                var dpx = Math.sqrt(
                    Math.pow(this.up.x - this.down.x, 2) +
                    Math.pow(this.up.y - this.down.y, 2)
                );
                if(dpx <= this.clickTolerance) {
                    this.callback(key, args);
                }
                this.down= null;//IGNF: dpx computation
            } else {
                this.callback(key, args);
            }
        }
    }

    });

}

/**
 * Class: OpenLayers.Control.DragFeature
 * IGNF: see <OpenLayers.UI>
 */
if (OpenLayers.Control && OpenLayers.Control.DragFeature) {

    OpenLayers.Control.DragFeature= OpenLayers.overload(OpenLayers.Control.DragFeature, {

    /**
     * APIMethod: deactivate
     * Deactivate the control and all handlers.
     *
     * Returns:
     * {Boolean} Successfully deactivated the control.
     */
    deactivate: function() {
        // the return from the handlers is unimportant in this case
        this.handlers.drag.deactivate();
        this.handlers.feature.deactivate();
        this.feature = null;
        this.dragging = false;
        this.lastPixel = null;
        OpenLayers.Element.removeClass(
            this.map.viewPortDiv, this.getDisplayClass() + "Over" //IGNF
        );
        return OpenLayers.Control.prototype.deactivate.apply(this, arguments);
    },

    /**
     * Method: overFeature
     * Called when the feature handler detects a mouse-over on a feature.
     *     This activates the drag handler.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>} The selected feature.
     *
     * Returns:
     * {Boolean} Successfully activated the drag handler.
     */
    overFeature: function(feature) {
        var activated = false;
        if(!this.handlers.drag.dragging) {
            this.feature = feature;
            this.handlers.drag.activate();
            activated = true;
            this.over = true;
            OpenLayers.Element.addClass(this.map.viewPortDiv, this.getDisplayClass() + "Over");//IGNF
            this.onEnter(feature);
        } else {
            if(this.feature.id == feature.id) {
                this.over = true;
            } else {
                this.over = false;
            }
        }
        return activated;
    },

    /**
     * Method: outFeature
     * Called when the feature handler detects a mouse-out on a feature.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>} The feature that the mouse
     * left.
     */
    outFeature: function(feature) {
        if(!this.handlers.drag.dragging) {
            this.over = false;
            this.handlers.drag.deactivate();
            OpenLayers.Element.removeClass(
                this.map.viewPortDiv, this.getDisplayClass() + "Over"
            );
            this.onLeave(feature);
            this.feature = null;
        } else {
            if(this.feature.id == feature.id) {
                this.over = false;
            }
        }
    }

    });

}

/**
 * Class: OpenLayers.Map
 * IGNF: new events "changelang", "mapmouseover", mapmouseout",
 * "changedisplayprojection", "controlactivated", "controlvisibilitychanged", "beforemove".
 */
if (OpenLayers.Map) {

    OpenLayers.Map= OpenLayers.overload(OpenLayers.Map, {

    /**
     * Constant: EVENT_TYPES
     * {Array(String)} Supported application event types.  Register a listener
     *     for a particular event with the following syntax:
     * (code)
     * map.events.register(type, obj, listener);
     * (end)
     *
     * Listeners will be called with a reference to an event object.  The
     *     properties of this event depends on exactly what happened.
     *
     * All event objects have at least the following properties:
     *  - *object* {Object} A reference to map.events.object.
     *  - *element* {DOMElement} A reference to map.events.element.
     *
     * Browser events have the following additional properties:
     *  - *xy* {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} The pixel location of the event (relative
     *      to the the map viewport).
     *  - other properties that come with browser events
     *
     * Supported map event types:
     *  - *preaddlayer* triggered before a layer has been added.  The event
     *      object will include a *layer* property that references the layer
     *      to be added.
     *  - *addlayer* triggered after a layer has been added.  The event object
     *      will include a *layer* property that references the added layer.
     *  - *preremovelayer* triggered before a layer has been removed. The event
     *      object will include a *layer* property that references the layer
     *      to be removed. When a listener returns "false" the removal will be
     *      aborted.
     *  - *removelayer* triggered after a layer has been removed.  The event
     *      object will include a *layer* property that references the removed
     *      layer.
     *  - *changelayer* triggered after a layer name change, order change, or
     *      visibility change (due to resolution thresholds).  Listeners will
     *      receive an event object with *layer* and *property* properties.  The
     *      *layer* property will be a reference to the changed layer.  The
     *      *property* property will be a key to the changed property (name,
     *      visibility, or order).
     *  - *movestart* triggered after the start of a drag, pan, or zoom
     *  - *move* triggered after each drag, pan, or zoom
     *  - *moveend* triggered after a drag, pan, or zoom completes
     *  - *popupopen* triggered after a popup opens
     *  - *popupclose* triggered after a popup opens
     *  - *addmarker* triggered after a marker has been added
     *  - *removemarker* triggered after a marker has been removed
     *  - *clearmarkers* triggered after markers have been cleared
     *  - *mouseover* triggered after mouseover the map
     *  - *mouseout* triggered after mouseout the map
     *  - *mousemove* triggered after mousemove the map
     *  - *dragstart* triggered after the start of a drag
     *  - *drag* triggered after a drag
     *  - *dragend* triggered after the end of a drag
     *  - *changebaselayer* triggered after the base layer changes
     *  - *mapmouseover* triggered after mouseover the map (2577)
     *  - *mapmouseout* triggered after mouseout the map (2577)
     *  - *changelang* triggered after language changed (IGNF: _addition_)
     *  - *changedisplayprojection* trigged after display projection changes
     *  (IGNF: _addition_)
     *  - *controlactivated* Triggered when activateControl method is called on
     *      a panel (IGNF: _addition_)
     *  - *controlvisibilitychanged* Triggered when a control hides or shows
     *      itself. The visibility and size attributes give the current
     *      control state (IGNF: _addition_)
     *  - *controldeleted* Triggered before removeControl method remove the
     *      control from the map (IGNF: _addition_)
     *  - *beforemove* Triggered just before new zoom or new center is applied
     *  (IGNF: _addition_)
     *  - *activelayer* Triggered when a layer is selected in the layer switcher (IGNF: _addition_)
     */
    EVENT_TYPES: [
        "preaddlayer", "addlayer", "preremovelayer", "removelayer",
        "changelayer", "movestart",
        "move", "moveend", "zoomend", "popupopen", "popupclose",
        "addmarker", "removemarker", "clearmarkers", "mouseover",
        "mouseout", "mousemove", "dragstart", "drag", "dragend",
        "changebaselayer",
        "mapmouseover", "mapmouseout",
        "changelang", "changedisplayprojection",
        "controlactivated", "controlvisibilitychanged", "controldeleted",
        "beforemove", "activelayer"],

    /**
     * APIProperty: mapMouseDelay
     * {Integer} Number of milliseconds between mouseover and mouseout events
     * under which these events are ignored.
     *  Defaults to *100*
     *  IGNF: _addition_
     */
    mapMouseDelay: 100,

    /**
     * Property: isMouseOver
     * {Boolean} True when mouse is over the map.
     *  IGNF: _addition_
     */
    isMouseOver: false,

    /**
     * APIProperty: onMouseOver
     * Trigger event "mapmouseover".
     *  IGNF: _addition_
     *
     * Parameters:
     * e - {<Event>}
     */
    onMouseOver: function(e) {
        if (this.outMapEventsTimer) {
            window.clearTimeout(this.outMapEventsTimer);
            this.outMapEventsTimer= null;
        }
        if (this.isMouseOver) { return; }
        this.isMouseOver= true;
        this.events.triggerEvent("mapmouseover");
    },

    /**
     * APIProperty: onMouseOut
     * Trigger event "mapmouseout".
     *  IGNF: _addition_
     *
     * Parameters:
     * e - {<Event>}
     */
    onMouseOut: function(e) {
        if (!this.outMapEventsTimer) {
            this.outMapEventsTimer= window.setTimeout(
                OpenLayers.Function.bind(function() {
                    this.outMapEventsTimer= null;
                    if (!this.isMouseOver) { return; }
                    this.isMouseOver= false;
                    this.events.triggerEvent("mapmouseout");
                }, this),
                this.mapMouseDelay);
        }
    },

    /**
     * Constructor: OpenLayers.Map
     * Constructor for a new OpenLayers.Map instance.  There are two possible
     *     ways to call the map constructor.  See the examples below.
     * IGNF: _aware of the current document_.
     *
     * Parameters:
     * div - {String} Id of an element in your page that will contain the map.
     *     May be omitted if the <div> option is provided or if you intend
     *     to use <render> later.
     * options - {Object} Optional object with properties to tag onto the map.
     *
     * Examples (method one):
     * (code)
     * // create a map with default options in an element with the id "map1"
     * var map = new OpenLayers.Map("map1");
     *
     * // create a map with non-default options in an element with id "map2"
     * var options = {
     *     maxExtent: new OpenLayers.Bounds(-200000, -200000, 200000, 200000),
     *     maxResolution: 156543,
     *     units: 'm',
     *     projection: "EPSG:41001"
     * };
     * var map = new OpenLayers.Map("map2", options);
     * (end)
     *
     * Examples (method two - single argument):
     * (code)
     * // create a map with non-default options
     * var map = new OpenLayers.Map({
     *     div: "map_id",
     *     maxExtent: new OpenLayers.Bounds(-200000, -200000, 200000, 200000),
     *     maxResolution: 156543,
     *     units: 'm',
     *     projection: "EPSG:41001"
     * });
     *
     * // create a map without a reference to a container - call render later
     * var map = new OpenLayers.Map({
     *     maxExtent: new OpenLayers.Bounds(-200000, -200000, 200000, 200000),
     *     maxResolution: 156543,
     *     units: 'm',
     *     projection: "EPSG:41001"
     * });
     */
    initialize: function (div, options) {
        
        // If only one argument is provided, check if it is an object.
        if(arguments.length === 1 && typeof div === "object") {
            options = div;
            div = options && options.div;
        }

        // Simple-type defaults are set in class definition. 
        //  Now set complex-type defaults 
        this.tileSize = new OpenLayers.Size(OpenLayers.Map.TILE_WIDTH,
                                            OpenLayers.Map.TILE_HEIGHT);
        
        this.paddingForPopups = new OpenLayers.Bounds(15, 15, 15, 15);

        this.theme = OpenLayers._getScriptLocation() + 
                             'theme/default/style.css'; 

        // backup original options
        this.options = OpenLayers.Util.extend({}, options);

        // now override default options 
        OpenLayers.Util.extend(this, options);
        
        var projCode = this.projection instanceof OpenLayers.Projection ?
            this.projection.projCode : this.projection;
        OpenLayers.Util.applyDefaults(this, OpenLayers.Projection.defaults[projCode]);
        
        // allow extents and center to be arrays
        if (this.maxExtent && !(this.maxExtent instanceof OpenLayers.Bounds)) {
            this.maxExtent = new OpenLayers.Bounds(this.maxExtent);
        }
        if (this.minExtent && !(this.minExtent instanceof OpenLayers.Bounds)) {
            this.minExtent = new OpenLayers.Bounds(this.minExtent);
        }
        if (this.restrictedExtent && !(this.restrictedExtent instanceof OpenLayers.Bounds)) {
            this.restrictedExtent = new OpenLayers.Bounds(this.restrictedExtent);
        }
        if (this.center && !(this.center instanceof OpenLayers.LonLat)) {
            this.center = new OpenLayers.LonLat(this.center);
        }
        // initialize layers array
        this.layers = [];

        this.id = OpenLayers.Util.createUniqueID("OpenLayers.Map_");

        this.div = OpenLayers.Util.getElement(div);
        if(!this.div) {
            this.div = OpenLayers.getDoc().createElement("div");
            this.div.style.height = "1px";
            this.div.style.width = "1px";
        }
        
        OpenLayers.Element.addClass(this.div, 'olMap');

        // the viewPortDiv is the outermost div we modify
        var id = this.id + "_OpenLayers_ViewPort";
        this.viewPortDiv = OpenLayers.Util.createDiv(id, null, null, null,
                                                     "relative", null,
                                                     "hidden");
        this.viewPortDiv.style.width = "100%";
        this.viewPortDiv.style.height = "100%";
        this.viewPortDiv.className = "olMapViewport";
        this.div.appendChild(this.viewPortDiv);

        this.events = new OpenLayers.Events(
            this, this.viewPortDiv, null /*this.EVENT_TYPES*/ , this.fallThrough, 
            {includeXY: true}
        );

        // the layerContainerDiv is the one that holds all the layers
        id = this.id + "_OpenLayers_Container";
        this.layerContainerDiv = OpenLayers.Util.createDiv(id);
        this.layerContainerDiv.style.width = '100px';
        this.layerContainerDiv.style.height = '100px';
        this.layerContainerDiv.style.zIndex=this.Z_INDEX_BASE['Popup']-1;
        
        this.viewPortDiv.appendChild(this.layerContainerDiv);

        this.updateSize();
        if(this.eventListeners instanceof Object) {
            this.events.on(this.eventListeners);
        }
 
        // update the map size and location before the map moves
        this.events.register("movestart", this, this.updateSize); // IGNF

        // Because Mozilla does not support the "resize" event for elements 
        // other than "window", we need to put a hack here. 
        if (parseFloat(navigator.appVersion.split("MSIE")[1]) < 9) {
            // If IE < 9, register the resize on the div
            this.events.register("resize", this, this.updateSize);
        } else {
            // Else updateSize on catching the window's resize
            //  Note that this is ok, as updateSize() does nothing if the 
            //  map's size has not actually changed.
            this.updateSizeDestroy = OpenLayers.Function.bind(this.updateSize, 
                this);
            OpenLayers.Event.observe(window, 'resize',
                            this.updateSizeDestroy);
        }
        
        // only append link stylesheet if the theme property is set
        if(this.theme) {
            // check existing links for equivalent url
            var addNode = true;
            var nodes = this.div.ownerDocument.getElementsByTagName('link'); // IGNF
            for(var i=0, len=nodes.length; i<len; ++i) {
                if(OpenLayers.Util.isEquivalentUrl(nodes.item(i).href,
                                                   this.theme)) {
                    addNode = false;
                    break;
                }
            }
            // only add a new node if one with an equivalent url hasn't already
            // been added
            if(addNode) {
                var cssNode = this.div.ownerDocument.createElement('link'); // IGNF
                cssNode.setAttribute('rel', 'stylesheet');
                cssNode.setAttribute('type', 'text/css');
                cssNode.setAttribute('href', this.theme);
                this.div.ownerDocument.getElementsByTagName('head')[0].appendChild(cssNode); // IGNF
            }
        }
        
        if (this.controls == null) { // default controls
            this.controls = [];
            if (OpenLayers.Control != null) { // running full or lite?
                // Navigation or TouchNavigation depending on what is in build
                if (OpenLayers.Control.Navigation) {
                    this.controls.push(new OpenLayers.Control.Navigation());
                } else if (OpenLayers.Control.TouchNavigation) {
                    this.controls.push(new OpenLayers.Control.TouchNavigation());
                }
                if (OpenLayers.Control.Zoom) {
                    this.controls.push(new OpenLayers.Control.Zoom());
                } else if (OpenLayers.Control.PanZoom) {
                    this.controls.push(new OpenLayers.Control.PanZoom());
                }

                if (OpenLayers.Control.ArgParser) {
                    this.controls.push(new OpenLayers.Control.ArgParser());
                }
                if (OpenLayers.Control.Attribution) {
                    this.controls.push(new OpenLayers.Control.Attribution());
                }
            }
        }

        for(var i=0, len=this.controls.length; i<len; i++) {
            this.addControlToMap(this.controls[i]);
        }

        this.popups = [];

        this.unloadDestroy = OpenLayers.Function.bind(this.destroy, this);
        
        if (this.mapmouseEventsEnable===true) { // IGNF
            this.events.register('mouseover', this, this.onMouseOver);
            this.events.register('mouseout', this, this.onMouseOut);
        }

        // always call map.destroy()
        OpenLayers.Event.observe(window, 'unload', this.unloadDestroy);
        
        // add any initial layers
        if (options && options.layers) {
            /** 
             * If you have set options.center, the map center property will be
             * set at this point.  However, since setCenter has not been called,
             * addLayers gets confused.  So we delete the map center in this 
             * case.  Because the check below uses options.center, it will
             * be properly set below.
             */
            delete this.center;
            this.addLayers(options.layers);
            // set center (and optionally zoom)
            if (options.center && !this.getCenter()) {
                // zoom can be undefined here
                this.setCenter(options.center, options.zoom);
            }
        }
    },





    /**
     * APIMethod: destroy
     * Destroy this map.
     *      IGNF: _bug fix for IE when closing page_.
     */
    destroy: function() {
        // if unloadDestroy is null, we've already been destroyed
        if (!this.unloadDestroy) {
            return false;
        }

        // make sure panning doesn't continue after destruction
        if(this.panTween) {
            this.panTween.stop();
            this.panTween = null;
        }

        if (this.mapmouseEventsEnable===true) {
            this.events.unregister('mouseover', this, this.onMouseOver);
            this.events.unregister('mouseout', this, this.onMouseOut);
        }

        // map has been destroyed. dont do it again!
        OpenLayers.Event.stopObserving(window, 'unload', this.unloadDestroy);
        this.unloadDestroy = null;

        if (this.updateSizeDestroy) {
            OpenLayers.Event.stopObserving(window, 'resize',
                                           this.updateSizeDestroy);
        } else {
            this.events.unregister("resize", this, this.updateSize);
        }

        this.paddingForPopups = null;

        if (this.controls != null) {
            for (var i = this.controls.length - 1; i>=0; --i) {
                if (this.controls[i]) {//IGNF
                    this.controls[i].destroy();
                }
            }
            this.controls = null;
        }
        if (this.layers != null) {
            // DGR 2013-04-02 : removing a geoportal on a territory
            //                  removes all layers on each territory!
            var i = this.layers.length - 1;
            while (i>=0) {
            //for (var i = this.layers.length - 1; i>=0; --i) {
                // pass 'false' to destroy so that map wont try to set a new
                // baselayer after each baselayer is removed
                this.layers[i].destroy(false);
                i = this.layers.length - 1;
            }
            this.layers = null;
        }
        if (this.viewPortDiv) {
            //IGNF: this.div.childNodes.length==0 ? (IE)
            if (this.div.childNodes.length>0) {
                this.div.removeChild(this.viewPortDiv);
            }
        }
        this.viewPortDiv = null;

        if(this.eventListeners) {
            this.events.un(this.eventListeners);
            this.eventListeners = null;
        }
        this.events.destroy();
        this.events = null;

    },

    /**
     * APIMethod: moveTo
     *      IGNF: _inclusion of "beforemove" event, various fixes_.
     *
     * Parameters:
     * lonlat - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>}
     * zoom - {Integer}
     * options - {Object}
     */
    moveTo: function(lonlat, zoom, options) {
        if (!options) {
            options = {};
        }
        if (zoom != null) {
            zoom = parseFloat(zoom);
            if (!this.fractionalZoom) {
                zoom = Math.round(zoom);
            }
        }

        // give beforemove listeners a chance to abort the move or
        // change the zoom and/or lonlat
        var evt = {zoom: zoom, lonlat: lonlat, options: options};
        if (this.events.triggerEvent("beforemove", evt) === false) {
            return;
        }
        zoom = evt.zoom;
        lonlat = evt.lonlat;

        var locLonlat= lonlat? lonlat.clone(): null;

        // dragging is false by default
        var dragging = options.dragging || this.dragging;
        // forceZoomChange is false by default
        var forceZoomChange = options.forceZoomChange;

        if (!this.getCachedCenter() && !this.isValidLonLat(locLonlat)) {
            //lonlat = this.maxExtent.getCenterLonLat();
            //IGNF:
            locLonlat = this.getMaxExtent().getCenterLonLat();// OL is maxExtent
            this.center = locLonlat.clone();//FIXME
        }

        if(this.restrictedExtent != null) {
            // In 3.0, decide if we want to change interpretation of maxExtent.
            if(locLonlat == null) {
                locLonlat = this.getCenter();//OL is this.center;
            }
            if(zoom == null) {
                zoom = this.getZoom();
            }
            var resolution = this.getResolutionForZoom(zoom);
            var extent = this.calculateBounds(locLonlat, resolution);
            if(extent!=null && !this.restrictedExtent.containsBounds(extent)) {
                var maxCenter = this.restrictedExtent.getCenterLonLat();
                if(extent.getWidth() > this.restrictedExtent.getWidth()) {
                    locLonlat = new OpenLayers.LonLat(maxCenter.lon, locLonlat.lat);
                } else if(extent.left < this.restrictedExtent.left) {
                    locLonlat = locLonlat.add(this.restrictedExtent.left -
                                        extent.left, 0);
                } else if(extent.right > this.restrictedExtent.right) {
                    locLonlat = locLonlat.add(this.restrictedExtent.right -
                                        extent.right, 0);
                }
                if(extent.getHeight() > this.restrictedExtent.getHeight()) {
                    locLonlat = new OpenLayers.LonLat(locLonlat.lon, maxCenter.lat);
                } else if(extent.bottom < this.restrictedExtent.bottom) {
                    locLonlat = locLonlat.add(0, this.restrictedExtent.bottom -
                                        extent.bottom);
                }
                else if(extent.top > this.restrictedExtent.top) {
                    locLonlat = locLonlat.add(0, this.restrictedExtent.top -
                                        extent.top);
                }
            }
        }

        var zoomChanged = forceZoomChange || (
                            (this.isValidZoomLevel(zoom)) &&
                            (zoom != this.getZoom()) );

        var resol= (this.getProjection()
                    ? this.getProjection().getProjName()=='longlat'? 0.000028:1.0
                    : undefined);
        //isValidLonLat() returns false when point is out of maxExtent or point is null ...
        var centerChanged= !(locLonlat && this.isValidLonLat(locLonlat) && locLonlat.equals(this.center,resol));

        // if neither center nor zoom will change, no need to do anything
        if (zoomChanged || centerChanged || dragging) {
            dragging || this.events.triggerEvent("movestart");

            if (centerChanged && locLonlat!=null) {
                if (!zoomChanged && this.center) {
                    // if zoom hasnt changed, just slide layerContainer
                    //  (must be done before setting this.center to new value)
                    this.centerLayerContainer(locLonlat);
                }
                this.center = locLonlat.clone();
            }

            var res = zoomChanged ?
                this.getResolutionForZoom(zoom) : this.getResolution();
            // (re)set the layerContainerDiv's location
            if (zoomChanged || this.layerContainerOrigin == null) {
                this.layerContainerOrigin = this.getCachedCenter();
                this.layerContainerDiv.style.left = "0px";
                this.layerContainerDiv.style.top  = "0px";
                var maxExtent = this.getMaxExtent({restricted: true});
                var maxExtentCenter = maxExtent.getCenterLonLat();
                var lonDelta = this.center.lon - maxExtentCenter.lon;
                var latDelta = maxExtentCenter.lat - this.center.lat;
                var extentWidth = Math.round(maxExtent.getWidth() / res);
                var extentHeight = Math.round(maxExtent.getHeight() / res);
                var left = (this.size.w - extentWidth) / 2 - lonDelta / res;
                var top = (this.size.h - extentHeight) / 2 - latDelta / res;
                this.minPx = new OpenLayers.Pixel(left, top);
                this.maxPx = new OpenLayers.Pixel(left + extentWidth, top + extentHeight);
            }

            if (zoomChanged) {
                this.zoom = zoom;
                this.resolution = res;
                // zoom level has changed, increment viewRequestID.
                this.viewRequestID++;
            }

            var bounds = this.getExtent();

            //send the move call to the baselayer and all the overlays

            if (bounds && this.baseLayer && this.baseLayer.visibility) {
                this.baseLayer.inRange = this.baseLayer.calculateInRange();//IGNF
                this.baseLayer.moveTo(bounds, zoomChanged, options.dragging);
                options.dragging || this.baseLayer.events.triggerEvent(
                    "moveend", {zoomChanged: zoomChanged}
                );
            }

            bounds = this.baseLayer && this.baseLayer.getExtent() || null;

            for (var i=this.layers.length-1; i>=0; --i) {
                var layer = this.layers[i];
                if (!layer) { continue; } //IGNF
                if (layer.isBaseLayer && layer!==this.baseLayer) { continue; } //IGNF
                if (layer !== this.baseLayer && !layer.isBaseLayer) {
                    var inRange = layer.calculateInRange();
                    if (layer.inRange != inRange) {
                        // the inRange property has changed. If the layer is
                        // no longer in range, we turn it off right away. If
                        // the layer is no longer out of range, the moveTo
                        // call below will turn on the layer.
                        layer.inRange = inRange;
                        if (!inRange) {
                            layer.display(false);
                        } else {
                            // force zoomChanged when the layer is no longer
                            // out of range
                            zoomChanged = true;
                        }
                        this.events.triggerEvent("changelayer", {
                            layer: layer, property: "visibility"
                        });
                    }
                    if (inRange && layer.visibility) {
                        layer.moveTo(bounds, zoomChanged, options.dragging);
                        options.dragging || layer.events.triggerEvent(
                            "moveend", {zoomChanged: zoomChanged}
                        );
                    }
                }
            }

            this.events.triggerEvent("move");
            dragging || this.events.triggerEvent("moveend");

            if (zoomChanged) {
                //redraw popups
                for (var i= 0, len= this.popups.length; i<len; i++) {
                    this.popups[i].updatePosition();
                }
                this.events.triggerEvent("zoomend");
            }
        }
    },

    /**
     * APIMethod: setBaseLayer
     * Allows user to specify one of the currently-loaded layers as the Map's
     *     new base layer.
     *      IGNF: _change in triggering "changebaselayer", bug fix on bounds
     *      reprojection before setCenter called_.
     *
     * Parameters:
     * newBaseLayer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} new base layer to set up.
     * ll - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>} targetted center if any expressed in the
     *      current base layer's projection.
     * zoom - {Integer} targetted zoom if any.
     */
    setBaseLayer: function(newBaseLayer,ll,zoom) {

        if (newBaseLayer != this.baseLayer) {
            var oldBaseLayer= null;
            var oldProjection= null;
            var oldExtent= null;
            if (this.baseLayer) {
                oldBaseLayer= this.baseLayer;
                oldProjection= this.getProjection();
                oldExtent= this.baseLayer.getExtent();
            }

            // ensure newBaseLayer is already loaded
            if (OpenLayers.Util.indexOf(this.layers, newBaseLayer) != -1) {

                // preserve center and scale when changing base layers
                var center = this.getCachedCenter();
                var newResolution = OpenLayers.Util.getResolutionFromScale(
                    this.getScale(), newBaseLayer.units
                );
                if (newBaseLayer.events.triggerEvent("loadstart")===false) {//IGNF
                    return;
                }

                // make the old base layer invisible
                if (this.baseLayer != null && !this.allOverlays) {
                    this.baseLayer.setVisibility(false);
                }

                // set new baselayer
                this.baseLayer= newBaseLayer;

                // Increment viewRequestID since the baseLayer is
                // changing. This is used by tiles to check if they should
                // draw themselves.
                this.viewRequestID++;
                if(!this.allOverlays || this.baseLayer.visibility) {
                    this.baseLayer.setVisibility(true);
                }

                // IGN: better give the old baseLayer than the new (which is
                // the current baseLayer now!). We keep layer and add
                // baseLayer to keep compatibility with current OL (while none
                // of the core code uses the event layer property !-)
                // IGN: layer must reproject their maxExtent before setCenter
                // is issued and their redrawal ...
                this.events.triggerEvent("changebaselayer", {
                    layer: newBaseLayer,
                    baseLayer: oldBaseLayer
                });
                newBaseLayer.events.triggerEvent("loadend");//IGNF

                // recenter the map
                if (center!=null || ll!=null) {

                    //either get the center from the old Extent or just from
                    // the current center of the map.
                    var newCenter = (ll)
                        ? ll.clone()
                        : (oldExtent)
                            ? oldExtent.getCenterLonLat()
                            : center;
                    // reproject map center :
                    newCenter.transform(oldProjection,this.getProjection());

                    //the new zoom will either come from the old Extent or
                    // from the current resolution of the map or
                    // from the caller
                    var newZoom = (typeof(zoom)=='number')
                        ? zoom
                        : (oldExtent)
                            ? this.getZoomForExtent(oldExtent, true)
                            : this.getZoomForResolution(this.resolution, true);

                    // zoom and force zoom change
                    this.setCenter(newCenter, newZoom, false, true);
                }
            }
        }
    },

    /**
     * Method: addControlToMap
     *      IGNF: _bug fix on zIndex_.
     *
     * Parameters:
     * control - {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>}
     * px - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>}
     */
    addControlToMap: function (control, px) {
        // If a control doesn't have a div at this point, it belongs in the
        // viewport.
        // IGNF: if outsideViewport has been set to true before addition, keep it.
        control.outsideViewport = control.outsideViewport || (control.div != null);

        // If the map has a displayProjection, and the control doesn't, set
        // the display projection.
        if (this.displayProjection && !control.displayProjection) {
            control.displayProjection = this.displayProjection;
        }

        control.setMap(this);
        var div = control.draw(px);
        if (div) {
            // IGNF: if zIndex not set, always set it ?
            if (!div.style.zIndex) {
                div.style.zIndex = this.Z_INDEX_BASE['Control'] +
                                    this.controls.length;
            }
            if(!control.outsideViewport) {
                //div.style.zIndex = this.Z_INDEX_BASE['Control'] +
                //                    this.controls.length;
                this.viewPortDiv.appendChild( div );
            }
        }
        if(control.autoActivate) {
            control.activate();
        }
    },

    /**
     * APIMethod: removeControl
     * Remove a control from the map. Removes the control both from the map
     *     object's internal array of controls, as well as from the map's
     *     viewPort (assuming the control was not added outsideViewport)
     *  IGNF: _trigger controldeleted event_
     *
     * Parameters:
     * control - {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>} The control to remove.
     */
    removeControl: function (control) {
        //make sure control is non-null and actually part of our map
        if ( (control) && (control == this.getControl(control.id)) ) {
            this.events.triggerEvent("controldeleted", {"control":control});//IGNF
            if (control.div && (control.div.parentNode == this.viewPortDiv)) {
                this.viewPortDiv.removeChild(control.div);
            }
            OpenLayers.Util.removeItem(this.controls, control);
        }
    },

    /**
     * Method: calculateBounds
     * IGNF: _bug fix when getting map's size_
     *
     * Parameters:
     * center - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>} Default is this.getCenter()
     * resolution - {float} Default is this.getResolution()
     *
     * Returns:
     * {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>} A bounds based on resolution, center, and
     *                       current mapsize.
     */
    calculateBounds: function(center, resolution) {

        var extent = null;

        if (center == null) {
            center = this.getCachedCenter();
        }
        if (resolution == null) {
            resolution = this.getResolution();
        }

        if ((center != null) && (resolution != null)) {

            var size = this.getSize();
            if (size != null) {//IGNF
                var w_deg = size.w * resolution;
                var h_deg = size.h * resolution;

                extent = new OpenLayers.Bounds(center.lon - w_deg / 2,
                                               center.lat - h_deg / 2,
                                               center.lon + w_deg / 2,
                                               center.lat + h_deg / 2);
            }

        }

        return extent;
    },

    /**
     * APIMethod: getApproxScaleDenominator
     * Approximate the current scale denominator.
     *  IGNF: _addition_
     *
     * Parameters:
     * z - {Integer} possibly the zoom to use.
     *
     * Returns:
     * {Integer} the scale denominator, 0 if no baselayer is set.
     */
    getApproxScaleDenominator: function(z) {
        var scale= 0;
        if (this.baseLayer!=null) {
            z= (z!=undefined? z : this.getZoom());
            var res= this.baseLayer.getResolutionForZoom(z);
            var units= this.baseLayer.getNativeProjection().getUnits();
            scale= Math.round(OpenLayers.Util.getScaleFromResolution(res, units) || 0);
            if (scale>0) {
                var n= Math.floor(Math.log(scale)/Math.log(10.0));
                var d= Math.exp(n*Math.log(10.0));
                var r= scale/d;
                scale= Math.round(Math.round(r)*d);
            }
        }
        return scale;
    }

    });

}

/**
 * Class: OpenLayers.Layer
 * IGNF: various properties and methods additions and bug fixes.
 */
if (OpenLayers.Layer) {

    //FIXME: check for new layers ?

    OpenLayers.Layer= OpenLayers.overload(OpenLayers.Layer, {

    /**
     * APIProperty: dataURL
     * {String} Contains a link to an online resource where data corresponding to the
     * layer can be found.
     *      Defaults to *null*
     *
     * FIXME: use new metadata property ?
     *
     *  IGNF: _addition_
     */
    dataURL: null,

    /**
     * APIProperty: metadataURL
     * {String} Contains a link to an online resource where descriptive metadata
     * corresponding to the layer can be found.
     *      Defaults to *null*
     *
     * FIXME: use new metadata property ?
     *
     *  IGNF: _addition_
     */
    metadataURL: null,

    /**
     * Property: onLoadError
     * {Function} Return a default result when loading data failed.
     *      Defaults to *null*
     *  IGNF: _addition from OpenLayers 2.9_
     */
    onLoadError: null,

    /**
     * APIMethod: transform
     * Reproject layer's extents.
     *      Does nothing. Should be overwritten by sub-classes.
     *  IGNF: _addition_
     *
     * Parameters:
     * source - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the source projection.
     * dest - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the destination projection.
     */
    transform: function(source, dest) {
    },

    /**
     * APIMethod: changeBaseLayer
     * Proposed listener of the map's event 'changebaselayer'.
     *      Reproject its maxExtent according to the new
     *      base layer if it is not a base layer itself.
     *  IGNF: _addition_
     *
     * Parameters:
     * evt - {Event} the 'changebaselayer' event.
     *
     * Context:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the new baseLayer
     * baseLayer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the old baseLayer
     *
     * Returns:
     * {Boolean} true to keep on, false to stop propagating the event.
     */
    changeBaseLayer: function(evt) {
        if (!evt) { return false; }
        if (!(evt.baseLayer)) { return false; }
        if (!this.map) { return false; }
        if (this.isBaseLayer) { return true; }
        var mapProj= this.map.getProjection();
        var oldMapProj= evt.baseLayer.getNativeProjection();
        // See OpenLayers.Layer.setMap() :
        if (this.maxExtent) {
            this.maxExtent.transform(oldMapProj,mapProj,true);
        }
        if (this.restrictedExtent) {
            this.restrictedExtent.transform(oldMapProj,mapProj,true);
        }
        if (this.territory && evt.layer.territory && this.territory != evt.layer.territory) {
            this.displayInLayerSwitcher= false;
            this.setVisibility(false);
        } else {
            if (this.aggregate!=undefined) {
                this.setVisibility(this.aggregate.visibility);
            }
        }

        return true;
    },

    /**
     * Method: getCompatibleProjection
     * Check whether the layer's projection is displayable with the base layer.
     *  IGNF: _addition_
     *
     * Params:
     * blayer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the baseLayer to compare with.
     *      if none, use current baseLayer from the map.
     *
     * Returns:
     * {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} if compatible,
     * undefined if not relevant, null on error.
     */
    getCompatibleProjection: function(blayer) {
        if (this.aggregate!=undefined) { return undefined; }
        var lproj= this.getNativeProjection();
        if (lproj==null) {
            if (this.map==null) { return undefined; }
            return null;
        }
        if (blayer==null) {
            if (this.map==null) { return undefined; }
            blayer= this.map.baseLayer;
            if (blayer==null) { return undefined; }
        }
        if (blayer.territory && this.territory && blayer.territory!==this.territory) { return null; }
        var bproj= blayer.getNativeProjection();

        var result= lproj.isCompatibleWith(bproj)? lproj:null;
        return result;
    },

    /**
     * APIMethod: setMap
     * Set the map property for the layer. This is done through an accessor
     *     so that subclasses can override this and take special action once
     *     they have their map variable set.
     *
     *     Here we take care to bring over any of the necessary default
     *     properties from the map.
     * IGNF: _bug fix on maxExtent_.
     *
     * Parameters:
     * map - {<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>}
     */
    setMap: function(map) {
        if (this.map == null) {

            this.map= map;

            // grab some essential layer data from the map if it hasn't already been set
            this.projection= this.getNativeProjection();
            // Check the projection to see if we can get units -- if not, refer
            // to properties.
            if (this.projection) {
                this.units= this.projection.getUnits() || this.units || this.map.units;
            }

            // FIXME if maxExtent exists it is expected to be in layer's projection
            //       as found in the capabilities
            if (this.maxExtent) {
                if (this.isBaseLayer) {
                    // we assume that base Layer's extent are correct as they
                    // support the map's projection
                    ;
                } else {
                    // depending on the Layer's type, reprojecting helps ...
                    this.maxExtent.transform(this.projection, this.map.getProjection(),true);
                }
            }
            if (this.minExtent) {
                if (this.isBaseLayer) {
                    // we assume that base Layer's extent are correct as they
                    // support the map's projection
                    ;
                } else {
                    // depending on the Layer's type, reprojecting helps ...
                    this.minExtent.transform(this.projection, this.map.getProjection(),true);
                }
            }
            if (!this.maxExtent || !this.minExtent) {
                //IGN: bug in OpenLayers.Layer.setMap():
                //this.maxExtent = this.maxExtent || this.map.maxExtent;
                // Find the relevant baseLayer ...
                var bl= null;
                for (var i= 0, l= map.layers.length; i<l; i++) {
                    var lyr= map.layers[i];
                    if (!lyr.isBaseLayer) { continue; }
                    if (this.projection.equals(lyr.getNativeProjection())) {
                        bl= lyr;
                        break;
                    }
                    if (this.projection.isCompatibleWith(lyr.getNativeProjection())) {
                        bl= lyr;
                        continue;
                    }
                }
                if (!this.maxExtent) {
                    if (bl && bl.maxExtent) {
                        this.maxExtent= bl.maxExtent.clone().
                                transform(bl.getNativeProjection(),this.map.getProjection(),true);
                    } else {
                        this.maxExtent= (new OpenLayers.Bounds(-180,-90,180,90)).
                                transform(OpenLayers.Projection.CRS84,this.map.getProjection(),true);
                    }
                }
                if (!this.minExtent) {
                    if (bl && bl.minExtent) {
                        this.minExtent= bl.minExtent.clone().
                                transform(bl.getNativeProjection(),this.map.getProjection(),true);
                    } else {
                        this.minExtent= null;
                    }
                }
            }
            if (this.restrictedExtent) {
                this.restrictedExtent.transform(this.projection,this.map.getProjection(),true);
            }
            if (this.originators) {
                for (var i= 0, l= this.originators.length; i<l; i++) {
                    var logo= this.originators[i];
                    if (logo.extent) {
                        if (!(OpenLayers.Util.isArray(logo.extent))) {
                            logo.extent= [logo.extent];
                        }
                        for (var j= 0, jl= logo.extent.length; j<jl; j++) {
                            logo.extent[j].transform(this.projection,this.map.getProjection(),true);
                        }
                    }
                }
            }

            this.initResolutions();

            if (!this.isBaseLayer) {
                this.inRange = this.calculateInRange();
                var show = ((this.visibility) && (this.inRange));
                this.div.style.display = show ? "" : "none";
            }

            // deal with gutters
            this.setTileSize();
        }
    },

    /**
     * Method: calculateInRange
     * Check whether the layer is viewable. Adds the ability to be
     * viewable by also checking its maxExtent.
     * FIXME: should be listen to moveend event for extent checking ?
     * IGNF: _takes layer's maxExtent with regard to current view extent_.
     *
     * Returns:
     * {Boolean} The layer is displayable at the current map's current
     *     resolution. Note that if 'alwaysInRange' is true for the layer,
     *     this function will always return true.
     */
    calculateInRange: function() {
        var inRange = false;

        if (this.alwaysInRange) {
            inRange = true;
        } else {
            if (this.map) {
                var resolution = this.map.getResolution();
                inRange = ( (resolution >= this.minResolution) &&
                            (resolution <= this.maxResolution) );
                //checks whether the extent intersects the current map's
                //extent (IGNF):
                if (inRange && !this.isBaseLayer && this.maxExtent) {
                    var viewExtent= this.map.calculateBounds();
                    if (viewExtent) {
                        //this can be heavy but ...
                        var x= this.restrictedExtent || this.maxExtent;
                        inRange= viewExtent.intersectsBounds(x);
                        //checks whether one of the constraint extent intersects
                        //the current map's extent :
                        if (inRange && this.constraints) {
                            inRange = false;
                            for (var i=0, l=this.constraints.length; i<l; i++) {
                                var constraint = this.constraints[i];
                                if ( (resolution >= constraint.minResolution) &&
                                     (resolution <= constraint.maxResolution) ) {
                                    if (viewExtent.intersectsBounds(constraint.maxExtent)) {
                                        inRange = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return inRange;
    },

    /**
     * Method: initResolutions
     * This method's responsibility is to set up the 'resolutions' array
     *     for the layer -- this array is what the layer will use to interface
     *     between the zoom levels of the map and the resolution display
     *     of the layer.
     *
     * The user has several options that determine how the array is set up.
     *
     * For a detailed explanation, see the following wiki from the
     *     openlayers.org homepage:
     *     http://trac.openlayers.org/wiki/SettingZoomLevels
     *
     * IGNF: _changes in computation of various properties (scales,
     * resolutions)_.
     */
    initResolutions:  function() {

        // ok we want resolutions, here's our strategy:
        //
        // 1. if resolutions are defined in the layer config, use them
        // 2. else, if scales are defined in the layer config then derive
        //    resolutions from these scales
        // 3. else, attempt to calculate resolutions from maxResolution,
        //    minResolution, numZoomLevels, maxZoomLevel set in the
        //    layer config
        // 4. if we still don't have resolutions, and if resolutions
        //    are defined in the same, use them
        // 5. else, if scales are defined in the map then derive
        //    resolutions from these scales
        // 6. else, attempt to calculate resolutions from maxResolution,
        //    minResolution, numZoomLevels, maxZoomLevel set in the
        //    map
        // 7. hope for the best!

        var i, len, p;
        var props = {}, alwaysInRange = true;

        // get resolution data from layer config
        // (we also set alwaysInRange in the layer as appropriate)
        for(i=0, len=this.RESOLUTION_PROPERTIES.length; i<len; i++) {
            p = this.RESOLUTION_PROPERTIES[i];
            props[p] = this.options[p];
            if(alwaysInRange && this.options[p]) {
                alwaysInRange = false;
            }
        }
        if(this.alwaysInRange == null) {
            this.alwaysInRange = alwaysInRange;
        }

        // if we don't have resolutions then attempt to derive them from scales
        if(props.resolutions == null) {
            props.resolutions = this.resolutionsFromScales(props.scales);
        }

        // if we still don't have resolutions then attempt to calculate them
        if(props.resolutions == null) {
            props.resolutions = this.calculateResolutions(props);
        }

        // if we couldn't calculate resolutions then we look at we have
        // in the map
        if(props.resolutions == null) {
            for(i=0, len=this.RESOLUTION_PROPERTIES.length; i<len; i++) {
                p = this.RESOLUTION_PROPERTIES[i];
                props[p] = this.options[p] != null ?
                    this.options[p] : this.map[p];
            }
            if(props.resolutions == null) {
                props.resolutions = this.resolutionsFromScales(props.scales);
            }
            if(props.resolutions == null) {
                props.resolutions = this.calculateResolutions(props);
            }
        }

        // ok, we new need to set properties in the instance

        // get maxResolution from the config if it's defined there
        var maxResolution;
        if(this.options.maxResolution &&
           this.options.maxResolution !== "auto") {
            maxResolution = this.options.maxResolution;
        }
        if(this.options.minScale) {
            maxResolution = OpenLayers.Util.getResolutionFromScale(
                this.options.minScale, this.units);
        }

        // get minResolution from the config if it's defined there
        var minResolution;
        if(this.options.minResolution &&
           this.options.minResolution !== "auto") {
            minResolution = this.options.minResolution;
        }
        if(this.options.maxScale) {
            minResolution = OpenLayers.Util.getResolutionFromScale(
                this.options.maxScale, this.units);
        }

        if(props.resolutions) {

            //sort resolutions array descendingly
            props.resolutions.sort(function(a, b) {
                return (b - a);
            });

            // if we still don't have a maxResolution get it from the
            // resolutions array
            if(!maxResolution) {
                maxResolution = props.resolutions[0];
            }

            // if we still don't have a minResolution get it from the
            // resolutions array
            if(!minResolution) {
                var lastIdx = props.resolutions.length - 1;
                minResolution = props.resolutions[lastIdx];
            }
        }

        this.resolutions = props.resolutions;
        if(this.resolutions) {
            len = this.resolutions.length;
            this.scales = new Array(len);
            for(i=0; i<len; i++) {
                this.scales[i] = OpenLayers.Util.getScaleFromResolution(
                    this.resolutions[i], this.units);
            }
            this.numZoomLevels = len;
        }
        this.minResolution = minResolution;
        if(minResolution) {
            this.maxScale = OpenLayers.Util.getScaleFromResolution(
                minResolution, this.units);
        }
        this.maxResolution = maxResolution;
        if(maxResolution) {
            this.minScale = OpenLayers.Util.getScaleFromResolution(
                maxResolution, this.units);
        }

        //IGNF begin
        this.minZoomLevel = typeof(this.options['minZoomLevel'])=='number'?
                                this.options['minZoomLevel'] :
                                this.map.minZoomLevel || 0;
        if (this.minZoomLevel < 0) {
            this.minZoomLevel = 0;
        }
        this.maxZoomLevel = this.options['maxZoomLevel'] || this.map.maxZoomLevel;
        if (this.resolutions) {
            this.maxZoomLevel = this.maxZoomLevel || this.resolutions.length - 1;
            if (this.maxZoomLevel > this.resolutions.length) {
                this.maxZoomLevel = this.resolutions.length - 1;
            }
            if (this.minZoomLevel > this.resolutions.length) {
                this.minZoomLevel = 0;
            }

            this.maxResolution = this.resolutions[this.minZoomLevel];
            this.minResolution = this.resolutions[this.maxZoomLevel];

            this.minScale = this.scales[this.minZoomLevel];
            this.maxScale = this.scales[this.maxZoomLevel];
        }
        //IGNF end
    },

  

    /**
     * APIMethod: setOpacity
     * Sets the opacity for the entire layer (all images).
     * IGNF: _bug fix for <OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html> base classes_.
     *
     * Parameter:
     * opacity - {Float}
     */
    
    setOpacity: function(opacity) {
        if (opacity != this.opacity) {
            this.opacity = opacity;
            var childNodes = this.div.childNodes;
            for(var i = 0, len = childNodes.length; i < len; ++i) {
                var element = childNodes[i].firstChild || childNodes[i];
                var lastChild = childNodes[i].lastChild;
                //TODO de-uglify this
                if (lastChild && lastChild.nodeName.toLowerCase() === "iframe") {
                    element = lastChild.parentNode;
                }
                if (element) {//IGNF
                    OpenLayers.Util.modifyDOMElement(element, null, null, null,
                                                     null, null, null, opacity);
                }
            }
            if (this.map != null) {
                this.map.events.triggerEvent("changelayer", {
                    layer: this,
                    property: "opacity"
                });
            }
        }
    }

    });

}

/**
 * Class: OpenLayers.StyleMap
 * IGNF: clone() method addition
 */
if (OpenLayers.StyleMap) {

    OpenLayers.StyleMap= OpenLayers.overload(OpenLayers.StyleMap, {

    /**
     * APIMethod: clone
     * Clones this styles' map.
     *
     * Returns:
     * {<OpenLayers.Style at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Style-js.html>} Clone of this style.
     */
    clone: function() {
        var styles= {};
        for (var s in this.styles) {
            styles[s]= this.styles[s].clone();
        }
        var options= {};
        options.extendDefault= this.extendDefault;
        return new OpenLayers.StyleMap(styles, options);
    }

    });

}

/**
 * Class: OpenLayers.Layer.Vector
 * IGNF: addition of changeBaseLayer, getCompatibleProjection
 */
if (OpenLayers.Layer && OpenLayers.Layer.Vector) {

    OpenLayers.Layer.Vector= OpenLayers.overload(OpenLayers.Layer.Vector, {

    /**
     * APIMethod: setOpacity
     * Sets the opacity for the entire layer (all images).
     * IGNF: _bug fix for <OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html> base classes_.
     *
     * Parameter:
     * opacity - {Float}
     */
    setOpacity: function(opacity) {
        if (opacity != this.opacity) {
            this.opacity = opacity;
            if (this.renderer && this.renderer.root) {
                OpenLayers.Util.modifyDOMElement(this.renderer.root, null,
                                                 null, null, null, null, null,
                                                 opacity);
                if (this.map != null) {
                    this.map.events.triggerEvent("changelayer", {
                        layer: this,
                        property: "opacity"
                    });
                }
            }
        }
    },

    /**
     * APIMethod: transform
     * Reproject features.
     *  IGNF: _addition_
     *
     * Parameters:
     * source - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the source projection.
     * dest - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the destination projection.
     */
    transform: function(source, dest) {
        if (this.protocol) {
            this.protocol.format.internalProjection= dest.clone();
            //this.protocol.options || this.protocol.options.internalProjection= dest.clone();
        } else {//FIXME: old way
            if (this.format) {
                this.format.internalProjection= dest.clone();
            } else {
                //if (!this.options) {
                //    this.options= {};
                //}
                if (!this.formatOptions) {
                    this.formatOptions= {};
                }
                //if (!this.options.formatOptions) {
                //    this.options.formatOptions= {};
                //}
                //this.options.formatOptions.internalProjection= dest.clone();
                this.formatOptions.internalProjection= dest.clone();
            }
        }
        for (var i= 0, l= this.features.length; i<l; i++) {
            var feature= this.features[i];
            feature.geometry.transform(source,dest);
            if (feature.popup && feature.popup.lonlat) {
                feature.popup.hide();
                feature.popup.lonlat.transform(source,dest);
            }
        }
    },

    /**
     * APIMethod: changeBaseLayer
     * Listener of the map's event 'changebaselayer'.
     *      Reproject its maxExtent according to the new
     *      base layer if it is not a base layer itself.
     *  IGNF: _addition_
     *
     * Parameters:
     * evt - {Event} the 'changebaselayer' event.
     *
     * Context:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the new baseLayer
     * baseLayer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the old baseLayer
     *
     * Returns:
     * {Boolean} true to keep on, false to stop propagating the event.
     */
    changeBaseLayer: function(evt) {
        if (OpenLayers.Layer.prototype.changeBaseLayer.apply(this,arguments)===false) {
            return false;
        }
        if (!this.isBaseLayer) {
            var v= this.getVisibility();
            if (v) {
                this.setVisibility(false);//remove old locations;
            }
            var mapProj= this.map.getProjection();
            var oldMapProj= evt.baseLayer? evt.baseLayer.getNativeProjection() : null;
            this.addOptions({projection: mapProj.clone()});// force re-computing resolutions
            if (oldMapProj) {
                this.transform(oldMapProj, mapProj);
            }
            if (v) {
                this.setVisibility(true);//reproject
            }
        }
        return true;
    },

    /**
     * Method: getCompatibleProjection
     * Check whether the layer's projection is displayable with the base layer.
     *  IGNF: _addition_
     *
     * Params:
     * blayer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the baseLayer to compare with.
     *      if none, use current baseLayer from the map.
     *
     * Returns:
     * {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} if compatible,
     * undefined if not relevant, null on error.
     */
    getCompatibleProjection: function(blayer) {
        if (this.aggregate!=undefined) { return undefined; }
        var lproj= this.getNativeProjection();
        if (lproj==null) {
            if (this.map==null) { return undefined; }
            return null;
        }

        return lproj;
    }

    });

}

/**
 * Class: OpenLayers.Layer.Vector.RootContainer
 * IGNF: addition of changeBaseLayer, getCompatibleProjection
 */
if (OpenLayers.Layer && OpenLayers.Layer.Vector && OpenLayers.Layer.Vector.RootContainer) {

    OpenLayers.Layer.Vector.RootContainer= OpenLayers.overload(OpenLayers.Layer.Vector.RootContainer, {

    /**
     * APIMethod: changeBaseLayer
     * Listener of the map's event 'changebaselayer'.
     *      Reproject its maxExtent according to the new
     *      base layer if it is not a base layer itself.
     *  IGNF: _addition_
     *
     * Parameters:
     * evt - {Event} the 'changebaselayer' event.
     *
     * Context:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the new baseLayer
     * baseLayer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the old baseLayer
     *
     * Returns:
     * {Boolean} true to keep on, false to stop propagating the event.
     */
    changeBaseLayer: function(evt) {
        // FIXME : should be OpenLayers.Layer.Vector.prototype ?
        if (OpenLayers.Layer.prototype.changeBaseLayer.apply(this,arguments)===false) {
            return false;
        }
        return true;
    },

    /**
     * Method: getCompatibleProjection
     * Check whether the layer's projection is displayable with the base layer.
     *  IGNF: _addition_
     *
     * Params:
     * blayer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the baseLayer to compare with.
     *      if none, use current baseLayer from the map.
     *
     * Returns:
     * {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} if compatible, undefined if not relevant, null on error.
     */
    getCompatibleProjection: function(blayer) {
        var lproj= this.getNativeProjection();
        if (lproj==null) {
            if (this.map==null) { return undefined; }
            return null;
        }

        return lproj;
    }

    });

}

/**
 * Class: OpenLayers.Control.SelectFeature
 * IGNF: allow passing options to OpenLayers.Handler.Feature
 */
if (OpenLayers.Control && OpenLayers.Control.SelectFeature) {

    OpenLayers.Control.SelectFeature= OpenLayers.overload(OpenLayers.Control.SelectFeature, {

    /**
     * Constructor: OpenLayers.Control.SelectFeature
     * Create a new control for selecting features.
     *  IGNF: _support for options.handlerOptions_
     *
     * Parameters:
     * layers - {<OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html>}, or an array of vector layers. The
     *     layer(s) this control will select features from.
     * options - {Object}
     */
    initialize: function(layers, options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        
        if(this.scope === null) {
            this.scope = this;
        }
        this.initLayer(layers);
        var callbacks = {
            click: this.clickFeature,
            clickout: this.clickoutFeature
        };
        if (this.hover) {
            callbacks.over = this.overFeature;
            callbacks.out = this.outFeature;
        }
             
        this.callbacks = OpenLayers.Util.extend(callbacks, this.callbacks);
        this.handlers = {
            feature: new OpenLayers.Handler.Feature(
                this, this.layer, this.callbacks,
                OpenLayers.Util.extend(
                    {geometryTypes: this.geometryTypes},
                    OpenLayers.Util.extend({}, this.handlersOptions && this.handlersOptions.feature))//IGNF
            )
        };

        if (this.box) {
            this.handlers.box = new OpenLayers.Handler.Box(
                this, {done: this.selectBox},
                {boxDivClassName: "olHandlerBoxSelectFeature"}
            ); 
        }
    }
    });

}

/**
 * Class: OpenLayers.Handler.Keyboard
 * IGNF: aware of the current document.
 */
if (OpenLayers.Handler && OpenLayers.Handler.Keyboard) {

    OpenLayers.Handler.Keyboard= OpenLayers.overload(OpenLayers.Handler.Keyboard, {

    /**
     * Method: activate
     * IGNF: _aware of the current document_.
     */
    activate: function() {
        if (OpenLayers.Handler.prototype.activate.apply(this, arguments)) {
            for (var i=0, len=this.KEY_EVENTS.length; i<len; i++) {
                OpenLayers.Event.observe(
                    OpenLayers.getDoc(), this.KEY_EVENTS[i], this.eventListener);//IGNF
            }
            return true;
        } else {
            return false;
        }
    },

    /**
     * Method: deactivate
     * IGNF: _aware of the current document_.
     */
    deactivate: function() {
        var deactivated = false;
        if (OpenLayers.Handler.prototype.deactivate.apply(this, arguments)) {
            for (var i=0, len=this.KEY_EVENTS.length; i<len; i++) {
                OpenLayers.Event.stopObserving(
                    OpenLayers.getDoc(), this.KEY_EVENTS[i], this.eventListener);//IGNF
            }
            deactivated = true;
        }
        return deactivated;
    }

    });

}

/**
 * Class: OpenLayers.Handler.MouseWheel
 * IGNF: aware of the current document.
 */
if (OpenLayers.Handler && OpenLayers.Handler.MouseWheel) {

    OpenLayers.Handler.MouseWheel= OpenLayers.overload(OpenLayers.Handler.MouseWheel, {

    /**
     * Method: onWheelEvent
     * Catch the wheel event and handle it xbrowserly
     * IGNF: _aware of the current document_.
     *
     * Parameters:
     * e - {Event}
     */
    onWheelEvent: function(e){

        // make sure we have a map and check keyboard modifiers
        if (!this.map || !this.checkModifiers(e)) {
            return;
        }

        // Ride up the element's DOM hierarchy to determine if it or any of
        //  its ancestors was:
        //   * specifically marked as scrollable
        //   * one of our layer divs
        //   * the map div
        //
        var overScrollableDiv = false;
        var overLayerDiv = false;
        var overMapDiv = false;

        var elem = OpenLayers.Event.element(e);
        while((elem != null) && !overMapDiv && !overScrollableDiv) {

            if (!overScrollableDiv) {
                try {
                    var overflow;//IGNF
                    if (elem.currentStyle) {
                        overflow = elem.currentStyle["overflow"];
                    } else {
                        var style =
                            elem.ownerDocument.defaultView.getComputedStyle(elem, null);//IGNF
                        overflow = style.getPropertyValue("overflow");//IGNF
                    }
                    overScrollableDiv = ( overflow &&
                        (overflow == "auto") || (overflow == "scroll") );
                } catch(err) {
                    //sometimes when scrolling in a popup, this causes
                    // obscure browser error
                }
            }

            if (!overLayerDiv) {
                for(var i=0, len=this.map.layers.length; i<len; i++) {
                    // Are we in the layer div? Note that we have two cases
                    // here: one is to catch EventPane layers, which have a
                    // pane above the layer (layer.pane)
                    if (elem == this.map.layers[i].div
                        || elem == this.map.layers[i].pane) {
                        overLayerDiv = true;
                        break;
                    }
                }
            }
            overMapDiv = (elem == this.map.div);

            elem = elem.parentNode;
        }

        // Logic below is the following:
        //
        // If we are over a scrollable div or not over the map div:
        //  * do nothing (let the browser handle scrolling)
        //
        //    otherwise
        //
        //    If we are over the layer div:
        //     * zoom/in out
        //     then
        //     * kill event (so as not to also scroll the page after zooming)
        //
        //       otherwise
        //
        //       Kill the event (dont scroll the page if we wheel over the
        //        layerswitcher or the pan/zoom control)
        //
        if (!overScrollableDiv && overMapDiv) {
            if (overLayerDiv) {
                var delta = 0;
                if (!e) {
                    e = window.event;
                }
                if (e.wheelDelta) {
                    delta = e.wheelDelta/120;
                    if (window.opera && window.opera.version() < 9.2) {
                        delta = -delta;
                    }
                } else if (e.detail) {
                    delta = -e.detail / 3;
                }
                this.delta = this.delta + delta;

                if(this.interval) {
                    window.clearTimeout(this._timeoutId);
                    this._timeoutId = window.setTimeout(
                        OpenLayers.Function.bind(function(){
                            this.wheelZoom(e);
                        }, this),
                        this.interval
                    );
                } else {
                    this.wheelZoom(e);
                }
            }
            OpenLayers.Event.stop(e);
        }
    },

    /**
     * Method: activate
     * IGNF: aware of the current document.
     */
    activate: function (evt) {
        if (OpenLayers.Handler.prototype.activate.apply(this, arguments)) {
            //register mousewheel events specifically on the window and document
            var wheelListener = this.wheelListener;
            OpenLayers.Event.observe(window, "DOMMouseScroll", wheelListener);
            OpenLayers.Event.observe(window, "mousewheel", wheelListener);
            OpenLayers.Event.observe(OpenLayers.getDoc(), "mousewheel", wheelListener);//IGNF
            return true;
        } else {
            return false;
        }
    },

    /**
     * Method: deactivate
     * IGNF: aware of the current document.
     */
    deactivate: function (evt) {
        if (OpenLayers.Handler.prototype.deactivate.apply(this, arguments)) {
            // unregister mousewheel events specifically on the window and document
            var wheelListener = this.wheelListener;
            OpenLayers.Event.stopObserving(window, "DOMMouseScroll", wheelListener);
            OpenLayers.Event.stopObserving(window, "mousewheel", wheelListener);
            OpenLayers.Event.stopObserving(OpenLayers.getDoc(), "mousewheel", wheelListener);//IGNF
            return true;
        } else {
            return false;
        }
    }

    });

}

/**
 * Class: OpenLayers.Tile.Image
 * IGNF: few enhancements
 */
if (OpenLayers.Tile && OpenLayers.Tile.Image) {

    OpenLayers.Tile.Image= OpenLayers.overload(OpenLayers.Tile.Image, {

        /** TBD 3.0 - reorder the parameters to the init function to remove
         *             URL. the getUrl() function on the layer gets called on
         *             each draw(), so no need to specify it here.
         *
         * Constructor: OpenLayers.Tile.Image
         * Constructor for a new <OpenLayers.Tile.Image at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Tile/Image-js.html> instance.
         * IGNF: _aware of the current document_.
         *
         * Parameters:
         * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} layer that the tile will go in.
         * position - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>}
         * bounds - {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>}
         * url - {<String>} Deprecated. Remove me in 3.0.
         * size - {<OpenLayers.Size at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Size-js.html>}
         * options - {Object}
         */
        initialize: function(layer, position, bounds, url, size, options) {
            OpenLayers.Tile.prototype.initialize.apply(this, arguments);

            this.url = url; //deprecated remove me
        
            this.layerAlphaHack = this.layer.alpha && OpenLayers.Util.alphaHack();

            if (this.maxGetUrlLength != null || this.layer.gutter || this.layerAlphaHack) {
                // only create frame if it's needed
               
                this.frame.style.position = "absolute";
                this.frame.style.overflow = "hidden";
            }
            if (this.maxGetUrlLength != null) {
                OpenLayers.Util.extend(this, OpenLayers.Tile.Image.IFrame);
            }
        }

    });

}

/**
 * Class: OpenLayers.Format.WMSCapabilities
 * IGNF: see changes on {<OpenLayers.Format.XML at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format/XML-js.html>}
 */
if (OpenLayers.Format && OpenLayers.Format.WMSCapabilities) {

    OpenLayers.Format.WMSCapabilities= OpenLayers.overload(OpenLayers.Format.WMSCapabilities, {

    readNode: OpenLayers.Format.XML.prototype.readNode,

    readChildNodes: OpenLayers.Format.XML.prototype.readChildNodes

    });

}

/**
 * Class: OpenLayers.Format.WMSCapabilities.v1
 * IGNF: bug fixes on Layer, addition of MetadataURL, DataURL, FeatureListURL.
 */
if (OpenLayers.Format && OpenLayers.Format.WMSCapabilities && OpenLayers.Format.WMSCapabilities.v1) {

    (function() {

    var _readers_= OpenLayers.Util.extend({}, OpenLayers.Format.WMSCapabilities.v1.prototype.readers);
    _readers_['wms']['Layer']= function(node, obj){
        var attrNode = node.getAttributeNode("queryable");
        var queryable = (attrNode && attrNode.specified) ?
            node.getAttribute("queryable") : null;
        attrNode = node.getAttributeNode("cascaded");
        var cascaded = (attrNode && attrNode.specified) ?
            node.getAttribute("cascaded") : null;
        attrNode = node.getAttributeNode("opaque");
        var opaque = (attrNode && attrNode.specified) ?
            node.getAttribute('opaque') : null;
        var noSubsets = node.getAttribute('noSubsets');
        var fixedWidth = node.getAttribute('fixedWidth');
        var fixedHeight = node.getAttribute('fixedHeight');
        var layer = {nestedLayers: [], styles: [], srs: {},
            metadataURLs: [], bbox: {}, dimensions: {},
            authorityURLs: {}, identifiers: {}, keywords: [],
            queryable: (queryable && queryable !== "") ?
                ( queryable === "1" || queryable === "true" ) : null,
            cascaded: (cascaded !== null) ? parseInt(cascaded) : null,
            opaque: opaque ?
                (opaque === "1" || opaque === "true" ) : null,
            noSubsets: (noSubsets !== null) ?
                ( noSubsets === "1" || noSubsets === "true" ) : null,
            fixedWidth: (fixedWidth != null) ?
                parseInt(fixedWidth) : null,
            fixedHeight: (fixedHeight != null) ?
                parseInt(fixedHeight) : null
            //IGNF:
            ,dataURLs: [], featureListURLs: []
        };
        obj.nestedLayers.push(layer);
        this.readChildNodes(node, layer);
        if(layer.name) {
            var parts = layer.name.split(":");
            if(parts.length > 0) {
                layer.prefix = parts[0];
            }
        }
    };
    _readers_['wms']['MetadataURL']= function(node, obj){
        var metadataURL = {
            type: node.getAttribute("type"),
            formats:[]      //IGNF
        };
        obj.metadataURLs.push(metadataURL);
        this.readChildNodes(node, metadataURL);
    };
    _readers_['wms']['DataURL']= function(node, obj){
        //IGNF
        var dataURL = {};
        obj.dataURLs.push(dataURL);
        this.readChildNodes(node, dataURL);
    };
    _readers_['wms']['FeatureListURL']= function(node, obj){
        //IGNF
        var featureListURL = {};
        obj.featureListURLs.push(featureListURL);
        this.readChildNodes(onde, featureListURL);
    };

    OpenLayers.Format.WMSCapabilities.v1= OpenLayers.overload(OpenLayers.Format.WMSCapabilities.v1, {

    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     * IGNF: _fix on Layer, support for MetadataURL, dataURL and featureListURL_
     */
    readers: _readers_

    });

    _readers_= null;

    })();
}

/**
 * Class: OpenLayers.Format.Filter
 * IGNF: see changes on <{OpenLayers.Format.XML}>
 */
if (OpenLayers.Format && OpenLayers.Format.Filter) {

    OpenLayers.Format.Filter= OpenLayers.overload(OpenLayers.Format.Filter, {

    readNode: OpenLayers.Format.XML.prototype.readNode,

    readChildNodes: OpenLayers.Format.XML.prototype.readChildNodes

    });

}

/**
 * Class: OpenLayers.Renderer.Elements
 * Adds http://trac.openlayers.org/ticket/2349 (Label background color and
 * border), 2965 (Label halo) [Experimental].
 */
if (OpenLayers.Renderer && OpenLayers.Renderer.Elements) {

    OpenLayers.Renderer.Elements= OpenLayers.overload(OpenLayers.Renderer.Elements, {

    /**
     * Constant: HALO_ID_SUFFIX
     * {String}
     *  IGNF: _addition_
     */
    HALO_ID_SUFFIX: "_halo",

    /**
     * Method: removeText
     * Removes a label
     *  IGNF: _addition_
     *
     * Parameters:
     * featureId - {String}
     */
    removeText: function(featureId) {
        var label = this.root.ownerDocument.getElementById(featureId + this.LABEL_ID_SUFFIX);
        if (label) {
            this.textRoot.removeChild(label);

            var labelHalo = OpenLayers.getDoc().getElementById(featureId +
                this.LABEL_ID_SUFFIX + this.HALO_ID_SUFFIX);
            if (labelHalo) {
                this.textRoot.removeChild(labelHalo);
            }
        }
        var labelBackground = this.root.ownerDocument.getElementById(featureId + this.LABEL_ID_SUFFIX + "_bg");
        if (labelBackground) {
            this.textRoot.removeChild(labelBackground);
        }
        // OL 2.12 addition
        var outline = this.root.ownerDocument.getElementById(featureId + this.LABEL_OUTLINE_SUFFIX);
        if (outline) {
                this.textRoot.removeChild(outline);
        }
        // IGNF : rajout de la suppression du outile "_bg"
        var outlineBg = this.root.ownerDocument.getElementById(featureId + this.LABEL_OUTLINE_SUFFIX+"_bg");
        if (outlineBg) {
                this.textRoot.removeChild(outlineBg);
        }
    }

    });

    /**
     * Constant: OpenLayers.Renderer.symbol
     * Coordinate arrays for well known (named) symbols.
     * IGNF: _addition of new symbols_
     *      symbol name starting and ending with '_' indicates that the strokeWidth must
     *      be equal to 0 in order to be displayed correctly.
     *      OpenLayers' symbols (from examples) includes : lightning, rectangle
     *      (symbol category) and church3 (religon category).
     *      IGNF's symbols includes :
     *      * symbol category: _square_, blazon, arrow, _arrow_, heart,
     *      _ruins_;
     *      * transport caterogy: gaz, _gaz_, car, _car_, _bus_,
     *      bicycle, _train_, _ship_, airport, _airport_, _boat_,
     *      _baggage_, _anchor_;
     *      * religion category: christian, _christian_, church, _church_,
     *      _church2_, church2, davidstar;
     *      * industry category: industry, tools, _recycle_, mine,
     *      _nuclear_;
     *      * food & drink category: food, _food_, _food2_, _coffee_,
     *      _bar_;
     *      * anenity category: phone, letter;
     *      * shopping category: market;
     *      * tourism category: _i_, _theater_, castle, _castle_,
     *      castle1, teepee, _teepee_, _trailer_, _trailer2_, museum,
     *      _museum_, labyrinthe, flower, _photo_, stone, parc,
     *      _monument_;
     *      * topography caterory: _swamp_, tree;
     *      * accomodation category: _wifi_, home, home2;
     *      * sports & leisure category: foot;
     *      * meteo category: _cloud_, _sun_cloud_, _rain_, _storm_,
     *      _sun_, _snow_, snow;
     *      * point of interest category: _poi_, _flag_, _view_,
     *      _view1_, _view3_.
     */
    OpenLayers.Renderer.symbol= OpenLayers.Util.extend(OpenLayers.Renderer.symbol, {
        /*
         * Symbol
         */
        'lightning': [0, 0, 4, 2, 6, 0, 10, 5, 6, 3, 4, 5, 0, 0],
        'rectangle': [0, 0, 4, 0, 4, 10, 0, 10, 0, 0],
        '_square_': [ -4,-5, -2,-3, -2,2, 3,2, 3,-3, -2,-3, -4,-5, 5,-5, 5,4, -4,4, -4,-5 ],
        'blazon': [-10,-8, -10,10, 0,15, 10,10, 10,-8 ],
        'arrow': [ -5,-2, 3,-2, 3,-3, 6,0, 3,3, 3,2, -5,2, -5,-2 ],
        '_arrow_': [ -2,11, -2,4, -4,4, 0,0, 0,-11, 0,0, 4,4, 2,4, 2,11, -2,11 ],
        'heart': [ 0,4, -4,0, -4,-2, -3,-3, -1,-3, 0,-2, 1,-3, 3,-3, 4,-2, 4,0, 0,4 ],
        '_ruins_': [ -100,1200, -216,1225, -312,1288, -375,1384, -400,1500, -375,1616, -312,1713, -216,1775, -100,1800, 16,1775, 113,1713, 284,2025, 188,2088, 125,2184, 100,2300, -300,2300, -325,2184, -387,2088, -484,2025, -600,2000, -716,2025, -812,2088, -875,2184, -900,2300, -875,2416, -812,2513, -716,2575, -600,2600, -484,2575, -387,2513, -325,2416, -300,2300, 100,2300, 125,2416, 188,2513, 284,2575, 400,2600, 516,2575, 613,2513, 675,2416, 700,2300, 675,2184, 613,2088, 516,2025, 400,2000, 284,2025, 284,2025, 113,1713, 113,1713, 175,1616, 200,1500, 175,1384, 113,1288, 16,1225, -100,1200  ],
        /*
         * Transport
         */
        'gaz': [ 0,10, 6,10, 5,10, 5,1, 1,1, 1,4, 1,4, 6,4, 6,4, 6,0, 0,0, 0,3, -1,3, -1,9, 0,9, 0,3, 0,4, 1,4, 1,10, 0,10 ],
        '_gaz_': [ -6,0, -6,7, -5,7, -5,17, -7,17, -7,18, 4,18, 4,17, 2,17, 2,9, 3,9, 4,10, 4,16, 5,17, 7,17, 8,16, 8,6, 4,2, 4,3, 6,5, 7,6, 7,7, 6,7, 6,5, 5,4, 5,7, 6,8, 7,8, 7,16, 5,16, 5,9, 4,8, 2,8, 2,7, 3,7, 3,5, -4,5, -4,2, 1,2, 1,5, 3,5, 3,0, -6,0 ],
        'car': [ 0,10, 1,10, 1,12, 2,13, 3,13, 4,12, 4,10, 11,10, 11,12, 12,13, 13,13, 14,12, 14,10, 15,10, 15,7, 12,7, 12,8, 14,8, 14,7, 15,7, 15,6, 14,5, 14,1, 13,0, 2,0, 1,1, 1,5, 2,5, 2,1, 13,1, 13,5, 14,5, 1,5, 0,6, 0,7, 3,7, 3,8, 1,8, 1,7, 0,7, 0,10 ],
        '_car_': [ 0,9, 1,9, 1,11, 2,12, 3,12, 4,11, 4,9, 11,9, 11,11, 12,12, 13,12, 14,11, 14,9, 15,9, 15,6, 14,6, 14,7, 12,7, 12,6, 15,6, 15,5, 14,4, 13,0, 2,0, 1,4, 2,4, 3,1, 12,1, 13,4, 1,4, 0,5, 0,6, 3,6, 3,7, 1,7, 1,6, 0,6, 0,9 ],
        '_bus_': [ -8,6, -7,7, -7,9, -6,10, -5,10, -4,9, -4,7, 3,7, 3,9, 4,10, 5,10, 6,9, 6,7, 7,6, 7,3, 6,3, 6,5, 4,5, 4,3, 3,3, 3,4, -4,4, -4,5, 3,5, 3,6, -4,6, -4,3, 7,3, 7,-7, 6,-8, 6,-6, -7,-6, -7,-7, 6,-7, 6,-8, -7,-8, -8,-7, -8,2, -7,2, -7,-4, -6,-5, -1,-5, -1,1, 0,1, 0,-5, 5,-5, 6,-4, 6,1, 5,1, 4,0, 2,0, 1,1, -7,1, -7,3, -5,3, -5,5, -7,5, -7,2, -8,2, -8,6 ],
        'bicycle': [ 0,6, 1,8, 3,9, 5,9, 7,8, 8,6, 8,4, 7,2, 5,1, 6,-1, 12,5, 16,5, 16,6, 17,8, 19,9, 21,9, 23,8, 24,6, 24,4, 23,2, 21,1, 19,1, 17,2, 16,4, 16,5, 20,5, 16,-1, 12,5, 16,-1, 18,-3, 14,-3, 16,-2, 16,-1, 6,-1, 7,-4, 9,-4, 7,-4, 6,-1, 4,5, 5,1, 3,1, 1,2, 0,4, 0,6 ],
        '_train_': [ 1,17, 0,16, 0,15, 3,15, 3,13, 1,13, 1,15, 0,15, 0,11, 11,11, 12,10, 12,6, 11,5, 9,5, 9,3, 4,3, 4,4, 9,4, 9,5, 2,5, 1,6, 1,10, 2,11, 0,11, 0,5, 0,3, 1,2, 3,2, 2,1, 3,0, 4,1, 3,2, 10,2, 9,1, 10,0, 11,1, 10,2, 12,2, 13,3, 13,13, 10,13, 10,15, 12,15, 12,13, 13,13, 13,16, 12,17, 12,19, 11,20, 13,25, 11,25, 10,20, 3,20, 3,19, 10,19, 10,17, 3,17, 3,19, 3,20, 2,25, 0,25, 2,20, 1,19, 1,17 ],
        '_ship_': [ -2,12, 0,20, 0,22, -1,22, -3,23, -5,22, -7,23, -7,24, -5,23, -3,24, -1,23, 1,24, 3,23, 5,24, 7,23, 9,24, 11,23, 13,24, 15,23, 17,24, 17,25, 15,24, 13,25, 11,24, 9,25, 7,24, 5,25, 3,24, 1,25, -1,24, -3,25, -5,24, -7,25, -7,26, 17,26, 17,24, 17,23, 15,22, 13,23, 11,22, 10,22, 10,20, 12,12, 10,11, 10,6, 7,5, 7,0, 3,0, 3,5, 0,6, 0,11, 1,10, 2,7, 8,7, 9,8, 9,10, 5,9, 1,10, 0,11, -2,12 ],
        'airport': [ 40,-80, 30,-70, 20,-50, 20,20, -100,70, -100,90, 20,70, 30,170, 10,190, 10,200, 45,190, 80,200, 80,190, 60,170, 70,70, 190,90, 190,70, 70,20, 70,-50, 60,-70, 50,-80, 40,-80 ],
        '_airport_': [ 60,-80, 50,-70, 40,-50, 50,-50, 60,-60, 70,-60, 80,-50, 40,-50, 40,20, -80,70, -80,100, 40,80, 50,170, 30,190, 30,210, 65,200, 100,210, 100,190, 80,170, 90,80, 210,100, 210,70, 90,20, 90,-50, 80,-70, 70,-80, 60,-80 ],
        '_boat_': [ -5,1, -4,3, 7,3, 9,1, 0,1, 0,-11, 9,0, -1,0, -1,-9, -7,0, 0,0, 0,1, -5,1 ],
        '_baggage_': [ 0,3, 0,8, 1,9, 10,9, 11,8, 11,3, 10,2, 9,2, 9,9, 8,9, 8,2, 4,2, 4,1, 7,1, 7,2, 8,2, 8,0, 3,0, 3,2, 3,2, 3,9, 2,9, 2,2, 1,2, 0,3 ],
        '_anchor_': [ 300,-400,222,-384,160,-340,116,-278,100,-200,116,-121,160,-59,219,-18,0,0,0,100,125,100,225,200,225,800,100,950,0,950,-93,914,-209,796,-250,700,-200,700,-300,500,-400,700,-346,700,-300,900,-150,1059,44,1156,200,1200,300,1300,400,1200,556,1156,750,1059,900,850,945,700,1000,700,900,500,800,700,850,700,809,818,693,914,600,950,500,950,375,800,375,200,475,100,600,100,600,0,381,-18,440,-59,484,-121,500,-200,400,-200,300,-100,200,-200,300,-300,400,-200,500,-200,484,-278,440,-340,378,-384,300,-400 ],
        /*
         * Religious
         */
        'christian': [4, 0, 6, 0, 6, 4, 10, 4, 10, 6, 6, 6, 6, 14, 4, 14, 4, 6, 0, 6, 0, 4, 4, 4, 4, 0],
        '_christian_': [ 3,8, 2,8, 2,3, 0,3, 0,2, 2,2, 2,0, 3,0, 3,2, 5,2, 5,3, 3,3, 3,16, 3,8 ],
        'church': [ 0,-500, -200,-462, -354,-354, -462,-200, -500,0, -462,200, -354,354, -200,462, 0,500, 200,462, 354,354, 462,200, 500,0, 462,-200, 354,-354, 200,-462, 0,-500, 0,-1400, 400,-1400, -400,-1400, 0,-1400, 0,-1800 ],
        '_church_': [ 250,200,250,400,50,400,50,500,250,500,250,800,180,825,90,890,25,980,0,1100,25,1210,90,1310,180,1375,300,1400,300,2000,300,1400,410,1375,510,1310,575,1210,600,1100,575,980,510,890,410,825,350,800,350,500,550,500,550,400,350,400,350,200,250,200 ],
        '_church2_': [ 0,7, 2,7, 2,3, 0,3, 0,2, 2,2, 2,0, 3,0, 3,2, 5,2, 5,3, 3,3, 3,7, 5,7, 5,12, 3,12, 3,18, 3,12, 0,12, 0,7 ],
        'church2': [ 4,19, 4,15, 3,15, 3,11, 2,10, 3,9, 4,10, 3,11, 3,15, 2,15, 2,19, 0,19, 0,9, 3,3, 3,0, 3,1, 2,1, 4,1, 3,1, 3,3, 6,9, 6,12, 12,12, 14,15, 14,19, 4,19 ],
        'church3': [4, 0, 6, 0, 6, 4, 10, 4, 10, 6, 6, 6, 6, 14, 4, 14, 4, 6, 0, 6, 0, 4, 4, 4, 4, 0],
        'davidstar': [ 17,0, 12,10, 22,10, 12,10, 0,10, 6,20, 12,10, 6,20, 0,30, 12,30, 6,20, 12,30, 17,40, 22,30, 12,30, 34,30, 28,20, 22,30, 28,20, 34,10, 22,10, 28,20, 22,10, 17,0 ],
        /*
         * Industry
         */
        'industry': [ -4,4, -4,0, -1,-2, -1,0, 2,-2, 2,0, 4,-2, 5,-8, 6,-8, 7,-1, 7,4, -4,4 ],
        'tools': [ -5,4, -5,3, -4,2, -3,2, -1,0, -4,-3, -4,-4, -3,-4, 0,-1, 2,-3, 2,-4, 3,-5, 4,-5, 3,-4, 4,-3, 5,-4, 5,-3, 4,-2, 3,-2, 1,0, 2,1, 3,1, 5,3, 5,4, 4,5, 3,5, 1,3, 1,2, 0,1, -2,3, -2,4, -3,5, -4,5, -3,4, -4,3, -5,4 ],
        '_recycle_': [ 18,31, 27,41, 3,43, 9,46, 0,62, 18,93, 54,93, 54,68, 26,68, 31,59, 36,63, 27,41, 18,31, 40,43, 54,19, 59,28, 53,31, 77,32, 90,31, 67,44, 81,67, 72,67, 72,61, 59,80, 72,100, 72,93, 90,93, 108,62, 90,31, 77,32, 86,12, 81,15, 72,0, 36,0, 18,31 ],
        'mine': [ -1,6, -1,6, 0,7, 0,7, 3,4, 3,4, 6,7, 6,7, 7,6, 4,3, 6,1, 6,1, 7,2, 7,2, 9,0, 6,-3, 4,-1, 5,0, 3,2, 1,0, 2,-1, 0,-3, -2,0, -2,3, 0,1, 2,3, -1,6 ],
        '_nuclear_': [ -225,-509, -578,-278, -809,75, -900,500, -100,500, -75,615, -12,712, 75,775, 200,800, 200,1000, -9,959, -81,906, -412,1387, -225,1509, 200,1600, 625,1509, 812,1387, 478,903, 393,959, 200,1000, 200,800, 356,775, 412,713, 475,615, 500,500, 1300,500, 1209,75, 978,-278, 625,-509, 393,40, 553,145, 659,306, 700,500, 500,500, 475,384, 412,287, 315,225, 200,200, 84,225, -12,287, -75,384, -100,500, -300,500, -259,306, -153,146, 6,40, -225,-509 ],
        /*
         * Food & drink
         */
        'food': [ -2,5, -3,4, 0,1, -1,0, -2,0, -4,-4, -4,-5, 1,0, 3,-2, 3,-3, 5,-5, 4,-3, 6,-4, 5,-2, 7,-3, 5,-1, 4,-1, 2,1, 5,4, 4,5, 1,2, -2,5 ],
        '_food_': [ 0,0, 1,0, 1,4, 2,4, 2,0, 3,0, 3,4, 4,4, 4,0, 5,0, 5,5, 4,6, 3,6, 4,14, 6,14, 7,8, 6,7, 7,1, 8,0, 9,0, 9,14, 8,15, 7,15, 6,14, 4,14, 3,15, 2,15, 1,14, 2,6, 1,6, 0,5, 0,0 ],
        '_food2_': [ -1000,-400, -1000,-100, -425,700, -200,700, -100,800, -800,1400, -800,1600, -700,1700, -500,1700, 75,1045, 600,1700, 800,1700, 900,1600, 900,1400, 275,800, 525,525, 600,600, 800,600, 1300,100, 1200,0, 800,400, 700,300, 1100,-100, 1000,-200, 600,200, 500,100, 900,-300, 800,-400, 300,100, 300,300, 375,375, 100,600, -1000,-400 ],
        '_coffee_': [ 2,0, 2,5, 3,6, 3,7, 0,7, 1,8, 10,8, 11,7, 3,7, 3,6, 8,6, 9,5, 9,4, 10,4, 11,3, 11,1, 10,0, 9,0, 9,1, 10,1, 10,3, 9,3, 9,0, 2,0 ],
        '_bar_': [ 2,12, 2,11, 5,11, 5,6, 0,0, 11,0, 6,6, 6,5, 7,4, 6,3, 5,4, 6,5, 6,6, 6,11, 9,11, 9,12, 2,12 ],
        /*
         * Anenity
         */
        'phone': [ 6,1, 10,-2, 10,-3, 9,-4, 4,0, 9,-4, 8,-5, 4,-5, 0,-3, -4,1, -6,5, -6,9, -5,10, -1,5, -5,10, -4,11, -3,11, 0,7, 0,6, -1,5, -1,4, 3,0, 4,0, 5,1, 6,1 ],
        'letter': [ 0,2, 4,-2, 0,2, -4,-2, -4,4, -1,1, -4,4, 4,4, 1,1, 4,4, 4,-2, -4,-2, 0,2 ],
        /*
         * Shopping
         */
        'market': [ -2,5, -3,6, -2,7, -1,6, -2,5, 5,5, 4,5, 3,6, 4,7, 5,6, 4,5, 5,-1, 5,-2, 7,-2, 5,-2, 5,-1, -4,-1, -3,3, 4,4, 4,5, -2,5 ],
        /*
         * Tourism
         */
        '_i_': [ 500,0, 384,25, 287,87, 225,184, 200,300, 225,415, 287,512, 384,575, 500,600, 500,700, 0,700, 0,800, 250,900, 250,1500, 0,1600, 0,1700, 1000,1700, 1000,1600, 750,1500, 750,700, 500,700, 500,600, 615,575, 713,512, 775,415, 800,300, 775,184, 712,87, 615,25, 500,0 ],
        '_theater_': [ 3,-4, 7,-4, 6,-1, 5,-2, 3,-3, 2,-3, 0,-3, 1,-2, 2,-3, 3,-3, 3,-2, 5,-2, 6,-1, 5,2, 4,1, 2,-1, 0,0, 2,0, 4,1, 5,2, 3,3, 2,3, 0,1, -1,0, -2,1, -4,0, -2,0, -1,0, -1,-2, -2,-2, -1,-3, -1,-6, -1,-5, -3,-3, -7,-3, -6,-2, -5,-1, -4,-1, -4,-2, -6,-2, -7,-3, -5,1, -3,2, -1,2, 0,1, 1,1, -1,3, -2,3, -5,2, -8,-4, -3,-4, -1,-6, 3,-4 ],
        'castle': [ 0,0, 1,1, 5,1, 6,0, 5,1, 5,3, 6,4, 5,3, 1,3, 0,4, 1,3, 1,1, 0,0 ],
        '_castle_': [ -6,-4, -7,-3, -5,-1, -5,2, -7,4, -6,5, -4,3, 4,3, 6,5, 7,4, 5,2, 5,-1, 7,-3, 6,-4, 4,-2, -4,-2, -6,-4 ],
        'castle1': [ -2,14, -1,3, -2,2, -2,-2, 0,-2, 0,0, 2,0, 2,-2, 4,-2, 4,0, 6,0, 6,-2, 8,-2, 8,2, 7,3, 8,14, 5,14, 5,9, 4,8, 2,8, 1,9, 1,14, -2,14 ],
        'teepee': [ 1,-8, 0,-6, -5,4, -2,4, 0,0, 2,4, 6,4, -6,4, 5,4, 0,-6, -1,-8, 0,-6, 1,-8 ],
        '_teepee_': [ 4,-2, 2,-2, 0,1, -2,-2, -4,-2, -1,2, -8,17, -11,17, -11,18, 11,18, 11,17, 3,17, -3,17, 0,10, 3,17, 8,17, 1,2, 4,-2 ],
        '_trailer_': [ 1,0, 0,1, 2,2, 6,2, 6,4, 2,4, 2,2, 0,1, 0,8, 5,8, 6,7, 7,7, 8,8, 8,9, 7,10, 6,10, 5,9, 5,8, 4,8, 4,7, 6,6, 7,6, 9,7, 9,8, 14,8, 14,7, 12,7, 12,4, 12,1, 11,2, 11,4, 8,4, 8,2, 11,2, 12,1, 11,0, 1,0 ],
        '_trailer2_': [ 5,6, 8,6, 9,8, 15,8, 15,7, 13,7, 13,3, 12,1, 10,0, 3,0, 1,1, 0,3, 1,4, 2,2, 4,1, 6,1, 6,4, 8,4, 8,1, 9,1, 11,2, 12,4, 1,4, 0,3, 0,8, 5,8, 5,9, 6,10, 7,10, 8,9, 8,8, 7,7, 6,7, 5,8, 4,8, 5,6 ],
        'museum': [ 1,0, 0,1, 1,2, 2,2, 2,9, 2,5, 4,5, 4,8, 4,5, 6,5, 6,9, 6,5, 2,5, 2,2, 3,2, 4,1, 3,0, 1,0 ],
        '_museum_': [ -30,-110, -40,-110, -35,-120, -45,-120, -55,-130, -55,-160, -45,-170, -35,-170, -25,-175, -15,-170, -5,-170, 5,-160, 5,-130, -15,-130, -5,-140, -5,-150, -15,-160, -25,-155, -35,-160, -45,-150, -45,-140, -35,-130, -25,-135, -15,-130, 5,-130, -5,-120, -15,-120, -10,-110, -20,-110, -20,-70, 35,-70, 45,-60, 45,0, 30,0, 30,-50, 25,-55, 15,-55, 15,0, 0,0, 0,-55, -15,-55, -15,0, -30,0, -30,-110 ],
        'labyrinthe': [ -1,6, -1,7, 0,8, 1,8, 2,7, 2,6, 4,6, 6,4, 6,2, 7,2, 8,1, 8,0, 7,-1, 6,-1, 6,-3, 4,-5, 2,-5, 2,-6, 1,-7, 0,-7, -1,-6, -1,-5, -3,-5, -5,-3, -5,-1, -6,-1, -7,0, -7,1, -6,2, -5,2, -5,4, -4,5, -3,4, -2,5, 0,5, 0,6, 1,6, 1,5, 3,5, 5,3, 5,1, 6,1, 6,0, 5,0, 5,-2, 4,-3, 3,-2, 2,-3, -1,-3, -3,-1, -3,2, -1,4, 2,4, 3,3, 2,2, 3,1, 3,0, 1,-2, 0,-2, -1,-1, 0,0, 1,0, 1,1, 0,1, 0,0, -1,-1, -2,0, -2,1, 0,3, 1,3, 2,2, 3,3, 4,2, 4,-1, 3,-2, 4,-3, 3,-4, 1,-4, 1,-5, 0,-5, 0,-4, -2,-4, -4,-2, -4,0, -5,0, -5,1, -4,1, -4,3, -3,4, -4,5, -3,6, -1,6 ],
        'flower': [ -5,3, -5,5, -4,6, -2,6, -1,5, -1,2, 0,2, 2,5, 4,5, 5,4, 5,2, 4,1, 1,1, 1,0, 4,-2, 4,-4, 3,-5, 1,-5, 0,-4, 0,-1, -1,-1, -3,-4, -5,-4, -6,-3, -6,-1, -5,0, -2,0, -2,1, -2,0, -1,-1, 0,-1, 1,0, 1,1, 0,2, -1,2, -2,1, -5,3 ],
        '_photo_': [ 1,1, 0,2, 0,6, 1,7, 5,7, 5,6, 3,6, 3,5, 5,5, 5,3, 3,3, 3,6, 2,5, 2,3, 3,2, 5,2, 6,3, 6,5, 5,6, 5,7, 8,7, 9,6, 9,2, 8,2, 8,3, 7,3, 7,2, 8,2, 9,2, 8,1, 6,1, 5,0, 3,0, 2,1, 1,1 ],
        'stone': [ 10,60, 10,30, 0,30, 0,10, 80,0, 90,10, 90,30, 80,30, 80,60, 55,60, 60,30, 30,30, 35,60, 10,60 ],
        'parc': [ 7,4, 10,0, 14,6, 9,5, 14,6, 10,12, 9,7, 10,12, 4,12, 7,8, 4,12, 0,6, 5,7, 0,6, 4,0, 5,5, 4,0, 10,0, 7,4, 9,5, 9,7, 7,8, 5,7, 5,5, 7,4, 7,4 ],
        '_monument_': [ -7,-2, -9,-1, -9,-3, 0,-8, 9,-3, 9,-1, 0,-6, -7,-2, 0,-2, 0,-3, -3,-3, 0,-5, 3,-3, 0,-3, 0,-2, 7,-2, 7,-1, 7,6, 5,6, 5,0, 3,0, 3,6, 1,6, 1,0, -1,0, -1,6, -3,6, -3,0, -5,0, -5,6, -7,6, 9,6, 9,8, -9,8, -9,6, -7,6, -7,-2 ],
        /*
         * Topography
         */
        '_swamp_': [ -3,0, -3,1, 4,1, 4,0, 3,0, 3,-2, 4,-5, 3,-5, 2,-2, 2,0, 1,0, 1,-3, 0,-7, -1,-7, 0,-3, 0,0, -1,0, -1,-1, -2,-3, -3,-3, -2,-1, -2,0, -3,0 ],
        'tree': [ 3,4, 0,4, 0,1, -3,1, 0,-8, 3,1, 0,1, 0,4, 3,4 ],
        /*
         * Accomodation
         */
        '_wifi_': [ 9,8, 9,9, 19,9, 20,8, 20,1, 19,0, 1,0, 0,1, 0,8, 1,9, 9,9, 9,7, 6,7, 5,5, 4,7, 2,2, 3,2, 4,4, 5,2, 6,4, 7,2, 8,2, 6,7, 9,7, 9,4, 10,4, 10,3, 9,3, 9,2, 10,2, 10,7, 9,7, 9,8, 11,7, 11,2, 13,1, 19,1, 19,8, 17,8, 17,7, 18,7, 18,4, 17,4, 17,3, 18,3, 18,2, 17,2, 17,8, 12,8, 12,7, 13,7, 13,5, 15,5, 15,4, 13,4, 13,3, 16,3, 16,2, 12,2, 12,8, 9,8 ],
        'home': [-10,-6, -10,10, 10,10, 10,-6, 15,-6, 0,-15, -15,-6 ],
        'home2': [ -2,6, 0,5, 2,3, 6,-4, 10,3, 12,5, 14,6, 0,6, 1,9, 3,9, 3,7, 5,7, 5,9, 7,9, 7,7, 9,7, 9,9, 11,9, 1,9, 2,14, 5,14, 5,10, 7,10, 7,14, 10,14, 11,9, 12,6, -2,6 ],
        /*
         * Sport & leisure
         */
        'foot': [ 0,0, 5,0, 5,2, 4,3, 5,4, 6,3, 5,2, 5,0, 10,0, 10,1, 8,1, 8,5, 10,5, 8,5, 8,1, 10,1, 10,6, 5,6, 5,4, 6,3, 5,2, 4,3, 5,4, 5,6, 0,6, 0,5, 2,5, 2,1, 0,1, 2,1, 2,5, 0,5, 0,0 ],
        /*
         * Meteo
         */
        '_cloud_': [ 70,0, 58,3, 48,9, 43,19, 50,20, 55,30, 50,23, 40,20, 32,22, 26,26, 22,32, 20,40, 30,43, 20,40, 12,42, 6,46, 2,52, 0,60, 2,68, 6,74, 12,78, 20,80, 100,80, 111,78, 121,71, 127,61, 130,50, 127,38, 121,29, 111,22, 100,20, 100,30, 98,19, 91,9, 81,3, 70,0 ],
        '_sun_cloud_': [ 40,5, 30,20, 10,15, 15,35, 0,45, 15,55, 15,35, 30,20, 50,20, 50,20, 65,35, 58,40, 53,48, 60,50, 65,60, 60,53, 50,50, 50,40, 55,30, 45,25, 35,25, 25,30, 20,40, 20,50, 25,60, 40,50, 50,40, 50,50, 42,52, 36,56, 32,62, 30,70, 15,55, 10,75, 16,76, 12,82, 10,90, 12,98, 16,104, 22,108, 30,110, 110,110, 120,108, 131,101, 137,91, 140,80, 137,68, 131,60, 121,52, 110,50, 110,60, 108,49, 101,39, 91,33, 80,30, 68,33, 65,35, 70,15, 50,20, 40,5 ],
        '_rain_': [ 70,0, 58,3, 48,9, 43,19, 50,20, 55,30, 50,23, 40,20, 32,22, 26,26, 22,32, 20,40, 30,43, 20,40, 12,42, 6,46, 2,52, 0,60, 2,68, 6,74, 12,78, 20,80, 30,80, -10,120, 0,120, 10,110, 0,110, 10,100, 20,100, 30,90, 20,90, 30,80, 50,80, 0,130, 10,130, 20,120, 10,120, 20,110, 30,110, 40,100, 30,100, 40,90, 50,90, 60,80, 70,80, 30,120, 40,120, 50,110, 40,110, 50,100, 60,100, 70,90, 60,90, 70,80, 90,80, 40,130, 50,130, 60,120, 50,120, 60,110, 70,110, 80,100, 70,100, 80,90, 90,90, 100,80, 111,78, 121,71, 127,61, 130,50, 127,38, 121,29, 111,22, 100,20, 100,30, 98,19, 91,9, 81,3, 70,0 ],
        '_storm_': [ 70,0, 58,3, 48,9, 43,19, 50,20, 55,30, 50,23, 40,20, 32,22, 26,26, 22,32, 20,40, 30,43, 20,40, 12,42, 6,46, 2,52, 0,60, 2,68, 6,74, 12,78, 20,80, 60,80, 30,100, 50,110, 30,160, 80,110, 60,100, 80,80, 100,80, 111,78, 121,71, 127,61, 130,50, 127,38, 121,29, 111,22, 100,20, 100,30, 98,19, 91,9, 81,3, 70,0 ],
        '_sun_': [ 12,4, 9,6, 9,2, 6,-1, 2,-1, -1,2, -1,6, 2,9, 6,9, 5,8, 7,7, 8,5, 8,3, 7,1, 5,0, 3,0, 1,1, 0,3, 0,5, 1,7, 3,8, 5,8, 6,9, 9,6, 10,10, 6,9, 4,12, 2,9, -2,10, -1,6, -4,4, -1,2, -2,-2, 2,-1, 4,-4, 6,-1, 10,-2, 9,2, 12,4 ],
        '_snow_': [ 1,-40, 1,-29, -7,-34, -10,-29, 1,-22, 1,-16, -5,-19, -7,-14, -1,-11, -11,-6, -11,-13, -16,-13, -16,-7, -21,-10, -21,-23, -27,-23, -27,-13, -38,-19, -41,-13, -31,-8, -39,-4, -36,1, -24,-4, -19,-2, -24,1, -21,5, -16,2, -16,12, -21,9, -24,14, -19,16, -24,19, -36,13, -39,18, -31,22, -41,27, -38,33, -27,28, -27,37, -21,37, -21,25, -16,22, -16,27, -11,27, -11,21, -1,26, -8,28, -5,33, 1,31, 1,36, -10,43, -7,48, 1,43, 1,55, 7,55, 7,43, 15,48, 19,43, 7,36, 7,31, 13,33, 15,28, 10,26, 19,21, 19,27, 24,27, 24,22, 29,25, 29,37, 35,37, 35,28, 46,33, 49,27, 39,22, 47,18, 44,13, 32,19, 27,16, 32,14, 29,9, 24,12, 24,2, 30,5, 32,1, 27,-2, 33,-5, 44,1, 47,-4, 39,-8, 49,-13, 46,-19, 36,-14, 36,-23, 30,-23, 30,-10, 24,-7, 24,-13, 19,-13, 19,-6, 10,-11, 15,-14, 13,-19, 7,-16, 7,-22, 18,-29, 15,-34, 7,-29, 7,-40, 1,-40, 4,-6, 16,0, 16,15, 4,20, -8,15, -8,0, 4,-6, 1,-40 ],
        'snow': [ 3,0, 4,1, 4,3, 3,3, 2,2, 2,1, 2,2, 1,2, 2,2, 3,3, 3,4, 1,4, 0,3, 1,4, 0,5, 1,4, 3,4, 3,5, 2,6, 1,6, 2,6, 2,7, 2,6, 3,5, 4,5, 4,7, 3,8, 4,7, 5,8, 4,7, 4,5, 5,5, 6,6, 6,7, 6,6, 7,6, 6,6, 5,5, 5,4, 7,4, 8,5, 7,4, 8,3, 7,4, 5,4, 5,3, 6,2, 7,2, 6,2, 6,1, 6,2, 5,3, 4,3, 4,1, 5,0, 4,1, 3,0 ],
        /*
         * POI
         */
        '_poi_': [ 0,-300, -116,-275, -212,-212, -275,-116, -300,0, -275,116, -212,213, -164,244, 0,700, 3,1400, 0,700, 164,244, 213,213, 275,116, 300,0, 275,-116, 213,-212, 116,-275, 0,-300, 0,-200, 78,-184, 141,-141, 184,-78, 200,0, 184,78, 141,141, 78,184, 0,200, 0,100, 38,91, 72,72, 91,38, 100,0, 91,-37, 72,-72, 38,-91, 0,-100, -37,-91, -72,-72, -91,-37, -100,0, -91,38, -72,72, -37,91, 0,100, 0,200, -78,184, -141,141, -184,78, -200,0, -184,-78, -141,-141, -78,-184, 0,-200, 0,-300 ],
        '_flag_': [ 1,0, 1,-6, 5,-8, 0,-10, 0,0, -4,10, 0,0, 1,0 ],
        '_view_': [ -500,0, -462,200, -354,354, -200,462, 0,500, 200,462, 354,354, 462,200, 500,0, 462,-200, 354,-354, 480,-480, 1117,-1400, 1400,-1400, 1400,-1117, 480,-480, 354,-354, 200,-462, 0,-500, 0,-700, -200,-1800, 0,-2000, 200,-1800, 0,-700, 0,-500, -200,-462, -354,-354, -480,-480, -1117,-1400, -1400,-1400, -1400,-1117, -480,-480, -354,-354, -462,-200, -500,0 ],
        '_view1_': [ -5,-60, 0,0, -20,-55, -30,-50, 0,0, 30,-50, 20,-55, 0,0, 0,60, 0,0, 5,-60, -5,-60 ],
        '_view3_': [ -5,-60, 0,0, -20,-55, -30,-50, 0,0, -50,0, -50,10, 0,0, -50,20, -50,30, 0,0, -40,40, -30,40, 0,0, 30,40, 40,40, 0,0, 50,30, 50,20, 0,0, 50,10, 50,0, 0,0, 30,-50, 20,-55, 0,0, 5,-60, -5,-60 ]
    });

}

if (OpenLayers.Control && OpenLayers.Control.Panel) {

/**
 * Class: OpenLayers.UI.Panel
 * Base class for rendering {<OpenLayers.Control.Panel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Panel-js.html>} components.
 *  IGNF: _addition_
 */
OpenLayers.UI.Panel = OpenLayers.Class(OpenLayers.UI, {
    /**
     * APIMethod: changeLang
     * Change the rendering when "changelang" has been triggered.
     * IGNF: _get rid of panel_div_
     *
     * Parameters:
     * evt - {Event} event fired, may be undefined (See
     *      <OpenLayers.Control.draw at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html#OpenLayers.Control.draw>).
     *      evt.lang holds the new language
     */
    changeLang: function(evt) {
        OpenLayers.UI.prototype.changeLang.apply(this,arguments);
        var cntrl;
        for (var i= 0, len= this.component.controls.length; i<len; i++) {
            cntrl= this.component.controls[i];
            cntrl.changeLang(evt);
        }
    },

    /**
     * APIMethod: addElement
     * Append a {DOMElement} to the current rendered element.
     *
     * Parameters:
     * element - {DOMElement} the elemeny to append
     */
    addElement: function(element) {
        this.container.appendChild(element);
    },

    /**
     * Constant: OpenLayers.UI.Panel.CLASS_NAME
     *  Defaults to *OpenLayers.UI.Panel*
     */
    CLASS_NAME: "OpenLayers.UI.Panel"
});

/**
 * Class: OpenLayers.UI.JQuery.Panel
 * Specialized class for rendering {<OpenLayers.Control.Panel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Panel-js.html>} using JQuery.
 * FIXME: JQuery UI (See http://jquery.com and http://jqueryui.com).
 */
OpenLayers.UI.JQuery.Panel = OpenLayers.Class(OpenLayers.UI.Panel, OpenLayers.UI.JQuery, {
    /**
     * Constant: OpenLayers.UI.JQuery.Panel.CLASS_NAME
     *  Defaults to *OpenLayers.UI.JQuery.Panel*
     */
    CLASS_NAME: "OpenLayers.UI.JQuery.Panel"
});

/**
 * Class: OpenLayers.Control.Panel
 * IGNF: mainly get rid of panel_div
 */
    OpenLayers.Control.Panel= OpenLayers.overload(OpenLayers.Control.Panel, {

    /**
     * Property: uis
     * {Array(String)} List of supported UI classes.  Add to this list to
     * add support for additional uis. This list is ordered :
     * the first ui which returns true for the  'supported()'
     * method will be used, if not defined in the 'ui' option.
     */
    uis: ["OpenLayers.UI.Panel"],

    /**
     * APIMethod: destroy
     * IGNF: _get rid of panel_div_
     */
    destroy: function() {
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
        for (var ctl, i = this.controls.length - 1; i >= 0; i--) {
            ctl = this.controls[i];
            if (ctl.events) {
                ctl.events.un({
                    "activate": this.redraw,
                    "deactivate": this.redraw,
                    scope: this
                });
            }
            OpenLayers.Event.stopObservingElement(this.controls[i].div);
        }
        this.activeState = null;
        this.controls = null;
    },

    /**
     * Method: addPanelDiv
     * Stop mousedowns and clicks, but don't stop mouseup, since
     *      they need to pass through.
     * IGNF: _addition (removal of unused node)_.
     * IGNF: _get rid of panel_div_
     *
     * Parameters:
     * cntrl - {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>} the control within the panel.
     */
    addPanelDiv: function (cntrl) {
        //FIXME: either we call draw on the control, or we just create a
        //div cause we assume that the control may have a different
        //representation when being a panel's control and not a standalone
        //one ... We use OpenLayers.UI.render() method in the first case
        //and OpenLayers.UI.draw() in the second !
        var ui= cntrl.getUI();
        var st= {
            position:''
        };
        var e= ui.getDom();
        if (e!=null) {
            for (var r in e.style) {
                var v= e.style[r];
                if (v===null) { continue; }
                switch(typeof(v)) {
                case 'number':
                case 'string':
                    if (v) {
                        st[r]= e.style[r];
                    }
                    break;
                default      :
                    break;
                }
            }
        }
        cntrl.div= ui.render({
            //force:true, FIXME: useless when building - prevent jqmobile style to apply
            style: st
        });
        cntrl.changeLang();
        e= ui.getDom();

        OpenLayers.Element.addClass(e, "olButton");
        cntrl.panel_div= e ;
    },

    /**
     * APIMethod: activateControl
     * IGNF: _addition of "controlactivated" triggering_.
     *
     * control - {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>} the control being activated.
     */
    activateControl: function (control) {
        if (!this.active) { return false; }
        if (control.type == OpenLayers.Control.TYPE_BUTTON) {
            control.trigger();
            this.redraw();
            return;
        }
        if (control.type == OpenLayers.Control.TYPE_TOGGLE) {
            if (control.active) {
                control.deactivate();
            } else {
                if (this.map) {//IGNF
                    this.map.events.triggerEvent("controlactivated",{control:control});
                }
                control.activate();
            }
            this.redraw();
            return;
        }
        if (this.allowDepress && control.active) {
            control.deactivate();
        } else {
            var c;
            for (var i= 0, len= this.controls.length; i<len; i++) {
                c = this.controls[i];
                if (c != control &&
                    (c.type === OpenLayers.Control.TYPE_TOOL || c.type == null)) {
                    c.deactivate();
                }
            }

            // trigger special event :
            if (this.map) {
                this.map.events.triggerEvent("controlactivated",{control:control});
            }
            control.activate();
        }
    },

    /**
     * APIMethod: addControls
     * To build a toolbar, you add a set of controls to it. addControls
     * lets you add a single control or a list of controls to the
     * Control Panel.
     * IGNF: _addition of private method addPanelDiv()_.
     *
     * Parameters:
     * controls - {<OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>}
     */
    addControls: function(controls) {
        if (!(OpenLayers.Util.isArray(controls))) {
            controls = [controls];
        }
        this.controls = this.controls.concat(controls);

        // Give each control a panel_div which will be used later.
        // Access to this div is via the panel_div attribute of the
        // control added to the panel.
        // Also, stop mousedowns and clicks, but don't stop mouseup,
        // since they need to pass through.
        for (var i=0, len=controls.length; i<len; i++) {
            this.addPanelDiv(controls[i]);
        }

        if (this.map) { // map.addControl() has already been called on the panel
            this.addControlsToMap(controls);
            this.redraw();
        }
    },

    /**
     * Method: redraw
     * IGNF: change removal/addition of inner controls (TODO: to be tested)
     * IGNF: _get rid of panel_div_
     */
    redraw: function() {
        for (var i= 0, len= this.controls.length; i<len; i++) {
            var cntrl= this.controls[i];
            var element= cntrl.div;
            if (element) {
                if (element.parentNode) {
                    element= element.parentNode.removeChild(element);
                }
                if (this.active) {
                    if (cntrl.active===true) {
                        OpenLayers.Control.Panel.prototype.iconOn.apply(cntrl,[]);
                    } else {
                        OpenLayers.Control.Panel.prototype.iconOff.apply(cntrl,[]);
                    }
                    this.div.appendChild(element);
                }
            }
        }
        if (!this.active) {
            this.div.innerHTML= "";
        }
    },

    /**
     * Method: iconOn
     * Internal use, for use only with "controls[i].events.on/un".
     */
    iconOn: function() {
        //var d = this.panel_div; // "this" refers to a control on panel!
        //d.className = d.className.replace(/ItemInactive$/, "ItemActive");
        //IGNF:
        var d = this.div; // "this" refers to a control on panel!
        if (d.className!="") {
            d.className = d.className.replace(new RegExp("("+this.getDisplayClass()+")(Item((A|Ina)ctive|Disabled))?"), "$1ItemActive");
        }
    },

    /**
     * Method: iconOff
     * Internal use, for use only with "controls[i].events.on/un".
     */
    iconOff: function() {
        //var d = this.panel_div; // "this" refers to a control on panel!
        //d.className = d.className.replace(/ItemActive$/, "ItemInactive");
        //IGNF:
        var d = this.div; // "this" refers to a control on panel!
        if (d.className!="") {
            d.className = d.className.replace(new RegExp("("+this.getDisplayClass()+")(Item((A|Ina)ctive|Disabled))?"), "$1ItemInactive");
        }
    },

    /**
     * Method: iconBlock
     * Set the CSS class of a control to render it as 'disabled'.
     */
    iconBlock: function() {
        var d = this.div; // "this" refers to a control on panel!
        if (d.className!="") {
            d.className = d.className.replace(new RegExp("("+this.getDisplayClass()+")(Item((A|Ina)ctive|Disabled))?"), "$1ItemDisabled");
        }
    }

    });

}

/**
 * Class: OpenLayers.Control.ZoomPanel
 * IGNF: few enhancements
 */
if (OpenLayers.Control && OpenLayers.Control.ZoomPanel) {

    OpenLayers.Control.ZoomPanel= OpenLayers.overload(OpenLayers.Control.ZoomPanel, {

    /**
     * Constructor: OpenLayers.Control.ZoomPanel
     * Add the three zooming controls.
     *      IGNF: passes options to sub-controls through the use of
     *      sub-control's CLASS_NAME options.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     */
    initialize: function(options) {
        options= options || {}
        OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);
        this.addControls([
            new OpenLayers.Control.ZoomIn(options['OpenLayers.Control.ZoomIn']),
            new OpenLayers.Control.ZoomToMaxExtent(options['OpenLayers.Control.ZoomToMaxExtent']),
            new OpenLayers.Control.ZoomOut(options['OpenLayers.Control.ZoomOut'])
        ]);
    }

    });

}

/**
 * Class: OpenLayers.Layer.HTTPRequest
 * IGNF: few enhancements
 */
if (OpenLayers.Layer && OpenLayers.Layer.HTTPRequest) {

    OpenLayers.Layer.HTTPRequest= OpenLayers.overload(OpenLayers.Layer.HTTPRequest, {

    /**
     * APIMethod: changeBaseLayer
     * Listener of the map's event 'changebaselayer'.
     *      Reproject its maxExtent according to the new
     *      base layer if it is not a base layer itself.
     * IGNF: _takes into account <OpenLayers.Layer.addOptions at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html#OpenLayers.Layer.addOptions>()_.
     *
     * Parameters:
     * evt - {Event} the 'changebaselayer' event.
     *
     * Context:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the new baseLayer
     * baseLayer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the old baseLayer
     *
     * Returns:
     * {Boolean} true to keep on, false to stop propagating the event.
     */
    changeBaseLayer: function(evt) {
        if (OpenLayers.Layer.prototype.changeBaseLayer.apply(this,arguments)===false) {
            return false;
        }
        if (!this.isBaseLayer) {
            var opts= {
                displayInLayerSwitcher:this.displayInLayerSwitcher
            };
            var p= this.getCompatibleProjection(evt.layer);
            if (p!=null) {
                opts.projection= p.clone();
                if (this.aggregate==undefined) {
                    opts.displayInLayerSwitcher= true;
                }
            } else {
                if (this.aggregate==undefined) {
                    opts.displayInLayerSwitcher= false;
                    this.visibility= true;//force update
                    this.setVisibility(false);
                }
            }
            //FIXME:// force re-computing resolutions
            this.addOptions(opts);
            this.redraw();
        }
        return true;
    }

    });

}

/**
 * Class: OpenLayers.Layer.Grid
 * IGNF: checks additions
 */
if (OpenLayers.Layer && OpenLayers.Layer.Grid) {

    OpenLayers.Layer.Grid= OpenLayers.overload(OpenLayers.Layer.Grid, {

    changeBaseLayer: OpenLayers.Layer.HTTPRequest.prototype.changeBaseLayer,

    getCompatibleProjection: OpenLayers.Layer.HTTPRequest.prototype.getCompatibleProjection,

    /**
     * Method: addTileMonitoringHooks
     * This function takes a tile as input and adds the appropriate hooks to
     *     the tile so that the layer can keep track of the loading tiles.
     * IGNF: _test on events returns_.
     *
     * Parameters:
     * tile - {<OpenLayers.Tile at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Tile-js.html>}
     */
    addTileMonitoringHooks: function(tile) {

        tile.onLoadStart = function() {
            //if that was first tile then trigger a 'loadstart' on the layer
            if (this.loading === false) {
                this.loading = true;
                if (this.events.triggerEvent("loadstart")===false) {//IGNF
                    return;
                }
            }
            this.events.triggerEvent("tileloadstart", {tile: tile});
            this.numLoadingTiles++;
        };

        tile.onLoadEnd = function() {
            this.numLoadingTiles--;
            this.events.triggerEvent("tileloaded", {tile: tile});
            //if that was the last tile, then trigger a 'loadend' on the layer
            if (this.tileQueue.length === 0 && this.numLoadingTiles === 0) {
                this.loading = false;
                this.events.triggerEvent("loadend");
                if(this.backBuffer) {
                    // the removal of the back buffer is delayed to prevent flash
                    // effects due to the animation of tile displaying
                    this.backBufferTimerId = window.setTimeout(
                        OpenLayers.Function.bind(this.removeBackBuffer, this),
                        this.removeBackBufferDelay
                    );
                }
            }
        };

        tile.onLoadError = function() {
            this.events.triggerEvent("tileerror", {tile: tile});
        };

        tile.events.on({
            "loadstart": tile.onLoadStart,
            "loadend": tile.onLoadEnd,
            "unload": tile.onLoadEnd,
            "loaderror": tile.onLoadError,
            scope: this
        });
    }

    });

}

/**
 * Class: OpenLayers.Strategy.Fixed
 * IGNF: addition of testing loadstart event false return.
 */
if (OpenLayers.Strategy && OpenLayers.Strategy.Fixed) {

    OpenLayers.Strategy.Fixed= OpenLayers.overload(OpenLayers.Strategy.Fixed, {

    /**
     * Property: response
     * {<OpenLayers.Protocol.Response at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Protocol/Response-js.html>}
     *      The protocol response object returned by the layer protocol.
     */
    response: null,

    /**
     * Method: load
     * Tells protocol to load data and unhooks the visibilitychanged event
     * IGNF: _test on event returns and check on response_
     *
     * Parameters:
     * options - {Object} options to pass to protocol read.
     */
    load: function(options) {
        //FIXME: visibilitychanged event ...
        //IGNF:
        if (this.response) {
            this.layer.protocol.abort(this.response);
            this.layer.events.triggerEvent("loadend");
        }

        if (this.layer.events.triggerEvent("loadstart")===false) {//IGNF
            return;
        }
        if (this.layer.protocol) {//IGNF
            this.response= this.layer.protocol.read(OpenLayers.Util.applyDefaults({//IGNF: this.response added ...
                callback: OpenLayers.Function.bind(this.merge, this,
                    this.layer.map.getProjection()),
                filter: this.layer.filter
            }, options));
        }
        this.layer.events.un({
            "visibilitychanged": this.load,
            scope: this
        });
    },

    /**
     * Method: merge
     * Add all features to the layer.
     * IGNF: _take protocol's format internal and external projections into
     * account_.
     *
     * Parameters:
     * mapProjection - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the map projection
     * resp - {Object} options to pass to protocol read.
     */
    merge: function(mapProjection, resp) {
        this.layer.destroyFeatures();
        var features = resp.features;
        if (features && features.length > 0) {
            var remote = null;
            //IGNF:
            if (this.layer.protocol &&
                this.layer.protocol.format &&
                this.layer.protocol.format.internalProjection &&
                this.layer.protocol.format.externalProjection) {
                remote= this.layer.protocol.format.internalProjection;
            }
            if (!remote) {
                remote = this.layer.projection;
            }
            var local = mapProjection;

            if(!local.equals(remote)) {
                var geom;
                for(var i=0, len=features.length; i<len; ++i) {
                    geom = features[i].geometry;
                    if(geom) {
                        geom.transform(remote, local);
                    }
                }
            }
            this.layer.addFeatures(features);
        }
        this.response = null;//IGNF
        this.layer.events.triggerEvent("loadend");
    }

    });

}

/**
 * Class: OpenLayers.Layer.WMS
 * IGNF: few enhancements
 */
if (OpenLayers.Layer && OpenLayers.Layer.WMS) {

    OpenLayers.Layer.WMS= OpenLayers.overload(OpenLayers.Layer.WMS, {

    /**
     * APIMethod: changeBaseLayer
     * Listener of the map's event 'changebaselayer'.
     *      Reproject its maxExtent according to the new
     *      base layer if it is not a base layer itself.
     *      IGNF: _takes into account <OpenLayers.Layer.addOptions at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html#OpenLayers.Layer.addOptions>()_.
     *
     * Parameters:
     * evt - {Event} the 'changebaselayer' event.
     *
     * Context:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the new baseLayer
     * baseLayer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the old baseLayer
     *
     * Returns:
     * {Boolean} true to keep on, false to stop propagating the event.
     */
    changeBaseLayer: function(evt) {
        // saving old visibility before calling prototype that will eventually 
        // change its value and thus corrupting the value for savedStates.
        var v= this.getVisibility();
        // FIXME : should be OpenLayers.Layer.Grid.prototype ?
        if (OpenLayers.Layer.prototype.changeBaseLayer.apply(this,arguments)===false) {
            return false;
        }
        if (!this.isBaseLayer) {
            var p= this.getCompatibleProjection(evt.layer);
            if (p!=null) {
                var opts= {
                    projection: p.clone(),
                    displayInLayerSwitcher:this.displayInLayerSwitcher
                };
                // deactivated because it displays the layer in the LS even when displayInLayerSwitcher= true
                /*if (this.aggregate==undefined) {
                    opts.displayInLayerSwitcher= true;
                }*/
                //FIXME: force re-computing resolutions
                
                //Force keep maxextent who is already recomputed
                if (this.maxExtent){
                 opts.maxExtent = this.maxExtent;   
                }
                this.addOptions(opts);
                if (this.savedStates[evt.layer.id]) {
                    this.setVisibility(!!this.savedStates[evt.layer.id].visibility);
                }
                return true;
            }
            this.displayInLayerSwitcher= false;
            if (!this.savedStates[evt.baseLayer.id]) {
                this.savedStates[evt.baseLayer.id]= {};
            }
            this.savedStates[evt.baseLayer.id].visibility= v;
            if (!v) {//force refresh
                this.visibility= true;  //hack
            }
            this.setVisibility(false);
        }
        return true;
    },

    /**
     * Method: getCompatibleProjection
     * Check whether the layer's projection is displayable with the base layer.
     *  IGNF: _addition_
     *
     * Params:
     * blayer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the baseLayer to compare with.
     *      if none, use current baseLayer from the map.
     *
     * Returns:
     * {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} if compatible,
     * undefined if not relevant, null on error.
     */
    getCompatibleProjection: function(blayer) {
        var lproj= OpenLayers.Layer.prototype.getCompatibleProjection.apply(this,arguments);
        if (lproj!=null) {
            return lproj;
        }
        blayer= blayer || this.map.baseLayer;
        if (blayer.territory && this.territory && blayer.territory!==this.territory) { return null; }
        var bproj= blayer.getNativeProjection();

        // assumption : from WMSCapabilities, srs is an hash of supported projections ...
        for (var crs in this.srs) {
            if (!(crs instanceof OpenLayers.Projection)) {
                lproj= new OpenLayers.Projection(crs);
            } else {
                lproj= crs;
            }
            if (lproj.isCompatibleWith(bproj)) {
                return lproj;
            }
            lproj= null;
        }
        return null;
    }

    });

}

/**
 * Namespace: OpenLayers.Request
 */
if (OpenLayers.Request) {

    /**
     * APIFunction: getFQDNForUrl
     * Compute (approximate?) the fully qualified domain name for the URL.
     *  IGNF: _addition_
     *
     * Parameters:
     * url - {String}
     *
     * Returns:
     * {String} the FQDN.
     */
    OpenLayers.Request.getFQDNForUrl= function(url) {
        if (url) {
            var pdn= url.match(/^[a-z]+:\/\/([^\/]+)\/?/i);
            if (pdn) {
                return pdn[1];
            }
            // figure out FQDN as there is no scheme ...
            // property host contains name and port number if any
            return window.location.host;
        }
        return null;
    };

    /**
     * APIFunction: setProxyUrl
     * Defines the URL of the proxy to use for the AJAX requests
     * (needed for XML resources).
     *  IGNF: _addition_
     *
     * Parameters:
     * url - {String}
     */
    OpenLayers.Request.setProxyUrl= function(url) {
        OpenLayers.ProxyHost= url;
        OpenLayers.ProxyHostFQDN= OpenLayers.Request.getFQDNForUrl(url);
        Proj4js.setProxyUrl(url);
    };

    /**
     * APIFunction: proxyfyUrl
     * Compute the proxied url whever it is needed : a proxy is defined and the
     * URL to proxied does not belong to the proxy FQDN. If it is not needed, the
     * url remains unchanged.
     *  IGNF: _addition_
     *
     * Parameters:
     * phost - {String} The proxy host.
     * phfqdn - {String} The proxy host fully qualified name (See
     *      <OpenLayers.Request.getFQDNForUrl at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Request-js.html#OpenLayers.Request.getFQDNForUrl>).
     * url - {String} The URL to proxy.
     *
     * Returns:
     * {String} The proxied URL or the unchanged URL.
     */
    OpenLayers.Request.proxyfyUrl= function(phost, phfqdn, url) {
        // Don't just check for http, but for proxy :
        if (phost) {
            if (!OpenLayers.String.startsWith(url, phost)) {
                if (url.search(/^[a-z]+:\/\//i)!=-1) {
                    var udn= url.match(/^[a-z]+:\/\/([^\/]*)\/?/i); // file:///...
                    if (udn) {
                        udn= udn[1];
                    }
                    if (phfqdn!=udn) {
                        // try not to proxy on same domain, this cause errors
                        // in requesting Javascript (proj4js/defs) files
                        url= phost + encodeURIComponent(url);
                    }
                }
            }
        }
        return url;
    };

    /**
     * APIMethod: issue
     * Create a new XMLHttpRequest object, open it, set any headers, bind
     *     a callback to done state, and send any data.  It is recommended that
     *     you use one <GET>, <POST>, <PUT>, <DELETE>, <OPTIONS>, or <HEAD>.
     *     This method is only documented to provide detail on the configuration
     *     options available to all request methods.
     *  IGNF: _use of <OpenLayers.Request.setProxyUrl at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Request-js.html#OpenLayers.Request.setProxyUrl>_
     *  IGNF: _see <http://trac.osgeo.org/openlayers/ticket/3491>_
     *
     * Parameters:
     * config - {Object} Object containing properties for configuring the
     *     request.  Allowed configuration properties are described below.
     *     This object is modified and should not be reused.
     *
     * Allowed config properties:
     * method - {String} One of GET, POST, PUT, DELETE, HEAD, or
     *     OPTIONS.  Default is GET.
     * url - {String} URL for the request.
     * async - {Boolean} Open an asynchronous request.  Default is true.
     * user - {String} User for relevant authentication scheme.  Set
     *     to null to clear current user.
     * password - {String} Password for relevant authentication scheme.
     *     Set to null to clear current password.
     * proxy - {String} Optional proxy.  Defaults to
     *     <OpenLayers.ProxyHost at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/ProxyHost-js.html> (IGNF: _use enhancements_).
     * params - {Object} Any key:value pairs to be appended to the
     *     url as a query string.  Assumes url doesn't already include a query
     *     string or hash.  Typically, this is only appropriate for <GET>
     *     requests where the query string will be appended to the url.
     *     Parameter values that are arrays will be
     *     concatenated with a comma (note that this goes against form-encoding)
     *     as is done with <OpenLayers.Util.getParameterString at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Util-js.html#OpenLayers.Util.getParameterString>.
     * headers - {Object} Object with header:value pairs to be set on
     *     the request.
     * data - {String | Document} Optional data to send with the request.
     *     Typically, this is only used with <POST> and <PUT> requests.
     *     Make sure to provide the appropriate "Content-Type" header for your
     *     data.  For <POST> and <PUT> requests, the content type defaults to
     *     "application-xml".  If your data is a different content type, or
     *     if you are using a different HTTP method, set the "Content-Type"
     *     header to match your data type.
     * callback - {Function} Function to call when request is done.
     *     To determine if the request failed, check request.status (200
     *     indicates success).
     * success - {Function} Optional function to call if request status is in
     *     the 200s.  This will be called in addition to callback above and
     *     would typically only be used as an alternative.
     * failure - {Function} Optional function to call if request status is not
     *     in the 200s.  This will be called in addition to callback above and
     *     would typically only be used as an alternative.
     * scope - {Object} If callback is a public method on some object,
     *     set the scope to that object.
     *
     * Returns:
     * {XMLHttpRequest} Request object.  To abort the request before a response
     *     is received, call abort() on the request object.
     */
    OpenLayers.Request.issue= function(config) {
        // apply default config - proxy host may have changed
        var defaultConfig = OpenLayers.Util.extend(
            this.DEFAULT_CONFIG,
            {proxy: OpenLayers.ProxyHost}
        );
        config = OpenLayers.Util.applyDefaults(config, defaultConfig);

        // IGNF: See http://trac.osgeo.org/openlayers/ticket/3491
        // Always set the "X-Requested-With" header to signal that this request
        // was issued through the XHR-object. Since header keys are case
        // insensitive and we want to allow overriding of the "X-Requested-With"
        // header through the user we cannot use applyDefaults, but have to
        // check manually whether we were called with a "X-Requested-With"
        // header.
        var customRequestedWithHeader = false;
        for(var headerKey in config.headers) {
            if (config.headers.hasOwnProperty( headerKey )) {
                if (headerKey.toLowerCase() === 'x-requested-with') {
                    customRequestedWithHeader = true;
                }
            }
        }
        if (customRequestedWithHeader === false) {
            // we did not have a custom "X-Requested-With" header
            config.headers['X-Requested-With'] = 'XMLHttpRequest';
        }

        // create request, open, and set headers
        var request = new OpenLayers.Request.XMLHttpRequest();
        var url = OpenLayers.Util.urlAppend(config.url,
            OpenLayers.Util.getParameterString(config.params || {}));
        var sameOrigin = !(url.indexOf("http") == 0);
        var urlParts = !sameOrigin && url.match(this.URL_SPLIT_REGEX);
        if (urlParts) {
            var location = window.location;
            sameOrigin =
                urlParts[1] == location.protocol &&
                urlParts[3] == location.hostname;
            var uPort = urlParts[4], lPort = location.port;
            if (uPort != 80 && uPort != "" || lPort != "80" && lPort != "") {
                sameOrigin = sameOrigin && uPort == lPort;
            }
        }
        if (!sameOrigin) {
            if (config.proxy) {
                if (typeof config.proxy == "function") {
                    url = config.proxy(url);
                } else {//IGNF
                    url= OpenLayers.Request.proxyfyUrl(
                            config.proxy,
                            OpenLayers.Request.getFQDNForUrl(config.proxy),
                            url);
                }
            } else {
                OpenLayers.Console.warn(
                    OpenLayers.i18n("proxyNeeded"), {url: url});
            }
        }
        request.open(
            config.method, url, config.async, config.user, config.password
        );
        for(var header in config.headers) {
            request.setRequestHeader(header, config.headers[header]);
        }

        var events = this.events;

        // we want to execute runCallbacks with "this" as the
        // execution scope
        var self = this;

        request.onreadystatechange = function() {
            if(request.readyState == OpenLayers.Request.XMLHttpRequest.DONE) {
                var proceed = events.triggerEvent(
                    "complete",
                    {request: request, config: config, requestUrl: url}
                );
                if(proceed !== false) {
                    self.runCallbacks(
                        {request: request, config: config, requestUrl: url}
                    );
                }
            }
        };

        // send request (optionally with data) and return
        // call in a timeout for asynchronous requests so the return is
        // available before readyState == 4 for cached docs
        if(config.async === false) {
            request.send(config.data);
        } else {
            window.setTimeout(function(){
                if (request.readyState !== 0) { // W3C: 0-UNSENT
                    request.send(config.data);
                }
            }, 0);
        }
        return request;
    };


// XMLHttpRequest.js Copyright (C) 2010 Sergey Ilinsky (http://www.ilinsky.com)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
(function () {

    // Save reference to earlier defined object implementation (if any)
    var oXMLHttpRequest= window.XMLHttpRequest;

    // Define on browser type
    var bGecko= !!window.controllers,
        bIE= window.document.all && !window.opera,
        bIE7= bIE && window.navigator.userAgent.match(/MSIE 7.0/);

    // Enables "XMLHttpRequest()" call next to "new XMLHttpReques()"
    function fXMLHttpRequest() {
        //IGNF:
        //this._object= oXMLHttpRequest ? new oXMLHttpRequest : new window.ActiveXObject('Microsoft.XMLHTTP');
        //read local file:
        this._object= oXMLHttpRequest && !bIE7 &&
                      (window.location.protocol!== "file:" || !window.ActiveXObject)?
            new oXMLHttpRequest
        :   new window.ActiveXObject('Microsoft.XMLHTTP');
        // http://trac.openlayers.org/ticket/2065
        this._listeners= [];
    };

    // Constructor
    function cXMLHttpRequest() {
        return new fXMLHttpRequest;
    };
    cXMLHttpRequest.prototype    = fXMLHttpRequest.prototype;

    // BUGFIX: Firefox with Firebug installed would break pages if not executed
    if (bGecko && oXMLHttpRequest.wrapped)
        cXMLHttpRequest.wrapped= oXMLHttpRequest.wrapped;

    // Constants
    cXMLHttpRequest.UNSENT              = 0;
    cXMLHttpRequest.OPENED              = 1;
    cXMLHttpRequest.HEADERS_RECEIVED    = 2;
    cXMLHttpRequest.LOADING             = 3;
    cXMLHttpRequest.DONE                = 4;
    //IGNF
    cXMLHttpRequest.PARSED_OK           = "Document contains no parsing errors";
    cXMLHttpRequest.PARSED_EMPTY        = "Document is empty";
    cXMLHttpRequest.PARSED_UNKNOWN_ERROR= "Not well-formed or other error";

    // Public Properties
    cXMLHttpRequest.prototype.readyState  = cXMLHttpRequest.UNSENT;
    cXMLHttpRequest.prototype.responseText= '';
    cXMLHttpRequest.prototype.responseXML = null;
    cXMLHttpRequest.prototype.status      = 0;
    cXMLHttpRequest.prototype.statusText  = '';

    // Priority proposal
    cXMLHttpRequest.prototype.priority= "NORMAL";

    // Instance-level Events Handlers
    cXMLHttpRequest.prototype.onreadystatechange= null;

    // Class-level Events Handlers
    cXMLHttpRequest.onreadystatechange= null;
    cXMLHttpRequest.onopen            = null;
    cXMLHttpRequest.onsend            = null;
    cXMLHttpRequest.onabort           = null;

    // Public Methods
    cXMLHttpRequest.prototype.open= function(sMethod, sUrl, bAsync, sUser, sPassword) {
        // Delete headers, required when object is reused
        delete this._headers;

        // When bAsync parameter value is ommited, use true as default
        if (arguments.length < 3)
            bAsync  = true;

        // Save async parameter for fixing Gecko bug with missing readystatechange in synchronous requests
        this._async= bAsync;

        // Set the onreadystatechange handler
        var oRequest= this,
            nState= this.readyState,
            fOnUnload;

        // BUGFIX: IE - memory leak on page unload (inter-page leak)
        if (bIE && bAsync) {
            fOnUnload= function() {
                if (nState != cXMLHttpRequest.DONE) {
                    fCleanTransport(oRequest);
                    // Safe to abort here since onreadystatechange handler removed
                    oRequest.abort();
                }
            };
            window.attachEvent("onunload", fOnUnload);
        }

        // Add method sniffer
        if (cXMLHttpRequest.onopen)
            cXMLHttpRequest.onopen.apply(this, arguments);

        if (arguments.length > 4)
            this._object.open(sMethod, sUrl, bAsync, sUser, sPassword);
        else
        if (arguments.length > 3)
            this._object.open(sMethod, sUrl, bAsync, sUser);
        else
            this._object.open(sMethod, sUrl, bAsync);

        this.readyState= cXMLHttpRequest.OPENED;
        fReadyStateChange(this);

        this._object.onreadystatechange= function() {
            if (bGecko && !bAsync)
                return;

            // Synchronize state
            oRequest.readyState= oRequest._object.readyState;

            //
            fSynchronizeValues(oRequest);

            // BUGFIX: Firefox fires unnecessary DONE when aborting
            if (oRequest._aborted) {
                // Reset readyState to UNSENT
                oRequest.readyState= cXMLHttpRequest.UNSENT;

                // Return now
                return;
            }

            if (oRequest.readyState == cXMLHttpRequest.DONE) {
                //
                fCleanTransport(oRequest);
// Uncomment this block if you need a fix for IE cache
/*
                // BUGFIX: IE - cache issue
                if (!oRequest._object.getResponseHeader("Date")) {
                    // Save object to cache
                    oRequest._cached= oRequest._object;

                    // Instantiate a new transport object
                    cXMLHttpRequest.call(oRequest);

                    // Re-send request
                    if (sUser) {
                        if (sPassword)
                            oRequest._object.open(sMethod, sUrl, bAsync, sUser, sPassword);
                        else
                            oRequest._object.open(sMethod, sUrl, bAsync, sUser);
                    }
                    else
                        oRequest._object.open(sMethod, sUrl, bAsync);
                    oRequest._object.setRequestHeader("If-Modified-Since", oRequest._cached.getResponseHeader("Last-Modified") || new window.Date(0));
                    // Copy headers set
                    if (oRequest._headers)
                        for (var sHeader in oRequest._headers)
                            if (typeof oRequest._headers[sHeader] == "string")  // Some frameworks prototype objects with functions
                                oRequest._object.setRequestHeader(sHeader, oRequest._headers[sHeader]);

                    oRequest._object.onreadystatechange= function() {
                        // Synchronize state
                        oRequest.readyState= oRequest._object.readyState;

                        if (oRequest._aborted) {
                            //
                            oRequest.readyState= cXMLHttpRequest.UNSENT;

                            // Return
                            return;
                        }

                        if (oRequest.readyState == cXMLHttpRequest.DONE) {
                            // Clean Object
                            fCleanTransport(oRequest);

                            // get cached request
                            if (oRequest.status == 304)
                                oRequest._object= oRequest._cached;

                            //
                            delete oRequest._cached;

                            //
                            fSynchronizeValues(oRequest);

                            //
                            fReadyStateChange(oRequest);

                            // BUGFIX: IE - memory leak in interrupted
                            if (bIE && bAsync)
                                window.detachEvent("onunload", fOnUnload);
                        }
                    };
                    oRequest._object.send(null);

                    // Return now - wait until re-sent request is finished
                    return;
                };
*/
                // BUGFIX: IE - memory leak in interrupted
                if (bIE && bAsync)
                    window.detachEvent("onunload", fOnUnload);
            }

            // BUGFIX: Some browsers (Internet Explorer, Gecko) fire OPEN readystate twice
            if (nState != oRequest.readyState)
                fReadyStateChange(oRequest);

            nState= oRequest.readyState;
        };

    };
    function fXMLHttpRequest_send(oRequest) {
        oRequest._object.send(oRequest._data);

        // BUGFIX: Gecko - missing readystatechange calls in synchronous requests
        if (bGecko && !oRequest._async) {
            oRequest.readyState    = cXMLHttpRequest.OPENED;

            // Synchronize state
            fSynchronizeValues(oRequest);

            // Simulate missing states
            while (oRequest.readyState < cXMLHttpRequest.DONE) {
                oRequest.readyState++;
                fReadyStateChange(oRequest);
                // Check if we are aborted
                if (oRequest._aborted)
                    return;
            }
        }
    };
    cXMLHttpRequest.prototype.send= function(vData) {
        // Add method sniffer
        if (cXMLHttpRequest.onsend)
            cXMLHttpRequest.onsend.apply(this, arguments);

        if (!arguments.length)
            vData= null;

        // BUGFIX: Safari - fails sending documents created/modified dynamically, so an explicit serialization required
        // BUGFIX: IE - rewrites any custom mime-type to "text/xml" in case an XMLNode is sent
        // BUGFIX: Gecko - fails sending Element (this is up to the implementation either to standard)
        if (vData && vData.nodeType) {
            vData= window.XMLSerializer ? new window.XMLSerializer().serializeToString(vData) : vData.xml;
            if (!oRequest._headers["Content-Type"])
                oRequest._object.setRequestHeader("Content-Type", "application/xml");
        }

        this._data= vData;
/*
        // Add to queue
        if (this._async)
            fQueue_add(this);
        else*/
            fXMLHttpRequest_send(this);
    };
    cXMLHttpRequest.prototype.abort= function() {
        // Add method sniffer
        if (cXMLHttpRequest.onabort)
            cXMLHttpRequest.onabort.apply(this, arguments);

        // BUGFIX: Gecko - unneccesary DONE when aborting
        if (this.readyState > cXMLHttpRequest.UNSENT)
            this._aborted= true;

        this._object.abort();

        // BUGFIX: IE - memory leak
        fCleanTransport(this);

        this.readyState    = cXMLHttpRequest.UNSENT;

        delete this._data;
/*        if (this._async)
            fQueue_remove(this);*/
    };
    cXMLHttpRequest.prototype.getAllResponseHeaders= function() {
        return this._object.getAllResponseHeaders();
    };
    cXMLHttpRequest.prototype.getResponseHeader= function(sName) {
        return this._object.getResponseHeader(sName);
    };
    cXMLHttpRequest.prototype.setRequestHeader= function(sName, sValue) {
        // BUGFIX: IE - cache issue
        if (!this._headers)
            this._headers= {};
        this._headers[sName]= sValue;

        /*return *//*no value returned IE 8 complains!*/this._object.setRequestHeader(sName, sValue);
    };

    // EventTarget interface implementation
    cXMLHttpRequest.prototype.addEventListener  = function(sName, fHandler, bUseCapture) {
        for (var nIndex = 0, oListener; oListener = this._listeners[nIndex]; nIndex++)
            if (oListener[0] == sName && oListener[1] == fHandler && oListener[2] == bUseCapture)
                return;
        // Add listener
        this._listeners.push([sName, fHandler, bUseCapture]);
    };

    cXMLHttpRequest.prototype.removeEventListener   = function(sName, fHandler, bUseCapture) {
        for (var nIndex = 0, oListener; oListener = this._listeners[nIndex]; nIndex++)
            if (oListener[0] == sName && oListener[1] == fHandler && oListener[2] == bUseCapture)
                break;
        // Remove listener
        if (oListener)
            this._listeners.splice(nIndex, 1);
    };

    cXMLHttpRequest.prototype.dispatchEvent = function(oEvent) {
        var oEventPseudo  = {
            'type':         oEvent.type,
            'target':       this,
            'currentTarget':this,
            'eventPhase':   2,
            'bubbles':      oEvent.bubbles,
            'cancelable':   oEvent.cancelable,
            'timeStamp':    oEvent.timeStamp,
            'stopPropagation':  function() {},  // There is no flow
            'preventDefault':   function() {},  // There is no default action
            'initEvent':        function() {}   // Original event object should be inited
        };

        // Execute onreadystatechange
        if (oEventPseudo.type == "readystatechange" && this.onreadystatechange)
            (this.onreadystatechange.handleEvent || this.onreadystatechange).apply(this, [oEventPseudo]);

        // Execute listeners
        for (var nIndex = 0, oListener; oListener = this._listeners[nIndex]; nIndex++)
            if (oListener[0] == oEventPseudo.type && !oListener[2])
                (oListener[1].handleEvent || oListener[1]).apply(this, [oEventPseudo]);
    };

    //
    cXMLHttpRequest.prototype.toString= function() {
        return '[' + "object" + ' ' + "XMLHttpRequest" + ']';
    };

    cXMLHttpRequest.toString= function() {
        return '[' + "XMLHttpRequest" + ']';
    };

    //IGNF
    cXMLHttpRequest.getParseErrorText= function(oDoc) {
        if (!oDoc) { return this.PARSED_EMPTY; }
        var parseErrorText= this.PARSED_OK;
        if (bIE) {
            if(oDoc.parseError && oDoc.parseError.errorCode && oDoc.parseError.errorCode != 0) {
                parseErrorText= OpenLayers.i18n('xml.parse.error',
                                                {
                                                    "reason": oDoc.parseError.reason,
                                                    "url": oDoc.parseError.url,
                                                    "line": oDoc.parseError.line,
                                                    "linepos": oDoc.parseError.linepos,
                                                    "srcText": oDoc.parseError.srcText
                                                }
                );
                for (var i= 0;  i < oDoc.parseError.linepos; i++) {
                    parseErrorText += "-";
                }
                parseErrorText += "^\n";
            } else {
                if (!oDoc.documentElement) { return this.PARSED_EMPTY; }
            }
        } else {
            if (oDoc.documentElement && oDoc.documentElement.tagName == "parsererror") {
                parseErrorText= oDoc.documentElement.firstChild.data;
                parseErrorText += "\n" +
                                  oDoc.documentElement.firstChild.nextSibling.firstChild.data;
            } else {
                if (oDoc.getElementsByTagName("parsererror").length > 0) {
                    var parsererror= oDoc.getElementsByTagName("parsererror")[0];
                    parseErrorText= fGetText(parsererror, true)+"\n";
                } else {
                    if (oDoc.parseError && oDoc.parseError.errorCode != 0) {
                        parseErrorText= this.PARSED_UNKNOWN_ERROR;
                    } else {
                        if (!oDoc.documentElement) { return this.PARSED_EMPTY; }
                    }
                }
            }
        }
        return parseErrorText;
    };

    // Helper function
    function fReadyStateChange(oRequest) {
        // Sniffing code
        if (cXMLHttpRequest.onreadystatechange)
            cXMLHttpRequest.onreadystatechange.apply(oRequest);

        // Fake event
        oRequest.dispatchEvent({
            'type':         "readystatechange",
            'bubbles':      false,
            'cancelable':   false,
            'timeStamp':    new Date + 0
        });
    };

    //IGNF
    function fGetText(oNode, deep) {
        var s= "";
        var nodes= oNode.childNodes;
        for (var i= 0, len= nodes.length; i<len; i++) {
            var node= nodes[i];
            var nodeType= node.nodeType;
            if (nodeType == Node.TEXT_NODE || nodeType == Node.CDATA_SECTION_NODE) {
                s += node.data;
            } else {
                if (deep === true &&
                    (nodeType == Node.ELEMENT_NODE ||
                     nodeType == Node.DOCUMENT_NODE ||
                     nodeType == Node.DOCUMENT_FRAGMENT_NODE)
                   ) {
                    s += fGetText(node, true);
                }
            }
        }
        return s;
    };

    function fGetDocument(oRequest) {
        var oDocument= oRequest.responseXML,
            sResponse= oRequest.responseText;
        // Try parsing responseText
        //if (bIE && oDocument && !oDocument.documentElement &&
        //    oRequest.getResponseHeader("Content-Type").match(/[^\/]+\/[^\+]+\+xml/)) {
        //    oDocument= new ActiveXObject('Microsoft.XMLDOM');
        //    oDocument.loadXML(oRequest.responseText);
        //}
        // http://trac.openlayers.org/ticket/2065
        //IGNF: matching */*+xml is too strong as a condition ... let's relax
        //      it :
        if (bIE && sResponse && oDocument && !oDocument.documentElement) {
            oDocument= new window.ActiveXObject('Microsoft.XMLDOM');
            oDocument.async= false;
            oDocument.validateOnParse= false;
            oDocument.loadXML(sResponse);
        }
        // Check if there is no error in document
        if (oDocument)
            //IGNF: parseError is an Object (IE)
            if ((bIE && oDocument.parseError && oDocument.parseError.errorCode!= 0) ||
                !oDocument.documentElement ||
                (oDocument.documentElement && oDocument.documentElement.tagName == "parsererror"))
                return null;
        return oDocument;
    };

    function fSynchronizeValues(oRequest) {
        try { oRequest.responseText = oRequest._object.responseText; } catch (e) {}
        try { oRequest.responseXML  = fGetDocument(oRequest._object); } catch (e) {}
        try { oRequest.status       = oRequest._object.status; } catch (e) {}
        try { oRequest.statusText   = oRequest._object.statusText; } catch (e) {}
    };

    function fCleanTransport(oRequest) {
        // BUGFIX: IE - memory leak (on-page leak)
        oRequest._object.onreadystatechange= new window.Function;
    };
/*
    // Queue manager
    var oQueuePending    = {"CRITICAL":[],"HIGH":[],"NORMAL":[],"LOW":[],"LOWEST":[]},
        aQueueRunning    = [];
    function fQueue_add(oRequest) {
        oQueuePending[oRequest.priority in oQueuePending ? oRequest.priority : "NORMAL"].push(oRequest);
        //
        setTimeout(fQueue_process);
    };

    function fQueue_remove(oRequest) {
        for (var nIndex = 0, bFound    = false; nIndex < aQueueRunning.length; nIndex++)
            if (bFound)
                aQueueRunning[nIndex - 1]    = aQueueRunning[nIndex];
            else
            if (aQueueRunning[nIndex] == oRequest)
                bFound    = true;
        if (bFound)
            aQueueRunning.length--;
        //
        setTimeout(fQueue_process);
    };

    function fQueue_process() {
        if (aQueueRunning.length < 6) {
            for (var sPriority in oQueuePending) {
                if (oQueuePending[sPriority].length) {
                    var oRequest    = oQueuePending[sPriority][0];
                    oQueuePending[sPriority]    = oQueuePending[sPriority].slice(1);
                    //
                    aQueueRunning.push(oRequest);
                    // Send request
                    fXMLHttpRequest_send(oRequest);
                    break;
                }
            }
        }
    };
*/
    // Internet Explorer 5.0 (missing apply)
    if (!window.Function.prototype.apply) {
        window.Function.prototype.apply= function(oRequest, oArguments) {
            if (!oArguments)
                oArguments= [];
            oRequest.__func= this;
            oRequest.__func(oArguments[0], oArguments[1], oArguments[2], oArguments[3], oArguments[4]);
            delete oRequest.__func;
        };
    };

    // Register new object with window
    /**
     * Class: OpenLayers.Request.XMLHttpRequest
     * Standard-compliant (W3C) cross-browser implementation of the
     *     XMLHttpRequest object.  From
     *     http://code.google.com/p/xmlhttprequest/.
     *
     * IGNF: _addition of getParseErrorText function
     */
    OpenLayers.Request.XMLHttpRequest= cXMLHttpRequest;
})();

}

/**
 * Class: OpenLayers.Format.KML
 * IGNF: extension for ExtendedData, CDATA reading and http://trac.openlayers.org/ticket/2195
 */
if (OpenLayers.Format && OpenLayers.Format.KML) {

    OpenLayers.Format.KML= OpenLayers.overload(OpenLayers.Format.KML, {

    /**
     * Property: extractFolders
     * {Boolean} Group placemarks in folders. Default is false.
     *  IGNF: _addition_
     */
    extractFolders: false,

    readNode: OpenLayers.Format.XML.prototype.readNode,

    readChildNodes: OpenLayers.Format.XML.prototype.readChildNodes,

    /**
     * APIMethod: read
     * Read data from a string, and return a list of features.
     * IGNF: _support of extractFolders_
     *
     * Parameters:
     * data    - {String} or {DOMElement} data to read/parse.
     *
     * Returns:
     * {Array(<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>)} List of features.
     */
    read: function(data) {
        this.features = [];
        this.styles   = {};
        this.fetched  = {};
        if (this.extractFolders) {
            this.folders  = {};
        }
        if (this.extractNetworkLinks) {
            this.networkLinks = [];
        }

        // Set default options
        var options = {
            depth: 0,
            styleBaseUrl: this.styleBaseUrl
        };

        this.parseData(data, options);
        return this.extractFolders ? this.folders : this.features;
    },

    /**
     * Method: parseData
     * Read data from a string, and return a list of features.
     * IGNF: _support of extractFolders_
     *
     * Parameters:
     * data    - {String} or {DOMElement} data to read/parse.
     * options - {Object} Hash of options
     *
     * Returns:
     * {Array(<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>)} List of features.
     */
    parseData: function(data, options) {
        if(typeof data == "string") {
            data = OpenLayers.Format.XML.prototype.read.apply(this, [data]);
        }

        // Loop throught the following node types in this order and
        // process the nodes found
        var types = ["Link", "NetworkLink", "Style", "StyleMap", "Placemark"];
        for(var i=0, len=types.length; i<len; ++i) {
            var type = types[i];

            var nodes = this.getElementsByTagNameNS(data, "*", type);

            // skip to next type if no nodes are found
            if(nodes.length == 0) {
                continue;
            }

            switch (type.toLowerCase()) {

                // Fetch external links
                case "link":
                case "networklink":
                    this.parseLinks(nodes, options);
                    break;

                // parse style information
                case "style":
                    if (this.extractStyles) {
                        this.parseStyles(nodes, options);
                    }
                    break;
                case "stylemap":
                    if (this.extractStyles) {
                        this.parseStyleMaps(nodes, options);
                    }
                    break;

                // parse features
                case "placemark":
                    this.parseFeatures(nodes, options);
                    break;
            }
        }

        // Convert the hash to an array
        if (this.extractFolders) {
            var f = [];
            for (var a in this.folders) {
                f.push(this.folders[a]);
            }
            this.folders = f;
        }

        return this.features;
    },

    /**
     * Method: parseStyle
     * Parses the children of a <Style> node and builds the style hash
     * accordingly
     * IGNF: _missing var and multiple nodes handling in balloonstyle_
     *
     * Parameters:
     * node - {DOMElement} <Style> node
     *
     * Returns:
     * {Object} the style definition.
     */
    parseStyle: function(node) {
        var style = {};

        var types = ["LineStyle", "PolyStyle", "IconStyle", "BalloonStyle",
                     "LabelStyle"];
        var type, styleTypeNode, nodeList, geometry, parser;
        for(var i=0, len=types.length; i<len; ++i) {
            type = types[i];
            styleTypeNode = this.getElementsByTagNameNS(node, "*", type)[0];
            if(!styleTypeNode) {
                continue;
            }

            // only deal with first geometry of this type
            switch (type.toLowerCase()) {
                case "linestyle":
                    var kmlColor = this.parseProperty(styleTypeNode, "*", "color");
                    var color = this.parseKmlColor(kmlColor);
                    if (color) {
                        style["strokeColor"] = color.color;
                        style["strokeOpacity"] = color.opacity;
                    }

                    var width = this.parseProperty(styleTypeNode, "*", "width");
                    if (width) {
                        style["strokeWidth"] = width;
                    }
                    break;

                case "polystyle":
                    var kmlColor = this.parseProperty(styleTypeNode, "*", "color");
                    var color = this.parseKmlColor(kmlColor);
                    if (color) {
                        style["fillOpacity"] = color.opacity;
                        style["fillColor"] = color.color;
                    }
                    // Check if fill is disabled
                    var fill = this.parseProperty(styleTypeNode, "*", "fill");
                    if (fill == "0") {
                        style["fillColor"] = "none";
                    }
                    // Check if outline is disabled
                    var outline = this.parseProperty(styleTypeNode, "*", "outline");
                    if (outline == "0") {
                        style["strokeWidth"] = "0";
                    }

                    break;

                case "iconstyle":
                    // set scale
                    var scale = parseFloat(this.parseProperty(styleTypeNode,
                                                          "*", "scale") || 1);

                    // set default width and height of icon
                    var width = 32 * scale;
                    var height = 32 * scale;

                    var iconNode = this.getElementsByTagNameNS(styleTypeNode,
                                               "*",
                                               "Icon")[0];
                    if (iconNode) {
                        var href = this.parseProperty(iconNode, "*", "href");
                        if (href) {

                            var w = this.parseProperty(iconNode, "*", "w");
                            var h = this.parseProperty(iconNode, "*", "h");

                            // Settings for Google specific icons that are 64x64
                            // We set the width and height to 64 and halve the
                            // scale to prevent icons from being too big
                            var google = "http://maps.google.com/mapfiles/kml";
                            if (OpenLayers.String.startsWith(
                                                 href, google) && !w && !h) {
                                w = 64;
                                h = 64;
                                scale = scale / 2;
                            }

                            // if only dimension is defined, make sure the
                            // other one has the same value
                            w = w || h;
                            h = h || w;

                            if (w) {
                                width = parseInt(w) * scale;
                            }

                            if (h) {
                                height = parseInt(h) * scale;
                            }

                            // support for internal icons
                            //    (/root://icons/palette-x.png)
                            // x and y tell the position on the palette:
                            // - in pixels
                            // - starting from the left bottom
                            // We translate that to a position in the list
                            // and request the appropriate icon from the
                            // google maps website
                            var matches = href.match(this.regExes.kmlIconPalette);
                            if (matches)  {
                                var palette = matches[1];
                                var file_extension = matches[2];

                                var x = this.parseProperty(iconNode, "*", "x");
                                var y = this.parseProperty(iconNode, "*", "y");

                                var posX = x ? x/32 : 0;
                                var posY = y ? (7 - y/32) : 7;

                                var pos = posY * 8 + posX;
                                href = "http://maps.google.com/mapfiles/kml/pal"
                                     + palette + "/icon" + pos + file_extension;
                            }

                            style["graphicOpacity"] = 1; // fully opaque
                            style["externalGraphic"] = href;
                        }

                    }


                    // hotSpots define the offset for an Icon
                    var hotSpotNode = this.getElementsByTagNameNS(styleTypeNode,
                                               "*",
                                               "hotSpot")[0];
                    if (hotSpotNode) {
                        var x = parseFloat(hotSpotNode.getAttribute("x"));
                        var y = parseFloat(hotSpotNode.getAttribute("y"));

                        var xUnits = hotSpotNode.getAttribute("xunits");
                        if (xUnits == "pixels") {
                            style["graphicXOffset"] = -x * scale;
                        }
                        else if (xUnits == "insetPixels") {
                            style["graphicXOffset"] = -width + (x * scale);
                        }
                        else if (xUnits == "fraction") {
                            style["graphicXOffset"] = -width * x;
                        }

                        var yUnits = hotSpotNode.getAttribute("yunits");
                        if (yUnits == "pixels") {
                            style["graphicYOffset"] = -height + (y * scale) + 1;
                        }
                        else if (yUnits == "insetPixels") {
                            style["graphicYOffset"] = -(y * scale) + 1;
                        }
                        else if (yUnits == "fraction") {
                            style["graphicYOffset"] =  -height * (1 - y) + 1;
                        }
                    }

                    style["graphicWidth"] = width;
                    style["graphicHeight"] = height;
                    break;

                case "balloonstyle":
                    //IGNF: there might be more than just the <text> Node !
                    //var balloonStyle = OpenLayers.Util.getXmlNodeValue(
                    //                        styleTypeNode);
                    var balloonStyle = this.getElementsByTagNameNS(styleTypeNode,
                                               "*",
                                               "text")[0];
                    if (balloonStyle) {
                        balloonStyle = OpenLayers.Util.getXmlNodeValue(
                                            balloonStyle);
                    }
                    if (balloonStyle) {
                        style["balloonStyle"] = balloonStyle.replace(
                                       this.regExes.straightBracket, "${$1}");
                    }
                    break;
                  case "labelstyle":
                    var kmlColor = this.parseProperty(styleTypeNode, "*", "color");
                    var color = this.parseKmlColor(kmlColor);
                    if (color) {
                        style["fontColor"] = color.color;
                        style["fontOpacity"] = color.opacity;
                        //IGNF:
                        // set scale
                        var scale = parseFloat(this.parseProperty(styleTypeNode, "*", "scale") || 1);
                        style["label"] = true;
                        style["labelAlign"] = "cb";
                        style["labelXOffset"] = 20;
                        style["labelYOffset"] = 20;
                        style["fontSize"] = (14 * scale)+"px";
                        style["fontWeight"] = "bold";
                        style["labelHaloColor"] = OpenLayers.Util.invertRGBColor(color.color);
                        style["labelHaloWidth"] = "2px";
                    }
                    break;

                default:
            }
        }

        // Some polygons have no line color, so we use the fillColor for that
        if (!style["strokeColor"] && style["fillColor"]) {
            style["strokeColor"] = style["fillColor"];
        }

        var id = node.getAttribute("id");
        if (id && style) {
            style.id = id;
        }

        return style;
    },

    /**
     * Method: parseFeatures
     * Loop through all Placemark nodes and parse them.
     * Will create a list of features.
     * IGNF: _support of extractFolders_
     *
     * Parameters:
     * nodes    - {Array} of {DOMElement} data to read/parse.
     * options  - {Object} Hash of options
     *
     */
    parseFeatures: function(nodes, options) {
        var features = [];
        for(var i=0, len=nodes.length; i<len; i++) {
            var featureNode = nodes[i];
            var folderNode = featureNode.parentNode;
            var feature = this.parseFeature.apply(this,[featureNode]) ;
            if(feature) {

                // Create reference to styleUrl
                if (this.extractStyles && feature.attributes &&
                    feature.attributes.styleUrl) {
                    feature.style = this.getStyle(feature.attributes.styleUrl, options);
                }

                if (this.extractStyles) {
                    // Make sure that <Style> nodes within a placemark are
                    // processed as well
                    var inlineStyleNode = this.getElementsByTagNameNS(featureNode,
                                                        "*",
                                                        "Style")[0];
                    if (inlineStyleNode) {
                        var inlineStyle= this.parseStyle(inlineStyleNode);
                        if (inlineStyle) {
                            feature.style = OpenLayers.Util.extend(
                                feature.style, inlineStyle
                            );
                        }
                    }
                }

                if (folderNode &&
                    folderNode.nodeName.toLowerCase() == 'folder' &&
                    this.extractFolders) {
                    var folder = this.parseAttributes(folderNode);
                    var name = folder.name;
                    if (this.folders[name] == undefined) {
                        this.folders[name] = folder;
                    }
                    if(this.folders[name]['features'] == undefined){
                        this.folders[name]['features'] = [];
                    }
                    this.folders[name].features.push(feature);
                }

                // check if gx:Track elements should be parsed
                if (this.extractTracks) {
                    var tracks = this.getElementsByTagNameNS(
                        featureNode, this.namespaces.gx, "Track"
                    );
                    if (tracks && tracks.length > 0) {
                        var track = tracks[0];
                        var container = {
                            features: [],
                            feature: feature
                        };
                        this.readNode(track, container);
                        if (container.features.length > 0) {
                            features.push.apply(features, container.features);
                        }
                    }
                } else {
                    // add feature to list of features
                    // IGNF: label ...
                    if (this.extractStyles && feature.style && feature.style.label) {
                        feature.style.label= feature.attributes?
                            feature.attributes['name'] || ''
                        :   '';
                    }
                    features.push(feature);
                }
            } else {
                throw "Bad Placemark: " + i;
            }
        }

        // add new features to existing feature list
        this.features = this.features.concat(features);
    },

    /**
     * Method: parseAttributes
     * IGNF: _because still not working correctly with OL 2.10 ...
     *       and addition of TimeStamp, TimeSpan_
     *
     * Parameters:
     * node - {DOMElement}
     *
     * Returns:
     * {Object} An attributes object.
     */
    parseAttributes: function(node) {
        var attributes = {};

        // Extended Data is parsed first.
        var edNodes = node.getElementsByTagName("ExtendedData");
        if (edNodes.length) {
            attributes = this.parseExtendedData(edNodes[0]);
        }

        // assume attribute nodes are type 1 children with a type 3 or 4 child
        var child, grandchildren, grandchild;
        var children = node.childNodes;

        for(var i=0, len=children.length; i<len; ++i) {
            child = children[i];
            if(child.nodeType == 1) {
                //IGNF: get name now
                var name = (child.prefix) ?
                        child.nodeName.split(":")[1] :
                        child.nodeName;
                grandchildren = child.childNodes;
                //if(grandchildren.length == 1 || grandchildren.length == 3)
                //      ==1 => one node either text(3) or CDATA(4)
                //IGNF: ==2 => one node (\n\s* or text(3)), one CDATA(4)
                //      OR
                //          => one node CDATA(4), one node (\n\s* or text(3))
                //      ==3 => one node (\n\s*), one node text(3) or CDATA(4), one node (\n\s*)
                if(1<=grandchildren.length && grandchildren.length<=3) {
                    var grandchild;
                    switch (grandchildren.length) {
                        case 1:
                            grandchild = grandchildren[0];
                            break;
                        case 2:
                            if(grandchildren[0].nodeType == 4) {
                                grandchild = grandchildren[0];
                                break;
                            }
                            grandchild = grandchildren[1];
                            break;
                        case 3:
                        default:
                            grandchild = grandchildren[1];
                            break;
                    }
                    if(grandchild.nodeType == 3 || grandchild.nodeType == 4) {
                        //var name = (child.prefix) ?
                        //        child.nodeName.split(":")[1] :
                        //        child.nodeName;
                        var value = OpenLayers.Util.getXmlNodeValue(grandchild);
                        if (value) {
                            value = value.replace(this.regExes.trimSpace, "");
                            attributes[name] = value;
                        }
                        continue;//IGNF: processed, directly go to the loop!
                    }
                }
                if (name.match(/^Time(Stamp|Span)$/)) {//IGNF: add TimeStamp/when|TimeSpan/(begin|end)
                    var atts= this.parseAttributes(child);
                    attributes[name]= atts;
                }
            }
        }
        return attributes;
    },

    /**
     * Method: parseExtendedData
     * Parse ExtendedData from KML. No support for schemas/datatypes.
     *     See http://code.google.com/apis/kml/documentation/kmlreference.html#extendeddata
     *     for more information on extendeddata.
     *     IGNF: _Parse ExtendedData/Data (OpenLayers 2.8) and
     *           ExtendedData/SchemaData/SimpleData.
     *          Handle CDATA in the Data and SimpleData_.
     */
    parseExtendedData: function(node) {
        var attributes= {};
        var mode= 1;
        var dataNodes= null;
        var i, len= 0;
        var data, key, ed, valueNode, v, nameNode;
        do {
            switch (mode) {
            case 1 :// try ExtendedData/Data :
                dataNodes= node.getElementsByTagName("Data");
                break;
            case 2 :// try ExtendedData/SchemaData/SimpleData :
                dataNodes= node.getElementsByTagName("SimpleData");
                break;
            case 3 :// try ExtendedData@xlink:href
                var ns= this.getAttributeNodeNS(node,"xlink","prefix");
                if (ns==null) {
                    dataNodes= [];
                } else {
                    dataNodes= this.getElementsByTagNameNS(node,ns.nodeValue,"*");
                }
            default:
                dataNodes= [];
                break;
            }
            len= dataNodes.length;
            if (len==0) {
                mode++;
                continue;
            }
            for (i= 0; i<len; i++) {
                data= dataNodes[i];
                key= mode!=3? data.getAttribute("name") : (data.localName || data.nodeName.split(":").pop());
                ed= {};
                valueNode= mode==1? data.getElementsByTagName("value") : [data];
                //IGN-F: consider CDATA
                v= '';
                if (valueNode.length>0) {
                    valueNode= valueNode[0].childNodes;
                    switch (valueNode.length) {
                    case 0 :
                        valueNode= null;
                        break;
                    case 1 :
                        valueNode= valueNode[0];
                        break;
                    case 2 :
                        if (valueNode[0].nodeType == 4) {
                            valueNode= valueNode[0];
                            break;
                        }
                        valueNode= valueNode[1];
                        break;
                    case 3 :
                    default:
                        valueNode= valueNode[1];
                        break;
                    }
                    if (valueNode && (valueNode.nodeType == 3 || valueNode.nodeType == 4)) {
                        v= OpenLayers.Util.getXmlNodeValue(valueNode);
                        if (v) {
                            v= v.replace(this.regExes.trimSpace, "");
                        }
                    }
                }
                ed['value']= v;
                nameNode= data.getElementsByTagName("displayName");
                if (nameNode.length) {
                    ed['displayName']= this.getChildValue(nameNode[0]);
                    if(!key) {
                        key = ed['displayName'];
                    }
                }
                attributes[key]= ed;
            }
            mode++;
        } while (mode<=3);
        return attributes;
    },

    /**
     * Method: parseLinks
     * Finds URLs of linked KML documents and fetches them
     * 
     * GEO : _parse NetworkLink node to get region attributes of a folder_
     * 
     * Parameters: 
     * nodes   - {Array} of {DOMElement} data to read/parse.
     * options - {Object} Hash of options
     * 
     */
    parseLinks: function(nodes, options) {
        // GEO : extract NetworkLink
        if(this.extractNetworkLinks){
            for(var i=0, len=nodes.length; i<len; i++) {
                var linkNode = nodes[i];
                if (linkNode.nodeName.toLowerCase() == 'networklink') {
                    var networkLink = this.parseNetworkLink.apply(this,[linkNode]);
                    this.networkLinks.push(networkLink);
                }
            }
        }

        // Fetch external links <NetworkLink> and <Link>
        // Don't do anything if we have reached our maximum depth for recursion
        if (options.depth >= this.maxDepth) {
            return false;
        }

        // increase depth
        var newOptions = OpenLayers.Util.extend({}, options);
        newOptions.depth++;

        for(var i=0, len=nodes.length; i<len; i++) {
            var href = this.parseProperty(nodes[i], "*", "href");
            if(href && !this.fetched[href]) {
                this.fetched[href] = true; // prevent reloading the same urls
                var data = this.fetchLink(href);
                if (data) {
                    this.parseData(data, newOptions);
                }
            } 
        }

    },

    /**
     * Method: parseRegion
     * Parses the children of a <Region> node and builds the region hash
     * accordingly
     *
     * Parameters:
     * node - {DOMElement} <Region> node
     *
     * Returns:
     * {Object} the region definition.
     */
    parseRegion: function(node) {
        var types = ["LatLonAltBox", "Lod"];
        var type, typeNode;
        var region = {};
        for(var i=0, len=types.length; i<len; ++i) {
            type = types[i];
            typeNode = this.getElementsByTagNameNS(node, "*", type)[0];
            if(!typeNode) { 
                continue;
            }
            switch (type.toLowerCase()) {
                case "latlonaltbox":
                    var north = parseFloat(this.parseProperty(typeNode, "*", "north"));
                    var south = parseFloat(this.parseProperty(typeNode, "*","south"));
                    var east = parseFloat(this.parseProperty(typeNode, "*","east"));
                    var west = parseFloat(this.parseProperty(typeNode, "*","west"));
                    region.latLonAltBox = new OpenLayers.Bounds(west,south,east,north);
                    break;
                case "lod":
                    var minLodPixels = parseFloat(this.parseProperty(typeNode, "*", "minLodPixels"));
                    var maxLodPixels = parseFloat(this.parseProperty(typeNode, "*","maxLodPixels"));
                    region.lod = { minLodPixels: minLodPixels, maxLodPixels: maxLodPixels};
                    break;
                default:
            }
        }
        return region;
    },

    /**
     * Method: parseNetworkLink
     * Parses the children of a <NetworkLink> node and builds the networkLink hash
     * accordingly
     *
     * Parameters:
     * node - {DOMElement} <NetworkLink> node
     *
     * Returns:
     * {Object} the networkLink definition.
     */
    parseNetworkLink: function(node) {
        var types = ["Region", "Link"];
        var type, typeNode;
        var link = {};
        for(var i=0, len=types.length; i<len; ++i) {
            type = types[i];
            typeNode = this.getElementsByTagNameNS(node, "*", type)[0];
            if(!typeNode) { 
                continue;
            }
            switch (type.toLowerCase()) {
                case "region":
                    link.region = this.parseRegion.apply(this,[typeNode]) ;;
                    break;
                case "link":
                    var href = this.parseProperty(typeNode, "*", "href");
                    if (href) {
                        link.link = { href : href };
                    }
                    break;
                default:
            }
        }
        return link;
    },

    /**
     * Method: createPlacemarkXML
     * Creates and returns a KML placemark node representing the given feature. 
     * IGNF : _ExtendedData node to export extendedData attribute of a
     * feature_
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>}
     *
     * Returns:
     * {DOMElement}
     */
    createPlacemarkXML: function(feature) {        
        // Placemark name
        var placemarkName = this.createElementNS(this.kmlns, "name");
        var name = feature.style && feature.style.label ? feature.style.label :
                   feature.attributes.name || feature.id;
        placemarkName.appendChild(this.createTextNode(name));

        // Placemark description
        var placemarkDesc = this.createElementNS(this.kmlns, "description");
        var desc = feature.attributes.description || this.placemarksDesc;
        placemarkDesc.appendChild(this.createTextNode(desc));
        
        // Placemark
        var placemarkNode = this.createElementNS(this.kmlns, "Placemark");
        if(feature.fid != null) {
            placemarkNode.setAttribute("id", feature.fid);
        }
        placemarkNode.appendChild(placemarkName);
        placemarkNode.appendChild(placemarkDesc);

        // Geometry node (Point, LineString, etc. nodes)
        var geometryNode = this.buildGeometryNode(feature.geometry);
        placemarkNode.appendChild(geometryNode);        
        
        // IGNF : ExtendedData node
        var extendedDataNode = this.createElementNS(this.kmlns, "ExtendedData");
        if (feature.extendedData) {
            for (var att in feature.extendedData) {
                var dataNode = this.createElementNS(this.kmlns, "Data");
                dataNode.setAttribute("name",att);
                var dataValueNode = this.createElementNS(this.kmlns, "value");
                dataValueNode.appendChild(this.createTextNode(feature.extendedData[att]));
                dataNode.appendChild(dataValueNode);
                extendedDataNode.appendChild(dataNode);
            }
            placemarkNode.appendChild(extendedDataNode);
        }
        
        // TBD - deal with remaining (non name/description) attributes.
        return placemarkNode;
    }

    });

}

/**
 * Class: OpenLayers.Format.WMSCapabilities.v1_1
 * IGNF: bug fixes on Layer, addition of MetadataURL, DataURL, FeatureListURL.
 */
if (OpenLayers.Format && OpenLayers.Format.WMSCapabilities && OpenLayers.Format.WMSCapabilities.v1_1) {



    (function() {

    var _readers_= OpenLayers.Util.extend({}, OpenLayers.Format.WMSCapabilities.v1_1.prototype.readers);
    for (var tag in ["Layer", "MetadataURL", "DataURL", "FeatureTypeURL"]) {
        _readers_["wms"][tag]= OpenLayers.Format.WMSCapabilities.v1.prototype.readers["wms"][tag];
    }

    OpenLayers.Format.WMSCapabilities.v1_1= OpenLayers.overload(OpenLayers.Format.WMSCapabilities.v1_1, {

    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     * IGNF: _fix on Layer, support for MetadataURL, dataURL and featureListURL_
     */
    readers: _readers_ 

    });

    _readers_= null;

   })();

}

/**
 * Class: OpenLayers.Format.WMSCapabilities.v1_1_0
 * IGNF: bug fixes on Layer, addition of MetadataURL, DataURL, FeatureListURL.
 */
if (OpenLayers.Format && OpenLayers.Format.WMSCapabilities && OpenLayers.Format.WMSCapabilities.v1_1_0) {

    (function() {

    var _readers_= OpenLayers.Util.extend({}, OpenLayers.Format.WMSCapabilities.v1_1_0.prototype.readers);
    for (var tag in ["Layer", "MetadataURL", "DataURL", "FeatureTypeURL"]) {
        _readers_["wms"][tag]= OpenLayers.Format.WMSCapabilities.v1_1.prototype.readers["wms"][tag];
    }

    OpenLayers.Format.WMSCapabilities.v1_1_0= OpenLayers.overload(OpenLayers.Format.WMSCapabilities.v1_1_0, {

    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     * IGNF: _fix on Layer, support for MetadataURL, dataURL and featureListURL_
     */
    readers: _readers_ 

    });

    _readers_= null;

   })();

}

/**
 * Class: OpenLayers.Format.WMSCapabilities.v1_3
 * IGNF: bug fixes on Layer, addition of MetadataURL, DataURL, FeatureListURL.
 */
if (OpenLayers.Format && OpenLayers.Format.WMSCapabilities && OpenLayers.Format.WMSCapabilities.v1_3) {

    (function() {

    var _readers_= OpenLayers.Util.extend({}, OpenLayers.Format.WMSCapabilities.v1_3.prototype.readers);
    for (var tag in ["Layer", "MetadataURL", "DataURL", "FeatureTypeURL"]) {
        _readers_["wms"][tag]= OpenLayers.Format.WMSCapabilities.v1.prototype.readers["wms"][tag];
    }

    OpenLayers.Format.WMSCapabilities.v1_3= OpenLayers.overload(OpenLayers.Format.WMSCapabilities.v1_3, {

    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     * IGNF: _fix on Layer, support for MetadataURL, dataURL and featureListURL_
     */
    readers: _readers_ 

    });

    _readers_= null;

   })();

}

/**
 * Class: OpenLayers.Strategy.BBOX
 * IGNF: addition of testing loadstart event false return, bug fixes in
 * projection handling.
 */
if (OpenLayers.Strategy && OpenLayers.Strategy.BBOX) {

    OpenLayers.Strategy.BBOX= OpenLayers.overload(OpenLayers.Strategy.BBOX, {

    /**
     * APIMethod: destroy
     * Clean up the strategy.
     * IGNF: _srs support_
     */
    destroy: function() {
        this.deactivate();
        if (this.srs) {//IGNF
            this.srs.destroy();
            this.srs= null;
        }
        this.layer = null;
        this.options = null;
    },

    /**
     * Method: calculateBounds
     * IGNF: BBOX reprojection added
     *
     * Parameters:
     * mapBounds - {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>} the current map extent, will be
     *      retrieved from the map object if not provided
     */
    calculateBounds: function(mapBounds) {
        if(!mapBounds) {
            //IGNF: reproject back to map's projection
            mapBounds = this.getMapBounds().transform(
                this.layer.getNativeProjection(), this.layer.map.getProjection()
            );
        }
        var center = mapBounds.getCenterLonLat();
        var dataWidth = mapBounds.getWidth() * this.ratio;
        var dataHeight = mapBounds.getHeight() * this.ratio;
        this.bounds = new OpenLayers.Bounds(
            center.lon - (dataWidth / 2),
            center.lat - (dataHeight / 2),
            center.lon + (dataWidth / 2),
            center.lat + (dataHeight / 2)
        );
        //IGNF: reproject BBOX !
        var srs= this.layer.protocol && (this.layer.protocol.srsName || this.layer.protocol.srs);
        if (!this.srs && srs && !this.layer.map.getProjection().equals(srs)) {
            this.srs= new OpenLayers.Projection(srs);
        }
        if (this.srs) {
            this.bounds.transform(this.layer.map.getProjection(), this.srs);
        }
    },

    /**
     * Method: createFilter
     * IGNF: _srs support_
     *
     * Returns
     * {<OpenLayers.Filter at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Filter-js.html>} The filter object.
     */
    createFilter: function() {
        var filter = new OpenLayers.Filter.Spatial({
            type: OpenLayers.Filter.Spatial.BBOX,
            value: this.bounds,
            projection: (this.srs || this.layer.map.getProjection()).getCode() //IGNF:
        });
        if (this.layer.filter) {
            filter = new OpenLayers.Filter.Logical({
                type: OpenLayers.Filter.Logical.AND,
                filters: [this.layer.filter, filter]
            });
        }
        return filter;
    },

    /**
     * Method: triggerRead
     * IGNF: _test on event false return, trigger "loadend" on aborting.
     *       listener for visibilitychanged event before reading added
     *       and removed after (to handle abort)_.
     *
     * Parameters:
     * options - Additional options for the protocol's read method (optional)
     *
     * Returns:
     * {<OpenLayers.Protocol.Response at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Protocol/Response-js.html>} The protocol response object
     *      returned by the layer protocol.
     */
    triggerRead: function(options) {
        if (this.response) {
            if (this.layer.protocol) {//IGNF:
                this.layer.protocol.abort(this.response);
            }
            this.layer.events.triggerEvent("loadend");
        }
        //IGNF:
        if (this.layer.events.triggerEvent("loadstart")===false) {
            return;
        }
        this.layer.events.on({
            "visibilitychanged": this.abortIf,
            scope: this
        });

        if (this.layer.protocol) {//IGNF:
            this.response = this.layer.protocol.read(
                OpenLayers.Util.applyDefaults({
                    filter: this.createFilter(),
                    callback: this.merge,
                    scope: this
            },options));
        } else {
            this.response = null;
        }

        //IGNF:
        this.layer.events.un({
            "visibilitychanged": this.abortIf,
            scope: this
        });
    },

    /**
     * Method:
     * Stop loading if the layer is not anymore visible.
     * IGNF: _check protocol_
     *
     * Parameters:
     * e - {Event} the browser event
     */
    abortIf: function(e) {
        if (this.response && e.property && e.property=="visibility") {
            if (e.layer===this.layer && !this.layer.visibility) {
                if (this.layer.protocol) {//IGNF:
                    this.layer.protocol.abort(this.response);
                }
                this.response= null;
                this.layer.events.triggerEvent("loadend");
            }
        }
    }

    });

}


if (OpenLayers.Control && OpenLayers.Control.Attribution) {

/**
 * Class: OpenLayers.UI.Attribution
 * Base class for rendering {<OpenLayers.Control.Attribution at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Attribution-js.html>}
 * components.
 */
OpenLayers.UI.Attribution = OpenLayers.Class(OpenLayers.UI, {

    /**
     * APIMethod: draw
     * The draw method is called to render the component's content on the page.
     *
     * Returns:
     * {DOMElement} A reference to the div DOMElement containing the
     * component.
     */
    draw: function () {
        var attributions= [];
        var map= (this.component && this.component.map) || null;
        if (map && map.layers) {
            for(var i= 0, len= map.layers.length; i<len; i++) {
                var layer= map.layers[i];
                if (layer.attribution && layer.getVisibility()) {
                    // add attribution only if attribution text is unique
                    if (OpenLayers.Util.indexOf(attributions, layer.attribution)===-1) {
                        attributions.push(layer.attribution);
                    }
                }
            }
            this.container.innerHTML = attributions.join(this.separator);
        }
        return OpenLayers.UI.prototype.draw.apply(this,arguments);
    },

    /**
     * Constant: OpenLayers.UI.Attribution.CLASS_NAME
     *  Defaults to *OpenLayers.UI.Attribution*
     */
    CLASS_NAME: "OpenLayers.UI.Attribution"
});

/**
 * Class: OpenLayers.Control.Attribution
 * IGNF: See {<OpenLayers.UI>}
 */
    OpenLayers.Control.Attribution= OpenLayers.overload(OpenLayers.Control.Attribution, {

    /**
     * Method: draw
     * Initialize control.
     *
     * Returns:
     * {DOMElement} A reference to the DIV DOMElement containing the control
     */
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this, arguments);

        this.map.events.on({
            'changebaselayer': this.updateAttribution,
            'changelayer': this.updateAttribution,
            'addlayer': this.updateAttribution,
            'removelayer': this.updateAttribution,
            scope: this
        });
        this.updateAttribution();

        return this.div;
    },

    /**
     * Method: updateAttribution
     * Update attribution string.
     */
    updateAttribution: function() {
        this.getUI().draw();
    }

    });

}

/**
 * Namespace: OpenLayers.Ajax
 * IGNF: use of <OpenLayers.Request.proxyfyUrl at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Request-js.html#OpenLayers.Request.proxyfyUrl>.
 */
if (OpenLayers.Ajax && OpenLayers.Ajax.Request) {

    OpenLayers.Ajax.Request= OpenLayers.overload(OpenLayers.Ajax.Request, {

        /**
         * Constructor: OpenLayers.Ajax.Request
         *  IGNF: _use of <OpenLayers.Request.proxyfyUrl at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Request-js.html#OpenLayers.Request.proxyfyUrl>_.
         *
         * Parameters:
         * url - {String}
         * options - {Object}
         */
        initialize: function(url, options) {
            OpenLayers.Ajax.Base.prototype.initialize.apply(this, [options]);

            url= OpenLayers.Request.proxyfyUrl(url);

            this.transport= OpenLayers.Ajax.getTransport();
            this.request(url);
        }

    });

}

/**
 * Class: OpenLayers.Layer.XYZ
 * IGNF: see changes on <{OpenLayers.Layer}>
 */
if (OpenLayers.Layer && OpenLayers.Layer.XYZ) {

    OpenLayers.Layer.XYZ= OpenLayers.overload(OpenLayers.Layer.XYZ, {

    // FIXME : should be OpenLayers.Layer.Grid.prototype ?
    changeBaseLayer: OpenLayers.Layer.HTTPRequest.prototype.changeBaseLayer

    });

}

/**
 * Class: OpenLayers.Format.WMC
 * IGNF: various enhancements
 */
if (OpenLayers.Format.WMC) {

    OpenLayers.Format.WMC= OpenLayers.overload(OpenLayers.Format.WMC, {

    /**
     * Method: getParser
     * Get the WMC parser given a version. Create a new parser if it does not
     * already exist.
     * IGNF: _i18n support_
     *
     * Parameters:
     * version - {String} The version of the parser.
     *
     * Returns:
     * {<OpenLayers.Format.WMC.v1 at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format/WMC/v1-js.html>} A WMC parser.
     */
    getParser: function(version) {
        var v = version || this.version || this.defaultVersion;
        if(!this.parser || this.parser.VERSION != v) {
            var format = OpenLayers.Format.WMC[
                "v" + v.replace(/\./g, "_")
            ];
            if(!format) {
                throw OpenLayers.i18n('wmc.version.not.supported',{'v':version});//IGNF
            }
            this.parser = new format(this.options);
        }
        return this.parser;
    },

    /**
     * Method: layerToContext
     * Create a layer context object given a wms layer object.
     * IGNF: _support for <OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html> and not only
     * <OpenLayers.Layer.WMS at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/WMS-js.html>_.
     *
     * Parameters:
     * obj - {<OpenLayers.Layer.WMS at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/WMS-js.html>} The layer.
     *
     * Returns:
     * {Object} A layer context object.
     */
    layerToContext: function(layer) {
        var parser = this.getParser();
        //IGNF: not only WMS layers ...
        if (!layer.params) { layer.params= {}; };
        var layerContext = {
            queryable: layer.queryable,
            visibility: layer.visibility,
            name: layer.params["LAYERS"],
            title: layer.name,
            "abstract": layer.metadata["abstract"],
            dataURL: layer.metadata.dataURL,
            metadataURL: layer.metadataURL,
            server: {
                version: layer.params["VERSION"],
                url: layer.url
            },
            maxExtent: layer.maxExtent,
            transparent: layer.params["TRANSPARENT"],
            numZoomLevels: layer.numZoomLevels,
            units: layer.units,
            isBaseLayer: layer.isBaseLayer,
            opacity: layer.opacity,
            displayInLayerSwitcher: layer.displayInLayerSwitcher,
            singleTile: layer.singleTile,
            tileSize: (layer.singleTile || !layer.tileSize) ?
                // IGNF: in geographical basemap, geoportal's layer not yet
                // displayed have no height (output==NaN).
                undefined : {width: layer.tileSize.w||OpenLayers.Map.TILE_WIDTH, height: layer.tileSize.h||OpenLayers.Map.TILE_HEIGHT},
            minScale : (layer.options.resolutions ||
                        layer.options.scales ||
                        layer.options.maxResolution ||
                        layer.options.minScale) ?
                        layer.minScale : undefined,
            maxScale : (layer.options.resolutions ||
                        layer.options.scales ||
                        layer.options.minResolution ||
                        layer.options.maxScale) ?
                        layer.maxScale : undefined,
            formats: [],
            styles: [],
            srs: layer.srs,
            dimensions: layer.dimensions
        };


        if (layer.metadata.servertitle) {
            layerContext.server.title = layer.metadata.servertitle;
        }

        if (layer.metadata.formats && layer.metadata.formats.length > 0) {
            for (var i=0, len=layer.metadata.formats.length; i<len; i++) {
                var format = layer.metadata.formats[i];
                layerContext.formats.push({
                    value: format.value,
                    current: (format.value == layer.params["FORMAT"])
                });
            }
        } else {
            layerContext.formats.push({
                value: layer.params["FORMAT"],
                current: true
            });
        }

        if (layer.metadata.styles && layer.metadata.styles.length > 0) {
            for (var i=0, len=layer.metadata.styles.length; i<len; i++) {
                var style = layer.metadata.styles[i];
                if ((style.href == layer.params["SLD"]) ||
                    (style.body == layer.params["SLD_BODY"]) ||
                    (style.name == layer.params["STYLES"])) {
                    style.current = true;
                } else {
                    style.current = false;
                }
                layerContext.styles.push(style);
            }
        } else {
            layerContext.styles.push({
                href: layer.params["SLD"],
                body: layer.params["SLD_BODY"],
                name: layer.params["STYLES"] || parser.defaultStyleName,
                title: parser.defaultStyleTitle,
                current: true
            });
        }

        return layerContext;
    },

    /**
     * Method: toContext
     * Create a context object free from layer given a map or a
     * context object.
     * IGNF: _use of instanceof instead of CLASS_NAME property_
     *
     * Parameters:
     * obj - {<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html> | Object} The map or context.
     *
     * Returns:
     * {Object} A context object.
     */
    toContext: function(obj) {
        var context = {};
        var layers = obj.layers;
        //if(obj.CLASS_NAME == "OpenLayers.Map") {
        if(typeof(OpenLayers.Map)!='undefined' && (obj instanceof OpenLayers.Map)) {//IGNF
            var metadata = obj.metadata || {};
            context.bounds = obj.getExtent();
            context.projection = obj.projection;
            context.title = obj.title;
            context.keywords = metadata.keywords;
            context["abstract"] = metadata["abstract"];
            context.logo = metadata.logo;
            context.descriptionURL = metadata.descriptionURL;
            context.contactInformation = metadata.contactInformation;
            context.maxExtent = obj.maxExtent;
            //IGNF: OpenLayers.Map.getSize() seems to return
            //clientWidth/Height instead of offsetWidth/Height ...
            //context.size = obj.getSize();
            var d= OpenLayers.Element.getDimensions(obj.div);
            context.size = new OpenLayers.Size(d.width, d.height);
            //IGNF: add class
            //if (obj.CLASS_NAME!="OpenLayers.Map") {
            //    context.clazz= obj.CLASS_NAME;
            //}
        } else {
            // copy all obj properties except the "layers" property
            OpenLayers.Util.applyDefaults(context, obj);
            if (context.layers != undefined) {
                delete(context.layers);
            }
        }

        if (context.layersContext == undefined) {
            context.layersContext = [];
        }

        // let's convert layers into layersContext object (if any)
        if (layers != undefined && OpenLayers.Util.isArray(layers)) {
            for (var i=0, len=layers.length; i<len; i++) {
                var layer = layers[i];
                //IGNF: allow all kind of OpenLayers.Layer
                //if(layer instanceof OpenLayers.Layer.WMS) {
                if(layer instanceof OpenLayers.Layer) {
                    context.layersContext.push(this.layerToContext(layer));
                }
            }
        }
        return context;
    }

    });

}

/**
 * Class: OpenLayers.Format.WMC.v1
 * IGNF: various enhancements
 */
if (OpenLayers.Format.WMC && OpenLayers.Format.WMC.v1) {

    // OpenLayers.Format.WMC.v1_0_0
    // OpenLayers.Format.WMC.v1_1_0
    OpenLayers.Format.WMC.v1= OpenLayers.overload(OpenLayers.Format.WMC.v1, {

    /**
     * Method: read_ol_minZoomLevel
     *  IGNF: _addition_
     */
    read_ol_minZoomLevel: function(obj, node) {
        var mzl= this.getChildValue(node);
        mzl= parseInt(mzl);
        if (!isNaN(mzl)) {
            obj.minZoomLevel= mzl;
        }
    },

    /**
     * Method: read_ol_maxZoomLevel
     *  IGNF: _addition_
     */
    read_ol_maxZoomLevel: function(obj, node) {
        var mzl= this.getChildValue(node);
        mzl= parseInt(mzl);
        if (!isNaN(mzl)) {
            obj.maxZoomLevel= mzl;
        }
    },

    /**
     * Method: read_ol_resolutions
     *  IGNF: _addition_
     */
    read_ol_resolutions: function(obj, node) {
        var resolutions= this.getChildValue(node).split(",");
        for (var i= 0, len= resolutions.length; i<len; i++) {
            resolutions[i]= parseFloat(resolutions[i]);
        }
        obj.resolutions= resolutions;
    },

    /**
     * Method: read_ol_nativeResolutions
     *  IGNF: _addition_
     */
    read_ol_nativeResolutions: function(obj, node) {
        var resolutions= this.getChildValue(node).split(",");
        for (var i= 0, len= resolutions.length; i<len; i++) {
            resolutions[i]= parseFloat(resolutions[i]);
        }
        obj.nativeResolutions= resolutions;
    },

    /**
     * Method: read_wmc_Window
     * Read a wmc:Window node.
     *   GC: _addition_
     *
     * Parameters:
     * context - {Object} An object representing a context.
     * node - {Element} An element node.
     */
    read_wmc_Window: function(context, node) {
        var width= parseInt(node.getAttribute("width")) | 0;
        var height= parseInt(node.getAttribute("height")) | 0;
        context.window= context.window || {};
        if (width>0) {
            context.window.width= width;
        }
        if (height>0) {
            context.window.height= height;
        }
    },

    /**
     * Method: write_wmc_General
     * Create a General node given an context object.
     * IGNF: _fix on Title value_
     *
     * Parameters:
     * context - {Object} Context object.
     *
     * Returns:
     * {Element} A WMC General element node.
     */
    write_wmc_General: function(context) {
        var node = this.createElementDefaultNS("General");

        // optional Window element
        if(context.size) {
            node.appendChild(this.createElementDefaultNS(
                "Window", null,
                {
                    width: context.size.w,
                    height: context.size.h
                }
            ));
        }

        // required BoundingBox element
        var bounds = context.bounds;
        node.appendChild(this.createElementDefaultNS(
            "BoundingBox", null,
            {
                minx: bounds.left.toPrecision(18),
                miny: bounds.bottom.toPrecision(18),
                maxx: bounds.right.toPrecision(18),
                maxy: bounds.top.toPrecision(18),
                SRS: context.projection
            }
        ));

        // required Title element
        // IGNF: add 'none' if no title
        node.appendChild(this.createElementDefaultNS(
            "Title", context.title||'none'
        ));

         // optional KeywordList element
         if (context.keywords) {
             node.appendChild(this.write_wmc_KeywordList(context.keywords));
         }

         // optional Abstract element
         if (context["abstract"]) {
             node.appendChild(this.createElementDefaultNS(
                 "Abstract", context["abstract"]
             ));
         }

         // Optional LogoURL element
         if (context.logo) {
             node.appendChild(this.write_wmc_URLType("LogoURL", context.logo.href, context.logo));
         }

         // Optional DescriptionURL element
         if (context.descriptionURL) {
             node.appendChild(this.write_wmc_URLType("DescriptionURL", context.descriptionURL));
         }

         // Optional ContactInformation element
         if (context.contactInformation) {
             node.appendChild(this.write_wmc_ContactInformation(context.contactInformation));
         }

        // OpenLayers specific map properties
        node.appendChild(this.write_ol_MapExtension(context));

        return node;
    },

    /**
     * Method: write_wmc_Layer
     * Create a Layer node given a layer object.
     * IGNF: _support for various properties_
     *
     * Parameters:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} Layer object.
     *
     * Returns:
     * {Element} A WMC Layer element node.
     */
    write_wmc_Layer: function(context) {
        var node= this.createElementDefaultNS(
            "Layer", null, {
                queryable: context.queryable ? "1" : "0",
                hidden: context.visibility ? "0" : "1"
            }
        );

        // required Server element
        node.appendChild(this.write_wmc_Server(context));

        // required Name element
        node.appendChild(this.createElementDefaultNS(
            "Name", context.name
        ));

        // required Title element
        node.appendChild(this.createElementDefaultNS(
            "Title", context.title
        ));

        // optional Abstract element
        if (context["abstract"]) {
            node.appendChild(this.createElementDefaultNS(
                "Abstract", context["abstract"]
            ));
        }

        // IGNF: optional SRS element
        if (context.projection) {
            node.appendChild(this.write_wmc_SRS(context));
        }

        // IGNF: optional dataURL element
        if (context.dataURL) {
            node.appendChild(this.write_wmc_dataURL(context));
        }

        // optional MetadataURL element
        if (context.metadataURL) {
            node.appendChild(this.write_wmc_MetadataURL(context));
        }

        // IGNF: optional FormatList element
        if (context.params && context.params["FORMAT"]) {//IGNF
            node.appendChild(this.write_wmc_FormatList(context));
        }

        // IGNF: optional StyleList element
        if (context.params) {//IGNF
            node.appendChild(this.write_wmc_StyleList(context));
        }

        // IGNF: OpenLayers specific properties go in an Extension element
        node.appendChild(this.write_wmc_LayerExtension(context));

        return node;
    },

    /**
     * Method: write_wmc_SRS
     *  IGNF: _addition_
     */
    write_wmc_SRS: function(layer) {
        var node= this.createElementDefaultNS("SRS", ''+layer.projection);//force toString
        return node;
    },

    /**
     * Method: write_wmc_LayerExtension
     * Add OpenLayers specific layer parameters to an Extension element.
     * IGNF: _support for various properties_
     *
     * Parameters:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} A layer.
     *
     * Returns:
     * {Element} A WMC Extension element (for a layer).
     */
    write_wmc_LayerExtension: function(context) {
        var node= this.createElementDefaultNS("Extension");

        if (context.resolutions) {//IGNF
            var r= this.createElementNS(this.namespaces.ol,"ol:resolutions");
            r.appendChild(this.createTextNode(context.resolutions.join(',')));
            node.appendChild(r);
        }

        var bounds= context.maxExtent;
        var maxExtent= this.createElementNS(
            this.namespaces.ol, "ol:maxExtent"
        );
        this.setAttributes(maxExtent, {
            minx: bounds.left.toPrecision(10),
            miny: bounds.bottom.toPrecision(10),
            maxx: bounds.right.toPrecision(10),
            maxy: bounds.top.toPrecision(10)
        });
        node.appendChild(maxExtent);

        if (context.tileSize && !context.singleTile) {
            var size = this.createElementNS(
                this.namespaces.ol, "ol:tileSize"
            );
            this.setAttributes(size, context.tileSize);
            node.appendChild(size);
        }

        if (context.nativeResolutions) {//IGNF
            var r= this.createElementNS(this.namespaces.ol,"ol:nativeResolutions");
            r.appendChild(this.createTextNode(context.nativeResolutions.join(',')));
            node.appendChild(r);
        }

        if (context.nativeProjection) {//IGNF
            var p= this.createElementNS(this.namespaces.ol,"ol:nativeProjection");
            p.appendChild(this.createTextNode(''+context.nativeProjection));//force toString
            node.appendChild(p);
        }

        var properties= [
            "transparent", "numZoomLevels", "units", "isBaseLayer",
            "opacity", "displayInLayerSwitcher", "singleTile",
            //IGNF
            "minZoomLevel", "maxZoomLevel"
        ];
        var child;
        for(var i=0, len=properties.length; i<len; ++i) {
            child= this.createOLPropertyNode(context, properties[i]);
            if(child) {
                node.appendChild(child);
            }
        }

        return node;
    },

    /**
     * Method: write_wmc_Server
     * Create a Server node given a layer object.
     * IGNF: _See <read_wmc_Server> for the writing what is read_.
     *
     * Parameters:
     * context - {Object} Layer description object.
     *
     * Returns:
     * {Element} A WMC Server element node.
     */
    write_wmc_Server: function(context) {
        //IGNF: server does not exist when using read_wmc_Server!
        var node= this.createElementDefaultNS("Server");
        var attributes = {
            service: context.metadata.type || "OGC:WMS",
            version: context.version
        };

        if (context.metadata.servertitle) {
            attributes.title = context.metadata.servertitle
        }
        this.setAttributes(node, attributes);

        // required OnlineResource element
        node.appendChild(this.write_wmc_OnlineResource(context.url));

        return node;
    },

    /**
     * Method: write_wmc_dataURL
     * Create a dataURL node given a layer object.
     *  IGNF: _addition_
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.WMS at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/WMS-js.html>} Layer object.
     *
     * Returns:
     * {Element} A WMC dataURL element node.
     */
    write_wmc_dataURL: function(layer) {
        var node= this.createElementDefaultNS("dataURL");

        // required OnlineResource element
        node.appendChild(this.write_wmc_OnlineResource(layer.dataURL));

        return node;
    }

    });

}

/**
 * Class: OpenLayers.Renderer.SVG
 * See also http://trac.openlayers.org/ticket/2148 (enabling vector features
 * to be selectable from their text node)
 */
if (OpenLayers.Renderer && OpenLayers.Renderer.SVG) {

    OpenLayers.Renderer.SVG= OpenLayers.overload(OpenLayers.Renderer.SVG, {

    HALO_ID_SUFFIX: OpenLayers.Renderer.Elements.prototype.HALO_ID_SUFFIX,

    removeText: OpenLayers.Renderer.Elements.prototype.removeText,

    /**
     * APIMethod: supported
     * IGNF: _aware of the current document_.
     *
     * Returns:
     * {Boolean} Whether or not the browser supports the SVG renderer
     */
    supported: function() {
        var svgFeature = "http://www.w3.org/TR/SVG11/feature#";
        var d = OpenLayers.getDoc();
        return (d.implementation &&
           (d.implementation.hasFeature("org.w3c.svg", "1.0") ||
            d.implementation.hasFeature(svgFeature + "SVG", "1.1") ||
            d.implementation.hasFeature(svgFeature + "BasicStructure", "1.1") ));
    },

    /**
     * Method: setExtent
     * IGNF: _check resolution_
     *
     * Parameters:
     * extent - {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>}
     * resolutionChanged - {Boolean}
     *
     * Returns:
     * {Boolean} true to notify the layer that the new extent does not exceed
     *     the coordinate range, and the features will not need to be redrawn.
     *     False otherwise.
     */
    setExtent: function(extent, resolutionChanged) {
        OpenLayers.Renderer.Elements.prototype.setExtent.apply(this,
                                                               arguments);

        var resolution = this.getResolution();
        var left = (extent? -extent.left / resolution : 0) | 0;//IGNF test on extent parameter
        var top = (extent? extent.top / resolution : 0) | 0;//IGNF test on extent parameter

        // If the resolution has changed, start over changing the corner,
        // because the features will redraw.
        if (resolutionChanged) {
            this.left = left;
            this.top = top;
            // Set the viewbox
            var extentString = "0 0 " + this.size.w + " " + this.size.h;

            this.rendererRoot.setAttributeNS(null, "viewBox", extentString);
            this.translate(0, 0);
            return true;
        } else {
            var inRange = this.translate(left - this.left, top - this.top);
            if (!inRange) {
                // recenter the coordinate system
                this.setExtent(extent, true);
            }
            return inRange;
        }
    },

    /**
     * Method: createNode
     * IGNF: _aware of the current document_.
     *
     * Parameters:
     * type - {String} Kind of node to draw
     * id - {String} Id for node
     *
     * Returns:
     * {DOMElement} A new node of the given type and id
     */
    createNode: function(type, id) {
        var doc= this.root? this.root.ownerDocument : OpenLayers.getDoc();
        var node = doc.createElementNS(this.xmlns, type);
        if (id) {
            node.setAttributeNS(null, "id", id);
        }
        return node;
    },

    /**
     * Method: drawText
     * This method is only called by the renderer itself.
     * IGNF: _TODO - bug when moving the feature, only the label's halo is
     * following the feature ..._
     *
     * Parameters:
     * featureId - {String}
     * style -
     * location - {<OpenLayers.Geometry.Point at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry/Point-js.html>}
     * useHalo - {Boolean}
     */
    drawText: function(featureId, style, location, useHalo) {
        // OL2.12 addition
        var drawOutline = (!!style.labelOutlineWidth);
        // First draw text in halo color and size and overlay the
        // normal text afterwards
        if (drawOutline) {
            var outlineStyle = OpenLayers.Util.extend({}, style);
            outlineStyle.fontColor = outlineStyle.labelOutlineColor;
            outlineStyle.fontStrokeColor = outlineStyle.labelOutlineColor;
            outlineStyle.fontStrokeWidth = style.labelOutlineWidth;
            delete outlineStyle.labelOutlineWidth;
            this.drawText(featureId, outlineStyle, location);
        }

        var resolution = this.getResolution();

        var x = ((location.x - this.featureDx) / resolution + this.left);
        var y = (location.y / resolution - this.top);

        var suffix = (drawOutline)?this.LABEL_OUTLINE_SUFFIX:this.LABEL_ID_SUFFIX+(useHalo ? this.HALO_ID_SUFFIX : "");
        var label = this.nodeFactory(featureId + suffix, "text");

        label.setAttributeNS(null, "x", x);
        label.setAttributeNS(null, "y", -y);

        if (style.fontColor) {
            label.setAttributeNS(null, "fill", style.fontColor);
        }
        if (style.fontStrokeColor) {
            label.setAttributeNS(null, "stroke", style.fontStrokeColor);
        }
        if (style.fontStrokeWidth) {
            label.setAttributeNS(null, "stroke-width", style.fontStrokeWidth);
        }
        if (style.fontOpacity) {
            label.setAttributeNS(null, "opacity", style.fontOpacity);
        }
        if (style.fontFamily) {
            label.setAttributeNS(null, "font-family", style.fontFamily);
        }
        if (style.fontSize) {
            label.setAttributeNS(null, "font-size", style.fontSize);
        }
        if (style.fontWeight) {
            label.setAttributeNS(null, "font-weight", style.fontWeight);
        }
        if (style.fontStyle) {
            label.setAttributeNS(null, "font-style", style.fontStyle);
        }
        if (style.fontStrokeColor) {
            label.setAttributeNS(null, "stroke", style.fontStrokeColor);
        }
        if (style.fontStrokeWidth) {
            label.setAttributeNS(null, "stroke-width", style.fontStrokeWidth);
        }
        if (style.labelSelect === true) {
            label.setAttributeNS(null, "pointer-events", "visible");
            label._featureId = featureId;
        } else {
            label.setAttributeNS(null, "pointer-events", "none");
        }
        var align = style.labelAlign || OpenLayers.Renderer.defaultSymbolizer.labelAlign;
        label.setAttributeNS(null, "text-anchor",
            OpenLayers.Renderer.SVG.LABEL_ALIGN[align[0]] || "middle");

        if (OpenLayers.IS_GECKO === true) {
            label.setAttributeNS(null, "dominant-baseline",
                OpenLayers.Renderer.SVG.LABEL_ALIGN[align[1]] || "central");
        }

        var labelRows = style.label.split('\n');
        var numRows = labelRows.length;
        while (label.childNodes.length > numRows) {
            label.removeChild(label.lastChild);
        }
        for (var i = 0; i < numRows; i++) {
            var tspan = this.nodeFactory(featureId + suffix + "_tspan_" + i, "tspan");
            if (style.labelSelect === true) {
                tspan._featureId = featureId;
                tspan._geometry = location;
                tspan._geometryClass = location.CLASS_NAME;
            }
            if (OpenLayers.IS_GECKO === false) {
                tspan.setAttributeNS(null, "baseline-shift",
                    OpenLayers.Renderer.SVG.LABEL_VSHIFT[align[1]] || "-35%");
            }
            tspan.setAttribute("x", x);
            if (i == 0) {
                var vfactor = OpenLayers.Renderer.SVG.LABEL_VFACTOR[align[1]];
                if (vfactor == null) {
                     vfactor = -.5;
                }
                tspan.setAttribute("dy", (vfactor*(numRows-1)) + "em");
            } else {
                tspan.setAttribute("dy", "1em");
            }
            tspan.textContent = (labelRows[i] === '') ? ' ' : labelRows[i];
            if (!tspan.parentNode) {
                label.appendChild(tspan);
            }
        }
        // First draw text in halo color and size and overlay the
        // normal text afterwards
        if (style.labelHaloColor) {
            var haloStyle = OpenLayers.Util.extend({}, style);
            haloStyle.fontColor = haloStyle.labelHaloColor;
            haloStyle.fontStrokeColor = haloStyle.labelHaloColor;
            haloStyle.fontStrokeWidth = style.labelHaloWidth || 2;
            delete haloStyle.labelHaloColor;
            this.drawText(featureId, haloStyle, location, true);
        }

        if (!label.parentNode) {
            this.textRoot.appendChild(label);
        }

        if (style.labelBackgroundColor ||
            style.labelBorderColor ||
            style.labelBorderSize) {
            var bg = this.nodeFactory(featureId + suffix + "_bg", "rect");
            if (style.labelBackgroundColor) {
                bg.setAttributeNS(null, "fill", style.labelBackgroundColor);
            }
            if (style.labelBorderColor || style.labelBorderSize) {
                bg.setAttributeNS(null, "stroke", (style.labelBorderColor ?  style.labelBorderColor : "#000000"));
                bg.setAttributeNS(null, "stroke-width", (style.labelBorderSize ? style.labelBorderSize : "0.5"));
            }
            var bbox = label.getBBox();
            var labelWidth = bbox.width;
            var labelHeight = bbox.height;
            var padding = 2;
            if (style.labelPadding) {
                var pos = style.labelPadding.indexOf("px");
                if (pos == -1) {
                    padding = style.labelPadding;
                } else {
                    padding = parseInt(style.labelPadding.substr(0, pos));
                }
            }
            bg.setAttributeNS(null, "x", bbox.x-padding);
            bg.setAttributeNS(null, "y", bbox.y-padding);
            bg.setAttributeNS(null, "height", (labelHeight+padding*2)+"px");
            bg.setAttributeNS(null, "width", (labelWidth+padding*2)+"px");
            this.textRoot.insertBefore(bg, label);
        }
    },

    /**
     * Method: importSymbol
     * add a new symbol definition from the rendererer's symbol hash
     * IGNF: _aware of the current document_.
     *
     * Parameters:
     * graphicName - {String} name of the symbol to import
     *
     * Returns:
     * {String} - id of the imported symbol
     */
    importSymbol: function (graphicName) {
        if (!this.defs) {
            // create svg defs tag
            this.defs = this.createDefs();
        }
        var id = this.container.id + "-" + graphicName;

        // check if symbol already exists in the defs
        var existing = this.root.ownerDocument.getElementById(id);//IGNF
        if (existing != null) {
            return existing;
        }

        var symbol = OpenLayers.Renderer.symbol[graphicName];
        if (!symbol) {
            throw new Error(graphicName + ' is not a valid symbol name');
        }

        var symbolNode = this.nodeFactory(id, "symbol");
        var node = this.nodeFactory(null, "polygon");
        symbolNode.appendChild(node);
        var symbolExtent = new OpenLayers.Bounds(
                                    Number.MAX_VALUE, Number.MAX_VALUE, 0, 0);

        var points = [];
        var x,y;
        for (var i=0; i<symbol.length; i=i+2) {
            x = symbol[i];
            y = symbol[i+1];
            symbolExtent.left = Math.min(symbolExtent.left, x);
            symbolExtent.bottom = Math.min(symbolExtent.bottom, y);
            symbolExtent.right = Math.max(symbolExtent.right, x);
            symbolExtent.top = Math.max(symbolExtent.top, y);
            points.push(x, ",", y);
        }

        node.setAttributeNS(null, "points", points.join(" "));

        var width = symbolExtent.getWidth();
        var height = symbolExtent.getHeight();
        // create a viewBox three times as large as the symbol itself,
        // to allow for strokeWidth being displayed correctly at the corners.
        var viewBox = [symbolExtent.left - width,
                        symbolExtent.bottom - height, width * 3, height * 3];
        symbolNode.setAttributeNS(null, "viewBox", viewBox.join(" "));
        this.symbolMetrics[id] = [
            Math.max(width, height),
            symbolExtent.getCenterLonLat().lon,
            symbolExtent.getCenterLonLat().lat
        ];

        this.defs.appendChild(symbolNode);
        return symbolNode;
    }

    });

}

/**
 * Class: OpenLayers.Format.WMSDescribeLayer
 * IGNF: see changes on <{OpenLayers.Format.XML}>
 */
if (OpenLayers.Format && OpenLayers.Format.WMSDescribeLayer) {

    OpenLayers.Format.WMSDescribeLayer= OpenLayers.overload(OpenLayers.Format.WMSDescribeLayer, {

    readNode: OpenLayers.Format.XML.prototype.readNode,

    readChildNodes: OpenLayers.Format.XML.prototype.readChildNodes

    });

}

/**
 * Class: OpenLayers.Popup
 * IGNF: fix for firefox, nullifying fields when destroying
 */
if (OpenLayers.Popup) {

    OpenLayers.Popup= OpenLayers.overload(OpenLayers.Popup, {

    /**
     * APIMethod: destroy
     * nullify references to prevent circular references and memory leaks
     *      IGNF: _more fields are now nullified, unregister events for Firefox
     *      set by draw()_.
     */
    destroy: function() {

        this.id = null;
        this.lonlat = null;
        this.contentSize = null;//IGNF
        this.size = null;
        this.contentHTML = null;

        this.backgroundColor = null;
        this.opacity = null;
        this.border = null;

        if (this.closeOnMove && this.map) {
            this.map.events.unregister("movestart", this, this.hide);
        }

        this.events.destroy();
        this.events = null;

        if (this.contentDiv) {//IGNF
            this.groupDiv.removeChild(this.contentDiv);
            this.contentDiv = null;
        }
        this.contentDivPadding = null;//IGNF

        if (this.closeDiv) {
            OpenLayers.Event.stopObservingElement(this.closeDiv);
            this.groupDiv.removeChild(this.closeDiv);
        }
        this.closeDiv = null;

        this.div.removeChild(this.groupDiv);
        this.groupDiv = null;

        if (this.map != null) {
            if (!this.disableFirefoxOverflowHack && OpenLayers.Util.getBrowserName() == 'firefox') {
                this.map.events.unregister("movestart", this, this.onMoveStartPopup);//IGNF
                this.map.events.unregister("moveend", this, this.onMoveEndPopup);//IGNF
            }
            this.map.removePopup(this);
        }
        this.map = null;
        this.div = null;

        this.autoSize = null;
        this.minSize = null;
        this.maxSize = null;
        this.padding = null;
        this.panMapIfOutOfView = null;
    },

    /**
     * APIMethod: draw
     * Constructs the elements that make up the popup.
     * IGNF: _make movestart, moveend callback as class's methods_
     *
     * Parameters:
     * px - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} the position the popup in pixels.
     *
     * Returns:
     * {DOMElement} Reference to a div that contains the drawn popup
     */
    draw: function(px) {
        if (px == null) {
            if ((this.lonlat != null) && (this.map != null)) {
                px = this.map.getLayerPxFromLonLat(this.lonlat);
            }
        }

        // this assumes that this.map already exists, which is okay because
        // this.draw is only called once the popup has been added to the map.
        if (this.closeOnMove) {
            this.map.events.register("movestart", this, this.hide);
        }

        //listen to movestart, moveend to disable overflow (FF bug)
        if (!this.disableFirefoxOverflowHack && OpenLayers.Util.getBrowserName() == 'firefox') {
            this.map.events.register("movestart", this, this.onMoveStartPopup);//IGNF
            this.map.events.register("moveend", this, this.onMoveEndPopup);//IGNF
        }

        this.moveTo(px);
        if (!this.autoSize && !this.size) {
            this.setSize(this.contentSize);
        }
        this.setBackgroundColor();
        this.setOpacity();
        this.setBorder();
        this.setContentHTML();

        if (this.panMapIfOutOfView) {
            this.panIntoView();
        }

        return this.div;
    },

    /**
     * Method: onMoveStartPopup
     *      IGNF: _callback for "movestart" under Firefox.
     *            aware of the current document_.
     */
    onMoveStartPopup: function() {
        if (!this.contentDiv) { return; }//IGNF
        var style = OpenLayers.getDoc().defaultView.getComputedStyle(
            this.contentDiv, null
        );
        var currentOverflow = style.getPropertyValue("overflow");
        if (currentOverflow != "hidden") {
            this.contentDiv._oldOverflow = currentOverflow;
            this.contentDiv.style.overflow = "hidden";
        }
    },

    /**
     * Method: onMoveEndPopup
     *      IGNF: _callback for "moveend" under Firefox_.
     */
    onMoveEndPopup: function() {
        if (!this.contentDiv) { return; }//IGNF
        var oldOverflow = this.contentDiv._oldOverflow;
        if (oldOverflow) {
            this.contentDiv.style.overflow = oldOverflow;
            this.contentDiv._oldOverflow = null;
        }
    },

    /**
     * APIMethod: updateSize
     * Auto size the popup so that it precisely fits its contents (as
     *     determined by this.contentDiv.innerHTML). Popup size will, of
     *     course, be limited by the available space on the current map
     * IGNF: _aware of the current document_.
     */
    updateSize: function() {

        // determine actual render dimensions of the contents by putting its
        // contents into a fake contentDiv (for the CSS) and then measuring it
        var preparedHTML = "<div class='" + this.contentDisplayClass+ "'>" +
            this.contentDiv.innerHTML +
            "</div>";

        var containerElement = (this.map) ? this.map.layerContainerDiv
                                          : OpenLayers.getDoc().body;//IGNF
        var realSize = OpenLayers.Util.getRenderedDimensions(
            preparedHTML, null, {
                displayClass: this.displayClass,
                containerElement: containerElement
            }
        );

        // is the "real" size of the div is safe to display in our map?
        var safeSize = this.getSafeContentSize(realSize);

        var newSize = null;
        if (safeSize.equals(realSize)) {
            //real size of content is small enough to fit on the map,
            // so we use real size.
            newSize = realSize;

        } else {

            //make a new OL.Size object with the clipped dimensions
            // set or null if not clipped.
            var fixedSize = new OpenLayers.Size();
            fixedSize.w = (safeSize.w < realSize.w) ? safeSize.w : null;
            fixedSize.h = (safeSize.h < realSize.h) ? safeSize.h : null;

            if (fixedSize.w && fixedSize.h) {
                //content is too big in both directions, so we will use
                // max popup size (safeSize), knowing well that it will
                // overflow both ways.
                newSize = safeSize;
            } else {
                //content is clipped in only one direction, so we need to
                // run getRenderedDimensions() again with a fixed dimension
                var clippedSize = OpenLayers.Util.getRenderedDimensions(
                    preparedHTML, fixedSize, {
                        displayClass: this.contentDisplayClass,
                        containerElement: containerElement
                    }
                );

                //if the clipped size is still the same as the safeSize,
                // that means that our content must be fixed in the
                // offending direction. If overflow is 'auto', this means
                // we are going to have a scrollbar for sure, so we must
                // adjust for that.
                //
                var currentOverflow = OpenLayers.Element.getStyle(
                    this.contentDiv, "overflow"
                );
                if ( (currentOverflow != "hidden") &&
                     (clippedSize.equals(safeSize)) ) {
                    var scrollBar = OpenLayers.Util.getScrollbarWidth();
                    if (fixedSize.w) {
                        clippedSize.h += scrollBar;
                    } else {
                        clippedSize.w += scrollBar;
                    }
                }

                newSize = this.getSafeContentSize(clippedSize);
            }
        }
        this.setSize(newSize);
    },

    /**
     * Method: getContentDivPadding
     * Glorious, oh glorious hack in order to determine the css 'padding' of
     *     the contentDiv. IE/Opera return null here unless we actually add
     *     the
     *     popup's main 'div' element (which contains contentDiv) to the DOM.
     *     So we make it invisible and then add it to the document
     *     temporarily.
     *
     *     Once we've taken the padding readings we need, we then remove it
     *     from the DOM (it will actually get added to the DOM in
     *     Map.js's addPopup)
     * IGNF: _aware of the current document_.
     *
     * Returns:
     * {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>}
     */
    getContentDivPadding: function() {

        //use cached value if we have it
        var contentDivPadding = this._contentDivPadding;
        if (!contentDivPadding) {

            if (this.div.parentNode == null) {
                //make the div invisible and add it to the page
                this.div.style.display = "none";
                OpenLayers.getDoc().body.appendChild(this.div);//IGNF
            }

            //read the padding settings from css, put them in an OL.Bounds
            contentDivPadding = new OpenLayers.Bounds(
                OpenLayers.Element.getStyle(this.contentDiv, "padding-left"),
                OpenLayers.Element.getStyle(this.contentDiv, "padding-bottom"),
                OpenLayers.Element.getStyle(this.contentDiv, "padding-right"),
                OpenLayers.Element.getStyle(this.contentDiv, "padding-top")
            );

            //cache the value
            this._contentDivPadding = contentDivPadding;

            if (this.div.parentNode == OpenLayers.getDoc().body) {//IGNF
                //remove the div from the page and make it visible again
                OpenLayers.getDoc().body.removeChild(this.div);//IGNF
                this.div.style.display = "";
            }
        }
        return contentDivPadding;
    },

    /**
     * APIMethod: defaultCloseBoxCallback
     * Stop event, hide the popup, unregister "movestart" and "moveend" events
     * (under FF only) and triggers "featureunselected".
     *  IGNF: _addition to facilitate inheritance_
     *  IGNF: _unregister events for Firefox set by draw()_.
     *
     * Parameters:
     * e - {Event}
     */
    defaultCloseBoxCallback: function(e) {
        this.hide();
        OpenLayers.Event.stop(e);
        if (!this.disableFirefoxOverflowHack && OpenLayers.Util.getBrowserName() == 'firefox') {//IGNF
            if (this.map && this.map.events) {
                this.map.events.unregister("movestart", this, this.onMoveStartPopup);
                this.map.events.unregister("moveend", this, this.onMoveEndPopup);
            }
        }
    }

    });

}

/**
 * Class: OpenLayers.Format.WMSGetFeatureInfo
 * IGNF: see changes on <{OpenLayers.Format.XML}>
 */
if (OpenLayers.Format && OpenLayers.Format.WMSGetFeatureInfo) {

    OpenLayers.Format.WMSGetFeatureInfo= OpenLayers.overload(OpenLayers.Format.WMSGetFeatureInfo, {

    readNode: OpenLayers.Format.XML.prototype.readNode,

    readChildNodes: OpenLayers.Format.XML.prototype.readChildNodes

    });

}

/**
 * Class: OpenLayers.Format.WMTSCapabilities
 * IGNF: see changes on <{OpenLayers.Format.XML}>
 */
if (OpenLayers.Format && OpenLayers.Format.WMTSCapabilities) {

    OpenLayers.Format.WMTSCapabilities= OpenLayers.overload(OpenLayers.Format.WMTSCapabilities, {

    readNode: OpenLayers.Format.XML.prototype.readNode,

    readChildNodes: OpenLayers.Format.XML.prototype.readChildNodes

    });

}

/*
 * Class: OpenLayers.Format.CSWGetRecords.v2_0_2
 * IGNF: ExceptionReport and Exception nodes reading
 */
if (OpenLayers.Format && OpenLayers.Format.CSWGetRecords && OpenLayers.Format.CSWGetRecords.v2_0_2) {

    (function() {

    var _readers_= OpenLayers.Util.extend({}, OpenLayers.Format.CSWGetRecords.v2_0_2.prototype.readers);
    _readers_['ows']['ExceptionReport']= function(node, obj) {
        var exceptionReport= {};
        this.readChildNodes(node, exceptionReport);
        if (node.attributes && node.attributes.language) {
            exceptionReport.language= node.attributes.language;
        }
        obj.exceptionReport= exceptionReport;
    };
    _readers_['ows']['Exception']= function(node, obj) {
        obj.exception= this.getChildValue(node);
    };

    OpenLayers.Format.CSWGetRecords.v2_0_2= OpenLayers.overload(OpenLayers.Format.CSWGetRecords.v2_0_2, {

    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     *  IGNF: _addition_
     */
    readers: _readers_

    });

    _readers_= null;

    })();
}

/**
 * Class: OpenLayers.Format.WMTSCapabilities.v1_0_0
 * IGNF: addition of TileMatrixSetLimits, fix for ows:WGS84BoundingBox
 */
if (OpenLayers.Format && OpenLayers.Format.WMTSCapabilities && OpenLayers.Format.WMTSCapabilities.v1_0_0) {

    (function() {

    var _readers_= OpenLayers.Util.extend({}, OpenLayers.Format.WMTSCapabilities.v1_0_0.prototype.readers);
    _readers_['ows']['WGS84BoundingBox']= function(node, obj) {
        var boundingBox = {};
        boundingBox.crs = node.getAttribute("crs");
        if (!boundingBox.crs) {//IGNF
            var local= node.localName || node.nodeName.split(":").pop();
            if (local==='WGS84BoundingBox') {
                boundingBox.crs= "CRS:84";
            }
        }
        /*IGNF: removed
        if (obj.BoundingBox) {
            obj.BoundingBox.push(boundingBox);
        } else {
            obj.projection = boundingBox.crs;
            boundingBox = obj;
        }
         */
        if (!obj.boundingBoxes) { obj.boundingBoxes= []; }
        obj.boundingBoxes.push(boundingBox);
        this.readChildNodes(node, boundingBox);
    };
    _readers_['wmts']['TileMatrixSetLimits']= function(node, obj) {
        if (!obj.limits) { obj.limits= {}; }
        this.readChildNodes(node, obj);
    };
    _readers_['wmts']['TileMatrixLimits']= function(node, obj) {
        this.readChildNodes(node, obj);
        delete obj.tileMatrix;
    };
    _readers_['wmts']['TileMatrix']= function(node, obj) {//IGNF: aware of parent node
        if (obj.matrixIds) {
            var tileMatrix = {
                supportedCRS: obj.supportedCRS
            };
            this.readChildNodes(node, tileMatrix);
            obj.matrixIds.push(tileMatrix);
        } else {
            obj.tileMatrix= this.getChildValue(node);
            obj.limits[obj.tileMatrix]= {};
        }
    };
/*
    _readers_[]['TopLeftCorner']= function(node, obj) {
        var topLeftCorner = this.getChildValue(node);
        var coords = topLeftCorner.split(" ");
        // decide on axis order for the given CRS
        var yx;
        if (obj.supportedCRS) {
            // extract out version from URN
            var crs = obj.supportedCRS.replace(
                /urn:ogc:def:crs:(\w+):.+:(\w+)$/,
                "urn:ogc:def:crs:$1::$2"
            );
            yx = !!this.yx[crs];
        }
        if (yx) {
            obj.topLeftCorner = new OpenLayers.LonLat(
                coords[1], coords[0]
            );
        } else {
            obj.topLeftCorner = new OpenLayers.LonLat(
                coords[0], coords[1]
            );
        }
    };
 */
    _readers_['wmts']['MinTileRow']= function(node, obj) {
        obj.limits[obj.tileMatrix].minTileRow= parseInt(this.getChildValue(node));
    };
    _readers_['wmts']['MaxTileRow']= function(node, obj) {
        obj.limits[obj.tileMatrix].maxTileRow= parseInt(this.getChildValue(node));
    };
    _readers_['wmts']['MinTileCol']= function(node, obj) {
        obj.limits[obj.tileMatrix].minTileCol= parseInt(this.getChildValue(node));
    };
    _readers_['wmts']['MaxTileCol']= function(node, obj) {
        obj.limits[obj.tileMatrix].maxTileCol= parseInt(this.getChildValue(node));
    };

    OpenLayers.Format.WMTSCapabilities.v1_0_0= OpenLayers.overload(OpenLayers.Format.WMTSCapabilities.v1_0_0, {

    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     *  IGNF: _addition_
     */
    readers: _readers_

    });

    _readers_= null;

    })();

}

/**
 * Class: OpenLayers.Control.ZoomBox
 * IGNF: See {<OpenLayers.UI>}
 */
if (OpenLayers.Control && OpenLayers.Control.ZoomBox) {

    OpenLayers.Control.ZoomBox= OpenLayers.overload(OpenLayers.Control.ZoomBox, {

    /**
     * Property: noUI
     * {Boolean} indicate whether the control has no a user interface.
     *      Defaults to *true*
     */
    noUI: true,

    /**
     * Method: draw
     */
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this,arguments);//IGNF
        this.handler = new OpenLayers.Handler.Box( this,
                            {done: this.zoomBox}, {keyMask: this.keyMask} );
    }
    });

}

/**
 * Class: OpenLayers.Control.DragPan
 * IGNF: See {<OpenLayers.UI>}
 */
if (OpenLayers.Control && OpenLayers.Control.DragPan) {

    OpenLayers.Control.DragPan= OpenLayers.overload(OpenLayers.Control.DragPan, {

    /**
     * Property: noUI
     * {Boolean} indicate whether the control has no a user interface.
     *      Defaults to *true*
     */
    noUI: true,

    /**
     * Method: draw
     * Creates a Drag handler, using <panMap> and
     * <panMapDone> as callbacks.
     */
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this,arguments);//IGNF
        if(this.enableKinetic) {
            var config = {interval: this.kineticInterval};
            if(typeof this.enableKinetic === "object") {
                config = OpenLayers.Util.extend(config, this.enableKinetic);
            }
            this.kinetic = new OpenLayers.Kinetic(config);
        }
        this.handler = new OpenLayers.Handler.Drag(this, {
                "move": this.panMap,
                "done": this.panMapDone,
                "down": this.panMapStart
            }, {
                interval: this.interval,
                documentDrag: this.documentDrag
            }
        );
    }

    });

}

/**
 * Class: OpenLayers.Control.Geolocate
 * IGNF: don't reproject position when not bound to the map
 */
if (OpenLayers.Control && OpenLayers.Control.Geolocate) {

    OpenLayers.Control.Geolocate= OpenLayers.overload(OpenLayers.Control.Geolocate, {

    /**
     * Method: geolocate
     * Activates the control.
     *  IGNF: _check map before reprojecting_
     */
    geolocate: function (position) {
/*
        var center = new OpenLayers.LonLat(
            position.coords.longitude,
            position.coords.latitude
        ).transform(
            new OpenLayers.Projection("EPSG:4326"),
            this.map.getProjectionObject()
        );
        if (this.bind) {
            this.map.setCenter(center);
        }
 */
        // IGNF begin
        var center = new OpenLayers.LonLat(
            position.coords.longitude,
            position.coords.latitude
        );
        if (this.map) {
            center.transform(OpenLayers.Projection.CRS84, this.map.getProjection());
            if (this.bind) {
                this.map.setCenter(center);
            }
        }
        //IGNF end
        this.events.triggerEvent("locationupdated", {
            position: position,
            point: new OpenLayers.Geometry.Point(
                center.lon, center.lat
            )
        });
    }

    });

}

/**
 * Class: OpenLayers.Control.Navigation
 * IGNF: bug fixes
 */
if (OpenLayers.Control && OpenLayers.Control.Navigation) {

    OpenLayers.Control.Navigation= OpenLayers.overload(OpenLayers.Control.Navigation, {

    /**
     * Method: draw
     */
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this,arguments);//IGNF
        // disable right mouse context menu for support of right click events
        if (this.handleRightClicks) {
            this.map.viewPortDiv.oncontextmenu = OpenLayers.Function.False;
        }

        var clickCallbacks = {
            'click': this.defaultClick,
            'dblclick': this.defaultDblClick,
            'dblrightclick': this.defaultDblRightClick
        };
        var clickOptions = {
            'double': true,
            'stopDouble': true
        };
        this.handlers.click = new OpenLayers.Handler.Click(
            this, clickCallbacks, clickOptions
        );
        this.dragPan = new OpenLayers.Control.DragPan(
            OpenLayers.Util.extend({
                map: this.map,
                documentDrag: this.documentDrag
            }, this.dragPanOptions)
        );
        this.zoomBox = new OpenLayers.Control.ZoomBox(
                    {map: this.map, keyMask: this.zoomBoxKeyMask});
        this.dragPan.draw();
        this.zoomBox.draw();
        this.handlers.wheel = new OpenLayers.Handler.MouseWheel(
                                    this, {"up"  : this.wheelUp,
                                           "down": this.wheelDown},
                                    this.mouseWheelOptions );
        if (OpenLayers.Control.PinchZoom) {
            this.pinchZoom = new OpenLayers.Control.PinchZoom(
                OpenLayers.Util.extend(
                    {map: this.map}, this.pinchZoomOptions));
        }
    },

    /**
     * APIMethod: deactivate
     * IGNF: _checks components before deactivation_.
     */
    deactivate: function() {
        if (this.pinchZoom) {
            this.pinchZoom.deactivate();
        }
        if (this.zoomBox) {
            this.zoomBox.deactivate();
        }
        if (this.dragPan) {
            this.dragPan.deactivate();
        }
        if (this.handlers) {
            if (this.handlers.click) {
                this.handlers.click.deactivate();
            }
            if (this.handlers.wheel) {
                this.handlers.wheel.deactivate();
            }
        }
        return OpenLayers.Control.prototype.deactivate.apply(this,arguments);
    }

    });

}

/**
 * Class: OpenLayers.Strategy.Cluster
 * IGNF: bug fixed when changing baselayer and related projection.
 */
if (OpenLayers.Strategy && OpenLayers.Strategy.Cluster) {

    OpenLayers.Strategy.Cluster= OpenLayers.overload(OpenLayers.Strategy.Cluster, {

    /**
     * APIMethod: activate
     * Activate the strategy.  Register any listeners, do appropriate setup.
     * IGNF: _aware of changebaselayer event_.
     *
     * Returns:
     * {Boolean} The strategy was successfully activated.
     */
    activate: function() {
        var activated = OpenLayers.Strategy.prototype.activate.call(this);
        if(activated) {
            this.layer.events.on({
                "beforefeaturesadded": this.cacheFeatures,
                "moveend": this.cluster,
                scope: this
            });
            //IGNF:
            this.layer.map.events.on({
                "changebaselayer": this.changeBaseLayer,
                scope:this
            });
        }
        return activated;
    },

    /**
     * APIMethod: deactivate
     * Deactivate the strategy.  Unregister any listeners, do appropriate
     *     tear-down.
     * IGNF: _aware of changebaselayer event_.
     *
     * Returns:
     * {Boolean} The strategy was successfully deactivated.
     */
    deactivate: function() {
        var deactivated = OpenLayers.Strategy.prototype.deactivate.call(this);
        if(deactivated) {
            this.clearCache();
            this.layer.events.un({
                "beforefeaturesadded": this.cacheFeatures,
                "moveend": this.cluster,
                scope: this
            });
            //IGNF:
            this.layer.map.events.un({
                "changebaselayer": this.changeBaseLayer,
                scope:this
            });
        }
        return deactivated;
    },

    /**
     * APIMethod: transform
     * Reproject cache
     *  IGNF: _addition_
     *
     * Parameters:
     * source - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the source projection.
     * dest - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the destination projection.
     */
    transform: function(source, dest) {
        //reproject cache:
        if (this.features) {
            for (var ii= 0, il= this.features.length; ii<il; ii++) {
                var feature= this.features[ii];
                feature.geometry.transform(source,dest);
            }
        }
    },

    /**
     * APIMethod: changeBaseLayer
     * Listener of the map's event 'changebaselayer'.
     *  IGNF: _addition_
     *
     * Parameters:
     * evt - {Event} the 'changebaselayer' event.
     *
     * Context:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the new baseLayer
     * baseLayer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the old baseLayer
     *
     * Returns:
     * {Boolean} true to keep on, false to stop propagating the event.
     */
    changeBaseLayer: function(evt) {
        if (!this.layer.isBaseLayer) {
            var mapProj= this.layer.map.getProjection();
            var oldMapProj= evt.baseLayer? evt.baseLayer.getNativeProjection() : null;
            if (!oldMapProj) { return false; }
            this.transform(oldMapProj,mapProj);
        }
        return true;
    }

    });

}

if (OpenLayers.Control && OpenLayers.Control.Button) {

/**
 * Class: OpenLayers.UI.Button
 * Base class for rendering {<OpenLayers.Control.Button at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Button-js.html>} components.
 *  IGNF: _addition_
 */
OpenLayers.UI.Button = OpenLayers.Class(OpenLayers.UI, {
    /**
     * Property: labelContainer
     * {DOMElement}
     */
    labelContainer: null,

    /**
     * APIProperty: label
     * {String}
     */
    label: null,

    /**
     * APIMethod: destroy
     */
    destroy: function() {
        this.labelContainer= null;
        OpenLayers.UI.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: createContainer
     * Create the DOM element associated with the container.
     *
     * Returns:
     * {DOMElement} A reference to the Document element containing the
     * component.
     */
    createContainer: function() {
        var b= OpenLayers.getDoc().createElement("button");
        b.id= this.id;
        return b;
    },

    /**
     * APIMethod: draw
     * The draw method is called to render the button's content on the page.
     *
     * Returns:
     * {DOMElement} A reference to the button DOMElement containing the
     * component.
     */
    draw: function () {
        if (!this.labelContainer) {
            this.labelContainer= this.container.ownerDocument.createTextNode('');
            this.container.appendChild(this.labelContainer);
        }
        this.changeLang();
        return this.container;
    },

    /**
     * APIMethod: changeLang
     * Change the rendering when "changelang" has been triggered.
     *
     * Parameters:
     * evt - {Event} event fired, may be undefined (See
     *      <OpenLayers.Control.draw at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html#OpenLayers.Control.draw>).
     *      evt.lang holds the new language
     */
    changeLang: function(evt) {
        OpenLayers.UI.prototype.changeLang.apply(this,arguments);
        if (this.labelContainer && this.label) {
            this.labelContainer.nodeValue= OpenLayers.i18n(this.label);
        }
    },

    /**
     * Constant: OpenLayers.UI.Button.CLASS_NAME
     *  Defaults to *OpenLayers.UI.Button*
     */
    CLASS_NAME: "OpenLayers.UI.Button"
});

/**
 * Class: OpenLayers.UI.JQuery.Button
 * Specialized class for rendering {<OpenLayers.Control.Button at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control/Button-js.html>} using JQuery
 * and JQuery UI (See http://jquery.com and http://jqueryui.com).
 */
OpenLayers.UI.JQuery.Button = OpenLayers.Class(OpenLayers.UI.Button, OpenLayers.UI.JQuery, {
    /**
     * Constant: OpenLayers.UI.JQuery.Button.CLASS_NAME
     *  Defaults to *OpenLayers.UI.JQuery.Button*
     */
    CLASS_NAME: "OpenLayers.UI.JQuery.Button"
});

}

/**
 * Class: OpenLayers.Renderer.VML
 * See also http://trac.openlayers.org/changeset/9759
 * See also http://trac.openlayers.org/ticket/2148 (enabling vector features
 * to be selectable from their text node)
 * See also http://trac.openlayers.org/ticket/2563 (fix for 2.9 labelAlign
 * with one character can not works on IE)
 * See also http://trac.openlayers.org/ticket/2965 (label halo)
 */
if (OpenLayers.Renderer && OpenLayers.Renderer.VML) {

    OpenLayers.Renderer.VML= OpenLayers.overload(OpenLayers.Renderer.VML, {

    HALO_ID_SUFFIX: OpenLayers.Renderer.Elements.prototype.HALO_ID_SUFFIX,

    removeText: OpenLayers.Renderer.Elements.prototype.removeText,

    /**
     * Constructor: OpenLayers.Renderer.VML
     * Create a new VML renderer.
     * IGNF: _aware of the current document_.
     *
     * Parameters:
     * containerID - {String} The id for the element that contains the
     * renderer
     */
    initialize: function(containerID) {
        if (!this.supported()) {
            return;
        }
        var doc= OpenLayers.getDoc();
        if (!doc.namespaces.olv) {
            doc.namespaces.add("olv", this.xmlns);
            var style = doc.createStyleSheet();
            //var shapes = ['shape','rect', 'oval', 'fill', 'stroke', 'imagedata', 'group','textbox'];
            var shapes = ['shape','rect', 'oval', 'fill', 'stroke', 'imagedata', 'group','textbox',
                'fill', 'stroke', 'path', 'textpath' // for new textpath
            ];
            for (var i = 0, len = shapes.length; i < len; i++) {

                style.addRule('olv\\:' + shapes[i], "behavior: url(#default#VML); " +
                              "position: absolute; display: inline-block;");
            }
        }

        OpenLayers.Renderer.Elements.prototype.initialize.apply(this,
                                                                arguments);
    },

    /**
     * APIMethod: supported
     * Determine whether a browser supports this renderer.
     * IGNF: _aware of the current document_.
     *
     * Returns:
     * {Boolean} The browser supports the VML renderer
     */
    supported: function() {
        return !!(OpenLayers.getDoc().namespaces);
    },

    /**
     * Method: setExtent
     * Set the renderer's extent
     * IGNF: _check resolution_
     *
     * Parameters:
     * extent - {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>}
     * resolutionChanged - {Boolean}
     *
     * Returns:
     * {Boolean} true to notify the layer that the new extent does not exceed
     *     the coordinate range, and the features will not need to be redrawn.
     */
    setExtent: function(extent, resolutionChanged) {
        OpenLayers.Renderer.Elements.prototype.setExtent.apply(this,
                                                               arguments);
        var resolution = this.getResolution();
        if (resolution == null) { return false; }//IGNF

        var left = (extent? extent.left/resolution : 0) | 0;//IGNF test on extent parameter
        var top = (extent? extent.top/resolution - this.size.h : 0) | 0;//IGNF test on extent parameter
        if (resolutionChanged || !this.offset) {
            this.offset = {x: left, y: top};
            left = 0;
            top = 0;
        } else {
            left = left - this.offset.x;
            top = top - this.offset.y;
        }


        var org = left + " " + top;
        this.root.coordorigin = org;
        var roots = [this.root, this.vectorRoot, this.textRoot];
        var root;
        for(var i=0, len=roots.length; i<len; ++i) {
            root = roots[i];

            var size = this.size.w + " " + this.size.h;
            root.coordsize = size;

        }
        // flip the VML display Y axis upside down so it
        // matches the display Y axis of the map
        this.root.style.flip = "y";

        return true;
    },

    /**
     * Method: graphicRotate
     * If a point is to be styled with externalGraphic and rotation, VML fills
     * cannot be used to display the graphic, because rotation of graphic
     * fills is not supported by the VML implementation of Internet Explorer.
     * This method creates a olv:imagedata element inside the VML node,
     * DXImageTransform.Matrix and BasicImage filters for rotation and
     * opacity, and a 3-step hack to remove rendering artefacts from the
     * graphic and preserve the ability of graphics to trigger events.
     * Finally, OpenLayers methods are used to determine the correct
     * insertion point of the rotated image, because DXImageTransform.Matrix
     * does the rotation without the ability to specify a rotation center
     * point.
     * IGNF: _aware of the current document_.
     *
     * Parameters:
     * node    - {DOMElement}
     * xOffset - {Number} rotation center relative to image, x coordinate
     * yOffset - {Number} rotation center relative to image, y coordinate
     * style   - {Object}
     */
    graphicRotate: function(node, xOffset, yOffset, style) {
        var style = style || node._style;
        var rotation = style.rotation || 0;

        var aspectRatio, size;
        if (!(style.graphicWidth && style.graphicHeight)) {
            // load the image to determine its size
            var img = new Image();
            img.onreadystatechange = OpenLayers.Function.bind(function() {
                if(img.readyState == "complete" ||
                   img.readyState == "interactive") {
                    aspectRatio = img.width / img.height;
                    size = Math.max(style.pointRadius * 2,
                        style.graphicWidth || 0,
                        style.graphicHeight || 0);
                    xOffset = xOffset * aspectRatio;
                    style.graphicWidth = size * aspectRatio;
                    style.graphicHeight = size;
                    this.graphicRotate(node, xOffset, yOffset, style);
                }
            }, this);
            img.src = style.externalGraphic;

            // will be called again by the onreadystate handler
            return;
        } else {
            size = Math.max(style.graphicWidth, style.graphicHeight);
            aspectRatio = style.graphicWidth / style.graphicHeight;
        }

        var width = Math.round(style.graphicWidth || size * aspectRatio);
        var height = Math.round(style.graphicHeight || size);
        node.style.width = width + "px";
        node.style.height = height + "px";

        // Three steps are required to remove artefacts for images with
        // transparent backgrounds (resulting from using DXImageTransform
        // filters on svg objects), while preserving awareness for browser
        // events on images:
        // - Use the fill as usual (like for unrotated images) to handle
        //   events
        // - specify an imagedata element with the same src as the fill
        // - style the imagedata element with an AlphaImageLoader filter
        //   with empty src
        var image = this.root.ownerDocument.getElementById(node.id + "_image");
        if (!image) {
            image = this.createNode("olv:imagedata", node.id + "_image");
            node.appendChild(image);
        }
        image.style.width = width + "px";
        image.style.height = height + "px";
        image.src = style.externalGraphic;
        image.style.filter =
            "progid:DXImageTransform.Microsoft.AlphaImageLoader(" +
            "src='', sizingMethod='scale')";

        var rot = rotation * Math.PI / 180;
        var sintheta = Math.sin(rot);
        var costheta = Math.cos(rot);

        // do the rotation on the image
        var filter =
            "progid:DXImageTransform.Microsoft.Matrix(M11=" + costheta +
            ",M12=" + (-sintheta) + ",M21=" + sintheta + ",M22=" + costheta +
            ",SizingMethod='auto expand')\n";

        // set the opacity (needed for the imagedata)
        var opacity = style.graphicOpacity || style.fillOpacity;
        if (opacity && opacity != 1) {
            filter +=
                "progid:DXImageTransform.Microsoft.BasicImage(opacity=" +
                opacity+")\n";
        }
        node.style.filter = filter;

        // do the rotation again on a box, so we know the insertion point
        var centerPoint = new OpenLayers.Geometry.Point(-xOffset, -yOffset);
        var imgBox = new OpenLayers.Bounds(0, 0, width, height).toGeometry();
        imgBox.rotate(style.rotation, centerPoint);
        var imgBounds = imgBox.getBounds();

        node.style.left = Math.round(
            parseInt(node.style.left) + imgBounds.left) + "px";
        node.style.top = Math.round(
            parseInt(node.style.top) - imgBounds.bottom) + "px";
    },

    /**
     * Method: createNode
     * Create a new node
     * IGNF: _aware of the current document_.
     *
     * Parameters:
     * type - {String} Kind of node to draw
     * id - {String} Id for node
     *
     * Returns:
     * {DOMElement} A new node of the given type and id
     */
    createNode: function(type, id) {
        var doc= this.root? this.root.ownerDocument : OpenLayers.getDoc();
        var node = doc.createElement(type);
        if (id) {
            node.id = id;
        }

        // IE hack to make elements unselectable, to prevent 'blue flash'
        // while dragging vectors; #1410
        node.unselectable = 'on';
        node.onselectstart = OpenLayers.Function.False;

        return node;
    },

    /**
     * Method: drawText
     * This method is only called by the renderer itself.
     * IGNF: _labelHalo redesign cause of IE 7_
     *
     * Parameters:
     * featureId - {String}
     * style -
     * location - {<OpenLayers.Geometry.Point at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry/Point-js.html>}
     */
    drawText: function(featureId, style, location) {

        // If the user wants a halo, first draw the text with a
        // thick stroke (using the halo color) and then draw the
        // text normally over that
        // Idea from:
        // http://www.mail-archive.com/svg-developers@yahoogroups.com/msg01002.html
        if (style.labelHaloColor) {
            var haloStyle = OpenLayers.Util.extend({}, style);
            haloStyle.fontStrokeColor = haloStyle.labelHaloColor;
            haloStyle.fontStrokeWidth = haloStyle.labelHaloWidth || 2;
            delete haloStyle.labelHaloColor;
            if (haloStyle.labelBackgroundColor) {
                delete haloStyle.labelBackgroundColor;
            }
            if (haloStyle.labelBorderColor) {
                delete haloStyle.labelBorderColor;
            }
            if (haloStyle.labelBorderSize) {
                delete haloStyle.labelBorderSize;
            }
            this.drawText2(featureId, haloStyle, location, true);
            delete style.labelHaloColor;
            if (style.labelHaloWidth) {
                delete style.labelHaloWidth;
            }
            this.drawText2(featureId, style, location, false);
            return;
        }

        var label = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX, "olv:rect");
        var textbox = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX + "_textbox", "olv:textbox");

        var resolution = this.getResolution();
        label.style.left = ((location.x/resolution - this.offset.x) | 0) + "px";
        label.style.top = ((location.y/resolution - this.offset.y) | 0) + "px";
        label.style.flip = "y";

        textbox.innerText = style.label;

        if (style.labelBackgroundColor) {
            textbox.style.backgroundColor = style.labelBackgroundColor;
        }
        // labelBorder breaks IE7:
        if (parseFloat((navigator.appVersion.match(/MSIE (\d+\.\d+);/i))[1])>=8) {
            if (style.labelBorderColor || style.labelBorderSize) {
                textbox.style.border =
                    (style.labelBorderSize || "1px") +
                    " solid " +
                    (style.labelBorderColor || "#000000");
            }
        }

        if (style.cursor != "inherit" && style.cursor != null) {
            textbox.style.cursor = style.cursor;
        }
        if (style.fontColor) {
            textbox.style.color = style.fontColor;
        }
        if (style.fontOpacity) {
            textbox.style.filter = 'alpha(opacity=' + (style.fontOpacity * 100) + ')';
        }
        if (style.fontFamily) {
            textbox.style.fontFamily = style.fontFamily;
        }
        if (style.fontSize) {
            textbox.style.fontSize = style.fontSize;
        }
        if (style.fontWeight) {
            textbox.style.fontWeight = style.fontWeight;
        }
        if (style.fontStyle) {
            textbox.style.fontStyle = style.fontStyle;
        }
        if (style.labelSelect === true) {
            label._featureId = featureId;
            textbox._featureId = featureId;
            textbox._geometry = location;
            textbox._geometryClass = location.CLASS_NAME;
        }
        textbox.style.whiteSpace = "nowrap";
        // fun with IE: IE7 in standards compliant mode does not display any
        // text with a left inset of 0. So we set this to 1px and subtract one
        // pixel later when we set label.style.left
        textbox.inset = "1px,0px,0px,0px";

        if(!label.parentNode) {
            label.appendChild(textbox);
            this.textRoot.appendChild(label);
        }

        var align = style.labelAlign || "cm";
        if (align.length == 1) {
            align += "m";
        }
        var xshift = textbox.clientWidth *
            (OpenLayers.Renderer.VML.LABEL_SHIFT[align.substr(0,1)]);
        var yshift = textbox.clientHeight *
            (OpenLayers.Renderer.VML.LABEL_SHIFT[align.substr(1,1)]);
        label.style.left = parseInt(label.style.left)-xshift-1+"px";
        label.style.top = parseInt(label.style.top)+yshift+"px";

    },

    /**
     * Method: drawText2
     * This method is only called by the renderer itself.
     * See also http://trac.openlayers.org/ticket/2965 (label halo)
     * IGNF: _labelHalo redesign cause of IE 7_
     *
     * Parameters:
     * featureId - {String}
     * style -
     * location - {<OpenLayers.Geometry.Point at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry/Point-js.html>}
     * useHalo - {Boolean}
     */
    drawText2: function(featureId, style, location, useHalo) {
        var label = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX +
                (useHalo ? this.HALO_ID_SUFFIX : ""), "olv:shape");

        // Add it to the DOM hierarchy
        if(!label.parentNode) {
            this.textRoot.appendChild(label);
        }

        // Set its dimension and position attributes
        var resolution = this.getResolution();
        label.style.left = ((location.x/resolution - this.offset.x) | 0) + "px";
        label.style.top = ((location.y/resolution - this.offset.y) | 0) + "px";
        label.style.flip = "y";
        label.style.position = "absolute";
        label.style.width = 1 + "px"; // some dummy value
        label.style.height = 1 + "px"; // some dummy value
        label.style.antialias = "true";

        /*
        // TODO: use built-in setStyle method for building style
        var nodeStyle = { fillColor: style.fontColor,
            fillOpacity: style.fontOpacity,
            strokeColor: style.fontStrokeColor,
            strokeWidth: style.fontHaloSize || 2,
            strokeOpacity: style.fontOpacity

        }
        var nodeOptions = {
            isFilled:  style.fontColor,
            isStroked: style.fontStrokeColor
        }

        this.setStyle(label, nodeStyle, nodeOptions, null);
        */
        // Create the fill object
        var myFill = OpenLayers.getDoc().createElement("olv:fill");
        myFill.on = "true";
        myFill.color = style.fontColor;

        // Add it to the DOM hierarchy
        label.appendChild(myFill);

        // Create the stroke object. We need to define the
        // stroke explicitly, otherwise we get a default
        // black outline
        var myStroke = OpenLayers.getDoc().createElement("olv:stroke");

        if (style.fontStrokeColor) {
            myStroke.on = "true";
            myStroke.color = style.fontStrokeColor;
        } else {
            myStroke.on = "false";
        }

        if (style.fontStrokeWidth) {
            myStroke.weight = style.fontStrokeWidth;
        }

        // Add it to the DOM hierarchy
        label.appendChild(myStroke);

        // Create the path object
        var myPath = OpenLayers.getDoc().createElement("olv:path");
        myPath.textpathok = "True";
        myPath.v = "m 0,0 l 200,0";

        // Add it to the DOM hierarchy
        label.appendChild(myPath);

        // Create the textpath object
        var myTextPath = OpenLayers.getDoc().createElement("olv:textpath");
        myTextPath.on = "true";
        myTextPath.fitpath = "false";
        myTextPath.string = style.label;

        label.appendChild(myTextPath);

        if (style.cursor != "inherit" && style.cursor != null) {
            myTextPath.style.cursor = style.cursor;
        }
        if (style.fontColor) {
            myTextPath.style.color = style.fontColor;
        }
        if (style.fontOpacity) {
            myFill.opacity = style.fontOpacity;
            myStroke.opacity = style.fontOpacity;
        }

        // Setting the font family does not seem to work
        // TODO: make this work!
        if (style.fontFamily) {
            myTextPath.style.fontFamily = style.fontFamily;
        }
        if (style.fontSize) {
            myTextPath.style.fontSize = style.fontSize;
        }
        if (style.fontWeight) {
            myTextPath.style.fontWeight = style.fontWeight;
        }
        if (style.fontStyle) {
            myTextPath.style.fontStyle = style.fontStyle;
        }

        var align = style.labelAlign || "cm";
        if (align.length == 1) {
            align += "m";
        }

        // Set the horizontal align
        var hAlign;
        switch (align.substr(0,1)) {
            case 'l': hAlign = "left"; break;
            case 'c': hAlign = "center"; break;
            case 'r': hAlign = "right"; break;
        }
        myTextPath.style['v-text-align'] = hAlign;

        if (style.labelSelect === true) {
            label._featureId = featureId;
            label._geometry = location;
            label._geometryClass = location.CLASS_NAME;
        }
        myTextPath.style.whiteSpace = "nowrap";
        // fun with IE: IE7 in standards compliant mode does not display any
        // text with a left inset of 0. So we set this to 1px and subtract one
        // pixel later when we set label.style.left
        myTextPath.inset = "1px,0px,0px,0px";

        var xshift = myTextPath.clientWidth *
            (OpenLayers.Renderer.VML.LABEL_SHIFT[align.substr(0,1)]);
        var yshift = myTextPath.clientHeight *
            (OpenLayers.Renderer.VML.LABEL_SHIFT[align.substr(1,1)]);
        label.style.left = parseInt(label.style.left)-xshift-1+"px";
        label.style.top = parseInt(label.style.top)+yshift+"px";

    }

    });

}

/**
 * Class: OpenLayers.Control.Graticule
 * IGNF: refactoring.
 */
if (OpenLayers.Control && OpenLayers.Control.Graticule) {

    OpenLayers.Control.Graticule= OpenLayers.overload(OpenLayers.Control.Graticule, {

    /**
     * Method: update
     * calculates the grid to be displayed and actually draws it
     * IGNF: _redesing using new/alias methods_.
     *
     * Returns:
     * {DOMElement}
     */
    update: function() {
        //wait for the map to be initialized before proceeding
        var mapBounds = this.map.getExtent();
        if (!mapBounds) {
            return;
        }

        //clear out the old grid
        this.gratLayer.destroyFeatures();

        //get the projection objects required
        var llProj = OpenLayers.Projection.CRS84;//IGNF
        var mapProj = this.map.getProjection();//IGNF
        var mapRes = this.map.getResolution();

        //if the map is in lon/lat, then the lines are straight and only one
        //point is required
        switch (mapProj.getProjName()) {//IGNF
        case "longlat":
        case "eqc"    :
        case "merc"   ://FIXME: web mercator ...
            this.numPoints = 1;
            break;
        default       :
            break;
        }

        //get the map center in EPSG:4326
        var mapCenter = this.map.getCenter(); //lon and lat here are really map x and y
        var mapCenterLL = new OpenLayers.Pixel(mapCenter.lon, mapCenter.lat);
        OpenLayers.Projection.transform(mapCenterLL, mapProj, llProj);

        /* This block of code determines the lon/lat interval to use for the
         * grid by calculating the diagonal size of one grid cell at the map
         * center.  Iterates through the intervals array until the diagonal
         * length is less than the targetSize option.
         */
        //find lat/lon interval that results in a grid of less than the target size
        var testSq = this.targetSize*mapRes;
        testSq *= testSq;   //compare squares rather than doing a square root to save time
        var llInterval;
        for (var i=0; i<this.intervals.length; ++i) {
            llInterval = this.intervals[i];   //could do this for both x and y??
            var delta = llInterval/2;
            var p1 = mapCenterLL.offset(new OpenLayers.Pixel(-delta, -delta));  //test coords in EPSG:4326 space
            var p2 = mapCenterLL.offset(new OpenLayers.Pixel( delta,  delta));
            OpenLayers.Projection.transform(p1, llProj, mapProj); // convert them back to map projection
            OpenLayers.Projection.transform(p2, llProj, mapProj);
            var distSq = (p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y);
            if (distSq <= testSq) {
                break;
            }
        }
        //alert(llInterval);

        //round the LL center to an even number based on the interval
        mapCenterLL.x = Math.floor(mapCenterLL.x/llInterval)*llInterval;
        mapCenterLL.y = Math.floor(mapCenterLL.y/llInterval)*llInterval;
        //TODO adjust for minutes/seconds?

        /* The following 2 blocks calculate the nodes of the grid along a
         * line of constant longitude (then latitude) running through the
         * center of the map until it reaches the map edge.  The calculation
         * goes from the center in both directions to the edge.
         */
        //get the central longitude line, increment the latitude
        var iter = 0;
        var centerLonPoints = [mapCenterLL.clone()];
        var newPoint = mapCenterLL.clone();
        var mapXY;
        do {
            newPoint = newPoint.offset(new OpenLayers.Pixel(0,llInterval));
            mapXY = OpenLayers.Projection.transform(newPoint.clone(), llProj, mapProj);
            centerLonPoints.unshift(newPoint);
        } while (mapBounds.containsPixel(mapXY) && ++iter<1000);
        newPoint = mapCenterLL.clone();
        do {
            newPoint = newPoint.offset(new OpenLayers.Pixel(0,-llInterval));
            mapXY = OpenLayers.Projection.transform(newPoint.clone(), llProj, mapProj);
            centerLonPoints.push(newPoint);
        } while (mapBounds.containsPixel(mapXY) && ++iter<1000);

        //get the central latitude line, increment the longitude
        iter = 0;
        var centerLatPoints = [mapCenterLL.clone()];
        newPoint = mapCenterLL.clone();
        do {
            newPoint = newPoint.offset(new OpenLayers.Pixel(-llInterval, 0));
            mapXY = OpenLayers.Projection.transform(newPoint.clone(), llProj, mapProj);
            centerLatPoints.unshift(newPoint);
        } while (mapBounds.containsPixel(mapXY) && ++iter<1000);
        newPoint = mapCenterLL.clone();
        do {
            newPoint = newPoint.offset(new OpenLayers.Pixel(llInterval, 0));
            mapXY = OpenLayers.Projection.transform(newPoint.clone(), llProj, mapProj);
            centerLatPoints.push(newPoint);
        } while (mapBounds.containsPixel(mapXY) && ++iter<1000);

        //now generate a line for each node in the central lat and lon lines
        //first loop over constant longitude
        var lines = [];
        for(var i=0; i < centerLatPoints.length; ++i) {
            var lon = centerLatPoints[i].x;
            var pointList = [];
            var labelPoint = null;
            var latEnd = Math.min(centerLonPoints[0].y, 90);
            var latStart = Math.max(centerLonPoints[centerLonPoints.length - 1].y, -90);
            var latDelta = (latEnd - latStart)/this.numPoints;
            var lat = latStart;
            for(var j=0; j<= this.numPoints; ++j) {
                var gridPoint = new OpenLayers.Geometry.Point(lon,lat);
                gridPoint.transform(llProj, mapProj);
                pointList.push(gridPoint);
                lat += latDelta;
                if (gridPoint.y >= mapBounds.bottom && !labelPoint) {
                    labelPoint = gridPoint;
                }
            }
            if (this.labelled) {
                //keep track of when this grid line crosses the map bounds to set
                //the label position
                //labels along the bottom, add 10 pixel offset up into the map
                //TODO add option for labels on top
                var labelPos = new OpenLayers.Geometry.Point(labelPoint.x,mapBounds.bottom);
                var labelAttrs = {
                    value: lon,
                    label: this.labelled? OpenLayers.Util.getFormattedLonLat(lon, "lon", this.labelFormat):"",
                    labelAlign: "cb",
                    xOffset: 0,
                    yOffset: 2
                };
                this.gratLayer.addFeatures(new OpenLayers.Feature.Vector(labelPos,labelAttrs));
            }
            var geom = new OpenLayers.Geometry.LineString(pointList);
            lines.push(new OpenLayers.Feature.Vector(geom));
        }

        //now draw the lines of constant latitude
        for (var j=0; j < centerLonPoints.length; ++j) {
            lat = centerLonPoints[j].y;
            if (lat<-90 || lat>90) {  //latitudes only valid between -90 and 90
                continue;
            }
            var pointList = [];
            var lonStart = centerLatPoints[0].x;
            var lonEnd = centerLatPoints[centerLatPoints.length - 1].x;
            var lonDelta = (lonEnd - lonStart)/this.numPoints;
            var lon = lonStart;
            var labelPoint = null;
            for(var i=0; i <= this.numPoints ; ++i) {
                var gridPoint = new OpenLayers.Geometry.Point(lon,lat);
                gridPoint.transform(llProj, mapProj);
                pointList.push(gridPoint);
                lon += lonDelta;
                if (gridPoint.x < mapBounds.right) {
                    labelPoint = gridPoint;
                }
            }
            if (this.labelled) {
                //keep track of when this grid line crosses the map bounds to set
                //the label position
                //labels along the right, 30 pixel offset left into the map
                //TODO add option for labels on left
                var labelPos = new OpenLayers.Geometry.Point(mapBounds.right, labelPoint.y);
                var labelAttrs = {
                    value: lat,
                    label: this.labelled?OpenLayers.Util.getFormattedLonLat(lat, "lat", this.labelFormat):"",
                    labelAlign: "rb",
                    xOffset: -2,
                    yOffset: 2
                };
                this.gratLayer.addFeatures(new OpenLayers.Feature.Vector(labelPos,labelAttrs));
            }
            var geom = new OpenLayers.Geometry.LineString(pointList);
            lines.push(new OpenLayers.Feature.Vector(geom));
          }
          this.gratLayer.addFeatures(lines);
    },

    /**
     * APIMethod: changeLang
     * Assigns the current language
     *  IGNF: _addition_
     *
     * Parameters:
     * evt {Event}  - event fired
     * - evt.lang holds the new language
     */
    changeLang: function(evt) {
        if (this.gratLayer) {
            this.update();
        }
    }

    });

}

/**
 * Class: OpenLayers.Control.WMSGetFeatureInfo
 * IGNF: Allow to use the coordinate reference system of layers instead of only
 *      using the map's coordinates reference system.
 *      It is also worth noting that all layers controlled by this control
 *      must use the same VERSION of WMS, SRS/CRS and FORMAT (it is the case
 *      in OpenLayers, but not really documented).
 */
if (OpenLayers.Control && OpenLayers.Control.WMSGetFeatureInfo) {

    OpenLayers.Control.WMSGetFeatureInfo= OpenLayers.overload(OpenLayers.Control.WMSGetFeatureInfo, {

    /**
     * APIMethod: layerQueryable
     * Indicate whether or not a layer is queryable for GetFeatureInfo.
     *      OpenLayers uses <OpenLayers.Layer.getVisibility at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html#OpenLayers.Layer.getVisibility>().
     * IGNF: _uses <OpenLayers.Layer.queryable at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html#OpenLayers.Layer.queryable> if defined_.
     *
     * Parameters:
     * layer -{<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the layer to elect.
     *
     * Returns:
     * {Boolean} true if the layer is queryable, false otherwise.
     */
    layerQueryable: function(layer) {
        if (!layer.getVisibility()) { return false; }
        if (!layer.calculateInRange()) { return false; }
        if (layer.queryable===false) { return false; }
        return true;
    },

    /**
     * Method: findLayers
     * Internal method to get the layers, independent of whether we are
     *     inspecting the map or using a client-provided array.
     * IGNF: _uses <OpenLayers.Layer.queryable at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html#OpenLayers.Layer.queryable> if defined_.
     */
    findLayers: function() {

        var candidates = this.layers || this.map.layers;
        var layers = [];
        var layer, url;
        for(var i=0, len=candidates.length; i<len; ++i) {
            layer = candidates[i];
            if(layer instanceof OpenLayers.Layer.WMS &&
               (!this.queryVisible || this.layerQueryable(layer))) {//IGNF: layer must be electable
                url = OpenLayers.Util.isArray(layer.url)? layer.url[0] : layer.url;
                // if the control was not configured with a url, set it
                // to the first layer url
                if(this.drillDown === false && !this.url) {
                    this.url = url;
                }
                if(this.drillDown === true || this.urlMatches(url)) {
                    layers.push(layer);
                }
            }
        }
        return layers;
    },

    /**
     * Method: buildWMSOptions
     * Build an object with the relevant WMS options for the GetFeatureInfo
     * request.
     *  IGNF: _use the layer's projection (and not map's one)_
     *
     * Parameters:
     * url - {String} The url to be used for sending the request
     * layers - {Array(<OpenLayers.Layer.WMS)} An array of layers
     * clickPosition - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} The position on the map where the mouse
     *     event occurred.
     * format - {String} The format from the corresponding GetMap request
     */
    buildWMSOptions: function(url, layers, clickPosition, format) {
        var layerNames = [], styleNames = [];
        for (var i = 0, len = layers.length; i < len; i++) {
            layerNames = layerNames.concat(layers[i].params.LAYERS);
            styleNames = styleNames.concat(this.getStyleNames(layers[i]));
        }
        var firstLayer = layers[0];
        // use the firstLayer's projection if it matches the map projection -
        // this assumes that all layers will be available in this projection
        // IGNF:
        var projection = this.map.getProjection();
        var layerProj = firstLayer.getNativeProjection();
        var params = OpenLayers.Util.extend({
            service: "WMS",
            version: firstLayer.params.VERSION,
            request: "GetFeatureInfo",
            layers: layerNames,
            query_layers: layerNames,
            styles: styleNames,
            //IGNF begin
            bbox: this.map.getExtent().
                    transform(projection, layerProj).
                    toBBOX(null, layers[0].reverseAxisOrder()),
            // IGNF end
            feature_count: this.maxFeatures,
            height: this.map.getSize().h,
            width: this.map.getSize().w,
            format: format,
            info_format: firstLayer.params.INFO_FORMAT || this.infoFormat
        }, (parseFloat(firstLayer.params.VERSION) >= 1.3) ?
            {
                crs: layerProj,//IGNF:
                i: parseInt(clickPosition.x),
                j: parseInt(clickPosition.y)
            } :
            {
                srs: layerProj,//IGNF:
                x: parseInt(clickPosition.x),
                y: parseInt(clickPosition.y)
            }
        );
        OpenLayers.Util.applyDefaults(params, this.vendorParams);
        return {
            url: url,
            params: OpenLayers.Util.upperCaseObject(params),
            callback: function(request) {
                this.handleResponse(clickPosition, request, url);
            },
            scope: this
        };
    },

    /**
     * Method: handleResponse
     * Handler for the GetFeatureInfo response.
     * IGNF: _test for empty response_
     *
     * Parameters:
     * xy - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} The position on the map where the
     *     mouse event occurred.
     * request - {XMLHttpRequest} The request object.
     * url - {String} The url which was used for this request.
     */
    handleResponse: function(xy, request, url) {

        var doc = request.responseXML;
        if(!doc || !doc.documentElement) {
            doc = request.responseText;
        }
        var features;
        if (doc && this.infoFormat=='application/vnd.ogc.gml') {
            //IGNF: doc might be empty, prevent browser complaining with empty XML ...
            features = this.format.read(doc);
        }

        if (this.drillDown === false) {
            this.triggerGetFeatureInfo(request, xy, features);
        } else {
            this._requestCount++;
            if (this.output === "object") {
                this._features = (this._features || []).concat(
                    {url: url, features: features}
                );
            } else {
                this._features = (this._features || []).concat(features);
            }
            if (this._requestCount === this._numRequests) {
                this.triggerGetFeatureInfo(request, xy, this._features.concat());
                delete this._features;
                delete this._requestCount;
                delete this._numRequests;
            }
        }
    }

    });

}

/**
 * Class: OpenLayers.Format.WMSCapabilities.v1_1_1
 * IGNF: bug fixes on Layer, addition of MetadataURL, DataURL, FeatureListURL.
 */
if (OpenLayers.Format && OpenLayers.Format.WMSCapabilities && OpenLayers.Format.WMSCapabilities.v1_1_1) {

    (function() {

    var _readers_= OpenLayers.Util.extend({}, OpenLayers.Format.WMSCapabilities.v1_1_1.prototype.readers);
    for (var tag in ["Layer", "MetadataURL", "DataURL", "FeatureTypeURL"]) {
        _readers_["wms"][tag]= OpenLayers.Format.WMSCapabilities.v1_1.prototype.readers["wms"][tag];
    }

    OpenLayers.Format.WMSCapabilities.v1_1_1= OpenLayers.overload(OpenLayers.Format.WMSCapabilities.v1_1_1, {

    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     * IGNF: _fix on Layer, support for MetadataURL, dataURL and featureListURL_
     */
    readers: _readers_

    });

    _readers_= null;

    })();
}

/**
 * Class: OpenLayers.Format.WMSCapabilities.v1_1_1_WMSC
 * IGNF: fix on TileSet, Resolutions, addition of Layers, Styles for OSGeo WMS-C.
 */
if (OpenLayers.Format && OpenLayers.Format.WMSCapabilities && OpenLayers.Format.WMSCapabilities.v1_1_1_WMSC) {

    (function() {

    var _readers_= OpenLayers.Util.extend({}, OpenLayers.Format.WMSCapabilities.v1_1_1_WMSC.prototype.readers);
    _readers_['wms']['TileSet']= function(node, obj) {
        var tileset= {
            srs:{},
            bbox:{},
            resolutions:[],
            formats:[],
            layers:[],
            styles:[]
        };
        this.readChildNodes(node, tileset);
        obj.tileSets.push(tileset);
    };
    _readers_['wms']['Resolutions']= function(node, obj) {
        var res= this.getChildValue(node);
        var values= res.split(/ +/);
        var len= values.length;
        if (len>0) {
            for (var i= 0; i<len; i++) {
                values[i]= parseFloat(values[i] || 0.0);
            }
            values.sort(function(a,b){return b - a});//descending order
            obj.resolutions= values;
        }
    };
    _readers_['wms']['Layers']= function(node, obj) {
        if (obj.layers) {
            obj.layers.push(this.getChildValue(node));
        }
    };
    _readers_['wms']['Styles']= function(node, obj) {
        if (obj.styles) {
            obj.styles.push(this.getChildValue(node));
        }
    };

    OpenLayers.Format.WMSCapabilities.v1_1_1_WMSC= OpenLayers.overload(OpenLayers.Format.WMSCapabilities.v1_1_1_WMSC, {

    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     * IGNF: _changes in support of TileSet, Resolutions_
     * IGNF: _support of Layers, Styles_
     */
    readers: _readers_

    });

    _readers_= null;

    })();
}

/**
 * Class: OpenLayers.Format.WMSCapabilities.v1_3_0
 * IGNF: bug fixes on Layer, addition of MetadataURL, DataURL, FeatureListURL.
 */
if (OpenLayers.Format && OpenLayers.Format.WMSCapabilities && OpenLayers.Format.WMSCapabilities.v1_3_0) {

    (function() {

    var _readers_= OpenLayers.Util.extend({}, OpenLayers.Format.WMSCapabilities.v1_3_0.prototype.readers);
    _readers_["wms"]= OpenLayers.Util.extend(_readers_["wms"],OpenLayers.Format.WMSCapabilities.v1_3.prototype.readers["wms"]);

    OpenLayers.Format.WMSCapabilities.v1_3_0= OpenLayers.overload(OpenLayers.Format.WMSCapabilities.v1_3_0, {

    /**
     * Property: readers
     * Contains public functions, grouped by namespace prefix, that will
     *     be applied when a namespaced node is found matching the function
     *     name.  The function will be applied in the scope of this parser
     *     with two arguments: the node being read and a context object passed
     *     from the parent.
     * IGNF: _fix on Layer, support for MetadataURL, dataURL and featureListURL_
     */
    readers: _readers_ 

    });

    _readers_= null;

   })();

}

/**
 * Class: OpenLayers.Control.KeyboardDefaults
 * IGNF: take into account <OpenLayers.Control.activeOverMapOnly at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html#OpenLayers.Control.activeOverMapOnly> flag.
 */
if (OpenLayers.Control && OpenLayers.Control.KeyboardDefaults) {

    OpenLayers.Control.KeyboardDefaults= OpenLayers.overload(OpenLayers.Control.KeyboardDefaults, {

    /**
     * APIProperty: autoActivate
     * {Boolean} Activate the control when it is added to a map.  Default is
     *     true.
     *      IGNF: _turned to false because of activeOverMapOnly option_.
     */
    autoActivate: false,

    /**
     * Property: noUI
     * {Boolean} indicate whether the control has no a user interface.
     *      Defaults to *true*
     */
    noUI: true,

    /**
     * Constructor: OpenLayers.Control.KeyboardDefaults
     * IGNF: _support of activeOverMapOnly_.
     */
    initialize: function() {
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
        if (this.activeOverMapOnly!==true) {//back to 2.10+ defaults !
            this.autoActivate= true;
        }
    },

    /**
     * Method: draw
     * Create handler.
     * IGNF: _support of activeOverMapOnly_.
     */
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this,arguments);//IGNF
        this.handler = new OpenLayers.Handler.Keyboard( this, {
            "keydown": this.defaultKeyPress
        });
        if (this.activeOverMapOnly!==true) {
            this.activate();
        }
    }

    });

}

// FIXME:
///**
// * Class: OpenLayers.Control.ArgParser
// * IGNF: take into account {<OpenLayers.UI>}
// */
//if (OpenLayers.Control && OpenLayers.Control.ArgParser) {
//
//    OpenLayers.Control.ArgParser= OpenLayers.overload(OpenLayers.Control.ArgParser, {
//
//    /**
//     * Property: noUI
//     * {Boolean} indicate whether the control has no a user interface.
//     *      Defaults to *true*
//     */
//    noUI: true
//
//    });
//
//}

/* Mobile */
/**
 * Class: OpenLayers.Control.PinchZoom
 * IGNF: take into account {<OpenLayers.UI>}
 */
if (OpenLayers.Control && OpenLayers.Control.PinchZoom) {

    OpenLayers.Control.PinchZoom= OpenLayers.overload(OpenLayers.Control.PinchZoom, {

    /**
     * Property: noUI
     * {Boolean} indicate whether the control has no a user interface.
     *      Defaults to *true*
     */
    noUI: true

    });

}

/**
 * Class: OpenLayers.Control.TouchNavigation
 * IGNF: take into account {<OpenLayers.UI>}
 */
if (OpenLayers.Control && OpenLayers.Control.TouchNavigation) {

    OpenLayers.Control.TouchNavigation= OpenLayers.overload(OpenLayers.Control.TouchNavigation, {

    /**
     * Property: noUI
     * {Boolean} indicate whether the control has no a user interface.
     *      Defaults to *true*
     */
    noUI: true

    });

}

/**
 * Class: OpenLayers.Protocol.String
 * A basic String protocol for vector layers (read-only).  Create a new
 * instance with the <OpenLayers.Protocol.String at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Protocol/String-js.html> constructor.
 * IGNF: addition to support serialized input strings instead of service URL.
 *
 * Inherits from:
 *  - <OpenLayers.Protocol at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Protocol-js.html>
 */
if (OpenLayers.Protocol && !OpenLayers.Protocol.String) {

OpenLayers.Protocol.String = OpenLayers.Class(OpenLayers.Protocol, {

    /**
     * Property: data
     * {String|Document} Serialized data or object, read-only, set through the
     * options passed to constructor.
     */
    data: null,

    /**
     * Constructor: OpenLayers.Protocol.String
     * A class for giving layers generic String protocol.
     *
     * Parameters:
     * options - {Object} Optional object whose properties will be set on the
     *     instance.
     *
     * Valid options include:
     * data - {String} the serialized data
     * format - {<OpenLayers.Format at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Format-js.html>}
     * callback - {Function}
     * scope - {Object}
     */
    initialize: function(options) {
        OpenLayers.Protocol.prototype.initialize.apply(this, arguments);
    },

    /**
     * APIMethod: destroy
     * Clean up the protocol.
     */
    destroy: function() {
        OpenLayers.Protocol.prototype.destroy.apply(this);
    },

    /**
     * APIMethod: read
     * Construct a request for reading new features.
     *
     * Parameters:
     * options - {Object} Optional object for configuring the request.
     *
     * Valid options:
     * data - {String|Document} the serialized data
     *
     * Returns:
     * {<OpenLayers.Protocol.Response at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Protocol/Response-js.html>}
     * An <OpenLayers/Protocol/Response at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Protocol/Response-js.html>
     * object, the same object will be passed to the callback function passed
     * if one exists in the options object.
     */
    read: function(options) {
        OpenLayers.Protocol.prototype.read.apply(this, arguments);
        options= OpenLayers.Util.applyDefaults(options, this.options);
        var resp= new OpenLayers.Protocol.Response({requestType: "read"});
        resp.priv= {
            status:200,
            responseText:typeof(this.data)=='string'? this.data:null,
            responseXML:typeof(this.data)!='string'? this.data:null
        };
        resp.features= this.format.read(this.data);
        resp.code = OpenLayers.Protocol.Response.SUCCESS;
        if (options.callback) {
            options.callback.call(options.scope, resp);
        }
        return resp;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *OpenLayers.Protocol.String*
     */
    CLASS_NAME: "OpenLayers.Protocol.String"
});

}

/*
 * OpenLayers Addins :
 */

/* Copyright (c) 2006-2007 MetaCarta, Inc., published under a modified BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/repository-license.txt
 * for the full text of the license. */

/**
 * @ requires OpenLayers/Control.js
 */
if (OpenLayers.Control && !OpenLayers.Control.Click) {

/**
 * Class: OpenLayers.Control.Click
 * The click handler can be used to gain more flexibility over handling
 * click events.  The handler can be constructed with options to handle
 * only single click events, to handle single and double-click events,
 * to ignore clicks that include a drag, and to stop propagation of
 * single and/or double-click events.  A single click is a click that
 * is not followed by another click for more than 300ms.  This delay
 * is configured with the delay property.
 *
 * The options to stop single and double clicks have to do with
 * stopping event propagation on the map events listener queue
 * (not stopping events from cascading to other elements).  The
 * ability to stop an event from propagating has to do with the
 * order in which listeners are registered.  With stopSingle or
 * stopDouble true, a click handler will stop propagation to all
 * listeners that were registered (or all handlers that were
 * activated) before the click handler was activated.  So, for
 * example, activating a click handler with stopDouble true after
 * the navigation control is active will stop double-clicks from
 * zooming in.
 *
 * IGNF: _copied from click-handler.html (OpenLayers examples)_.
 *
 * Inherits from:
 *  - <OpenLayers.Control at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Control-js.html>
 *
 */
OpenLayers.Control.Click= OpenLayers.Class(OpenLayers.Control, {

    /**
     * Property: defaultHandlerOptions
     * {Object} Default settings for <OpenLayers.Handler.Click> :
     *      * single: true,
     *      * double: true,
     *      * pixelTolerance: 0,
     *      * stopSingle: false,
     *      * stopDouble: false
     */
    defaultHandlerOptions: {
        'single': true,
        'double': false,
        'pixelTolerance': 0,
        'stopSingle': false,
        'stopDouble': false
    },

    /**
     * Constructor: OpenLayers.Control.Click
     *
     * Parameters:
     * options - {Object}
     */
    initialize: function(options) {
        this.handlerOptions= OpenLayers.Util.extend({}, this.defaultHandlerOptions);
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
        this.handler= new OpenLayers.Handler.Click(
            this,
            {
                'click': this.onClick,
                'dblclick': this.onDblclick
            },
            this.handlerOptions);
    },

    /**
     * APIProperty: onClick
     * {Function} called on a mouse "click" event. Expect an {Event}
     * parameter.
     *      Does nothing by default.
     */
    onClick: function(evt) {},

    /**
     * APIProperty: onDlbClick
     * {Function} called on a mouse "dblclick" event. Expect an {Event}
     * parameter.
     *      Does nothing by default.
     */
    onDblclick: function(evt) {},

    /**
     * Constant: CLASS_NAME
     * {String} *"OpenLayers.Control.Click"*
     */
    CLASS_NAME: "OpenLayers.Control.Click"
});



}

/**
 * Class: OpenLayers.Control.Measure
 * See http://trac.openlayers.org/ticket/2501
 * See http://trac.openlayers.org/ticket/2096
 * See http://trac.openlayers.org/ticket/2820
 */

if (OpenLayers.Control.Measure) {

    OpenLayers.Control.Measure= OpenLayers.overload(OpenLayers.Control.Measure, {

    /**
     * Method: measure
     * IGNF: redesign to use <getMeasure>
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry-js.html>}
     * eventType - {String}
     */
    measure: function(geometry, eventType) {
        this.events.triggerEvent(eventType, this.getMeasure(geometry));
    },

    /**
     * APIFunction: getMeasure
     * Calculate measurement on geometry.
     *      As a public method, subclasses could overwrite it.
     * IGNF: _check on gemetry type_
     *
     * Parameters:
     * geometry - {<OpenLayers.Geometry at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry-js.html>}
     *
     * Returns:
     * {Object} Measurement information:
     *      * measure: measurement value;
     *      * units: measurement unit;
     *      * order: 1 for length, 2 for area (can be extended);
     *      * geometry: geometry used for measuring.
     */
    getMeasure: function(geometry) {
        var stat, order;
        if (geometry instanceof OpenLayers.Geometry.LineString) {//IGNF
            stat= this.getBestLength(geometry);
            order= 1;
        } else {
            stat= this.getBestArea(geometry);
            order= 2;
        }
        return {
            'measure': stat[0],
            'units': stat[1],
            'order': order,
            'geometry': geometry
        };
    }

    });

}

