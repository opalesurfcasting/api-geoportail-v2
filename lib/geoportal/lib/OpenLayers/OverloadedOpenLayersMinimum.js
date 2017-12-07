/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license.
 */

/**
 * Header: Overloaded classes and methods (part I/III)
 *      OpenLayers amendments/tickets.
 *      Some bug fixes, new functions and GeoRM handler.
 */
window.OpenLayers= window.OpenLayers || {};

/**
 * Namespace: OpenLayers
 * IGNF: add a property to store the current document and then make OpenLayers
 * aware of it.
 */

    /**
     * Property: _document
     * {DOMElement} the current working document.
     * IGNF: _addition_.
     */
    OpenLayers._document= null;

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

    /**
     * APIFunction: setDoc
     * Assign the current working document.
     * IGNF: _addition_.
     *
     * Parameters:
     * d - {DOMElement} the current document
     *
     * Returns:
     * {DOMElement} the document
     */
    OpenLayers.setDoc= function(d) {
        OpenLayers._document= d;
    };

/**
 * Class: OpenLayers.Class
 * IGNF: since OL 2.11 the behavior of OpenLayers.Class has completly changed
 * the way of overloading constructor. The newly added function overload tries
 * to propose a workaround to facilitate this !
 */
if (!OpenLayers.Class) { alert("OpenLayers.Class is mandatory") };

    /**
     * Function: OpenLayers.overload
     * Apply the patch to the given class and propagate it downward
     * to the sub-classes by insuring that only not overwritten
     * methods() or properties are overloaded.
     *
     * Parameters:
     * P - {Object} an instance of {<OpenLayers.Class at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Class-js.html>}
     * F - {Object} an object used to overwrite methods (including
     * constructor) and properties of P and its sub-classes.
     *
     * Returns:
     * {Object} the overloaded instance of given {<OpenLayers.Class at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Class-js.html>}
     */
    if (typeof(OpenLayers.inherit)!=="function") {//OL 2.10-

        OpenLayers.overload= function(P,F) {
            var pProtoInitialize= typeof(F.initialize)=="function"?
                P.prototype.initialize
            :   null;
            OpenLayers.Util.extend(P.prototype, F);
            if (pProtoInitialize!==null) {
                // override sub-class having same constructor:
                for (var pn in P) {
                    if (typeof(P[pn])=='function' && P[pn].prototype.initialize===pProtoInitialize) {
                        var f= {};
                        f= eval('{"initialize":'+F.initialize.toString()+'}');
                        P[pn]= OpenLayers.overload(P[pn],f);
                    }
                }
            }

            return P;
        };

    } else {
        OpenLayers.overload= function(P,F) {
            // if P has no method initialize it doesn't means it isn't a class
            if (typeof(F.initialize)==="function" /*&& P===P.prototype.initialize*/) {
                // OL 2.11
                var pProto= P.prototype;
                var sProps= OpenLayers.Util.extend({}, P);
                P= F.initialize;
                P.prototype= pProto;
                OpenLayers.Util.extend(P, sProps);
            }
            OpenLayers.Util.extend(P.prototype, F);

            return P;
        };

    }

/**
 * Class: OpenLayers.Bounds
 * IGNF: bounds reprojection is not reprojection of bounds ...
 */
if (OpenLayers.Bounds) {

    OpenLayers.Bounds= OpenLayers.overload(OpenLayers.Bounds, {

    // OL 2.12 method (TBD)
    /**
     * APIMethod: intersectsBounds
     * Determine whether the target bounds intersects this bounds.  Bounds are
     *     considered intersecting if any of their edges intersect or if one
     *     bounds contains the other.
     * 
     * Parameters:
     * bounds - {<OpenLayers.Bounds>} The target bounds.
     * options - {Object} Optional parameters.
     * 
     * Acceptable options:
     * inclusive - {Boolean} Treat coincident borders as intersecting.
     * Default
     *     is true.  If false, bounds that do not overlap but only touch at
     *     the
     *     border will not be considered as intersecting.
     * worldBounds - {<OpenLayers.Bounds>} If a worldBounds is provided, two
     *     bounds will be considered as intersecting if they intersect when 
     *     shifted to within the world bounds.  This applies only to bounds
     *     that
     *     cross or are completely outside the world bounds.
     *
     * Returns:
     * {Boolean} The passed-in bounds object intersects this bounds.
     */
    intersectsBounds:function(bounds, options) {
        if (typeof options === "boolean") {
            options =  {inclusive: options};
        }
        options = options || {};
        if (options.worldBounds) {
            var self = this.wrapDateLine(options.worldBounds);
            bounds = bounds.wrapDateLine(options.worldBounds);
        } else {
            self = this;
        }
        if (options.inclusive == null) {
            options.inclusive = true;
        }
        var intersects = false;
        var mightTouch = (
            self.left == bounds.right ||
            self.right == bounds.left ||
            self.top == bounds.bottom ||
            self.bottom == bounds.top
        );

        // if the two bounds only touch at an edge, and inclusive is false,
        // then the bounds don't *really* intersect.
        if (options.inclusive || !mightTouch) {
            // otherwise, if one of the boundaries even partially contains another,
            // inclusive of the edges, then they do intersect.
            var inBottom = (
                ((bounds.bottom >= self.bottom) && (bounds.bottom <= self.top)) ||
                ((self.bottom >= bounds.bottom) && (self.bottom <= bounds.top))
            );
            var inTop = (
                ((bounds.top >= self.bottom) && (bounds.top <= self.top)) ||
                ((self.top > bounds.bottom) && (self.top < bounds.top))
            );
            var inLeft = (
                ((bounds.left >= self.left) && (bounds.left <= self.right)) ||
                ((self.left >= bounds.left) && (self.left <= bounds.right))
            );
            var inRight = (
                ((bounds.right >= self.left) && (bounds.right <= self.right)) ||
                ((self.right >= bounds.left) && (self.right <= bounds.right))
            );
            intersects = ((inBottom || inTop) && (inLeft || inRight));
        }
        // document me
        if (options.worldBounds && !intersects) {
            var world = options.worldBounds;
            var width = world.getWidth();
            var selfCrosses = !world.containsBounds(self);
            var boundsCrosses = !world.containsBounds(bounds);
            if (selfCrosses && !boundsCrosses) {
                bounds = bounds.add(-width, 0);
                intersects = self.intersectsBounds(bounds, {inclusive: options.inclusive});
            } else if (boundsCrosses && !selfCrosses) {
                self = self.add(-width, 0);
                intersects = bounds.intersectsBounds(self, {inclusive: options.inclusive});
            }
        }
        return intersects;
    },

    /**
     * APIMethod: transform
     *      IGNF: _bug fix in OL 2.6-2.10,
     *            use an accurate transform when needed_.
     *
     * Parameters:
     * source - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} source map coordinate system
     * dest - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} destination map coordinate system
     * accurate - {Boolean} true if accuracy is needed, false otherwise (IGNF).
     *
     * Returns:
     * {OpenLayers.Bounds}
     */
    transform: function(source,dest,accurate) {
        if (!accurate) {
            // this fix a bug since OL 2.6 :
            var ll= OpenLayers.Projection.transform({'x':this.left,'y':this.bottom},source,dest);
            var ur= OpenLayers.Projection.transform({'x':this.right,'y':this.top},source,dest);
            this.left= Math.min(ll.x, ur.x);
            this.bottom= Math.min(ll.y, ur.y);
            this.right= Math.max(ur.x, ll.x);
            this.top=  Math.max(ur.y, ll.y);
            return this;
        }
        // precise reprojection : we considerer that just reprojecting the
        // extent is really not accurate : a rectangle in a given projection
        // is not a rectangle in another projection. The idea is to densify
        // the bounds up until we have enough points ...
        var precision= dest.getProjName()=='longlat'? 0.000028:1.0;
        // iterate up until the reprojected bounds is stable
        var left, bottom, right, top;
        var step= 1;
        // 2^3 iterations seem to be a max for small scales
        for (var i= 0; i<7; i++) {
            var dx= (this.right - this.left)/(1.0*step);
            var dy= (this.top - this.bottom)/(1.0*step);
            var p;
            var nleft, nbottom, nright, ntop;
            var pts= [], npts= 0;
            for (var j= 0; j<step; j++) {
                pts[npts++]= {'x':this.left  + j*dx,  'y':this.bottom};
                pts[npts++]= {'x':this.right,         'y':this.bottom + j*dy};
                pts[npts++]= {'x':this.right - j *dx, 'y':this.top};
                pts[npts++]= {'x':this.left,          'y':this.top    - j*dy};
            }
            pts= OpenLayers.Projection.transform(pts, source, dest);
            if (nleft==undefined) {
                nleft= nright= pts[0].x; nbottom= ntop= pts[0].y;
            }
            for (var ipts= 0; ipts<npts; ipts++) {
                p= pts[ipts];
                if (p.x < nleft) { nleft= p.x; }
                if (p.y < nbottom) { nbottom= p.y; }
                if (p.x > nright) { nright= p.x; }
                if (p.y > ntop) { ntop= p.y; }
            }
            pts= null;
            if (left!=undefined &&
                Math.abs(nleft - left) < precision &&
                Math.abs(nbottom - bottom) < precision &&
                Math.abs(nright - right) < precision &&
                Math.abs(ntop - top) < precision) {
                this.left= nleft;
                this.bottom= nbottom;
                this.right= nright;
                this.top= ntop;
                return this;
            }
            left= nleft;
            bottom= nbottom;
            right= nright;
            top= ntop;
            step*=2;
        }
        this.left= left;
        this.bottom= bottom;
        this.right= right;
        this.top= top;
        return this;
    }

    });

}

/**
 * Class: OpenLayers.LonLat
 * IGNF: addition of coordinates resolution when reprojecting.
 */
if (OpenLayers.LonLat) {

    OpenLayers.LonLat= OpenLayers.overload(OpenLayers.LonLat, {

    /**
     * APIMethod: equals
     *      IGNF: _refactoring to take into account resolution_.
     *
     * Parameters:
     * ll - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>}
     * rz - {Float} coordinates resolution (IGNF).
     *
     * Returns:
     * {Boolean} Boolean value indicating whether the passed-in
     *           <OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html> object has the same lon and lat
     *           components as this.
     *           Note: if ll passed in is null, returns false
     */
    equals: function(ll,rz) {
        var equals = false;
        if (!rz) {
            rz= 1e-6;
        }
        if (ll != null) {
            var dlon= (!isNaN(this.lon) && !isNaN(ll.lon))
                        ? Math.abs(this.lon - ll.lon)
                        : 1.0;
            var dlat= (!isNaN(this.lat) && !isNaN(ll.lat))
                        ? Math.abs(this.lat - ll.lat)
                        : 1.0;
            equals = ((dlon<=rz && dlat<=rz) ||
                      (isNaN(this.lon) && isNaN(this.lat) && isNaN(ll.lon) && isNaN(ll.lat)));
        }
        return equals;
    }

    });

}

/**
 * Namespace: OpenLayers.Lang
 * IGNF: addition of 'W', 'E', 'N', 'S', 'no.proj.implementation.found',
 *       'unknown.crs' and 'dd' keys.
 */

OpenLayers.Lang= OpenLayers.Lang || {};

/**
 * Namespace: OpenLayers.Lang["en"]
 */
OpenLayers.Lang.en= OpenLayers.Lang.en || {};
OpenLayers.Lang.en['no.proj.implementation.found']= 'No implementation for Projection handling found';
OpenLayers.Lang.en['unknown.crs']= 'Unknown CRS : ${crs}';
OpenLayers.Lang.en['dd']= 'degrees';

/**
 * Namespace: OpenLayers.Lang["de"]
 */
OpenLayers.Lang.de= OpenLayers.Lang.de || OpenLayers.Util.applyDefaults({}, OpenLayers.Lang["en"]);
OpenLayers.Lang.de['no.proj.implementation.found']= 'Keine umsetzung für projektions-handling gefunden';
OpenLayers.Lang.de['unknown.crs']= 'Unknown CRS : ${crs}';
OpenLayers.Lang.de['dd']= 'grad';

/**
 * Namespace: OpenLayers.Lang["es"]
 */
OpenLayers.Lang.es= OpenLayers.Lang.es || OpenLayers.Util.applyDefaults({}, OpenLayers.Lang["en"]);
OpenLayers.Lang.es['W']= 'Oe';
OpenLayers.Lang.es['E']= 'Or';
OpenLayers.Lang.es['no.proj.implementation.found']= 'No aplicación para el manejo de proyección encontrado';
OpenLayers.Lang.es['unknown.crs']= 'Unknown CRS : ${crs}';
OpenLayers.Lang.es['dd']= 'grados';

/**
 * Namespace: OpenLayers.Lang["fr"]
 */
OpenLayers.Lang.fr= OpenLayers.Lang.fr || OpenLayers.Util.applyDefaults({}, OpenLayers.Lang["en"]);
OpenLayers.Lang.fr['no.proj.implementation.found']= "Aucune implémentation d'un gestionnaire de projections n'a été chargé";
OpenLayers.Lang.fr['unknown.crs']= 'CRS inconnu : ${crs}';
OpenLayers.Lang.fr['dd']= 'degrés';

/**
 * Namespace: OpenLayers.Lang["it"]
 */
OpenLayers.Lang.it= OpenLayers.Lang.it || OpenLayers.Util.applyDefaults({}, OpenLayers.Lang["en"]);
OpenLayers.Lang.it['W']= 'O';
OpenLayers.Lang.it['E']= 'E';
OpenLayers.Lang.it['N']= 'N';
OpenLayers.Lang.it['S']= 'S';
OpenLayers.Lang.it['no.proj.implementation.found']= 'No di attuazione per la gestione di proiezione trovato';
OpenLayers.Lang.it['unknown.crs']= 'Unknown CRS : ${crs}';
OpenLayers.Lang.it['dd']= 'gradi';

/**
 * Namespace: OpenLayers.Util
 * IGNF: addition of new conversions from inches : deg, degre, degree, rad,
 *       gon, meters, meter, metres, metre.
 */
if (OpenLayers.Util) {

    /**
     * Constant: INCHES_PER_UNIT
     * IGNF: _addition of deg, degre, degree, rad, gon, meters, meter, metres,
     * metre_.
     */
    OpenLayers.Util.extend(OpenLayers.INCHES_PER_UNIT, {
        "deg"   : OpenLayers.INCHES_PER_UNIT.dd,
        "degre" : OpenLayers.INCHES_PER_UNIT.dd,
        "degree": OpenLayers.INCHES_PER_UNIT.dd,
        "rad"   : OpenLayers.INCHES_PER_UNIT.dd * 0.01745329251994329577,
        "gon"   : OpenLayers.INCHES_PER_UNIT.dd * 1.111111111111111111,
        "m"     : OpenLayers.INCHES_PER_UNIT["Meter"],
        "meters": OpenLayers.INCHES_PER_UNIT["Meter"],
        "meter" : OpenLayers.INCHES_PER_UNIT["Meter"],
        "metres": OpenLayers.INCHES_PER_UNIT["Meter"],
        "metre" : OpenLayers.INCHES_PER_UNIT["Meter"]
    });

    /**
     * APIFunction: getResolutionFromScale
     *      IGNF: _bug fix when units is not defined_.
     *
     * Parameters:
     * scale - {Float}
     * units - {String} Index into OpenLayers.INCHES_PER_UNIT hashtable.
     *                  Default is degrees
     *
     * Returns:
     * {Float} The corresponding resolution given passed-in scale and unit
     *         parameters.
     */
    OpenLayers.Util.getResolutionFromScale= function (scale, units) {
        var resolution;
        if (scale) {
            if (units == null || OpenLayers.INCHES_PER_UNIT[units]==undefined) {
                units = "degrees";
            }

            var normScale = OpenLayers.Util.normalizeScale(scale);

            resolution = 1 / (normScale * OpenLayers.INCHES_PER_UNIT[units]
                                            * OpenLayers.DOTS_PER_INCH);
        }
        return resolution;
    };

    /**
     * APIFunction: getScaleFromResolution
     *      IGNF: _bug fix when units is not defined_.
     *
     * Parameters:
     * resolution - {Float}
     * units - {String} Index into OpenLayers.INCHES_PER_UNIT hashtable.
     *                  Default is degrees
     *
     * Returns:
     * {Float} The corresponding scale given passed-in resolution and unit
     *         parameters.
     */
    OpenLayers.Util.getScaleFromResolution= function (resolution, units) {

        if (units == null || OpenLayers.INCHES_PER_UNIT[units]==undefined) {
            units = "degrees";
        }

        var scale = resolution * OpenLayers.INCHES_PER_UNIT[units] *
                    OpenLayers.DOTS_PER_INCH;
        return scale;
    };

    /**
     * Function: rad
     * Convert a decimal degrees angle into radians.
     *      IGNF: _faster implementation than OpenLayers's one_.
     *
     * Parameters:
     * x - {Float}
     *
     * Returns:
     * {Float}
     */
    OpenLayers.Util.rad= function(x) {return x*0.01745329251994329577;};

    /**
     * Function: deg
     * Convert a radians angle into decimal degrees.
     *      IGNF: _faster implementation than OpenLayers's one_.
     *
     * Parameters:
     * x - {Float}
     *
     * Returns:
     * {Float}
     */
    OpenLayers.Util.deg= function(x) {return x*57.29577951308232088;};

    /**
     * Function: gon
     * Convert a radians angle into grades.
     *      IGNF: _addition_
     *
     * Parameters:
     * x - {Float}
     *
     * Returns:
     * {Float}
     */
    OpenLayers.Util.gon= function(x) {return x*1.111111111111111111;} ;

    /**
     * Function: distVincenty
     * Given two objects representing points with geographic coordinates, this
     *     calculates the distance between those points on the surface of an
     *     ellipsoid.
     *
     * Parameters:
     * p1 - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>} (or any object with both .lat, .lon properties)
     * p2 - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>} (or any object with both .lat, .lon properties)
     * crs - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} optional projection to get the
     *      ellipsoid parameters. If none, use WGS84 ellipsoid (IGNF
     *      addition). IGNF: _addition_
     *
     * Returns:
     * {Float} The distance (in km) between the two input points as measured on an
     *     ellipsoid.  Note that the input point objects must be in geographic
     *     coordinates (decimal degrees) and the return distance is in kilometers.
     */
    OpenLayers.Util.distVincenty= function(p1, p2, crs) {
        if (crs==undefined || !(crs instanceof OpenLayers.Projection)) {
            crs= OpenLayers.Projection.CRS84;
        }
        var a= crs.getProperty('semi_major') || 6378137.0,
            b= crs.getProperty('semi_minor') || 6356752.3142,
            f= crs.getProperty('inverse_flattening') || 298.257223563;
        f= 1/f;
        var L = OpenLayers.Util.rad(p2.lon - p1.lon);
        var U1 = Math.atan((1-f) * Math.tan(OpenLayers.Util.rad(p1.lat)));
        var U2 = Math.atan((1-f) * Math.tan(OpenLayers.Util.rad(p2.lat)));
        var sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
        var sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);
        var lambda = L, lambdaP = 2*Math.PI;
        var iterLimit = 20;
        while (Math.abs(lambda-lambdaP) > 1e-12 && --iterLimit>0) {
            var sinLambda = Math.sin(lambda), cosLambda = Math.cos(lambda);
            var sinSigma = Math.sqrt((cosU2*sinLambda) * (cosU2*sinLambda) +
                (cosU1*sinU2-sinU1*cosU2*cosLambda) * (cosU1*sinU2-sinU1*cosU2*cosLambda));
            if (sinSigma==0) {
                return 0;  // co-incident points
            }
            var cosSigma = sinU1*sinU2 + cosU1*cosU2*cosLambda;
            var sigma = Math.atan2(sinSigma, cosSigma);
            var alpha = Math.asin(cosU1 * cosU2 * sinLambda / sinSigma);
            var cosSqAlpha = Math.cos(alpha) * Math.cos(alpha);
            var cos2SigmaM = cosSigma - 2*sinU1*sinU2/cosSqAlpha;
            var C = f/16*cosSqAlpha*(4+f*(4-3*cosSqAlpha));
            lambdaP = lambda;
            lambda = L + (1-C) * f * Math.sin(alpha) *
                (sigma + C*sinSigma*(cos2SigmaM+C*cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)));
        }
        if (iterLimit==0) {
            return NaN;  // formula failed to converge
        }
        var uSq = cosSqAlpha * (a*a - b*b) / (b*b);
        var A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
        var B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));
        var deltaSigma = B*sinSigma*(cos2SigmaM+B/4*(cosSigma*(-1+2*cos2SigmaM*cos2SigmaM)-
            B/6*cos2SigmaM*(-3+4*sinSigma*sinSigma)*(-3+4*cos2SigmaM*cos2SigmaM)));
        var s = b*A*(sigma-deltaSigma);
        var d = s.toFixed(3)/1000; // round to 1mm precision
        return d;
    };

    /**
     * Function: resolveUrl
     * Computes the absolute URL based on the given base URL.
     *
     * Parameters:
     * base - {String} base URL. If none, use current location href.
     * rel - {String} relative URL.
     *
     * Returns:
     * {String} the absolute URL.
     */
    OpenLayers.Util.resolveUrl= function(base, rel) {
        rel= rel || '';
        if (rel.match(/^\//)) {
            rel= window.location.protocol+'//'+window.location.host+rel;
        }
        var u= window.location.href.split('/');
        var f= u.pop();
        var burl= u.join('/')+'/';
        base= base || burl;
        //          schema            domain              path     querystring    fragment
        var purl= /^(?:([^:\/?\#]+):)?(?:\/\/([^\/?\#]*))?([^?\#]*)(?:\?([^\#]*))?(?:\#(.*))?/;
        var prel= rel.match(purl);
        if (prel[1]) { return rel; } //is absolute !
        // clean ...
        rel= rel.replace(/\/\.\//g, '/');
        rel= rel.replace(/\/\.$/, '/');
        var rx= /\/((?!\.\.\/)[^\/]*)\/\.\.\//;
        while (rel.match(rx)) {
            rel= rel.replace(rx, '/');
        }
        rel= rel.replace(/\/([^\/]*)\/\.\.$/, '/');

        var pbas= base.match(purl);
        if (pbas[2] && !pbas[3]) {
            return '/'+rel;
        }
        rx= /^(.*)\//;
        return base.match(rx)[0]+rel;
    };

}

/**
 * Class: OpenLayers.Control
 */
if (OpenLayers.Control) {

/**
 * Class: OpenLayers.UI
 * Fake class for {<Geoportal.Control>}
 */
OpenLayers.UI= OpenLayers.UI || OpenLayers.Class({

    /**
     * Constructor: OpenLayers.UI
     * Fake constructor
     *
     * Parameters:
     * options - {Object}
     */
    initialize: function (options) {
    }

});

}

/**
 * Class: OpenLayers.Feature.Vector
 * IGNF: add a call to OpenLayers.Feature for popup deletion.
 */
if (OpenLayers.Feature && OpenLayers.Feature.Vector) {

    OpenLayers.Feature.Vector= OpenLayers.overload(OpenLayers.Feature.Vector, {

    /**
     * Method: destroyPopup
     * HACK - we need to decide if all vector features should be able to
     * delete popups
     * IGNF - calls superclass destroyPopup().
     */
    destroyPopup: function() {
        OpenLayers.Feature.prototype.destroyPopup.apply(this,arguments);
    }

    });

}

/**
 * Class: OpenLayers.Rule
 * IGNF: bug fix on clone method when context is a function
 */
if (OpenLayers.Rule) {

    OpenLayers.Rule= OpenLayers.overload(OpenLayers.Rule, {

    /**
     * APIMethod: clone
     * Clones this rule.
     * 
     * Returns:
     * {<OpenLayers.Rule>} Clone of this rule.
     */
    clone: function() {
        var options = OpenLayers.Util.extend({}, this);
        if (this.symbolizers) {
            // clone symbolizers
            var len = this.symbolizers.length;
            options.symbolizers = new Array(len);
            for (var i=0; i<len; ++i) {
                options.symbolizers[i] = this.symbolizers[i].clone();
            }
        } else {
            // clone symbolizer
            options.symbolizer = {};
            var value, type;
            for(var key in this.symbolizer) {
                value = this.symbolizer[key];
                type = typeof value;
                if(type === "object") {
                    options.symbolizer[key] = OpenLayers.Util.extend({}, value);
                } else if(type === "string") {
                    options.symbolizer[key] = value;
                }
            }
        }
        // clone filter
        options.filter = this.filter && this.filter.clone();
        // clone context
        //options.context = this.context && OpenLayers.Util.extend({}, this.context);
        //IGNF:
        options.context = typeof this.context === "function" ?
            this.context
        :   this.context && OpenLayers.Util.extend({}, this.context);
        return new OpenLayers.Rule(options);
    }

    });

}

/**
 * Class: OpenLayers.Format.XML
 * IGNF: bug fixes
 */
if (OpenLayers.Format && OpenLayers.Format.XML) {

    OpenLayers.Format.XML= OpenLayers.overload(OpenLayers.Format.XML, {

    /**
     * APIMethod: write
     * Serialize a DOM node into a XML string.
     *      IGNF: _bug fix (use of node.xml instead of this.xmldom)
     *            aware of the current document_.
     *
     * Parameters:
     * node - {DOMElement} A DOM node.
     *
     * Returns:
     * {String} The XML string representation of the input node.
     */
    write: function(node) {
        var data;
        if(node.xml!=undefined) {//IGNF: instead of this.xmldom
            data = node.xml;
        } else {
            var serializer = new XMLSerializer();
            if (node.nodeType == 1) {
                // Add nodes to a document before serializing. Everything else
                // is serialized as is. This may need more work. See #1218 .
                var doc = OpenLayers.getDoc().implementation.createDocument("", "", null);
                if (doc.importNode) {
                    node = doc.importNode(node, true);
                }
                doc.appendChild(node);
                data = serializer.serializeToString(doc);
            } else {
                data = serializer.serializeToString(node);
            }
        }
        return data;
    },

    /**
     * APIMethod: setAttributeNS
     * Adds a new attribute or changes the value of an attribute with the given
     *     namespace and name.
     *      IGNF: _fix for null values and i18n support_.
     *
     * Parameters:
     * node - {Element} Element node on which to set the attribute.
     * uri - {String} Namespace URI for the attribute.
     * name - {String} Qualified name (prefix:localname) for the attribute.
     * value - {String} Attribute value.
     */
    setAttributeNS: function(node, uri, name, value) {
        if (value==null || value==undefined) { value= ''; }//IGNF
        if(node.setAttributeNS) {
            node.setAttributeNS(uri, name, value);
        } else {
            if(this.xmldom) {
                if(uri) {
                    var attribute = node.ownerDocument.createNode(
                        2, name, uri
                    );
                    attribute.nodeValue = value;
                    node.setAttributeNode(attribute);
                } else {
                    node.setAttribute(name, value);
                }
            } else {
                throw OpenLayers.i18n('xml.setattributens');//IGNF
            }
        }
    },

    /**
     * Method: writeNode
     * Shorthand for applying one of the named writers and appending the
     *     results to a node.  If a qualified name is not provided for the
     *     second argument (and a local name is used instead), the namespace
     *     of the parent node will be assumed.
     *     IGNF: _check state of child node_.
     *
     * Parameters:
     * name - {String} The name of a node to generate.  If a qualified name
     *     (e.g. "pre:Name") is used, the namespace prefix is assumed to be
     *     in the <writers> group.  If a local name is used (e.g. "Name") then
     *     the namespace of the parent is assumed.  If a local name is used
     *     and no parent is supplied, then the default namespace is assumed.
     * obj - {Object} Structure containing data for the writer.
     * parent - {DOMElement} Result will be appended to this node.  If no parent
     *     is supplied, the node will not be appended to anything.
     *
     * Returns:
     * {DOMElement} The child node.
     */
    writeNode: function(name, obj, parent) {
        var prefix, local;
        var split = name.indexOf(":");
        if(split > 0) {
            prefix = name.substring(0, split);
            local = name.substring(split + 1);
        } else {
            if(parent) {
                prefix = this.namespaceAlias[parent.namespaceURI];
            } else {
                prefix = this.defaultPrefix;
            }
            local = name;
        }
        var child = this.writers[prefix][local].apply(this, [obj]);
        if(parent && child) {//IGNF
            parent.appendChild(child);
        }
        return child;
    }

    });

}

/**
 * Class: OpenLayers.Format.XML.VersionedOGC
 * IGNF: @see read
 */
if (OpenLayers.Format && OpenLayers.Format.XML && OpenLayers.Format.XML.VersionedOGC) {

OpenLayers.Format.XML.VersionedOGC = OpenLayers.Class(OpenLayers.Format.XML.VersionedOGC, {
    
    /**
     * APIMethod: read
     * Read a doc and return an object representing the document.
     *      IGNF: _modified to read XML fragment and the result only holds the
     *      version if it is not an Array (for reading <OpenLayers.Feature at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature-js.html>
     *      instead of only capabilities)._
     *
     * Parameters:
     * data - {String | DOMElement} Data to read.
     * options - {Object} Options for the reader.
     *
     * Returns:
     * {Object} An object representing the document.
     */
    read: function(data, options) {
        if(typeof data == "string") {
            data = OpenLayers.Format.XML.prototype.read.apply(this, [data]);
        }
        //IGNF: var root = data.documentElement;
        var root = data.nodeType==9? data.documentElement : data;
        var version = this.getVersion(root);
        this.parser = this.getParser(version);
        //IGNF: var obj = this.parser.read(data, options);
        var obj = this.parser.read(root, options);
        if (obj) {
            if (this.errorProperty !== null && obj[this.errorProperty] === undefined) {
                // an error must have happened, so parse it and report back
                var format = new OpenLayers.Format.OGCExceptionReport();
                //IGNF: obj.error = format.read(data);
                obj.error = format.read(root);
            }
            //IGNF: obj.version = version;
            if (!(OpenLayers.Util.isArray(obj))) {
                obj.version = version;
            }
        }
        return obj;
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
     * Method: read
     * Read capabilities data from a string, and return a list of layers.
     *
     * Parameters:
     * data - {String} or {DOMElement} data to read/parse.
     *
     * Returns:
     * {Array} List of named layers.
     */
    read: function(data) {
        if(typeof data == "string") {
            data = OpenLayers.Format.XML.prototype.read.apply(this, [data]);
        }
        //IGNF:var root = data.documentElement;
        var root = data.nodeType==9? data.documentElement : data;
        this.rootPrefix = root.prefix;
        var context = {
            version: root.getAttribute("version")
        };
        this.runChildNodes(context, root);
        return context;
    },

    /**
     * Method: read_wmc_Server
     * IGNF: _addition of service attribute_
     */
    read_wmc_Server: function(layerContext, node) {
        //IGNF
        var serv= node.getAttribute("service");
        layerContext.metadata.type= serv || "OGC:WMS";

        layerContext.version = node.getAttribute("version");
        layerContext.url = this.getOnlineResource_href(node);
        layerContext.metadata.servertitle = node.getAttribute("title");
    },

    /**
     * Method: read_wmc_dataURL
     *  IGNF: _addition_
     */
    read_wmc_dataURL: function(layerInfo, node) {
        var dataURL= {};
        var links= node.getElementsByTagName("OnlineResource");
        if(links.length > 0) {
            this.read_wmc_OnlineResource(dataURL, links[0]);
        }
        layerInfo.dataURL= dataURL.href;

    },

    /**
     * Method: read_wmc_SRS
     *  IGNF: _addition_
     */
    read_wmc_SRS: function(obj, node) {
        var srs= this.getChildValue(node);
        if (srs) {
            obj.projection= new OpenLayers.Projection(srs);
        }
    },

    /**
     * Method: read_wmc_nativeProjection
     *  IGNF: _addition_
     */
    read_wmc_nativeProjection: function(obj, node) {
        var srs= this.getChildValue(node);
        if (srs) {
            obj.nativeProjection= new OpenLayers.Projection(srs.replace(/epsg/,"EPSG"));
        }
    }

    });

}

/**
 * Class: OpenLayers.Format.WMC.v1_1_0
 * IGNF: enhancement of read_wmc_SRS
 */
if (OpenLayers.Format.WMC && OpenLayers.Format.WMC.v1_1_0) {

    OpenLayers.Format.WMC.v1_1_0= OpenLayers.overload(OpenLayers.Format.WMC.v1_1_0, {

    /**
     * Method: read_wmc_SRS
     * IGNF: _projection is computed from SRS_
     *
     * Parameters:
     * layerContext - {Object} An object representing a layer.
     * node - {Element} An element node.
     */
    read_wmc_SRS: function(layerContext, node) {
        if (! ("srs" in layerContext)) {
            layerContext.srs = {};
        }
        var srs= this.getChildValue(node);
        if (srs) {
            layerContext.srs[srs] = true;
            layerContext.projection= new OpenLayers.Projection(srs.replace(/epsg/,"EPSG"));
        }
    }

    });

}

/**
 * Class: OpenLayers.Geometry.Point
 * IGNF: take new OpenLayers.Projection design. More efficient for
 * transformation.
 */
if (OpenLayers.Geometry && OpenLayers.Geometry.Point) {

    OpenLayers.Geometry.Point= OpenLayers.overload(OpenLayers.Geometry.Point, {

    /**
     * APIMethod: transform
     * Translate the x,y properties of the point from source to dest.
     * IGNF: _use optimisation (nullify bounds into
     * OpenLayers.Projection.transform)_
     *
     * Parameters:
     * source - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>}
     * dest - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>}
     *
     * Returns:
     * {<OpenLayers.Geometry at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry-js.html>}
     */
    transform: function(source, dest) {
        OpenLayers.Projection.transform(this, source, dest);
        return this;
    }

    });

}

/**
 * Class: OpenLayers.Geometry.MultiPoint
 * point === first point !
 */
if (OpenLayers.Geometry && OpenLayers.Geometry.MultiPoint) {

    OpenLayers.Geometry.MultiPoint= OpenLayers.overload(OpenLayers.Geometry.MultiPoint, {

    /**
     * APIMethod: transform
     * Reproject the components geometry from source to dest.
     *  IGNF: _use optimisation_
     *
     * Parameters:
     * source - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>}
     * dest - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>}
     *
     * Returns:
     * {<OpenLayers.Geometry at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry-js.html>}
     */
    transform: function(source, dest) {
        OpenLayers.Projection.transform(this.components, source, dest);
        if (source && dest) {
            this.bounds = null;
        }
        return this;
    }

    });

}

/**
 * Class: OpenLayers.Geometry.Curve
 * IGNF: proper use of projection
 */
if (OpenLayers.Geometry && OpenLayers.Geometry.Curve) {

    OpenLayers.Geometry.Curve= OpenLayers.overload(OpenLayers.Geometry.Curve, {

    /**
     * APIMethod: transform
     * Reproject the components geometry from source to dest.
     *  IGNF: _use optimisation_
     *
     * Parameters:
     * source - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>}
     * dest - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>}
     *
     * Returns:
     * {<OpenLayers.Geometry at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry-js.html>}
     */
    transform: OpenLayers.Geometry.MultiPoint.prototype.transform,

    /**
     * APIMethod: getGeodesicLength
     * Calculate the approximate length of the geometry were it projected onto
     *     the earth.
     *
     * projection - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} The spatial reference system
     *     for the geometry coordinates.
     *      IGNF: _If not provided, Geographic/WGS84 is
     *            assumed_.
     *
     * Returns:
     * {Float} The appoximate geodesic length of the geometry in meters.
     */
    getGeodesicLength: function(projection) {
        var geom= this;  // so we can work with a clone if needed
        var gg= projection || OpenLayers.Projection.CRS84;
        if (projection) {
            if(!OpenLayers.Projection.CRS84.equals(projection)) {
                geom= this.clone().transform(projection, OpenLayers.Projection.CRS84);
                gg= OpenLayers.Projection.CRS84;
            }
        }
        var length= 0.0;
        if (geom.components && (geom.components.length > 1)) {
            var p1, p2;
            for(var i= 1, len= geom.components.length; i<len; i++) {
                p1= geom.components[i-1];
                p2= geom.components[i];
                // this returns km and requires lon/lat properties
                length+= OpenLayers.Util.distVincenty(
                    {lon: p1.x, lat: p1.y}, {lon: p2.x, lat: p2.y}, gg
                );
            }
        }
        // convert to m
        return length * 1000;
    }

    });

}

/**
 * Class: OpenLayers.Geometry.LineString
 * IGNF: proper use of projection
 */
if (OpenLayers.Geometry && OpenLayers.Geometry.LineString) {

    OpenLayers.Geometry.LineString= OpenLayers.overload(OpenLayers.Geometry.LineString, {

    /**
     * APIMethod: transform
     * Reproject the components geometry from source to dest.
     *  IGNF: _use optimisation_
     *
     * Parameters:
     * source - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>}
     * dest - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>}
     *
     * Returns:
     * {<OpenLayers.Geometry at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry-js.html>}
     */
    transform: OpenLayers.Geometry.MultiPoint.prototype.transform,

    /**
     * APIMethod: getGeodesicLength
     * Calculate the approximate length of the geometry were it projected onto
     *     the earth.
     *
     * projection - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} The spatial reference system
     *     for the geometry coordinates.
     *      IGNF: _If not provided, Geographic/WGS84 is
     *            assumed_.
     *
     * Returns:
     * {Float} The appoximate geodesic length of the geometry in meters.
     */
    getGeodesicLength: OpenLayers.Geometry.Curve.prototype.getGeodesicLength

    });

}

/**
 * Class: OpenLayers.Geometry.LinearRing
 * IGNF: OpenLayers.Geometry.LinearRing.transform() cannot be optimized as the last
 * IGNF: proper use of projection
 */
if (OpenLayers.Geometry && OpenLayers.Geometry.LinearRing) {

    OpenLayers.Geometry.LinearRing= OpenLayers.overload(OpenLayers.Geometry.LinearRing, {

    /**
     * APIMethod: getGeodesicArea
     * Calculate the approximate area of the polygon were it projected onto
     *     the earth.  Note that this area will be positive if ring is
     *     oriented
     *     clockwise, otherwise it will be negative.
     *
     * Parameters:
     * projection - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} The spatial reference system
     *     for the geometry coordinates.
     *     IGNF: _If not provided, Geographic/WGS84 is
     *           assumed_.
     *
     * Reference:
     * Robert. G. Chamberlain and William H. Duquette, "Some Algorithms for
     *     Polygons on a Sphere", JPL Publication 07-03, Jet Propulsion
     *     Laboratory, Pasadena, CA, June 2007
     *     http://trs-new.jpl.nasa.gov/dspace/handle/2014/40409
     *
     * Returns:
     * {float} The approximate signed geodesic area of the polygon in square
     *     meters.
     */
    getGeodesicArea: function(projection) {
        var ring= this;  // so we can work with a clone if needed
        var gg= projection || OpenLayers.Projection.CRS84;
        if (projection) {
            if(!OpenLayers.Projection.CRS84.equals(projection)) {
                gg= OpenLayers.Projection.CRS84;
                ring= this.clone().transform(projection, gg);
            }
        }
        var area= 0.0;
        var len= ring.components && ring.components.length;
        var a= gg.getProperty('semi_major') || 6378137.0;
        if (len > 2) {
            var p1, p2;
            for (var i= 0; i<len-1; i++) {
                p1= ring.components[i];
                p2= ring.components[i+1];
                area+= OpenLayers.Util.rad(p2.x - p1.x) *
                       (2 + Math.sin(OpenLayers.Util.rad(p1.y)) +
                       Math.sin(OpenLayers.Util.rad(p2.y)));
            }
            area= area * a * a / 2.0;
        }
        return area;
    },

    /**
     * Method: containsPoint
     * Test if a point is inside a linear ring.  For the case where a point
     *     is coincident with a linear ring edge, returns 1.  Otherwise,
     *     returns boolean.
     *  IGNF: _fix for <http://trac.osgeo.org/openlayers/ticket/2492>_
     *
     * Parameters:
     * point - {<OpenLayers.Geometry.Point>}
     *
     * Returns:
     * {Boolean | Number} The point is inside the linear ring.  Returns 1 if
     *     the point is coincident with an edge.  Returns boolean otherwise.
     */
    containsPoint: function(point) {
        var approx = OpenLayers.Number.limitSigDigs;
        var digs = 14;
        var px = approx(point.x, digs);
        var py = approx(point.y, digs);
        function getX(y, x1, y1, x2, y2) {
            //return (((x1 - x2) * y) + ((x2 * y1) - (x1 * y2))) / (y1 - y2);
            // see https://github.com/openlayers/openlayers/commit/0aaa5265b459a01456abcecba42aad1fcb6e041d
            return (y - y2) * ((x2 - x1) / (y2 - y1)) + x2;
        }
        var numSeg = this.components.length - 1;
        var start, end, x1, y1, x2, y2, cx, cy;
        var crosses = 0;
        for(var i=0; i<numSeg; ++i) {
            start = this.components[i];
            x1 = approx(start.x, digs);
            y1 = approx(start.y, digs);
            end = this.components[i + 1];
            x2 = approx(end.x, digs);
            y2 = approx(end.y, digs);
            
            /**
             * The following conditions enforce five edge-crossing rules:
             *    1. points coincident with edges are considered contained;
             *    2. an upward edge includes its starting endpoint, and
             *    excludes its final endpoint;
             *    3. a downward edge excludes its starting endpoint, and
             *    includes its final endpoint;
             *    4. horizontal edges are excluded; and
             *    5. the edge-ray intersection point must be strictly right
             *    of the point P.
             */
            if(y1 == y2) {
                // horizontal edge
                if(py == y1) {
                    // point on horizontal line
                    if(x1 <= x2 && (px >= x1 && px <= x2) || // right or vert
                       x1 >= x2 && (px <= x1 && px >= x2)) { // left or vert
                        // point on edge
                        crosses = -1;
                        break;
                    }
                }
                // ignore other horizontal edges
                continue;
            }
            cx = approx(getX(py, x1, y1, x2, y2), digs);
            if(cx == px) {
                // point on line
                if(y1 < y2 && (py >= y1 && py <= y2) || // upward
                   y1 > y2 && (py <= y1 && py >= y2)) { // downward
                    // point on edge
                    crosses = -1;
                    break;
                }
            }
            if(cx <= px) {
                // no crossing to the right
                continue;
            }
            if(x1 != x2 && (cx < Math.min(x1, x2) || cx > Math.max(x1, x2))) {
                // no crossing
                continue;
            }
            if(y1 < y2 && (py >= y1 && py < y2) || // upward
               y1 > y2 && (py < y1 && py >= y2)) { // downward
                ++crosses;
            }
        }
        var contained = (crosses == -1) ?
            // on edge
            1 :
            // even (out) or odd (in)
            !!(crosses & 1);

        return contained;
    }

    });

}

/**
 * Namespace: OpenLayers.Event
 * IGNF: Fix for IE when closing the page.
 */
if (OpenLayers.Event) {

    /**
     * Method: stopObservingElement
     * Given the id of an element to stop observing, cycle through the
     *   element's cached observers, calling stopObserving on each one,
     *   skipping those entries which can no longer be removed.
     *   IGNF: _test on cacheID added_.
     *
     * parameters:
     * elementParam - {DOMElement || String}
     */
    OpenLayers.Event.stopObservingElement= function(elementParam) {
        var element = OpenLayers.Util.getElement(elementParam);
        if (element) {
            var cacheID = element._eventCacheID;

            if (cacheID) {
                this._removeElementObservers(OpenLayers.Event.observers[cacheID]);
            }
        }
    };

}

/**
 * Class: OpenLayers.Projection
 * IGNF: redesign of OpenLayers class not to deeply depends on PROJ4JS.
 */
if (OpenLayers.Projection) {

    OpenLayers.Projection= OpenLayers.overload(OpenLayers.Projection, {

    /**
     * APIProperty: domainOfValidity
     * {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>} the extent to which the projection applies.
     *      IGNF: _addition_
     */
    domainOfValidity: null,

    /**
     * Constructor: OpenLayers.Projection
     * This class offers several methods for interacting with projection
     *      object.
     *      Currently support Pro4js projection implementation.
     *      IGNF: _redesign to assign domain of validity_
     *
     * Parameters:
     * projCode - {String} The projection identifier.
     * options - {Object} An optional object with properties to set on the
     *     projection.
     *
     * Returns:
     * {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} A projection object. Throws an exception when
     * no implementation have been found.
     */
    initialize: function(projCode, options) {
        OpenLayers.Util.extend(this, options);
        this.projCode= projCode;
        this.options= OpenLayers.Util.extend({},options);//usefull for cloning
        this.aliases= OpenLayers.Util.extend({},this.options.aliases);//alias cache
        if (window.Proj4js) {
            // try to maintain google mercator aliases ...
            if (!Proj4js.defs['EPSG:3857']) {
                Proj4js.defs['EPSG:3857']=
"+title=WGS 84 / Pseudo-Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";
            }
            this.proj= null;
            try {
                this.proj= new Proj4js.Proj(projCode);
            } catch(ex) {
                throw OpenLayers.i18n('unknown.crs',{'crs':projCode});
            }
        }
        if (this.proj==null) {
            throw OpenLayers.i18n('no.proj.implementation.found');
        }
        if (projCode=='EPSG:4326'   ||
            projCode=='CRS:84'      ||
            projCode=='IGNF:WGS84G' ||
            projCode=='WGS84') {
            this.domainOfValidity= new OpenLayers.Bounds(-180,-90,180,90);
        } else if (projCode=='EPSG:3857'   ||
                   projCode=='EPSG:900913' ||
                   projCode=='EPSG:102113' ||
                   projCode=='GOOGLE') {
            this.domainOfValidity= new OpenLayers.Bounds(-180,-85.05113,180,85.05113);
        } else if (this.isUTMZoneProjection()) {
            var westBound= -180, southBound= -90, eastBound= 180, northBound= 90;
            if (this.getProjName()=='utm') {
                eastBound= this.getProperty('zone')*6 - 180;
                westBound= eastBound - 6;
                northBound= 84;
                southBound= 0;
                if (this.getProperty('south')===true) {
                    // south
                    northBound= 0;
                    southBound= -80;
                }
                // FIXME : MGRS special cases ?
            } else if (this.getProjName()=='stere') {
                if (this.getProperty('standard_parallel_1')>0) {
                    southBound= 84;
                } else {
                    northBound= -80;
                }
            }
            this.domainOfValidity= new OpenLayers.Bounds(westBound, southBound, eastBound, northBound);
        }
    },

    /**
     * APIMethod: getCode
     * Get the string SRS code.
     *      IGNF: _wrapper not to depend on PROJ4JS_.
     *
     * Returns:
     * {String} The SRS code.
     */
    getCode: function() {
        if (window.Proj4js && (this.proj instanceof Proj4js.Proj)) { return this.proj.srsCode; }
        return this.projCode;
    },

    /**
     * APIMethod: getUnits
     * Get the units string for the projection -- returns null if
     *     proj4js is not available.
     *      IGNF: _wrapper not to depend on PROJ4JS_.
     *
     * Returns:
     * {String} The units abbreviation.
     */
    getUnits: function() {
        if (window.Proj4js && (this.proj instanceof Proj4js.Proj)) {
            return this.proj.units || (this.proj.projName=='longlat'? 'dd': 'm');
        }
        return null;
    },

    /**
     * APIMethod: clone
     * Clone a projection
     *      IGNF: _addition_
     */
    clone: function() {
        if (this.proj==null) { return null; }
        var p= new OpenLayers.Projection(this.projCode,this.options);
        p.aliases= OpenLayers.Util.extend({},this.aliases);
        return p;
    },

    /**
     * APIMethod: getProjName
     * Return the projection's name.
     *  FIXME: wkt name instead of PROJ4 one ?
     *      IGNF: _wrapper not to depend on PROJ4JS_.
     *
     * Returns:
     * {String} the projection's name or null if none.
     */
    getProjName: function() {
        if (window.Proj4js && (this.proj instanceof Proj4js.Proj)) { return this.proj.projName; }
        return null;
    },

    /**
     * APIMethod: getTitle
     * Return coordinates reference system's title.
     *      IGNF: _improvement_
     *
     * Parameters:
     * options - {Object} the force option set to true prevent getTitle to
     * return an empty value when the projection is not ready to use.
     *
     * Returns:
     * {String} the projection's title or an empty value if not known.
     */
    getTitle: function(options) {
        var im= OpenLayers.i18n(this.projCode);
        if (im==this.projCode) {
            // no translation :
            im= this.getProperty('title');
            if (im==null && !(options && options.force===true)) { im= this.projCode }
        }
        return im || '';
    },

    /**
     * APIMethod: getDatum
     * Return the projection's datum.
     *      IGNF: _wrapper not to depend on PROJ4JS_.
     *
     * Returns:
     * {String} the projection's datum or null if none.
     */
    getDatum: function() {
        if (window.Proj4js && (this.proj instanceof Proj4js.Proj)) { return this.proj.datum; }
        return null;
    },

    /**
     * APIMethod: getProperty
     * Return the projection's parameter. It is just a wrapper to access the
     * inner property of the underlaying of the projection.
     *      IGNF: _addition_
     *
     * Parameters:
     * prop - {String} property name. OGC WKT names like 'semi_major',
     *      'standard_parallel_1', 'scale_factor', etc ...
     *
     * Returns:
     * {Object|Number|String} the projection's property or null if none.
     */
    getProperty: function(prop) {
        if (prop==undefined) { return null; }
        if (window.Proj4js && (this.proj instanceof Proj4js.Proj)) {
            switch(prop){
            case 'projcs': prop= 'projName'; break;
            case 'datum': prop= 'datumCode'; break;
            case 'spheroid': prop= 'ellps'; break;
            case 'nadgrids': prop= 'nagrids'; break;
            case 'semi_major': prop= 'a'; break;
            case 'semi_minor': prop= 'b'; break;
            case 'inverse_flattening': prop= 'rf'; break;
            case 'standard_parallel_1': prop= (this.getProjName().match(/t?merc|eqc|stere|utm/)? 'lat_ts': 'lat1'); break;
            case 'standard_parallel_2': prop= 'lat2'; break;
            case 'latitude_of_center':
            case 'latitude_of_origin': prop= 'lat0'; break;
            case 'longitude_of_center':
            case 'central_meridian': prop= 'long0'; break;
            case 'false_easting': prop= 'x0'; break;
            case 'false_northing': prop= 'y0'; break;
            case 'scale_factor': prop= 'k0'; break;
            case 'south': prop= 'utmSouth'; break;
            case 'towgs84': prop= 'datum_params'; break;
            case 'primem': prop= 'from_greenwich'; break;
            default: break;
            }
            return this.proj[prop];
        }
        return null;
    },

    /**
     * APIMethod: equals
     * Test equality of two projection instances.  Determines equality based
     *     soley on the projection code.
     *      IGNF: _improvement_
     *
     * Parameters:
     * projection - {String | <OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>}
     *
     * Returns:
     * {Boolean} The two projections are equivalent.
     */
    equals: function(projection) {
        var result= false;
        if (this.proj && projection) {
            var code= projection instanceof OpenLayers.Projection?
                projection.getCode()
            :   projection;
            if (this.getCode()==code) {
                result= true;
            } else {
                // check for well-known alias :
                // based on srsCode due to urn (see above)
                result= this.isAliasOf(projection);
            }
        }
        return result;
    },

    /**
     * APIMethod: isAliasOf
     * Return true when projection is an alias of the object.
     *      IGNF: _addition_
     *
     * Parameters:
     * projection - {String | <OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the projection to check.
     *
     * Returns:
     * {Boolean} true if the projections are equivalent, false otherwise.
     */
    isAliasOf: function(projection) {
        if (!this.proj || !projection) { return false; }
        var thisCode= this.getCode(),
            projCode= projection instanceof OpenLayers.Projection?
                projection.getCode()
            :   projection;
        if (this.aliases[projCode]===true) { return true; }
        if (this.aliases[projCode]===false) { return false; }
        // never checked :
        var thisFound= false, projFound= false;
        for (var k in OpenLayers.Projection.WKALIASES) {
            if (OpenLayers.Projection.WKALIASES.hasOwnProperty(k)) {
                var a= OpenLayers.Projection.WKALIASES[k];
                for (var i= 0, l= a.length; i<l && !(thisFound && projFound); i++) {
                    if (thisCode==a[i]) {
                        thisFound= true;
                        if (projCode==thisCode) {
                            projFound= true;
                            break;
                        }
                        continue;
                    }
                    if (projCode==a[i]) {
                        projFound= true;
                        continue;
                    }
                }
                if (thisFound || projFound) { break; }
            }
        }
        this.aliases[projCode]= (thisFound && projFound);
        return this.aliases[projCode];
    },

    /**
     * APIMethod: isWebMercator
     * Indicate whether the projection is the web mercator (aka google
     * projection) or not.
     *
     * Returns:
     * {Boolean} true if it is a web mercator, false otherwise.
     */
    isWebMercator: function() {
        var n= this.getCode();
        switch (n) {
        case 'GOOGLE'     :
        case 'EPSG:3857'  :
        case 'EPSG:102113':
        case 'EPSG:900913':
            return true;
        default           :
            return false;
        }
    },

    /**
     * APIMethod: isCompatibleWith
     * Indicate whether or not two coordinates reference systems differ from
     *      an affine transformation. Current implementation is just based on
     *      coordinates reference system type (longlat, ...) and datums. More
     *      tests are to be added.
     *      IGNF: _addition_
     *
     * Parameters:
     * projection - {String | <OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the projection to compare with.
     *
     * Returns:
     * {Boolean} true or false.
     */
    isCompatibleWith: function(projection) {
        if (!this.proj || !projection) { return false; }
        var p;
        try {
            p= projection instanceof OpenLayers.Projection?
                projection
            :   new OpenLayers.Projection(projection);
        } catch(e) {
            OpenLayers.Console.error(e.message);
            return false;
        }
        var result= false;
        if (this.equals(p)) {
            result= true;
        } else {
            // FIXME : check for prime meridian too ?
            // FIXME : compare_datums is part of underlaying implementation !
            try {
                var tn= this.getProjName(), pn= p.getProjName();
                if ((tn=='longlat' || tn=='eqc' || (tn=='merc' && this.isWebMercator())) &&
                    (pn=='longlat' || pn=='eqc' || (pn=='merc' &&    p.isWebMercator()))) {
                    result= true;
                    // datum : web mercator==WGS84 sphere ...
                    if ((tn!='merc' && pn!='merc') && this.getDatum() && p.getDatum()) {
                        result= this.getDatum().compare_datums(p.getDatum());
                    }
                    // area of interest :
                    if (result && this.domainOfValidity && p.domainOfValidity) {
                        result= this.domainOfValidity.intersectsBounds(p.domainOfValidity,true);
                    }
                } else {
                    //FIXME?
                    ;
                }
            } catch (e) {}
        }
        if (!(p==projection)) {
            p.destroy();
            p= null;
        }
        return result;
    },

    /**
     * APIMethod: isUTMZoneProjection
     * Is the projection a Universal Transverse Mercator standard projection
     * (with zone).
     *      IGNF: _addition_
     *
     * Parameters:
     * p - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the projection
     *
     * Returns:
     * {Boolean} true, the projection is a UTM with zone, false otherwise.
     */
    isUTMZoneProjection: function() {
        if (this.proj==null) { return false; }
        if (this.getProjName()=='utm' && this.getProperty('zone')!=null) {
            //FIXME: one could check 1..60 for zone ?
            return true;
        }
        if (this.getProjName()=='stere' && this.getProperty('central_meridian')==0 &&
            this.getProperty('latitude_of_origin')===this.getProperty('standard_parallel_1') &&
            Math.abs(this.getProperty('latitude_of_origin'))==1.57079632679) {
            return true;
        }
        return false;
    },

    /**
     * APIMethod: isAxisInverted
     * Return whether the given projection has its axis "inverted".
     *
     * Returns:
     * {Boolean} true if one has to invert axis order when using it, false
     * otherwise.
     */
    isAxisInverted: function() {
        if (window.Proj4js && (this.proj instanceof Proj4js.Proj)) {
            if (this.axisInverted===undefined) {
                this.axisInverted= OpenLayers.Projection.INVERTED_AXIS[this.proj.srsCode]===1;
            }
            return this.axisInverted;
        }
        return false;
    },

    /**
     * APIMethod: destroy
     * Destroy projection object.
     *      IGNF: _take into account of changes_
     */
    destroy: function() {
        if (this.proj) { delete this.proj }
        if (this.projCode) { delete this.projCode }
        if (this.domainOfValidity) { delete this.domainOfValidity }
        delete this.options;
        delete this.aliases;
    }

    });

    /**
     * Constant: OpenLayers.Projection.WKALIASES
     * {Object} Holds a equivalence classes between well-known CRSs for indicating these
     *      CRSs are considered similar.
     *      FIXME: to be push to PROJ4JS ?
     *      IGNF: _addition_
     */
    OpenLayers.Projection.WKALIASES= {
        'WGS84G':       [ 'WGS84',// defined by Proj4js
                          'EPSG:4326',
                          'CRS:84',
                          'IGNF:WGS84G',
                          'IGNF:WGS84RRAFGEO',
                          // to some extent ...
                          'IGNF:RGF93G',
                          'IGNF:RGFG95GEO',
                          'IGNF:RGM04GEO',
                          'IGNF:RGNCGEO',
                          'IGNF:RGPFGEO',
                          'IGNF:RGR92GEO',
                          'IGNF:RGSPM06GEO',
                          'EPSG:4171',//IGNF:RGF93G
                          'EPSG:4624',//IGNF:RGFG95GEO
                          'EPSG:4627',//IGNF:RGR92GEO
                          'EPSG:4640',//IGNF:WGS84RRAFGEO
                          'EPSG:4687',//IGNF:RGPFGEO
                          'EPSG:4749',//IGNF:RGNCGEO
                          'EPSG:4258' //ETRS89 geographic 2D
        ],
        'LAMB93':       [ 'IGNF:LAMB93',
                          'EPSG:2154'
        ],
        'LAMBE':        [ 'IGNF:LAMBE',
                          'EPSG:27572',
                          'EPSG:27582'
        ],
        'UTM39SW84':    [ 'IGNF:UTM39SW84',
                          'EPSG:32739'
        ],
        'UTM20W84GUAD': [ 'IGNF:UTM20W84GUAD',
                          'EPSG:2969',
                          'EPSG:4559',
                          'EPSG:32620'
        ],
        'UTM22RGFG95':  [ 'IGNF:UTM22RGFG95',
                          'EPSG:2972',
                          'EPSG:32622'
        ],
        'UTM42SW84':    [ 'IGNF:UTM42SW84',
                          'EPSG:32742'
        ],
        'UTM20W84MART': [ 'IGNF:UTM20W84MART',
                          'EPSG:2989',
                          'EPSG:4559',
                          'EPSG:32620'
        ],
        'RGM04UTM38S':  [ 'IGNF:RGM04UTM38S',
                          'EPSG:4471',
                          'EPSG:32738'
        ],
        'RGNCUTM57S':   [ 'IGNF:RGNCUTM57S',
                          'EPSG:32757'
        ],
        'RGNCUTM58S':   [ 'IGNF:RGNCUTM58S',
                          'EPSG:32758'
        ],
        'RGNCUTM59S':   [ 'IGNF:RGNCUTM59S',
                          'EPSG:32759'
        ],
        'RGPFUTM5S':    [ 'IGNF:RGPFUTM5S',
                          'EPSG:3296',
                          'EPSG:32705'
        ],
        'RGPFUTM6S':    [ 'IGNF:RGPFUTM6S',
                          'EPSG:3297',
                          'EPSG:32706'
        ],
        'RGPFUTM7S':    [ 'IGNF:RGPFUTM7S',
                          'EPSG:3298',
                          'EPSG:32707'
        ],
        'RGR92UTM40S':  [ 'IGNF:RGR92UTM40S',
                          'EPSG:2975',
                          'EPSG:32740'
        ],
        'UTM43SW84':    [ 'IGNF:UTM43SW84',
                          'EPSG:32743'
        ],
        'RGSPM06U21':   [ 'IGNF:RGSPM06U21',
                          'EPSG:4467',
                          'EPSG:32606'
        ],
        'UTM01SW84':    [ 'IGNF:UTM01SW84',
                          'EPSG:32701'
        ],
        'WGS84WMSV':    [ 'GOOGLE',// defined by Proj4js
                          'EPSG:3857',
                          'EPSG:900913',
                          'EPSG:102113'
        ],
        'GEOPORTALFXX': [ 'IGNF:GEOPORTALFXX',
                          'EPSG:310024802'
        ],
        'GEOPORTALANF': [ 'IGNF:GEOPORTALANF',
                          'EPSG:310915814'
        ],
        'GEOPORTALGUF': [ 'IGNF:GEOPORTALGUF',
                          'EPSG:310486805'
        ],
        'GEOPORTALREU': [ 'IGNF:GEOPORTALREU',
                          'EPSG:310700806'
        ],
        'GEOPORTALMYT': [ 'IGNF:GEOPORTALMYT',
                          'EPSG:310702807'
        ],
        'GEOPORTALSPM': [ 'IGNF:GEOPORTALSPM',
                          'EPSG:310706808'
        ],
        'GEOPORTALNCL': [ 'IGNF:GEOPORTALNCL',
                          'EPSG:310547809'
        ],
        'GEOPORTALWLF': [ 'IGNF:GEOPORTALWLF',
                          'EPSG:310642810'
        ],
        'GEOPORTALPYF': [ 'IGNF:GEOPORTALPYF',
                          'EPSG:310032811'
        ],
        'GEOPORTALKER': [ 'IGNF:GEOPORTALKER',
                          'EPSG:310642812'
        ],
        'GEOPORTALCRZ': [ 'IGNF:GEOPORTALCRZ',
                          'EPSG:310642801'
        ],
        'GEOPORTALASP': [ 'IGNF:GEOPORTALASP',
                          'EPSG:310642813'
        ],
        'TERA50STEREO': [ 'IGNF:TERA50STEREO',
                          'EPSG:2986'
        ],
        'MILLER':       [ 'IGNF:MILLER',
                          'EPSG:310642901'
        ]
    };

    /**
     * Constant: OpenLayers.Projection.INVERTED_AXIS
     * {Object} Give coordinate reference systems for which axis order (lon,
     * x), (lat, y) is to be inverted (lat, y), (lon, x) when dealing with
     * coordinates. This is usefull for WMS 1.3.0, WMTS 1.0.0 and WFS 2.0.0,
     * etc ...
     */
    OpenLayers.Projection.INVERTED_AXIS= {
        'EPSG:2036':1,
        'EPSG:2044':1,
        'EPSG:2045':1,
        'EPSG:2065':1,
        'EPSG:2081':1,
        'EPSG:2082':1,
        'EPSG:2083':1,
        'EPSG:2085':1,
        'EPSG:2086':1,
        'EPSG:2091':1,
        'EPSG:2092':1,
        'EPSG:2093':1,
        'EPSG:2096':1,
        'EPSG:2097':1,
        'EPSG:2098':1,
        'EPSG:2105':1,
        'EPSG:2106':1,
        'EPSG:2107':1,
        'EPSG:2108':1,
        'EPSG:2109':1,
        'EPSG:2110':1,
        'EPSG:2111':1,
        'EPSG:2112':1,
        'EPSG:2113':1,
        'EPSG:2114':1,
        'EPSG:2115':1,
        'EPSG:2116':1,
        'EPSG:2117':1,
        'EPSG:2118':1,
        'EPSG:2119':1,
        'EPSG:2120':1,
        'EPSG:2121':1,
        'EPSG:2122':1,
        'EPSG:2123':1,
        'EPSG:2124':1,
        'EPSG:2125':1,
        'EPSG:2126':1,
        'EPSG:2127':1,
        'EPSG:2128':1,
        'EPSG:2129':1,
        'EPSG:2130':1,
        'EPSG:2131':1,
        'EPSG:2132':1,
        'EPSG:2166':1,
        'EPSG:2167':1,
        'EPSG:2168':1,
        'EPSG:2169':1,
        'EPSG:2170':1,
        'EPSG:2171':1,
        'EPSG:2172':1,
        'EPSG:2173':1,
        'EPSG:2174':1,
        'EPSG:2175':1,
        'EPSG:2176':1,
        'EPSG:2177':1,
        'EPSG:2178':1,
        'EPSG:2179':1,
        'EPSG:2180':1,
        'EPSG:2193':1,
        'EPSG:2199':1,
        'EPSG:2200':1,
        'EPSG:2206':1,
        'EPSG:2207':1,
        'EPSG:2208':1,
        'EPSG:2209':1,
        'EPSG:2210':1,
        'EPSG:2211':1,
        'EPSG:2212':1,
        'EPSG:2319':1,
        'EPSG:2320':1,
        'EPSG:2321':1,
        'EPSG:2322':1,
        'EPSG:2323':1,
        'EPSG:2324':1,
        'EPSG:2325':1,
        'EPSG:2326':1,
        'EPSG:2327':1,
        'EPSG:2328':1,
        'EPSG:2329':1,
        'EPSG:2330':1,
        'EPSG:2331':1,
        'EPSG:2332':1,
        'EPSG:2333':1,
        'EPSG:2334':1,
        'EPSG:2335':1,
        'EPSG:2336':1,
        'EPSG:2337':1,
        'EPSG:2338':1,
        'EPSG:2339':1,
        'EPSG:2340':1,
        'EPSG:2341':1,
        'EPSG:2342':1,
        'EPSG:2343':1,
        'EPSG:2344':1,
        'EPSG:2345':1,
        'EPSG:2346':1,
        'EPSG:2347':1,
        'EPSG:2348':1,
        'EPSG:2349':1,
        'EPSG:2350':1,
        'EPSG:2351':1,
        'EPSG:2352':1,
        'EPSG:2353':1,
        'EPSG:2354':1,
        'EPSG:2355':1,
        'EPSG:2356':1,
        'EPSG:2357':1,
        'EPSG:2358':1,
        'EPSG:2359':1,
        'EPSG:2360':1,
        'EPSG:2361':1,
        'EPSG:2362':1,
        'EPSG:2363':1,
        'EPSG:2364':1,
        'EPSG:2365':1,
        'EPSG:2366':1,
        'EPSG:2367':1,
        'EPSG:2368':1,
        'EPSG:2369':1,
        'EPSG:2370':1,
        'EPSG:2371':1,
        'EPSG:2372':1,
        'EPSG:2373':1,
        'EPSG:2374':1,
        'EPSG:2375':1,
        'EPSG:2376':1,
        'EPSG:2377':1,
        'EPSG:2378':1,
        'EPSG:2379':1,
        'EPSG:2380':1,
        'EPSG:2381':1,
        'EPSG:2382':1,
        'EPSG:2383':1,
        'EPSG:2384':1,
        'EPSG:2385':1,
        'EPSG:2386':1,
        'EPSG:2387':1,
        'EPSG:2388':1,
        'EPSG:2389':1,
        'EPSG:2390':1,
        'EPSG:2391':1,
        'EPSG:2392':1,
        'EPSG:2393':1,
        'EPSG:2394':1,
        'EPSG:2395':1,
        'EPSG:2396':1,
        'EPSG:2397':1,
        'EPSG:2398':1,
        'EPSG:2399':1,
        'EPSG:2400':1,
        'EPSG:2401':1,
        'EPSG:2402':1,
        'EPSG:2403':1,
        'EPSG:2404':1,
        'EPSG:2405':1,
        'EPSG:2406':1,
        'EPSG:2407':1,
        'EPSG:2408':1,
        'EPSG:2409':1,
        'EPSG:2410':1,
        'EPSG:2411':1,
        'EPSG:2412':1,
        'EPSG:2413':1,
        'EPSG:2414':1,
        'EPSG:2415':1,
        'EPSG:2416':1,
        'EPSG:2417':1,
        'EPSG:2418':1,
        'EPSG:2419':1,
        'EPSG:2420':1,
        'EPSG:2421':1,
        'EPSG:2422':1,
        'EPSG:2423':1,
        'EPSG:2424':1,
        'EPSG:2425':1,
        'EPSG:2426':1,
        'EPSG:2427':1,
        'EPSG:2428':1,
        'EPSG:2429':1,
        'EPSG:2430':1,
        'EPSG:2431':1,
        'EPSG:2432':1,
        'EPSG:2433':1,
        'EPSG:2434':1,
        'EPSG:2435':1,
        'EPSG:2436':1,
        'EPSG:2437':1,
        'EPSG:2438':1,
        'EPSG:2439':1,
        'EPSG:2440':1,
        'EPSG:2441':1,
        'EPSG:2442':1,
        'EPSG:2443':1,
        'EPSG:2444':1,
        'EPSG:2445':1,
        'EPSG:2446':1,
        'EPSG:2447':1,
        'EPSG:2448':1,
        'EPSG:2449':1,
        'EPSG:2450':1,
        'EPSG:2451':1,
        'EPSG:2452':1,
        'EPSG:2453':1,
        'EPSG:2454':1,
        'EPSG:2455':1,
        'EPSG:2456':1,
        'EPSG:2457':1,
        'EPSG:2458':1,
        'EPSG:2459':1,
        'EPSG:2460':1,
        'EPSG:2461':1,
        'EPSG:2462':1,
        'EPSG:2463':1,
        'EPSG:2464':1,
        'EPSG:2465':1,
        'EPSG:2466':1,
        'EPSG:2467':1,
        'EPSG:2468':1,
        'EPSG:2469':1,
        'EPSG:2470':1,
        'EPSG:2471':1,
        'EPSG:2472':1,
        'EPSG:2473':1,
        'EPSG:2474':1,
        'EPSG:2475':1,
        'EPSG:2476':1,
        'EPSG:2477':1,
        'EPSG:2478':1,
        'EPSG:2479':1,
        'EPSG:2480':1,
        'EPSG:2481':1,
        'EPSG:2482':1,
        'EPSG:2483':1,
        'EPSG:2484':1,
        'EPSG:2485':1,
        'EPSG:2486':1,
        'EPSG:2487':1,
        'EPSG:2488':1,
        'EPSG:2489':1,
        'EPSG:2490':1,
        'EPSG:2491':1,
        'EPSG:2492':1,
        'EPSG:2493':1,
        'EPSG:2494':1,
        'EPSG:2495':1,
        'EPSG:2496':1,
        'EPSG:2497':1,
        'EPSG:2498':1,
        'EPSG:2499':1,
        'EPSG:2500':1,
        'EPSG:2501':1,
        'EPSG:2502':1,
        'EPSG:2503':1,
        'EPSG:2504':1,
        'EPSG:2505':1,
        'EPSG:2506':1,
        'EPSG:2507':1,
        'EPSG:2508':1,
        'EPSG:2509':1,
        'EPSG:2510':1,
        'EPSG:2511':1,
        'EPSG:2512':1,
        'EPSG:2513':1,
        'EPSG:2514':1,
        'EPSG:2515':1,
        'EPSG:2516':1,
        'EPSG:2517':1,
        'EPSG:2518':1,
        'EPSG:2519':1,
        'EPSG:2520':1,
        'EPSG:2521':1,
        'EPSG:2522':1,
        'EPSG:2523':1,
        'EPSG:2524':1,
        'EPSG:2525':1,
        'EPSG:2526':1,
        'EPSG:2527':1,
        'EPSG:2528':1,
        'EPSG:2529':1,
        'EPSG:2530':1,
        'EPSG:2531':1,
        'EPSG:2532':1,
        'EPSG:2533':1,
        'EPSG:2534':1,
        'EPSG:2535':1,
        'EPSG:2536':1,
        'EPSG:2537':1,
        'EPSG:2538':1,
        'EPSG:2539':1,
        'EPSG:2540':1,
        'EPSG:2541':1,
        'EPSG:2542':1,
        'EPSG:2543':1,
        'EPSG:2544':1,
        'EPSG:2545':1,
        'EPSG:2546':1,
        'EPSG:2547':1,
        'EPSG:2548':1,
        'EPSG:2549':1,
        'EPSG:2551':1,
        'EPSG:2552':1,
        'EPSG:2553':1,
        'EPSG:2554':1,
        'EPSG:2555':1,
        'EPSG:2556':1,
        'EPSG:2557':1,
        'EPSG:2558':1,
        'EPSG:2559':1,
        'EPSG:2560':1,
        'EPSG:2561':1,
        'EPSG:2562':1,
        'EPSG:2563':1,
        'EPSG:2564':1,
        'EPSG:2565':1,
        'EPSG:2566':1,
        'EPSG:2567':1,
        'EPSG:2568':1,
        'EPSG:2569':1,
        'EPSG:2570':1,
        'EPSG:2571':1,
        'EPSG:2572':1,
        'EPSG:2573':1,
        'EPSG:2574':1,
        'EPSG:2575':1,
        'EPSG:2576':1,
        'EPSG:2577':1,
        'EPSG:2578':1,
        'EPSG:2579':1,
        'EPSG:2580':1,
        'EPSG:2581':1,
        'EPSG:2582':1,
        'EPSG:2583':1,
        'EPSG:2584':1,
        'EPSG:2585':1,
        'EPSG:2586':1,
        'EPSG:2587':1,
        'EPSG:2588':1,
        'EPSG:2589':1,
        'EPSG:2590':1,
        'EPSG:2591':1,
        'EPSG:2592':1,
        'EPSG:2593':1,
        'EPSG:2594':1,
        'EPSG:2595':1,
        'EPSG:2596':1,
        'EPSG:2597':1,
        'EPSG:2598':1,
        'EPSG:2599':1,
        'EPSG:2600':1,
        'EPSG:2601':1,
        'EPSG:2602':1,
        'EPSG:2603':1,
        'EPSG:2604':1,
        'EPSG:2605':1,
        'EPSG:2606':1,
        'EPSG:2607':1,
        'EPSG:2608':1,
        'EPSG:2609':1,
        'EPSG:2610':1,
        'EPSG:2611':1,
        'EPSG:2612':1,
        'EPSG:2613':1,
        'EPSG:2614':1,
        'EPSG:2615':1,
        'EPSG:2616':1,
        'EPSG:2617':1,
        'EPSG:2618':1,
        'EPSG:2619':1,
        'EPSG:2620':1,
        'EPSG:2621':1,
        'EPSG:2622':1,
        'EPSG:2623':1,
        'EPSG:2624':1,
        'EPSG:2625':1,
        'EPSG:2626':1,
        'EPSG:2627':1,
        'EPSG:2628':1,
        'EPSG:2629':1,
        'EPSG:2630':1,
        'EPSG:2631':1,
        'EPSG:2632':1,
        'EPSG:2633':1,
        'EPSG:2634':1,
        'EPSG:2635':1,
        'EPSG:2636':1,
        'EPSG:2637':1,
        'EPSG:2638':1,
        'EPSG:2639':1,
        'EPSG:2640':1,
        'EPSG:2641':1,
        'EPSG:2642':1,
        'EPSG:2643':1,
        'EPSG:2644':1,
        'EPSG:2645':1,
        'EPSG:2646':1,
        'EPSG:2647':1,
        'EPSG:2648':1,
        'EPSG:2649':1,
        'EPSG:2650':1,
        'EPSG:2651':1,
        'EPSG:2652':1,
        'EPSG:2653':1,
        'EPSG:2654':1,
        'EPSG:2655':1,
        'EPSG:2656':1,
        'EPSG:2657':1,
        'EPSG:2658':1,
        'EPSG:2659':1,
        'EPSG:2660':1,
        'EPSG:2661':1,
        'EPSG:2662':1,
        'EPSG:2663':1,
        'EPSG:2664':1,
        'EPSG:2665':1,
        'EPSG:2666':1,
        'EPSG:2667':1,
        'EPSG:2668':1,
        'EPSG:2669':1,
        'EPSG:2670':1,
        'EPSG:2671':1,
        'EPSG:2672':1,
        'EPSG:2673':1,
        'EPSG:2674':1,
        'EPSG:2675':1,
        'EPSG:2676':1,
        'EPSG:2677':1,
        'EPSG:2678':1,
        'EPSG:2679':1,
        'EPSG:2680':1,
        'EPSG:2681':1,
        'EPSG:2682':1,
        'EPSG:2683':1,
        'EPSG:2684':1,
        'EPSG:2685':1,
        'EPSG:2686':1,
        'EPSG:2687':1,
        'EPSG:2688':1,
        'EPSG:2689':1,
        'EPSG:2690':1,
        'EPSG:2691':1,
        'EPSG:2692':1,
        'EPSG:2693':1,
        'EPSG:2694':1,
        'EPSG:2695':1,
        'EPSG:2696':1,
        'EPSG:2697':1,
        'EPSG:2698':1,
        'EPSG:2699':1,
        'EPSG:2700':1,
        'EPSG:2701':1,
        'EPSG:2702':1,
        'EPSG:2703':1,
        'EPSG:2704':1,
        'EPSG:2705':1,
        'EPSG:2706':1,
        'EPSG:2707':1,
        'EPSG:2708':1,
        'EPSG:2709':1,
        'EPSG:2710':1,
        'EPSG:2711':1,
        'EPSG:2712':1,
        'EPSG:2713':1,
        'EPSG:2714':1,
        'EPSG:2715':1,
        'EPSG:2716':1,
        'EPSG:2717':1,
        'EPSG:2718':1,
        'EPSG:2719':1,
        'EPSG:2720':1,
        'EPSG:2721':1,
        'EPSG:2722':1,
        'EPSG:2723':1,
        'EPSG:2724':1,
        'EPSG:2725':1,
        'EPSG:2726':1,
        'EPSG:2727':1,
        'EPSG:2728':1,
        'EPSG:2729':1,
        'EPSG:2730':1,
        'EPSG:2731':1,
        'EPSG:2732':1,
        'EPSG:2733':1,
        'EPSG:2734':1,
        'EPSG:2735':1,
        'EPSG:2738':1,
        'EPSG:2739':1,
        'EPSG:2740':1,
        'EPSG:2741':1,
        'EPSG:2742':1,
        'EPSG:2743':1,
        'EPSG:2744':1,
        'EPSG:2745':1,
        'EPSG:2746':1,
        'EPSG:2747':1,
        'EPSG:2748':1,
        'EPSG:2749':1,
        'EPSG:2750':1,
        'EPSG:2751':1,
        'EPSG:2752':1,
        'EPSG:2753':1,
        'EPSG:2754':1,
        'EPSG:2755':1,
        'EPSG:2756':1,
        'EPSG:2757':1,
        'EPSG:2758':1,
        'EPSG:2935':1,
        'EPSG:2936':1,
        'EPSG:2937':1,
        'EPSG:2938':1,
        'EPSG:2939':1,
        'EPSG:2940':1,
        'EPSG:2941':1,
        'EPSG:2953':1,
        'EPSG:2963':1,
        'EPSG:3006':1,
        'EPSG:3007':1,
        'EPSG:3008':1,
        'EPSG:3009':1,
        'EPSG:3010':1,
        'EPSG:3011':1,
        'EPSG:3012':1,
        'EPSG:3013':1,
        'EPSG:3014':1,
        'EPSG:3015':1,
        'EPSG:3016':1,
        'EPSG:3017':1,
        'EPSG:3018':1,
        'EPSG:3019':1,
        'EPSG:3020':1,
        'EPSG:3021':1,
        'EPSG:3022':1,
        'EPSG:3023':1,
        'EPSG:3024':1,
        'EPSG:3025':1,
        'EPSG:3026':1,
        'EPSG:3027':1,
        'EPSG:3028':1,
        'EPSG:3029':1,
        'EPSG:3030':1,
        'EPSG:3034':1,
        'EPSG:3035':1,
        'EPSG:3038':1,
        'EPSG:3039':1,
        'EPSG:3040':1,
        'EPSG:3041':1,
        'EPSG:3042':1,
        'EPSG:3043':1,
        'EPSG:3044':1,
        'EPSG:3045':1,
        'EPSG:3046':1,
        'EPSG:3047':1,
        'EPSG:3048':1,
        'EPSG:3049':1,
        'EPSG:3050':1,
        'EPSG:3051':1,
        'EPSG:3058':1,
        'EPSG:3059':1,
        'EPSG:3068':1,
        'EPSG:3114':1,
        'EPSG:3115':1,
        'EPSG:3116':1,
        'EPSG:3117':1,
        'EPSG:3118':1,
        'EPSG:3120':1,
        'EPSG:3126':1,
        'EPSG:3127':1,
        'EPSG:3128':1,
        'EPSG:3129':1,
        'EPSG:3130':1,
        'EPSG:3131':1,
        'EPSG:3132':1,
        'EPSG:3133':1,
        'EPSG:3134':1,
        'EPSG:3135':1,
        'EPSG:3136':1,
        'EPSG:3137':1,
        'EPSG:3138':1,
        'EPSG:3139':1,
        'EPSG:3140':1,
        'EPSG:3146':1,
        'EPSG:3147':1,
        'EPSG:3150':1,
        'EPSG:3151':1,
        'EPSG:3152':1,
        'EPSG:3300':1,
        'EPSG:3301':1,
        'EPSG:3328':1,
        'EPSG:3329':1,
        'EPSG:3330':1,
        'EPSG:3331':1,
        'EPSG:3332':1,
        'EPSG:3333':1,
        'EPSG:3334':1,
        'EPSG:3335':1,
        'EPSG:3346':1,
        'EPSG:3350':1,
        'EPSG:3351':1,
        'EPSG:3352':1,
        'EPSG:3366':1,
        'EPSG:3386':1,
        'EPSG:3387':1,
        'EPSG:3388':1,
        'EPSG:3389':1,
        'EPSG:3390':1,
        'EPSG:3396':1,
        'EPSG:3397':1,
        'EPSG:3398':1,
        'EPSG:3399':1,
        'EPSG:3407':1,
        'EPSG:3414':1,
        'EPSG:3416':1,
        'EPSG:3764':1,
        'EPSG:3788':1,
        'EPSG:3789':1,
        'EPSG:3790':1,
        'EPSG:3791':1,
        'EPSG:3793':1,
        'EPSG:3795':1,
        'EPSG:3796':1,
        'EPSG:3819':1,
        'EPSG:3821':1,
        'EPSG:3823':1,
        'EPSG:3824':1,
        'EPSG:3833':1,
        'EPSG:3834':1,
        'EPSG:3835':1,
        'EPSG:3836':1,
        'EPSG:3837':1,
        'EPSG:3838':1,
        'EPSG:3839':1,
        'EPSG:3840':1,
        'EPSG:3841':1,
        'EPSG:3842':1,
        'EPSG:3843':1,
        'EPSG:3844':1,
        'EPSG:3845':1,
        'EPSG:3846':1,
        'EPSG:3847':1,
        'EPSG:3848':1,
        'EPSG:3849':1,
        'EPSG:3850':1,
        'EPSG:3851':1,
        'EPSG:3852':1,
        'EPSG:3854':1,
        'EPSG:3873':1,
        'EPSG:3874':1,
        'EPSG:3875':1,
        'EPSG:3876':1,
        'EPSG:3877':1,
        'EPSG:3878':1,
        'EPSG:3879':1,
        'EPSG:3880':1,
        'EPSG:3881':1,
        'EPSG:3882':1,
        'EPSG:3883':1,
        'EPSG:3884':1,
        'EPSG:3885':1,
        'EPSG:3888':1,
        'EPSG:3889':1,
        'EPSG:3906':1,
        'EPSG:3907':1,
        'EPSG:3908':1,
        'EPSG:3909':1,
        'EPSG:3910':1,
        'EPSG:3911':1,
        'EPSG:4001':1,
        'EPSG:4002':1,
        'EPSG:4003':1,
        'EPSG:4004':1,
        'EPSG:4005':1,
        'EPSG:4006':1,
        'EPSG:4007':1,
        'EPSG:4008':1,
        'EPSG:4009':1,
        'EPSG:4010':1,
        'EPSG:4011':1,
        'EPSG:4012':1,
        'EPSG:4013':1,
        'EPSG:4014':1,
        'EPSG:4015':1,
        'EPSG:4016':1,
        'EPSG:4017':1,
        'EPSG:4018':1,
        'EPSG:4019':1,
        'EPSG:4020':1,
        'EPSG:4021':1,
        'EPSG:4022':1,
        'EPSG:4023':1,
        'EPSG:4024':1,
        'EPSG:4025':1,
        'EPSG:4026':1,
        'EPSG:4027':1,
        'EPSG:4028':1,
        'EPSG:4029':1,
        'EPSG:4030':1,
        'EPSG:4031':1,
        'EPSG:4032':1,
        'EPSG:4033':1,
        'EPSG:4034':1,
        'EPSG:4035':1,
        'EPSG:4036':1,
        'EPSG:4037':1,
        'EPSG:4038':1,
        'EPSG:4040':1,
        'EPSG:4041':1,
        'EPSG:4042':1,
        'EPSG:4043':1,
        'EPSG:4044':1,
        'EPSG:4045':1,
        'EPSG:4046':1,
        'EPSG:4047':1,
        'EPSG:4052':1,
        'EPSG:4053':1,
        'EPSG:4054':1,
        'EPSG:4055':1,
        'EPSG:4074':1,
        'EPSG:4075':1,
        'EPSG:4080':1,
        'EPSG:4081':1,
        'EPSG:4120':1,
        'EPSG:4121':1,
        'EPSG:4122':1,
        'EPSG:4123':1,
        'EPSG:4124':1,
        'EPSG:4125':1,
        'EPSG:4126':1,
        'EPSG:4127':1,
        'EPSG:4128':1,
        'EPSG:4129':1,
        'EPSG:4130':1,
        'EPSG:4131':1,
        'EPSG:4132':1,
        'EPSG:4133':1,
        'EPSG:4134':1,
        'EPSG:4135':1,
        'EPSG:4136':1,
        'EPSG:4137':1,
        'EPSG:4138':1,
        'EPSG:4139':1,
        'EPSG:4140':1,
        'EPSG:4141':1,
        'EPSG:4142':1,
        'EPSG:4143':1,
        'EPSG:4144':1,
        'EPSG:4145':1,
        'EPSG:4146':1,
        'EPSG:4147':1,
        'EPSG:4148':1,
        'EPSG:4149':1,
        'EPSG:4150':1,
        'EPSG:4151':1,
        'EPSG:4152':1,
        'EPSG:4153':1,
        'EPSG:4154':1,
        'EPSG:4155':1,
        'EPSG:4156':1,
        'EPSG:4157':1,
        'EPSG:4158':1,
        'EPSG:4159':1,
        'EPSG:4160':1,
        'EPSG:4161':1,
        'EPSG:4162':1,
        'EPSG:4163':1,
        'EPSG:4164':1,
        'EPSG:4165':1,
        'EPSG:4166':1,
        'EPSG:4167':1,
        'EPSG:4168':1,
        'EPSG:4169':1,
        'EPSG:4170':1,
        'EPSG:4171':1,
        'EPSG:4172':1,
        'EPSG:4173':1,
        'EPSG:4174':1,
        'EPSG:4175':1,
        'EPSG:4176':1,
        'EPSG:4178':1,
        'EPSG:4179':1,
        'EPSG:4180':1,
        'EPSG:4181':1,
        'EPSG:4182':1,
        'EPSG:4183':1,
        'EPSG:4184':1,
        'EPSG:4185':1,
        'EPSG:4188':1,
        'EPSG:4189':1,
        'EPSG:4190':1,
        'EPSG:4191':1,
        'EPSG:4192':1,
        'EPSG:4193':1,
        'EPSG:4194':1,
        'EPSG:4195':1,
        'EPSG:4196':1,
        'EPSG:4197':1,
        'EPSG:4198':1,
        'EPSG:4199':1,
        'EPSG:4200':1,
        'EPSG:4201':1,
        'EPSG:4202':1,
        'EPSG:4203':1,
        'EPSG:4204':1,
        'EPSG:4205':1,
        'EPSG:4206':1,
        'EPSG:4207':1,
        'EPSG:4208':1,
        'EPSG:4209':1,
        'EPSG:4210':1,
        'EPSG:4211':1,
        'EPSG:4212':1,
        'EPSG:4213':1,
        'EPSG:4214':1,
        'EPSG:4215':1,
        'EPSG:4216':1,
        'EPSG:4218':1,
        'EPSG:4219':1,
        'EPSG:4220':1,
        'EPSG:4221':1,
        'EPSG:4222':1,
        'EPSG:4223':1,
        'EPSG:4224':1,
        'EPSG:4225':1,
        'EPSG:4226':1,
        'EPSG:4227':1,
        'EPSG:4228':1,
        'EPSG:4229':1,
        'EPSG:4230':1,
        'EPSG:4231':1,
        'EPSG:4232':1,
        'EPSG:4233':1,
        'EPSG:4234':1,
        'EPSG:4235':1,
        'EPSG:4236':1,
        'EPSG:4237':1,
        'EPSG:4238':1,
        'EPSG:4239':1,
        'EPSG:4240':1,
        'EPSG:4241':1,
        'EPSG:4242':1,
        'EPSG:4243':1,
        'EPSG:4244':1,
        'EPSG:4245':1,
        'EPSG:4246':1,
        'EPSG:4247':1,
        'EPSG:4248':1,
        'EPSG:4249':1,
        'EPSG:4250':1,
        'EPSG:4251':1,
        'EPSG:4252':1,
        'EPSG:4253':1,
        'EPSG:4254':1,
        'EPSG:4255':1,
        'EPSG:4256':1,
        'EPSG:4257':1,
        'EPSG:4258':1,
        'EPSG:4259':1,
        'EPSG:4260':1,
        'EPSG:4261':1,
        'EPSG:4262':1,
        'EPSG:4263':1,
        'EPSG:4264':1,
        'EPSG:4265':1,
        'EPSG:4266':1,
        'EPSG:4267':1,
        'EPSG:4268':1,
        'EPSG:4269':1,
        'EPSG:4270':1,
        'EPSG:4271':1,
        'EPSG:4272':1,
        'EPSG:4273':1,
        'EPSG:4274':1,
        'EPSG:4275':1,
        'EPSG:4276':1,
        'EPSG:4277':1,
        'EPSG:4278':1,
        'EPSG:4279':1,
        'EPSG:4280':1,
        'EPSG:4281':1,
        'EPSG:4282':1,
        'EPSG:4283':1,
        'EPSG:4284':1,
        'EPSG:4285':1,
        'EPSG:4286':1,
        'EPSG:4287':1,
        'EPSG:4288':1,
        'EPSG:4289':1,
        'EPSG:4291':1,
        'EPSG:4292':1,
        'EPSG:4293':1,
        'EPSG:4294':1,
        'EPSG:4295':1,
        'EPSG:4296':1,
        'EPSG:4297':1,
        'EPSG:4298':1,
        'EPSG:4299':1,
        'EPSG:4300':1,
        'EPSG:4301':1,
        'EPSG:4302':1,
        'EPSG:4303':1,
        'EPSG:4304':1,
        'EPSG:4306':1,
        'EPSG:4307':1,
        'EPSG:4308':1,
        'EPSG:4309':1,
        'EPSG:4310':1,
        'EPSG:4311':1,
        'EPSG:4312':1,
        'EPSG:4313':1,
        'EPSG:4314':1,
        'EPSG:4315':1,
        'EPSG:4316':1,
        'EPSG:4317':1,
        'EPSG:4318':1,
        'EPSG:4319':1,
        'EPSG:4322':1,
        'EPSG:4324':1,
        'EPSG:4326':1,
        'EPSG:4327':1,
        'EPSG:4329':1,
        'EPSG:4339':1,
        'EPSG:4341':1,
        'EPSG:4343':1,
        'EPSG:4345':1,
        'EPSG:4347':1,
        'EPSG:4349':1,
        'EPSG:4351':1,
        'EPSG:4353':1,
        'EPSG:4355':1,
        'EPSG:4357':1,
        'EPSG:4359':1,
        'EPSG:4361':1,
        'EPSG:4363':1,
        'EPSG:4365':1,
        'EPSG:4367':1,
        'EPSG:4369':1,
        'EPSG:4371':1,
        'EPSG:4373':1,
        'EPSG:4375':1,
        'EPSG:4377':1,
        'EPSG:4379':1,
        'EPSG:4381':1,
        'EPSG:4383':1,
        'EPSG:4386':1,
        'EPSG:4388':1,
        'EPSG:4417':1,
        'EPSG:4434':1,
        'EPSG:4463':1,
        'EPSG:4466':1,
        'EPSG:4469':1,
        'EPSG:4470':1,
        'EPSG:4472':1,
        'EPSG:4475':1,
        'EPSG:4480':1,
        'EPSG:4482':1,
        'EPSG:4483':1,
        'EPSG:4490':1,
        'EPSG:4491':1,
        'EPSG:4492':1,
        'EPSG:4493':1,
        'EPSG:4494':1,
        'EPSG:4495':1,
        'EPSG:4496':1,
        'EPSG:4497':1,
        'EPSG:4498':1,
        'EPSG:4499':1,
        'EPSG:4500':1,
        'EPSG:4501':1,
        'EPSG:4502':1,
        'EPSG:4503':1,
        'EPSG:4504':1,
        'EPSG:4505':1,
        'EPSG:4506':1,
        'EPSG:4507':1,
        'EPSG:4508':1,
        'EPSG:4509':1,
        'EPSG:4510':1,
        'EPSG:4511':1,
        'EPSG:4512':1,
        'EPSG:4513':1,
        'EPSG:4514':1,
        'EPSG:4515':1,
        'EPSG:4516':1,
        'EPSG:4517':1,
        'EPSG:4518':1,
        'EPSG:4519':1,
        'EPSG:4520':1,
        'EPSG:4521':1,
        'EPSG:4522':1,
        'EPSG:4523':1,
        'EPSG:4524':1,
        'EPSG:4525':1,
        'EPSG:4526':1,
        'EPSG:4527':1,
        'EPSG:4528':1,
        'EPSG:4529':1,
        'EPSG:4530':1,
        'EPSG:4531':1,
        'EPSG:4532':1,
        'EPSG:4533':1,
        'EPSG:4534':1,
        'EPSG:4535':1,
        'EPSG:4536':1,
        'EPSG:4537':1,
        'EPSG:4538':1,
        'EPSG:4539':1,
        'EPSG:4540':1,
        'EPSG:4541':1,
        'EPSG:4542':1,
        'EPSG:4543':1,
        'EPSG:4544':1,
        'EPSG:4545':1,
        'EPSG:4546':1,
        'EPSG:4547':1,
        'EPSG:4548':1,
        'EPSG:4549':1,
        'EPSG:4550':1,
        'EPSG:4551':1,
        'EPSG:4552':1,
        'EPSG:4553':1,
        'EPSG:4554':1,
        'EPSG:4555':1,
        'EPSG:4557':1,
        'EPSG:4558':1,
        'EPSG:4568':1,
        'EPSG:4569':1,
        'EPSG:4570':1,
        'EPSG:4571':1,
        'EPSG:4572':1,
        'EPSG:4573':1,
        'EPSG:4574':1,
        'EPSG:4575':1,
        'EPSG:4576':1,
        'EPSG:4577':1,
        'EPSG:4578':1,
        'EPSG:4579':1,
        'EPSG:4580':1,
        'EPSG:4581':1,
        'EPSG:4582':1,
        'EPSG:4583':1,
        'EPSG:4584':1,
        'EPSG:4585':1,
        'EPSG:4586':1,
        'EPSG:4587':1,
        'EPSG:4588':1,
        'EPSG:4589':1,
        'EPSG:4600':1,
        'EPSG:4601':1,
        'EPSG:4602':1,
        'EPSG:4603':1,
        'EPSG:4604':1,
        'EPSG:4605':1,
        'EPSG:4606':1,
        'EPSG:4607':1,
        'EPSG:4608':1,
        'EPSG:4609':1,
        'EPSG:4610':1,
        'EPSG:4611':1,
        'EPSG:4612':1,
        'EPSG:4613':1,
        'EPSG:4614':1,
        'EPSG:4615':1,
        'EPSG:4616':1,
        'EPSG:4617':1,
        'EPSG:4618':1,
        'EPSG:4619':1,
        'EPSG:4620':1,
        'EPSG:4621':1,
        'EPSG:4622':1,
        'EPSG:4623':1,
        'EPSG:4624':1,
        'EPSG:4625':1,
        'EPSG:4626':1,
        'EPSG:4627':1,
        'EPSG:4628':1,
        'EPSG:4629':1,
        'EPSG:4630':1,
        'EPSG:4631':1,
        'EPSG:4632':1,
        'EPSG:4633':1,
        'EPSG:4634':1,
        'EPSG:4635':1,
        'EPSG:4636':1,
        'EPSG:4637':1,
        'EPSG:4638':1,
        'EPSG:4639':1,
        'EPSG:4640':1,
        'EPSG:4641':1,
        'EPSG:4642':1,
        'EPSG:4643':1,
        'EPSG:4644':1,
        'EPSG:4645':1,
        'EPSG:4646':1,
        'EPSG:4652':1,
        'EPSG:4653':1,
        'EPSG:4654':1,
        'EPSG:4655':1,
        'EPSG:4656':1,
        'EPSG:4657':1,
        'EPSG:4658':1,
        'EPSG:4659':1,
        'EPSG:4660':1,
        'EPSG:4661':1,
        'EPSG:4662':1,
        'EPSG:4663':1,
        'EPSG:4664':1,
        'EPSG:4665':1,
        'EPSG:4666':1,
        'EPSG:4667':1,
        'EPSG:4668':1,
        'EPSG:4669':1,
        'EPSG:4670':1,
        'EPSG:4671':1,
        'EPSG:4672':1,
        'EPSG:4673':1,
        'EPSG:4674':1,
        'EPSG:4675':1,
        'EPSG:4676':1,
        'EPSG:4677':1,
        'EPSG:4678':1,
        'EPSG:4679':1,
        'EPSG:4680':1,
        'EPSG:4681':1,
        'EPSG:4682':1,
        'EPSG:4683':1,
        'EPSG:4684':1,
        'EPSG:4685':1,
        'EPSG:4686':1,
        'EPSG:4687':1,
        'EPSG:4688':1,
        'EPSG:4689':1,
        'EPSG:4690':1,
        'EPSG:4691':1,
        'EPSG:4692':1,
        'EPSG:4693':1,
        'EPSG:4694':1,
        'EPSG:4695':1,
        'EPSG:4696':1,
        'EPSG:4697':1,
        'EPSG:4698':1,
        'EPSG:4699':1,
        'EPSG:4700':1,
        'EPSG:4701':1,
        'EPSG:4702':1,
        'EPSG:4703':1,
        'EPSG:4704':1,
        'EPSG:4705':1,
        'EPSG:4706':1,
        'EPSG:4707':1,
        'EPSG:4708':1,
        'EPSG:4709':1,
        'EPSG:4710':1,
        'EPSG:4711':1,
        'EPSG:4712':1,
        'EPSG:4713':1,
        'EPSG:4714':1,
        'EPSG:4715':1,
        'EPSG:4716':1,
        'EPSG:4717':1,
        'EPSG:4718':1,
        'EPSG:4719':1,
        'EPSG:4720':1,
        'EPSG:4721':1,
        'EPSG:4722':1,
        'EPSG:4723':1,
        'EPSG:4724':1,
        'EPSG:4725':1,
        'EPSG:4726':1,
        'EPSG:4727':1,
        'EPSG:4728':1,
        'EPSG:4729':1,
        'EPSG:4730':1,
        'EPSG:4731':1,
        'EPSG:4732':1,
        'EPSG:4733':1,
        'EPSG:4734':1,
        'EPSG:4735':1,
        'EPSG:4736':1,
        'EPSG:4737':1,
        'EPSG:4738':1,
        'EPSG:4739':1,
        'EPSG:4740':1,
        'EPSG:4741':1,
        'EPSG:4742':1,
        'EPSG:4743':1,
        'EPSG:4744':1,
        'EPSG:4745':1,
        'EPSG:4746':1,
        'EPSG:4747':1,
        'EPSG:4748':1,
        'EPSG:4749':1,
        'EPSG:4750':1,
        'EPSG:4751':1,
        'EPSG:4752':1,
        'EPSG:4753':1,
        'EPSG:4754':1,
        'EPSG:4755':1,
        'EPSG:4756':1,
        'EPSG:4757':1,
        'EPSG:4758':1,
        'EPSG:4759':1,
        'EPSG:4760':1,
        'EPSG:4761':1,
        'EPSG:4762':1,
        'EPSG:4763':1,
        'EPSG:4764':1,
        'EPSG:4765':1,
        'EPSG:4766':1,
        'EPSG:4767':1,
        'EPSG:4768':1,
        'EPSG:4769':1,
        'EPSG:4770':1,
        'EPSG:4771':1,
        'EPSG:4772':1,
        'EPSG:4773':1,
        'EPSG:4774':1,
        'EPSG:4775':1,
        'EPSG:4776':1,
        'EPSG:4777':1,
        'EPSG:4778':1,
        'EPSG:4779':1,
        'EPSG:4780':1,
        'EPSG:4781':1,
        'EPSG:4782':1,
        'EPSG:4783':1,
        'EPSG:4784':1,
        'EPSG:4785':1,
        'EPSG:4786':1,
        'EPSG:4787':1,
        'EPSG:4788':1,
        'EPSG:4789':1,
        'EPSG:4790':1,
        'EPSG:4791':1,
        'EPSG:4792':1,
        'EPSG:4793':1,
        'EPSG:4794':1,
        'EPSG:4795':1,
        'EPSG:4796':1,
        'EPSG:4797':1,
        'EPSG:4798':1,
        'EPSG:4799':1,
        'EPSG:4800':1,
        'EPSG:4801':1,
        'EPSG:4802':1,
        'EPSG:4803':1,
        'EPSG:4804':1,
        'EPSG:4805':1,
        'EPSG:4806':1,
        'EPSG:4807':1,
        'EPSG:4808':1,
        'EPSG:4809':1,
        'EPSG:4810':1,
        'EPSG:4811':1,
        'EPSG:4812':1,
        'EPSG:4813':1,
        'EPSG:4814':1,
        'EPSG:4815':1,
        'EPSG:4816':1,
        'EPSG:4817':1,
        'EPSG:4818':1,
        'EPSG:4819':1,
        'EPSG:4820':1,
        'EPSG:4821':1,
        'EPSG:4822':1,
        'EPSG:4823':1,
        'EPSG:4824':1,
        'EPSG:4839':1,
        'EPSG:4855':1,
        'EPSG:4856':1,
        'EPSG:4857':1,
        'EPSG:4858':1,
        'EPSG:4859':1,
        'EPSG:4860':1,
        'EPSG:4861':1,
        'EPSG:4862':1,
        'EPSG:4863':1,
        'EPSG:4864':1,
        'EPSG:4865':1,
        'EPSG:4866':1,
        'EPSG:4867':1,
        'EPSG:4868':1,
        'EPSG:4869':1,
        'EPSG:4870':1,
        'EPSG:4871':1,
        'EPSG:4872':1,
        'EPSG:4873':1,
        'EPSG:4874':1,
        'EPSG:4875':1,
        'EPSG:4876':1,
        'EPSG:4877':1,
        'EPSG:4878':1,
        'EPSG:4879':1,
        'EPSG:4880':1,
        'EPSG:4883':1,
        'EPSG:4885':1,
        'EPSG:4887':1,
        'EPSG:4889':1,
        'EPSG:4891':1,
        'EPSG:4893':1,
        'EPSG:4895':1,
        'EPSG:4898':1,
        'EPSG:4900':1,
        'EPSG:4901':1,
        'EPSG:4902':1,
        'EPSG:4903':1,
        'EPSG:4904':1,
        'EPSG:4907':1,
        'EPSG:4909':1,
        'EPSG:4921':1,
        'EPSG:4923':1,
        'EPSG:4925':1,
        'EPSG:4927':1,
        'EPSG:4929':1,
        'EPSG:4931':1,
        'EPSG:4933':1,
        'EPSG:4935':1,
        'EPSG:4937':1,
        'EPSG:4939':1,
        'EPSG:4941':1,
        'EPSG:4943':1,
        'EPSG:4945':1,
        'EPSG:4947':1,
        'EPSG:4949':1,
        'EPSG:4951':1,
        'EPSG:4953':1,
        'EPSG:4955':1,
        'EPSG:4957':1,
        'EPSG:4959':1,
        'EPSG:4961':1,
        'EPSG:4963':1,
        'EPSG:4965':1,
        'EPSG:4967':1,
        'EPSG:4969':1,
        'EPSG:4971':1,
        'EPSG:4973':1,
        'EPSG:4975':1,
        'EPSG:4977':1,
        'EPSG:4979':1,
        'EPSG:4981':1,
        'EPSG:4983':1,
        'EPSG:4985':1,
        'EPSG:4987':1,
        'EPSG:4989':1,
        'EPSG:4991':1,
        'EPSG:4993':1,
        'EPSG:4995':1,
        'EPSG:4997':1,
        'EPSG:4999':1,
        'EPSG:5012':1,
        'EPSG:5013':1,
        'EPSG:5017':1,
        'EPSG:5048':1,
        'EPSG:5105':1,
        'EPSG:5106':1,
        'EPSG:5107':1,
        'EPSG:5108':1,
        'EPSG:5109':1,
        'EPSG:5110':1,
        'EPSG:5111':1,
        'EPSG:5112':1,
        'EPSG:5113':1,
        'EPSG:5114':1,
        'EPSG:5115':1,
        'EPSG:5116':1,
        'EPSG:5117':1,
        'EPSG:5118':1,
        'EPSG:5119':1,
        'EPSG:5120':1,
        'EPSG:5121':1,
        'EPSG:5122':1,
        'EPSG:5123':1,
        'EPSG:5124':1,
        'EPSG:5125':1,
        'EPSG:5126':1,
        'EPSG:5127':1,
        'EPSG:5128':1,
        'EPSG:5129':1,
        'EPSG:5130':1,
        'EPSG:5132':1,
        'EPSG:5167':1,
        'EPSG:5168':1,
        'EPSG:5169':1,
        'EPSG:5170':1,
        'EPSG:5171':1,
        'EPSG:5172':1,
        'EPSG:5173':1,
        'EPSG:5174':1,
        'EPSG:5175':1,
        'EPSG:5176':1,
        'EPSG:5177':1,
        'EPSG:5178':1,
        'EPSG:5179':1,
        'EPSG:5180':1,
        'EPSG:5181':1,
        'EPSG:5182':1,
        'EPSG:5183':1,
        'EPSG:5184':1,
        'EPSG:5185':1,
        'EPSG:5186':1,
        'EPSG:5187':1,
        'EPSG:5188':1,
        'EPSG:5224':1,
        'EPSG:5228':1,
        'EPSG:5229':1,
        'EPSG:5233':1,
        'EPSG:5245':1,
        'EPSG:5246':1,
        'EPSG:5251':1,
        'EPSG:5252':1,
        'EPSG:5253':1,
        'EPSG:5254':1,
        'EPSG:5255':1,
        'EPSG:5256':1,
        'EPSG:5257':1,
        'EPSG:5258':1,
        'EPSG:5259':1,
        'EPSG:5263':1,
        'EPSG:5264':1,
        'EPSG:5269':1,
        'EPSG:5270':1,
        'EPSG:5271':1,
        'EPSG:5272':1,
        'EPSG:5273':1,
        'EPSG:5274':1,
        'EPSG:5275':1,
        'EPSG:5801':1,
        'EPSG:5802':1,
        'EPSG:5803':1,
        'EPSG:5804':1,
        'EPSG:5808':1,
        'EPSG:5809':1,
        'EPSG:5810':1,
        'EPSG:5811':1,
        'EPSG:5812':1,
        'EPSG:5813':1,
        'EPSG:5814':1,
        'EPSG:5815':1,
        'EPSG:5816':1,
        'EPSG:20004':1,
        'EPSG:20005':1,
        'EPSG:20006':1,
        'EPSG:20007':1,
        'EPSG:20008':1,
        'EPSG:20009':1,
        'EPSG:20010':1,
        'EPSG:20011':1,
        'EPSG:20012':1,
        'EPSG:20013':1,
        'EPSG:20014':1,
        'EPSG:20015':1,
        'EPSG:20016':1,
        'EPSG:20017':1,
        'EPSG:20018':1,
        'EPSG:20019':1,
        'EPSG:20020':1,
        'EPSG:20021':1,
        'EPSG:20022':1,
        'EPSG:20023':1,
        'EPSG:20024':1,
        'EPSG:20025':1,
        'EPSG:20026':1,
        'EPSG:20027':1,
        'EPSG:20028':1,
        'EPSG:20029':1,
        'EPSG:20030':1,
        'EPSG:20031':1,
        'EPSG:20032':1,
        'EPSG:20064':1,
        'EPSG:20065':1,
        'EPSG:20066':1,
        'EPSG:20067':1,
        'EPSG:20068':1,
        'EPSG:20069':1,
        'EPSG:20070':1,
        'EPSG:20071':1,
        'EPSG:20072':1,
        'EPSG:20073':1,
        'EPSG:20074':1,
        'EPSG:20075':1,
        'EPSG:20076':1,
        'EPSG:20077':1,
        'EPSG:20078':1,
        'EPSG:20079':1,
        'EPSG:20080':1,
        'EPSG:20081':1,
        'EPSG:20082':1,
        'EPSG:20083':1,
        'EPSG:20084':1,
        'EPSG:20085':1,
        'EPSG:20086':1,
        'EPSG:20087':1,
        'EPSG:20088':1,
        'EPSG:20089':1,
        'EPSG:20090':1,
        'EPSG:20091':1,
        'EPSG:20092':1,
        'EPSG:21413':1,
        'EPSG:21414':1,
        'EPSG:21415':1,
        'EPSG:21416':1,
        'EPSG:21417':1,
        'EPSG:21418':1,
        'EPSG:21419':1,
        'EPSG:21420':1,
        'EPSG:21421':1,
        'EPSG:21422':1,
        'EPSG:21423':1,
        'EPSG:21453':1,
        'EPSG:21454':1,
        'EPSG:21455':1,
        'EPSG:21456':1,
        'EPSG:21457':1,
        'EPSG:21458':1,
        'EPSG:21459':1,
        'EPSG:21460':1,
        'EPSG:21461':1,
        'EPSG:21462':1,
        'EPSG:21463':1,
        'EPSG:21473':1,
        'EPSG:21474':1,
        'EPSG:21475':1,
        'EPSG:21476':1,
        'EPSG:21477':1,
        'EPSG:21478':1,
        'EPSG:21479':1,
        'EPSG:21480':1,
        'EPSG:21481':1,
        'EPSG:21482':1,
        'EPSG:21483':1,
        'EPSG:21896':1,
        'EPSG:21897':1,
        'EPSG:21898':1,
        'EPSG:21899':1,
        'EPSG:22171':1,
        'EPSG:22172':1,
        'EPSG:22173':1,
        'EPSG:22174':1,
        'EPSG:22175':1,
        'EPSG:22176':1,
        'EPSG:22177':1,
        'EPSG:22181':1,
        'EPSG:22182':1,
        'EPSG:22183':1,
        'EPSG:22184':1,
        'EPSG:22185':1,
        'EPSG:22186':1,
        'EPSG:22187':1,
        'EPSG:22191':1,
        'EPSG:22192':1,
        'EPSG:22193':1,
        'EPSG:22194':1,
        'EPSG:22195':1,
        'EPSG:22196':1,
        'EPSG:22197':1,
        'EPSG:25884':1,
        'EPSG:27205':1,
        'EPSG:27206':1,
        'EPSG:27207':1,
        'EPSG:27208':1,
        'EPSG:27209':1,
        'EPSG:27210':1,
        'EPSG:27211':1,
        'EPSG:27212':1,
        'EPSG:27213':1,
        'EPSG:27214':1,
        'EPSG:27215':1,
        'EPSG:27216':1,
        'EPSG:27217':1,
        'EPSG:27218':1,
        'EPSG:27219':1,
        'EPSG:27220':1,
        'EPSG:27221':1,
        'EPSG:27222':1,
        'EPSG:27223':1,
        'EPSG:27224':1,
        'EPSG:27225':1,
        'EPSG:27226':1,
        'EPSG:27227':1,
        'EPSG:27228':1,
        'EPSG:27229':1,
        'EPSG:27230':1,
        'EPSG:27231':1,
        'EPSG:27232':1,
        'EPSG:27391':1,
        'EPSG:27392':1,
        'EPSG:27393':1,
        'EPSG:27394':1,
        'EPSG:27395':1,
        'EPSG:27396':1,
        'EPSG:27397':1,
        'EPSG:27398':1,
        'EPSG:27492':1,
        'EPSG:28402':1,
        'EPSG:28403':1,
        'EPSG:28404':1,
        'EPSG:28405':1,
        'EPSG:28406':1,
        'EPSG:28407':1,
        'EPSG:28408':1,
        'EPSG:28409':1,
        'EPSG:28410':1,
        'EPSG:28411':1,
        'EPSG:28412':1,
        'EPSG:28413':1,
        'EPSG:28414':1,
        'EPSG:28415':1,
        'EPSG:28416':1,
        'EPSG:28417':1,
        'EPSG:28418':1,
        'EPSG:28419':1,
        'EPSG:28420':1,
        'EPSG:28421':1,
        'EPSG:28422':1,
        'EPSG:28423':1,
        'EPSG:28424':1,
        'EPSG:28425':1,
        'EPSG:28426':1,
        'EPSG:28427':1,
        'EPSG:28428':1,
        'EPSG:28429':1,
        'EPSG:28430':1,
        'EPSG:28431':1,
        'EPSG:28432':1,
        'EPSG:28462':1,
        'EPSG:28463':1,
        'EPSG:28464':1,
        'EPSG:28465':1,
        'EPSG:28466':1,
        'EPSG:28467':1,
        'EPSG:28468':1,
        'EPSG:28469':1,
        'EPSG:28470':1,
        'EPSG:28471':1,
        'EPSG:28472':1,
        'EPSG:28473':1,
        'EPSG:28474':1,
        'EPSG:28475':1,
        'EPSG:28476':1,
        'EPSG:28477':1,
        'EPSG:28478':1,
        'EPSG:28479':1,
        'EPSG:28480':1,
        'EPSG:28481':1,
        'EPSG:28482':1,
        'EPSG:28483':1,
        'EPSG:28484':1,
        'EPSG:28485':1,
        'EPSG:28486':1,
        'EPSG:28487':1,
        'EPSG:28488':1,
        'EPSG:28489':1,
        'EPSG:28490':1,
        'EPSG:28491':1,
        'EPSG:28492':1,
        'EPSG:29701':1,
        'EPSG:29702':1,
        'EPSG:30161':1,
        'EPSG:30162':1,
        'EPSG:30163':1,
        'EPSG:30164':1,
        'EPSG:30165':1,
        'EPSG:30166':1,
        'EPSG:30167':1,
        'EPSG:30168':1,
        'EPSG:30169':1,
        'EPSG:30170':1,
        'EPSG:30171':1,
        'EPSG:30172':1,
        'EPSG:30173':1,
        'EPSG:30174':1,
        'EPSG:30175':1,
        'EPSG:30176':1,
        'EPSG:30177':1,
        'EPSG:30178':1,
        'EPSG:30179':1,
        'EPSG:30800':1,
        'EPSG:31251':1,
        'EPSG:31252':1,
        'EPSG:31253':1,
        'EPSG:31254':1,
        'EPSG:31255':1,
        'EPSG:31256':1,
        'EPSG:31257':1,
        'EPSG:31258':1,
        'EPSG:31259':1,
        'EPSG:31275':1,
        'EPSG:31276':1,
        'EPSG:31277':1,
        'EPSG:31278':1,
        'EPSG:31279':1,
        'EPSG:31281':1,
        'EPSG:31282':1,
        'EPSG:31283':1,
        'EPSG:31284':1,
        'EPSG:31285':1,
        'EPSG:31286':1,
        'EPSG:31287':1,
        'EPSG:31288':1,
        'EPSG:31289':1,
        'EPSG:31290':1,
        'EPSG:31466':1,
        'EPSG:31467':1,
        'EPSG:31468':1,
        'EPSG:31469':1,
        'EPSG:31700':1
    };

    /**
     * APIFunction: getUTMZone
     * Return the UTM zone from a given latitude.
     *      IGNF: _addition_
     *
     * Parameters:
     * lat - {Number} the latitude.
     *
     * Returns:
     * {String} the UTM zone from 1 to 60.
     */
    OpenLayers.Projection.getUTMZone= function(lat) {
        var s= ''+(Math.floor(lat/6)+31);
        return s;
    };

    /**
     * APIFunction: getMGRSZone
     * Return the UTM zone and latitude band for a given longitude, latitude as
     * explained in http://en.wikipedia.org/wiki/Universal_Transverse_Mercator_coordinate_system :
     *      Latitude bands
     *
     *      Latitude bands are not a part of UTM, but rather a part of MGRS.
     *      They are however sometimes used.
     *
     *      Latitude bands
     *
     *      Each zone is segmented into 20 latitude bands. Each latitude band is 8
     *      degrees high, and is lettered starting from "C" at 80° S, increasing
     *      up the English alphabet until "X", omitting the letters "I" and "O"
     *      (because of their similarity to the numerals one and zero). The last
     *      latitude band, "X", is extended an extra 4 degrees, so it ends at 84°
     *      N latitude, thus covering the northernmost land on Earth. Latitude
     *      bands "A" and "B" do exist, as do bands "Y" and Z". They cover the
     *      western and eastern sides of the Antarctic and Arctic regions
     *      respectively. A convenient mnemonic to remember is that the letter "N"
     *      is the first letter in the northern hemisphere, so any letter coming
     *      before "N" in the alphabet is in the southern hemisphere, and any
     *      letter "N" or after is in the northern hemisphere.
     *
     *      Notation
     *
     *      The combination of a zone and a latitude band defines a grid zone. The
     *      zone is always written first, followed by the latitude band. For
     *      example (see image, top right), a position in Toronto, Canada, would
     *      find itself in zone 17 and latitude band "T", thus the full grid zone
     *      reference is "17T". The grid zones serve to delineate irregular UTM
     *      zone boundaries. They also are an integral part of the military grid
     *      reference system.
     *
     *      A note of caution: A method also is used that simply adds N or S
     *      following the zone number to indicate North or South hemisphere (the
     *      easting and northing coordinates along with the zone number supplying
     *      everything necessary to geolocate a position except which hemisphere).
     *      However, this method has caused some confusion since, for instance,
     *      "50S" can mean southern hemisphere but also grid zone "50S" in the
     *      northern hemisphere.
     *
     *      Exceptions
     *
     *      These grid zones are uniform over the globe, except in two areas. On
     *      the southwest coast of Norway, grid zone 32V is extended further west,
     *      and grid zone 31V is correspondingly shrunk to cover only open water.
     *      Also, in the region around Svalbard, the four grid zones 31X, 33X,
     *      35X, and 37X are extended to cover what would otherwise have been
     *      covered by the seven grid zones 31X to 37X. The three grid zones 32X,
     *      34X and 36X are not used.
     *
     *      See also:
     *      http://en.wikipedia.org/wiki/Military_grid_reference_system
     *
     *      Polar regions
     *
     *      In the polar regions, a different convention is used. South of
     *      80°S, UPS South (Universal Polar Stereographic) is used instead of a
     *      UTM projection. The west half-circle forms a grid zone with
     *      designation A; the east half-circle forms one with designation B; see
     *      figure 3. North of 84°N, UPS North is used, and the west half-circle
     *      is Y, the east one is Z; see figure 4. Since the letters A, B, Y, and
     *      Z are not used for any latitude bands of UTM, their presence in an
     *      MGRS coordinate, with the omission of a zone number, indicates that
     *      the coordinates are in the UPS system.
     *
     *      The lettering scheme for 100,000 m squares is slightly different in
     *      the polar regions. The row letters go from A to Z, omitting I and O.
     *      The column letters use a more restricted alphabet, going from A to Z
     *      but omitting I, O, D, E, M, N, V, W; the columns are arranged so that
     *      the rightmost column in grid zone A and Y has column letter Z, and the
     *      next column in grid zone B or Z starts over with column letter A. The
     *      restricted column alphabet for UPS ensures that no UPS square will be
     *      adjacent to a UTM square with the same identification.
     *
     *      In the polar regions, there is only one version of the lettering
     *      scheme.
     *
     *      See also:
     *      http://en.wikipedia.org/wiki/Universal_Polar_Stereographic_coordinate_system
     *      http://fr.wikipedia.org/wiki/Fichier:Utm-zones.jpg
     *
     *      IGNF: _addition_
     *
     * Parameters:
     * zone - {String} UTM zone
     * ll - {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>} longitude, latitude
     *
     *
     * Returns:
     * {String}
     */
    OpenLayers.Projection.getMGRSZone= function(zone, ll) {
        var MGRS= ['C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'];
        var s;
        // below 80°S :
        if (ll.lat<-80) {
            if (ll.lon<0) {
                s= 'A';
            } else {
                s= 'B';
            }
            return s;
        }
        // above 84°N :
        if (ll.lat>84) {
            if (ll.lon<0) {
                s= 'Y';
            } else {
                s= 'Z';
            }
            return s;
        }
        // special case X (12°) :
        if (ll.lat>72) {
            if (ll.lon<0 || ll.lon>42) {
                s= zone + 'X';
            } else {
                if (ll.lon<=9) {
                    s= '31X';
                } else if (ll.lon<=21) {
                    s= '33X';
                } else if (ll.lon<=33) {
                    s= '35X';
                } else {
                    s= '37X';
                }
            }
            return s;
        }
        //General case:
        var iMGRS= Math.abs(parseInt((ll.lat+80)/8, 10));
        s= zone + MGRS[iMGRS];
        //Special case southwest coast of Norway :
        if (s=='31V' && ll.lon>3) {
            s= '32V';
        }
        return s;
    };

    /**
     * APIFunction: transform
     * Transform a point coordinate from one projection to another.  Note that
     *     the input point is transformed in place.
     *      IGNF: _transformation only occurs when source and destination
     *      projections are different_.
     *
     * Parameters:
     * geom - {<OpenLayers.Geometry at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry-js.html> | Object} An object with x and y
     *     properties representing coordinates in those dimensions.
     *     IGNF: It can be an {Array({<OpenLayers.Geometry at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Geometry-js.html> | Object})}.
     * source - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} Source map coordinate system
     * dest - {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} Destination map coordinate system
     *
     * Returns:
     * geom - {object} A transformed coordinate.  The original geometry is modified.
     */
    OpenLayers.Projection.transform= function(geom, source, dest) {
        if (source && dest) {
            if (window.Proj4js &&
                (source.proj instanceof Proj4js.Proj) &&
                (dest.proj instanceof Proj4js.Proj)) {
                if (!source.equals(dest)) {
                    // avoid transform when projections are identifical (by name) ...
                    // in order not to have weird coordinates :
                    if (OpenLayers.Util.isArray(geom)) {
                        for (var i= 0, l= geom.length; i<l; i++) {
                            geom[i]= Proj4js.transform(source.proj, dest.proj, geom[i]);
                            if (geom[i] instanceof OpenLayers.Geometry) { geom[i].bounds= null; }
                        }
                    } else {
                        geom= Proj4js.transform(source.proj, dest.proj, geom);
                        if (geom instanceof OpenLayers.Geometry) { geom.bounds= null; }
                    }
                }
            } else {
                if (typeof(source.getCode)=='function') {
                    source= source.getCode();
                }
                if (typeof(dest.getCode)=='function') {
                    dest= dest.getCode();
                }
                if (OpenLayers.Projection.transforms[source] && OpenLayers.Projection.transforms[source][dest]) {
                    //FIXME : source and dest equality is not checked ...
                    if (OpenLayers.Util.isArray(geom)) {
                        for (var i= 0, l= geom.length; i<l; i++) {
                            OpenLayers.Projection.transforms[source][dest](geom[i]);
                            if (geom[i] instanceof OpenLayers.Geometry) { geom[i].bounds= null; }
                        }
                    } else {
                        OpenLayers.Projection.transforms[source][dest](geom);
                        if (geom instanceof OpenLayers.Geometry) { geom.bounds= null; }
                    }
                }
            }
        }
        return geom;
    };

    /**
     * Constant : CRS84
     * {Object} Proj4JS CRS84 (urn:ogc:def:crs:OGC:1.3:CRS84)
     *      IGNF: _needed addition_
     */
    OpenLayers.Projection.CRS84= new OpenLayers.Projection('WGS84');

    /**
     * Constant : WebMercator
     * {Object} Proj4JS EPSG:3857
     *      IGNF: _needed addition_
     */
    OpenLayers.Projection.WebMercator= new OpenLayers.Projection('EPSG:3857');

}

/**
 * Class: OpenLayers.Map
 * IGNF: bug fixes in IE
 */

if (OpenLayers.Map) {

    OpenLayers.Map= OpenLayers.overload(OpenLayers.Map, {

    /**
     * APIMethod: removeLayer
     * Removes a layer from the map by removing its visual element (the
     *   layer.div property), then removing it from the map's internal list
     *   of layers, setting the layer's map property to null.
     *
     *   a "removelayer" event is triggered.
     *
     *   very worthy of mention is that simply removing a layer from a map
     *   will not cause the removal of any popups which may have been created
     *   by the layer. this is due to the fact that it was decided at some
     *   point that popups would not belong to layers. thus there is no way
     *   for us to know here to which layer the popup belongs.
     *
     *     A simple solution to this is simply to call destroy() on the layer.
     *     the default OpenLayers.Layer class's destroy() function
     *     automatically takes care to remove itself from whatever map it has
     *     been attached to.
     *
     *     The correct solution is for the layer itself to register an 
     *     event-handler on "removelayer" and when it is called, if it 
     *     recognizes itself as the layer being removed, then it cycles through
     *     its own personal list of popups, removing them from the map.
     *
     *  IGNF: _cases in IE6/7 where layerContainerDiv.childNodes.length==0_
     *
     * Parameters:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>}
     * setNewBaseLayer - {Boolean} Default is true
     */
    removeLayer: function(layer, setNewBaseLayer) {
        if (setNewBaseLayer == null) {
            setNewBaseLayer = true;
        }
    
        if (layer.isFixed) {
            this.viewPortDiv.removeChild(layer.div);
        } else {
            //IGNF: this.layerContainerDiv.childNodes.length==0 ? (IE)
            if (this.layerContainerDiv.childNodes.length>0) {
                this.layerContainerDiv.removeChild(layer.div);
            }
        }
        OpenLayers.Util.removeItem(this.layers, layer);
        layer.removeMap(this);
        layer.map = null;

        // if we removed the base layer, need to set a new one
        if(this.baseLayer == layer) {
            this.baseLayer = null;
            if(setNewBaseLayer) {
                for(var i=0, len=this.layers.length; i<len; i++) {
                    var iLayer = this.layers[i];
                    if (iLayer.isBaseLayer || this.allOverlays) {
                        this.setBaseLayer(iLayer);
                        break;
                    }
                }
            }
        }

        this.resetLayersZIndex();

        this.events.triggerEvent("removelayer", {layer: layer});
        layer.events.triggerEvent("removed", {map: this, layer: layer});
    },

    /**
     * Method: isValidLonLat
     *          IGNF: add no baseLayer case
     * 
     * Parameters:
     * lonlat - {<OpenLayers.LonLat>}
     * 
     * Returns:
     * {Boolean} Whether or not the lonlat passed in is non-null and within
     *           the maxExtent bounds
     */
    isValidLonLat: function(lonlat) {
        var valid = false;
        if (lonlat != null) {
            var maxExtent = this.getMaxExtent();
            if (this.baseLayer) {
                var worldBounds = this.baseLayer.wrapDateLine && maxExtent;
                valid = maxExtent.containsLonLat(lonlat, {worldBounds: worldBounds});
            } else {
                valid = maxExtent.containsLonLat(lonlat);
            }
        }
        return valid;
    },

    /**
     * Method: isValidZoomLevel
     * IGNF: _use minZoomLevel/maxZoomLevel when defined_.
     *
     * Parameters:
     * zoomLevel - {Integer}
     *
     * Returns:
     * {Boolean} Whether or not the zoom level passed in is non-null and
     *           within the min/max range of zoom levels.
     */
    isValidZoomLevel: function(zoomLevel) {
        var isVZL= (zoomLevel != null);
        // remove the try catch when 2.11 is out !?
        try {
            isVZL= isVZL && (zoomLevel >= (this.getRestrictedMinZoom() || 0));
        } catch (e) {
            // getRestrictedMinZoom exists in OL 2.11 not before
            isVZL= isVZL && (zoomLevel >= 0);
        }
        isVZL= isVZL && (zoomLevel < this.getNumZoomLevels());
        if (this.minZoomLevel!=undefined) {
            isVZL= isVZL && (zoomLevel>=this.minZoomLevel);
        }
        if (this.maxZoomLevel!=undefined) {
            isVZL= isVZL && (zoomLevel<=this.maxZoomLevel);
        }
        return isVZL;
    },

    /**
     * APIMethod: getProjection
     * Returns the projection object from the baselayer.
     *
     * Returns:
     * {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the base layer's projection or map's default
     * projection if none.
     */
    getProjection: function() {
        var projection= null;
        if (this.baseLayer != null) {
            projection= this.baseLayer.projection;
        } else {
            projection= this.projection;
        }
        if (projection && typeof(projection)=="string"){
            projection= new OpenLayers.Projection(projection);
        }
        return projection? projection : null;
    },

    /**
     * APIMethod: getProjectionObject
     * Returns the projection object from the baselayer.
     *
     * FIXME: In 3.0, we will remove getProjectionObject, and instead
     *     return a Projection object from this function. 
     *
     * IGNF: _alias getProjectionObject()_.
     *
     * Returns:
     * {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the base layer's projection or map's default
     * projection if none.
     */
    getProjectionObject: function() {
        return this.getProjection();
    },

    /**
     * APIMethod : getDisplayProjection
     * IGNF: _addition_
     *
     * Returns:
     * {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} the map's display projection for various controls.
     */
    getDisplayProjection: function() {
        var projection= null;
        if (this.displayProjection) {
            projection= this.displayProjection;
        } else {
            projection= this.getProjection();
        }
        return projection;
    },

    /**
     * APIMethod: getMaxExtent
     * IGNF: _Return map's max extent. If none, set it to the world's extent (-180,
     * -90, 180, 90) reprojected according to map's projection_.
     *
     * Parameters:
     * options - {Object}
     *
     * Allowed Options:
     * restricted - {Boolean} If true, returns
     *     restricted extent (if it is available.)
     *
     * Returns:
     * {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>} The maxExtent property as set on the current
     *     baselayer, unless the 'restricted' option is set, in which case
     *     the 'restrictedExtent' option from the map is returned (if it
     *     is set).
     */
    getMaxExtent: function(options) {
        var maxExtent= null;
        if (options && options.restricted && this.restrictedExtent) {
            maxExtent = this.restrictedExtent;
        } else if (this.baseLayer != null) {
            maxExtent= this.baseLayer.maxExtent;
        }
        if (!maxExtent) {
            // FIXME: reprojecting world's extent may produce unexpected bounds ...
            this.maxExtent= new OpenLayers.Bounds(-180, -90, 180, 90);
            this.maxExtent.transform(OpenLayers.Projection.CRS84, this.getProjection(), true);
            maxExtent= this.maxExtent;
        }
        return maxExtent;
    }

    });

}

/**
 * Class: OpenLayers.Layer
 * IGNF: support for Geoportail's GeoRM.
 */

if (OpenLayers.Layer) {

    OpenLayers.Layer= OpenLayers.overload(OpenLayers.Layer, {

    /**
     * Property: savedStates
     * {Object} Hashtable of opacity, visibility of the layer for each base layer.
     *      The saving occurs during the "changebaselayer" events.
     *      IGNF: _addition_
     */
    savedStates: {},

    /**
     * Constructor: OpenLayers.Layer
     * IGNF: _GeoRM addition_.
     *
     * Parameters:
     * name - {String} The layer name
     * options - {Object} Hashtable of extra options to tag onto the layer
     */
    initialize: function(name, options) {

        this.metadata = {};

        this.addOptions(options);

        this.name = name;

        if (this.id == null) {

            this.id = OpenLayers.Util.createUniqueID(this.CLASS_NAME + "_");

            this.div = OpenLayers.Util.createDiv(this.id);
            this.div.style.width = "100%";
            this.div.style.height = "100%";
            this.div.dir = "ltr";

            this.events = new OpenLayers.Events(this, this.div,
                                                this.EVENT_TYPES);
            if(this.eventListeners instanceof Object) {
                this.events.on(this.eventListeners);
            }

        }

        //IGNF: begin
        this.savedStates= {};

        if (this.GeoRM) {
            if (!this.events) {
                this.events = new OpenLayers.Events(this, this.div, this.EVENT_TYPES);
            }
            this.events.register('loadstart', this, this.updateGeoRM);
            this.events.register('move', this, this.updateGeoRM);
            this.events.register('moveend', this, this.updateGeoRM);
        }
        //IGNF: end
    },

    /**
     * Method: calculateResolutions
     * Calculate resolutions based on the provided properties.
     * IGNF : _back to OL2.11 behaviour_ 
     *
     * Parameters:
     * props - {Object} Properties
     *
     * Returns:
     * {Array({Number})} Array of resolutions.
     */
    calculateResolutions: function(props) {

        var viewSize, wRes, hRes;

        // determine maxResolution
        var maxResolution = props.maxResolution;
        if(props.minScale != null) {
            maxResolution =
                OpenLayers.Util.getResolutionFromScale(props.minScale,
                                                       this.units);
        } else if(maxResolution == "auto" && this.maxExtent != null) {
            viewSize = this.map.getSize();
            wRes = this.maxExtent.getWidth() / viewSize.w;
            hRes = this.maxExtent.getHeight() / viewSize.h;
            maxResolution = Math.max(wRes, hRes);
        }

        // determine minResolution
        var minResolution = props.minResolution;
        if(props.maxScale != null) {
            minResolution =
                OpenLayers.Util.getResolutionFromScale(props.maxScale,
                                                       this.units);
        } else if(props.minResolution == "auto" && this.minExtent != null) {
            viewSize = this.map.getSize();
            wRes = this.minExtent.getWidth() / viewSize.w;
            hRes = this.minExtent.getHeight()/ viewSize.h;
            minResolution = Math.max(wRes, hRes);
        }

        // IGNF : this test (new in OL2.12) computes wrong resolutions
/*
        if(typeof maxResolution !== "number" &&
           typeof minResolution !== "number" &&
           this.maxExtent != null) {
            // maxResolution for default grid sets assumes that at zoom
            // level zero, the whole world fits on one tile.
            var tileSize = this.map.getTileSize();
            maxResolution = Math.max(
                this.maxExtent.getWidth() / tileSize.w,
                this.maxExtent.getHeight() / tileSize.h
            );
        }
*/
        // determine numZoomLevels
        var maxZoomLevel = props.maxZoomLevel;
        var numZoomLevels = props.numZoomLevels;
        if(typeof minResolution === "number" &&
           typeof maxResolution === "number" && numZoomLevels === undefined) {
            var ratio = maxResolution / minResolution;
            numZoomLevels = Math.floor(Math.log(ratio) / Math.log(2)) + 1;
        } else if(numZoomLevels === undefined && maxZoomLevel != null) {
            numZoomLevels = maxZoomLevel + 1;
        }

        // are we able to calculate resolutions?
        if(typeof numZoomLevels !== "number" || numZoomLevels <= 0 ||
           (typeof maxResolution !== "number" &&
                typeof minResolution !== "number")) {
            return;
        }

        // now we have numZoomLevels and at least one of maxResolution
        // or minResolution, we can populate the resolutions array

        var resolutions = new Array(numZoomLevels);
        var base = 2;
        if(typeof minResolution == "number" &&
           typeof maxResolution == "number") {
            // if maxResolution and minResolution are set, we calculate
            // the base for exponential scaling that starts at
            // maxResolution and ends at minResolution in numZoomLevels
            // steps.
            base = Math.pow(
                    (maxResolution / minResolution),
                (1 / (numZoomLevels - 1))
            );
        }

        var i;
        if(typeof maxResolution === "number") {
            for(i=0; i<numZoomLevels; i++) {
                resolutions[i] = maxResolution / Math.pow(base, i);
            }
        } else {
            for(i=0; i<numZoomLevels; i++) {
                resolutions[numZoomLevels - 1 - i] =
                    minResolution * Math.pow(base, i);
            }
        }

        return resolutions;
    },

    /**
     * Method: destroy
     * Destroy is a destructor: this is to alleviate cyclic references which
     *     the Javascript garbage cleaner can not take care of on its own.
     * IGNF: _GeoRM addition_.
     *
     * Parameters:
     * setNewBaseLayer - {Boolean} Set a new base layer when this layer has
     *     been destroyed.  Default is true.
     */
    destroy: function(setNewBaseLayer) {
        if (setNewBaseLayer == null) {
            setNewBaseLayer = true;
        }
        if (this.map != null) {
            this.map.removeLayer(this, setNewBaseLayer);
        }
        this.projection = null;
        this.map = null;
        this.name = null;
        this.div = null;
        this.options = null;
        //IGNF: begin
        this.savedStates = null;
        if (this.constraints) {
            this.constraints = null;
        }

        if (this.GeoRM) {
            this.events.unregister('moveend', this, this.updateGeoRM);
            this.events.unregister('move', this, this.updateGeoRM);
            this.events.unregister('loadstart', this, this.updateGeoRM);
        }
        //IGNF: end
        if (this.events) {
            if(this.eventListeners) {
                this.events.un(this.eventListeners);
            }
            this.events.destroy();
        }
        this.eventListeners = null;
        this.events = null;
    },

    /**
     * APIMethod: clone
     * IGNF: _GeoRM addition_.
     *
     * Parameters:
     * obj - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} The layer to be cloned
     *
     * Returns:
     * {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} An exact clone of this <OpenLayers/Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>
     */
    clone: function (obj) {

        if (obj == null) {
            obj = new OpenLayers.Layer(this.name, this.getOptions());
        }

        // catch any randomly tagged-on properties
        OpenLayers.Util.applyDefaults(obj, this);

        // a cloned layer should never have its map property set
        //  because it has not been added to a map yet.
        obj.map = null;

        //IGNF: begin
        //FIXME: GeoRM cloned ...
        obj.savedStates = {};
        //IGNF: end

        return obj;
    },

    /**
     * Method: updateGeoRM
     * Refresh or ask for a GeoRM token.
     *  IGNF: _addition_
     *
     * Returns:
     * {Boolean} always true.
     */
    updateGeoRM: function() {
        return true;
    },

    /**
     * APIMethod: getNativeProjection
     * This method returns the layer's service side projection.
     *      IGNF: _addition_.
     *
     * Returns:
     * {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>}
     */
    getNativeProjection: function() {
        if (this.isBaseLayer) {
            this.projection= this.projection||this.nativeProjection;
        }
        if (!this.projection && this.map) {
            this.projection= this.map.getProjection();
        }
        if (this.projection && typeof(this.projection)=="string"){
            this.projection= new OpenLayers.Projection(this.projection);
        }
        return this.projection;
    }

    });

}

/**
 * Class: OpenLayers.Popup
 * IGNF: see http://trac.osgeo.org/openlayers/attachment/ticket/3567/openlayers-3567.patch
 */
if (OpenLayers.Popup) {

    OpenLayers.Popup= OpenLayers.overload(OpenLayers.Popup, {

    /**
     * APIProperty: closeBoxDisplayClass
     * {String} The CSS class of the popup close box div.
     */
    closeBoxDisplayClass: "olPopupCloseBox",

    /**
     * APIMethod: updateSize
     * Auto size the popup so that it precisely fits its contents (as 
     *     determined by this.contentDiv.innerHTML). Popup size will, of
     *     course, be limited by the available space on the current map
     */
    updateSize: function() {
        
        // determine actual render dimensions of the contents by putting its
        // contents into a fake contentDiv (for the CSS) and then measuring it
        var preparedHTML = "<div class='" + this.contentDisplayClass+ "'>" + 
            this.contentDiv.innerHTML + 
            "</div>";
 
        // patch :
        //var containerElement = (this.map) ? this.map.layerContainerDiv
        var containerElement = (this.map) ? this.map.div
                                          : OpenLayers.getDoc().body; //IGNF
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
     * Method: addCloseBox
     * Add a close box icon to the popup.
     *  IGNF: _unregister events for Firefox set by draw()_.
     *  IGNF:_redesigned the use closeBoxDisplayClass and
     *  defaultCloseBoxCallBack._
     * 
     * Parameters:
     * callback - {Function} The callback to be called when the close button
     *     is clicked.
     */
    addCloseBox: function(callback) {
        // close icon
        this.closeDiv = OpenLayers.Util.createDiv(
            this.id + "_close", null, new OpenLayers.Size(17, 17)
        );
        this.closeDiv.className = this.closeBoxDisplayClass;
        // use the content div's css padding to determine if we should
        // padd the close div
        var contentDivPadding = this.getContentDivPadding();
        this.closeDiv.style.right = contentDivPadding.right + "px";
        this.closeDiv.style.top = contentDivPadding.top + "px";
        this.groupDiv.appendChild(this.closeDiv);
        var closePopup = callback || this.defaultCloseBoxCallback;
        OpenLayers.Event.observe(this.closeDiv, "touchend",
            OpenLayers.Function.bindAsEventListener(closePopup, this));
        OpenLayers.Event.observe(this.closeDiv, "click",
            OpenLayers.Function.bindAsEventListener(closePopup, this));
    },

    /**
     * APIMethod: defaultCloseBoxCallback
     * Stop event, hide the popup, unregister "movestart" and "moveend" events
     * (under FF only) and triggers "featureunselected".
     *  IGNF: _addition to facilitate inheritance_
     *
     * Parameters:
     * e - {Event}
     */
    defaultCloseBoxCallback: function(e) {
        this.hide();
        OpenLayers.Event.stop(e);
    }

    });

}

/**
 * Class: OpenLayers.Popup.Anchored
 * IGNF: Check relativePosition for null value.
 */
if (OpenLayers.Popup && OpenLayers.Popup.Anchored) {

    OpenLayers.Popup.Anchored= OpenLayers.overload(OpenLayers.Popup.Anchored, {

    /**
     * APIMethod: calculateNewPx
     * Return the new position of the popup.
     *
     * Parameters:
     * px - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>}
     *
     * Returns:
     * {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} The new px position of the popup on the screen
     *     relative to the passed-in px.
     */
    calculateNewPx:function(px) {
        var newPx = px.offset(this.anchor.offset);

        //use contentSize if size is not already set
        var size = this.size || this.contentSize;

        var top = (this.relativePosition && this.relativePosition.charAt(0) == 't');
        newPx.y += (top) ? -size.h : this.anchor.size.h;

        var left = (this.relativePosition && this.relativePosition.charAt(1) == 'l');
        newPx.x += (left) ? -size.w : this.anchor.size.w;

        return newPx;
    }

    });

}

/**
 * Class: OpenLayers.Layer.HTTPRequest
 * IGNF: GeoRM additions
 */
if (OpenLayers.Layer && OpenLayers.Layer.HTTPRequest) {

    OpenLayers.Layer.HTTPRequest= OpenLayers.overload(OpenLayers.Layer.HTTPRequest, {

    /**
     * APIMethod: mergeNewParams
     * IGNF: _GeoRM addition_.
     *
     * Parameters:
     * newParams - {Object}
     *
     * Returns:
     * redrawn: {Boolean} whether the layer was actually redrawn.
     */
    mergeNewParams: function(newParams) {
        this.params = OpenLayers.Util.extend(this.params, newParams);
        if(this.GeoRM) {//IGN
            OpenLayers.Util.extend(this.params, this.GeoRM.token);
            if (this.GeoRM.transport=='referrer') {
                OpenLayers.Util.extend(this.params, Geoportal.GeoRMHandler.getCookieReferrer((this.map? this.map.div :null),true));
            }
        }
        var ret = this.redraw();
        if(this.map != null) {
            this.map.events.triggerEvent("changelayer", {
                layer: this,
                property: "params"
            });
        }
        return ret;
    },

    /**
     * APIMethod: getFullRequestString
     * Combine url with layer's params and these newParams.
     *      IGNF: _GeoRM addition_.
     *
     *    does checking on the serverPath variable, allowing for cases when it
     *     is supplied with trailing ? or &, as well as cases where not.
     *
     *    return in formatted string like this:
     *        "server?key1=value1&key2=value2&key3=value3"
     *
     * WARNING: The altUrl parameter is deprecated and will be removed in 3.0.
     *
     * Parameters:
     * newParams - {Object}
     * altUrl - {String} Use this as the url instead of the layer's url
     *
     * Returns:
     * {String} the final full request.
     */
    getFullRequestString: function(newParams, altUrl) {

        // if not altUrl passed in, use layer's url
        var url = altUrl || this.url;

        // create a new params hashtable with all the layer params and the
        // new params together. then convert to string
        var allParams = OpenLayers.Util.extend({}, this.params);
        allParams = OpenLayers.Util.extend(allParams, newParams);
        if(this.GeoRM) {//IGN
            OpenLayers.Util.extend(allParams, this.GeoRM.token);
            if (this.GeoRM.transport=='referrer') {
                OpenLayers.Util.extend(allParams, Geoportal.GeoRMHandler.getCookieReferrer((this.map? this.map.div : null),true));
            }
        }
        var paramsString = OpenLayers.Util.getParameterString(allParams);

        // if url is not a string, it should be an array of strings,
        // in which case we will deterministically select one of them in
        // order to evenly distribute requests to different urls.
        //
        if (OpenLayers.Util.isArray(url)) {
            url = this.selectUrl(paramsString, url);
        }

        // ignore parameters that are already in the url search string
        var urlParams =
            OpenLayers.Util.upperCaseObject(OpenLayers.Util.getParameters(url));
        for(var key in allParams) {
            if(key.toUpperCase() in urlParams) {
                delete allParams[key];
            }
        }
        paramsString = OpenLayers.Util.getParameterString(allParams);

        return OpenLayers.Util.urlAppend(url, paramsString);
    }

    });

}

/**
 * Class: OpenLayers.Tile
 */
if (OpenLayers.Tile) {

    OpenLayers.Tile= OpenLayers.overload(OpenLayers.Tile, {

    /** TBD 3.0 -- remove 'url' from the list of parameters to the constructor.
     *             there is no need for the base tile class to have a url.
     *
     * Constructor: OpenLayers.Tile
     * Constructor for a new <OpenLayers.Tile at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Tile-js.html> instance.
     *      IGNF: _GeoRM addition_.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} layer that the tile will go in.
     * position - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>}
     * bounds - {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>}
     * url - {<String>}
     * size - {<OpenLayers.Size at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Size-js.html>}
     * options - {Object}
     */
    initialize: function(layer, position, bounds, url, size, options) {
        this.layer = layer;
        this.position = position.clone();
        this.setBounds(bounds);
        this.url = url;
        if (size) {
            this.size = size.clone();
        }

        //give the tile a unique id based on its BBOX.
        this.id = OpenLayers.Util.createUniqueID("Tile_");

        OpenLayers.Util.extend(this, options);

        this.events = new OpenLayers.Events(this);
        if (this.eventListeners instanceof Object) {
            this.events.on(this.eventListeners);
        }

        //IGNF: begin
        if (layer.GeoRM) {
            this.events.register('reload', this, this.updateGeoRM);
            this.events.register('loadstart', this, this.updateGeoRM);
        }
        //IGNF: end
    },

    /**
     * APIMethod: destroy
     * Nullify references to prevent circular references and memory leaks
     *      IGNF: _GeoRM addition_.
     */
    destroy: function() {
        //IGNF: begin
        if (this.layer.GeoRM) {
            this.events.unregister('reload', this, this.updateGeoRM);
            this.events.unregister('loadstart', this, this.updateGeoRM);
        }
        //IGNF: end

        this.layer  = null;
        this.bounds = null;
        this.size = null;
        this.position = null;

        if (this.eventListeners) {
            this.events.un(this.eventListeners);
        }
        this.events.destroy();
        this.eventListeners = null;
        this.events = null;
    },

    /**
     * Method: updateGeoRM
     * Refresh or ask for a GeoRM token.
     *      IGNF: _GeoRM addition_.
     *
     * Returns:
     * {Boolean} always true.
     */
    updateGeoRM: function() {
        return true;
    },

    /**
     * Method: shouldDraw
     * Return whether or not the tile should actually be (re-)drawn. The only
     * case where we *wouldn't* want to draw the tile is if the tile is outside
     * its layer's maxExtent
     *      IGNF: _takes care of compatible projections_
     * 
     * Returns:
     * {Boolean} Whether or not the tile should actually be drawn.
     */
    shouldDraw: function() {
        //IGNF: bounds is in layer's native projection ...
        //      be sure maxExtent is in the same !
        var withinMaxExtent = false,
            maxExtent = this.layer.resample? this.layer.nativeMaxExtent : this.layer.maxExtent;
        if (maxExtent) {
            var map = this.layer.map;
            var worldBounds = map.baseLayer.wrapDateLine && map.getMaxExtent();
            if (this.bounds.intersectsBounds(maxExtent, {inclusive: false, worldBounds: worldBounds})) {
                withinMaxExtent = true;
            }
        }

        return withinMaxExtent || this.layer.displayOutsideMaxExtent;
    }

    });

}

/**
 * Class: OpenLayers.Tile.Image
 * IGNF: handling cases
 */
if (OpenLayers.Tile && OpenLayers.Tile.Image) {

    OpenLayers.Tile.Image= OpenLayers.overload(OpenLayers.Tile.Image, {

    /**
     * Method: onImageError
     * Handler for the image onerror event
     */
    onImageError: function() {
        var img = this.imgDiv;
        if (img.src != null) {
            this.imageReloadAttempts++;
            if (this.imageReloadAttempts <= OpenLayers.IMAGE_RELOAD_ATTEMPTS) {
                this.setImgSrc(this.layer.getURL(this.bounds));
            } else {
                // OSM:
                if (img.src.match(/^http:\/\/[abc]\.[a-z]+\.openstreetmap\.org\//)) {
                    img.src = "http://openstreetmap.org/openlayers/img/404.png";
                } else if (img.src.match(/^http:\/\/[def]\.tah\.openstreetmap\.org\//)) {
                    // do nothing - img layer is transparent
                } else {
                    if (this.layer.onLoadError) {
                        img.src= this.layer.onLoadError();
                    } else {
                        if (img.src.match(/^http:\/\/[a-z0-9-]+\.ign\.fr\//) || img.src.match(/^https:\/\/[a-z0-9-]+\.ign\.fr\//)) {
                            if (img.src.match(/TRANSPARENT=true/i) || (img.src.match(/SERVICE=WMTS/i) && !img.src.match(/FORMAT=image[^\&]*jp.?g/i))) {
                                //img.src= Geoportal.Util.getImagesLocation()+'nodata.gif';
                                img.src= OpenLayers.Util.getImagesLocation()+'blank.gif';
                            } else {
                                img.src= Geoportal.Util.getImagesLocation()+'nodata.jpg';
                            }
                        } else {
                            OpenLayers.Element.addClass(img, "olImageLoadError");
                        }
                    }
                }
                this.events.triggerEvent("loaderror");
                this.onImageLoad();
            }
        }
    }

    });
}

/**
 * Class: OpenLayers.Layer.Grid
 * IGNF: GeoRM additions
 * IGNF: Addition of getMaxExtent() for old OpenLayers release (prior 2.10).
 */
if (OpenLayers.Layer && OpenLayers.Layer.Grid) {

    OpenLayers.Layer.Grid= OpenLayers.overload(OpenLayers.Layer.Grid, {

    /**
     * APIMethod: mergeNewParams
     * IGNF: _GeoRM addition_.
     *
     * Parameters:
     * newParams - {Object}
     *
     * Returns:
     * redrawn: {Boolean} whether the layer was actually redrawn.
     */
    mergeNewParams: OpenLayers.Layer.HTTPRequest.prototype.mergeNewParams,

    /**
     * APIMethod: getFullRequestString
     * Combine url with layer's params and these newParams.
     *      IGNF: _GeoRM addition_.
     *
     *    does checking on the serverPath variable, allowing for cases
     *    when it
     *     is supplied with trailing ? or &, as well as cases where not.
     *
     *    return in formatted string like this:
     *        "server?key1=value1&key2=value2&key3=value3"
     *
     * WARNING: The altUrl parameter is deprecated and will be removed in
     * 3.0.
     *
     * Parameters:
     * newParams - {Object}
     * altUrl - {String} Use this as the url instead of the layer's url
     *
     * Returns:
     * {String} the final full request.
     */
    getFullRequestString: OpenLayers.Layer.HTTPRequest.prototype.getFullRequestString,

    /**
     * APIMethod: getTileBounds
     * Returns The tile bounds for a layer given a pixel location.
     * IGNF: _takes into account resampling of tiles_
     *
     * Parameters:
     * viewPortPx - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>} The location in the viewport.
     *
     * Returns:
     * {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>} Bounds of the tile at the given pixel
     * location.
     */
    getTileBounds: function(viewPortPx) {
        var maxExtent, resolution, tileMapWidth, tileMapHeight ;
        if (this.resample) {//IGNF
            maxExtent = this.nativeMaxExtent;
            resolution = this.nativeResolution;
            tileMapWidth = resolution * this.nativeTileSize.w;
            tileMapHeight = resolution * this.nativeTileSize.h;
        } else {
            maxExtent = this.maxExtent;
            resolution = this.getResolution();
            tileMapWidth = resolution * this.tileSize.w;
            tileMapHeight = resolution * this.tileSize.h;
        }
        var mapPoint = this.getLonLatFromViewPortPx(viewPortPx);
        if (this.resample) {//IGNF
            mapPoint.transform(this.map.getProjection(), this.getNativeProjection());
        }
        var tileLeft = maxExtent.left + (tileMapWidth *
                                         Math.floor((mapPoint.lon -
                                                     maxExtent.left) /
                                                    tileMapWidth));
        var tileBottom = maxExtent.bottom + (tileMapHeight *
                                             Math.floor((mapPoint.lat -
                                                         maxExtent.bottom) /
                                                        tileMapHeight));
        return new OpenLayers.Bounds(tileLeft, tileBottom,
                                     tileLeft + tileMapWidth,
                                     tileBottom + tileMapHeight);
    },

    /**
     * Method: transformDiv
     * Transform the layer div.
     *
     * Parameters:
     * scale - {Number} The value by which the layer div is to
     *     be scaled.
     * IGNF : patch for IE8 if scale = NaN;
     */
    transformDiv: function(scale) {
        //IGNF
        if (isNaN(scale))
        return;


        // scale the layer div

        this.div.style.width = 100 * scale + '%';
        this.div.style.height = 100 * scale + '%';

        // and translate the layer div as necessary

        var size = this.map.getSize();
        var lcX = parseInt(this.map.layerContainerDiv.style.left, 10);
        var lcY = parseInt(this.map.layerContainerDiv.style.top, 10);
        var x = (lcX - (size.w / 2.0)) * (scale - 1);
        var y = (lcY - (size.h / 2.0)) * (scale - 1);

        this.div.style.left = x + '%';
        this.div.style.top = y + '%';
    },

    /**
     * Method: getTileOrigin
     * Determine the origin for aligning the grid of tiles.  If a <tileOrigin>
     *     property is supplied, that will be returned.  Otherwise, the origin
     *     will be derived from the layer's <maxExtent> property.  In this
     *     case,
     *     the tile origin will be the corner of the <maxExtent> given by the 
     *     <tileOriginCorner> property.
     *     IGNF: _if no <maxExtent>, then tile origin is at 0,0._
     *
     * Returns:
     * {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>} The tile origin.
     */
    getTileOrigin: function() {
        var origin = this.tileOrigin;
        if (!origin) {
            var extent = this.getMaxExtent();
            var edges = ({
                "tl": ["left", "top"],
                "tr": ["right", "top"],
                "bl": ["left", "bottom"],
                "br": ["right", "bottom"]
            })[this.tileOriginCorner];
            origin = new OpenLayers.LonLat(
                extent? extent[edges[0]]: 0.0,
                extent? extent[edges[1]]: 0.0);
        }
        return origin;
    },

    /**
     * Method: removeExcessTiles
     * When the size of the map or the buffer changes, we may need to
     *     remove some excess rows and columns.
     *     IGNF : before tile is destroyed, remove tile reference from
     *     tileQueue.
     * 
     * Parameters:
     * rows - {Integer} Maximum number of rows we want our grid to have.
     * columns - {Integer} Maximum number of columns we want our grid to have.
     */
    removeExcessTiles: function(rows, columns) {
        var i, l;

        // remove extra rows
        while (this.grid.length > rows) {
            var row = this.grid.pop();
            for (i=0, l=row.length; i<l; i++) {
                var tile = row[i];
                // IGNF : remove tile from tileQueue 
                if (~OpenLayers.Util.indexOf(this.tileQueue, tile)) {
                  this.tileQueue.splice(OpenLayers.Util.indexOf(this.tileQueue, tile),1) ;
                }
                this.destroyTile(tile);
            }
        }

        // remove extra columns
        for (i=0, l=this.grid.length; i<l; i++) {
            while (this.grid[i].length > columns) {
                var row = this.grid[i];
                var tile = row.pop();
                // IGNF : remove tile from tileQueue 
                if (~OpenLayers.Util.indexOf(this.tileQueue, tile)) {
                  this.tileQueue.splice(OpenLayers.Util.indexOf(this.tileQueue, tile),1) ;
                }
                this.destroyTile(tile);
            }
        }
    },
    
    //Merge vith OL2.13 due to IE10 bug
    

    gridResolution: null,
    gridLayout: null,
    rowSign: null,
    


    calculateGridLayout: function(bounds, origin, resolution) {
        var tilelon = resolution * this.tileSize.w;
        var tilelat = resolution * this.tileSize.h;
        
        var offsetlon = bounds.left - origin.lon;
        var tilecol = Math.floor(offsetlon/tilelon) - this.buffer;
        
        var rowSign = this.rowSign;

        var offsetlat = rowSign * (origin.lat - bounds.top + tilelat);  
        var tilerow = Math[~rowSign ? 'floor' : 'ceil'](offsetlat/tilelat) - this.buffer * rowSign;
        
        return { 
          tilelon: tilelon, tilelat: tilelat,
          startcol: tilecol, startrow: tilerow
        };
     },



    clearGrid: function() {
        this.clearTileQueue();
        if (this.grid) {
            for(var iRow=0, len=this.grid.length; iRow<len; iRow++) {
                var row = this.grid[iRow];
                for(var iCol=0, clen=row.length; iCol<clen; iCol++) {
                    var tile = row[iCol];
                    this.destroyTile(tile);
                }
            }
            this.grid = [];
            this.gridResolution = null;
            this.gridLayout = null;
        }
    },

    initialize: function(name, url, params, options) {

        OpenLayers.Layer.HTTPRequest.prototype.initialize.apply(this, 
                                                                arguments);
        this.grid = [];
        this.tileQueue = [];

        if (this.removeBackBufferDelay === null) {
            this.removeBackBufferDelay = this.singleTile ? 0 : 2500;
        }
        
        if (this.className === null) {
            this.className = this.singleTile ? 'olLayerGridSingleTile' :
                                               'olLayerGrid';
        }

        if (!OpenLayers.Animation.isNative) {
            this.deferMoveGriddedTiles = OpenLayers.Function.bind(function() {
                this.moveGriddedTiles(true);
                this.moveTimerId = null;
            }, this);
        }
        
        this.rowSign = this.tileOriginCorner.substr(0, 1) === "t" ? 1 : -1;
    },

    getServerResolution: function(resolution) {
        var distance = Number.POSITIVE_INFINITY;
        resolution = resolution || this.map.getResolution();
        if(this.serverResolutions &&
           OpenLayers.Util.indexOf(this.serverResolutions, resolution) === -1) {
            var i, newDistance, newResolution, serverResolution;
            for(i=this.serverResolutions.length-1; i>= 0; i--) {
                newResolution = this.serverResolutions[i];
                newDistance = Math.abs(newResolution - resolution);
                if (newDistance > distance) {
                    break;
                }
                distance = newDistance;
                serverResolution = newResolution;
            }
            resolution = serverResolution;
        }
        return resolution;
    },

    getTileBoundsForGridIndex: function(row, col) {
        var origin = this.getTileOrigin();
        var tileLayout = this.gridLayout;
        var tilelon = tileLayout.tilelon;
        var tilelat = tileLayout.tilelat;
        var startcol = tileLayout.startcol;
        var startrow = tileLayout.startrow;
        var rowSign = this.rowSign;
        return new OpenLayers.Bounds(
            origin.lon + (startcol + col) * tilelon,
            origin.lat - (startrow + row * rowSign) * tilelat * rowSign,
            origin.lon + (startcol + col + 1) * tilelon,
            origin.lat - (startrow + (row - 1) * rowSign) * tilelat * rowSign
        );
    },

    initGriddedTiles: function(bounds) {

        this.clearTileQueue();

        // work out mininum number of rows and columns; this is the number of
        // tiles required to cover the viewport plus at least one for panning

        var viewSize = this.map.getSize();
        
        var origin = this.getTileOrigin();
        var resolution = this.map.getResolution(),
            serverResolution = this.getServerResolution(),
            ratio = resolution / serverResolution,
            tileSize = {
                w: this.tileSize.w / ratio,
                h: this.tileSize.h / ratio
            };

        var minRows = Math.ceil(viewSize.h/tileSize.h) + 
                      2 * this.buffer + 1;
        var minCols = Math.ceil(viewSize.w/tileSize.w) +
                      2 * this.buffer + 1;

        var tileLayout = this.calculateGridLayout(bounds, origin, serverResolution);
        this.gridLayout = tileLayout;
        
        var tilelon = tileLayout.tilelon;
        var tilelat = tileLayout.tilelat;
        
        //TC 13/08/2013 : layerContainerOriginPx ajouté dans OL 2.13
        //layerContainerOriginPx = coin en haut à gauche de la carte à l'initialisation puis modifié par les déplacement de la carte
        //layerContainerOrigin = initialisé au centre de la carte puis modifié par les déplacement de celle-ci
        
        this.map.layerContainerOriginPx = this.map.getPixelFromLonLat(this.map.layerContainerOrigin);
        this.map.layerContainerOriginPx.x-=Math.round(this.map.size.w/2);
        this.map.layerContainerOriginPx.y-=Math.round(this.map.size.h/2);
        
        var layerContainerDivLeft = this.map.layerContainerOriginPx.x;
        var layerContainerDivTop = this.map.layerContainerOriginPx.y;
              

        var tileBounds = this.getTileBoundsForGridIndex(0, 0);
        var startPx = this.map.getViewPortPxFromLonLat(
            new OpenLayers.LonLat(tileBounds.left, tileBounds.top)
        );
        startPx.x = Math.round(startPx.x) - layerContainerDivLeft;
        startPx.y = Math.round(startPx.y) - layerContainerDivTop;

        var tileData = [], center = this.map.getCenter();

        var rowidx = 0;
        var colidx = 0;
        do {
            var row = this.grid[rowidx];
            if (!row) {
                row = [];
                this.grid.push(row);
            }
            
            colidx = 0;
            do {
                tileBounds = this.getTileBoundsForGridIndex(rowidx, colidx);
                var px = startPx.clone();
                px.x = px.x + colidx * Math.round(tileSize.w);
                px.y = px.y + rowidx * Math.round(tileSize.h);
                var tile = row[colidx];
                if (!tile) {
                    tile = this.addTile(tileBounds, px);
                    this.addTileMonitoringHooks(tile);
                    row.push(tile);
                } else {
                    tile.moveTo(tileBounds, px, false);
                }
                var tileCenter = tileBounds.getCenterLonLat();
                tileData.push({
                    tile: tile,
                    distance: Math.pow(tileCenter.lon - center.lon, 2) +
                        Math.pow(tileCenter.lat - center.lat, 2)
                });
     
                colidx += 1;
            } while ((tileBounds.right <= bounds.right + tilelon * this.buffer)
                     || colidx < minCols);
             
            rowidx += 1;
        } while((tileBounds.bottom >= bounds.bottom - tilelat * this.buffer)
                || rowidx < minRows);
        
        //shave off exceess rows and colums
        this.removeExcessTiles(rowidx, colidx);

        var resolution = this.getServerResolution(),
            immediately = resolution === this.gridResolution;
        // store the resolution of the grid
        this.gridResolution = resolution;

        //now actually draw the tiles
        tileData.sort(function(a, b) {
            return a.distance - b.distance; 
        });
        for (var i=0, ii=tileData.length; i<ii; ++i) {
            tileData[i].tile.draw(immediately);
        }
    }
    


    });

}

/**
 * Class: OpenLayers.Layer.Vector
 * IGNF: bug fixes
 */
if (OpenLayers.Layer && OpenLayers.Layer.Vector) {

    OpenLayers.Layer.Vector= OpenLayers.overload(OpenLayers.Layer.Vector, {

    /**
     * APIMethod: addFeatures
     * Add Features to the layer.
     *      when formatOptions.extractFolders is true, this method should be overriden.
     *      Specially, a callback associated with event 'beforefeaturesadded'
     *      should be defined to filter features.
     *      If not, this method acts like if extractFolders was false ...
     * IGNF: check if feature is an OpenLayers.Feature.Vector
     *
     * Parameters:
     * features - {Array(<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>)}
     * options - {Object}
     */
    addFeatures: function(features, options) {
        if (!(OpenLayers.Util.isArray(features))) {
            features = [features];
        }

        var notify = !options || !options.silent;
        if(notify) {
            var event = {features: features};
            var ret = this.events.triggerEvent("beforefeaturesadded", event);
            if(ret === false) {
                return;
            }
            features = event.features;
        }

        // Track successfully added features for featuresadded event, since
        // beforefeatureadded can veto single features.
        var featuresAdded = [];
        for (var i=0, len=features.length; i<len; i++) {
            if (i != (features.length - 1)) {
                this.renderer.locked = true;
            } else {
                this.renderer.locked = false;
            }
            var feature = features[i];

            //IGNF: extractFolder:true, check if feature is an OpenLayers.Feature.Vector :
            if (!(feature instanceof OpenLayers.Feature.Vector)) {
                continue;
            }

            if (this.geometryType &&
                !(feature.geometry instanceof this.geometryType)) {
                var throwStr = OpenLayers.i18n('componentShouldBe',
                      {'geomType':this.geometryType.prototype.CLASS_NAME});
                throw throwStr;
            }

            //give feature reference to its layer
            feature.layer = this;

            if (!feature.style && this.style) {
                feature.style = OpenLayers.Util.extend({}, this.style);
            }

            if (notify) {
                if(this.events.triggerEvent("beforefeatureadded",
                                            {feature: feature}) === false) {
                    continue;
                };
                this.preFeatureInsert(feature);
            }

            featuresAdded.push(feature);
            this.features.push(feature);
            this.drawFeature(feature);

            if (notify) {
                this.events.triggerEvent("featureadded", {
                    feature: feature
                });
                this.onFeatureInsert(feature);
            }
        }

        if(notify) {
            this.events.triggerEvent("featuresadded", {features: featuresAdded});
        }
    }

    });

}

/**
 * Class: OpenLayers.Layer.WMS
 * IGNF: GeoRM addition
 */
if (OpenLayers.Layer && OpenLayers.Layer.WMS) {

    OpenLayers.Layer.WMS= OpenLayers.overload(OpenLayers.Layer.WMS, {

    /**
     * APIMethod: getFullRequestString
     * Combine the layer's url with its params and these newParams.
     *
     *     Add the SRS parameter from projection -- this is probably
     *     more eloquently done via a setProjection() method, but this
     *     works for now and always.
     *     IGNF: _Takes care of WMS 1.3.0 (CRS and possibly layerLimit)_.
     *
     * Parameters:
     * newParams - {Object}
     * altUrl - {String} Use this as the url instead of the layer's url
     *
     * Returns:
     * {String}
     */
    getFullRequestString: function(newParams, altUrl) {
        var projection= this.getNativeProjection();
        var prm= 'SRS';
        if (parseFloat(this.params.VERSION) >= 1.3) {
            prm= 'CRS';
            if (typeof(this.layerLimit)=='number') {
                var lyrs= this.params.LAYERS.split(',');
                if (this.layerLimit<lyrs.length) {
                    this.params.LAYERS= lyrs.slice(0,this.layerLimit).join(',');
                    OpenLayers.Console.warn('['+lyrs.slice(this.layerLimit).join(',')+']');
                }
            }
        }
        this.params[prm]= (projection == null) ? "none" : projection.getCode();

        return OpenLayers.Layer.Grid.prototype.getFullRequestString.apply(this, arguments);
    },

    /**
     * APIMethod: reverseAxisOrder
     * Returns true if the axis order is reversed for the WMS version and
     * projection of the layer.
     *
     *     IGNF: _case of WMS 1.3 with EPSG:4326 projection but map projection
     *           not in EPSG:4326, uses the layer native projection._
     * 
     * Returns:
     * {Boolean} true if the axis order is reversed, false otherwise.
     */
    reverseAxisOrder : function() {
        var projection= this.getNativeProjection();
        if(projection==null) {
            projection= this.map.getProjection();
        }
        return (parseFloat(this.params.VERSION) >= 1.3 && 
            (!!this.yx[projection.getCode()] || OpenLayers.Projection.defaults[projection.getCode()].yx));
    },

    /**
     * Method: getURL
     * Return a GetMap query string for this layer
     *      IGNF: _reproject bounds if necessary_.
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>} A bounds representing the bbox for the
     *                                request.
     *
     * Returns:
     * {String} A string with the layer's url and parameters and also the
     *          passed-in bounds and appropriate tile size specified as
     *          parameters.
     */
    getURL: function (bounds) {
        // IGNF protect incoming bounds from projection :
        var e= bounds.clone();
        e = this.adjustBounds(e);
        e.transform(this.map.getProjection(),this.getNativeProjection(), true);

        var imageSize = this.getImageSize();
        var newParams = {};
        // WMS 1.3 introduced axis order
        var reverseAxisOrder = this.reverseAxisOrder();
        newParams.BBOX = this.encodeBBOX ?
            e.toBBOX(null, reverseAxisOrder) :
            e.toArray(reverseAxisOrder);
        newParams.WIDTH = imageSize.w;
        newParams.HEIGHT = imageSize.h;
        var requestString = this.getFullRequestString(newParams);
        return requestString;
    },

    /**
     * APIMethod: getDataExtent
     * Returns the max extent.
     * IGNF: _addition_
     *
     * Returns:
     * {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>}
     */
    getDataExtent: function () {
        return this.maxExtent;
    }

    });

}

/**
 * Class: OpenLayers.Layer.Vector.RootContainer
 * IGNF: handling removal of child layers ("Adam Ratcliffe" 2010-07-04).
 */
if (OpenLayers.Layer && OpenLayers.Layer.Vector && OpenLayers.Layer.Vector.RootContainer) {

    OpenLayers.Layer.Vector.RootContainer= OpenLayers.overload(OpenLayers.Layer.Vector.RootContainer, {

    /**
     * Method: setMap
     * IGNF: _handling removal of child layers ("Adam Ratcliffe" 2010-07-04)_
     *
     * Parameters:
     * map - {<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>}
     */
    setMap: function(map) {
        OpenLayers.Layer.Vector.prototype.setMap.apply(this, arguments);
        this.collectRoots();
        //IGNF:map.events.register("changelayer", this, this.handleChangeLayer);
        map.events.on({
            'changelayer': this.handleChangeLayer,
            'removelayer': this.handleRemoveLayer,
            scope: this
        });
    },

    /**
     * Method: removeMap
     * IGNF: _handling removal of child layers ("Adam Ratcliffe" 2010-07-04)_
     *
     * Parameters:
     * map - {<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>}
     */
    removeMap: function(map) {
        //IGNF:map.events.unregister("changelayer", this, this.handleChangeLayer);
        map.events.un({
            'changelayer': this.handleChangeLayer,
            'removelayer': this.handleRemoveLayer,
            scope: this
        });
        this.resetRoots();
        OpenLayers.Layer.Vector.prototype.removeMap.apply(this, arguments);
    },

    /**
     * Method: handleRemoveLayer
     * Event handler for the map's removelayer event.
     * IGNF: _handling removal of child layers ("Adam Ratcliffe" 2010-07-04)_
     *
     * Parameters:
     * evt - {Object}
     */
    handleRemoveLayer: function(evt) {
        var layer = evt.layer;
        for(var i = 0; i < this.layers.length; i++) {
            if(layer == this.layers[i]) {
                this.layers.splice(i, 1);
                this.renderer.eraseFeatures(layer.features);
                return;
            }
        }
    }

    });

}

/**
 * Class: OpenLayers.Protocol.Script
 * IGNF: see <http://trac.osgeo.org/openlayers/ticket/3486>
 */
if (OpenLayers.Protocol && OpenLayers.Protocol.Script) {

    OpenLayers.Protocol.Script= OpenLayers.overload(OpenLayers.Protocol.Script, {

    /** 
     * Method: createRequest
     * Issues a request for features by creating injecting a script in the 
     *     document head.
     *
     * Parameters:
     * url - {String} Service URL.
     * params - {Object} Query string parameters.
     * callback - {Function} Callback to be called with resulting data.
     *
     * Returns:
     * {HTMLScriptElement} The script pending execution.
     */
    createRequest: function(url, params, callback) {
        var id = OpenLayers.Protocol.Script.register(callback);
        var name = "OpenLayers.Protocol.Script.registry.regId" + id;
        params = OpenLayers.Util.extend({}, params);
        params[this.callbackKey] = this.callbackPrefix + name;
        if(url == null){
            url = OpenLayers.Util.urlAppend(
                url, OpenLayers.Util.getParameterString(params)
            );
        }else{
            var posHttp = url.search('http://');
            var posHttps = url.search('https://');
            if((posHttp > -1) || (posHttps > -1)){
                url = OpenLayers.Util.urlAppend(
                    url, OpenLayers.Util.getParameterString(params)
                );
            }
        }
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = url;
        script.id = "OpenLayers_Protocol_Script_" + id;
        var onfail = this.options.onError || function() {};
        var self = this;
        script.onerror = function() {
            onfail.call(self);
        };
        var ua= navigator.userAgent.toLowerCase();
        if (/msie/.test(ua) && !/opera/.test(ua)) {
            script.onreadystatechange= function() {
                if (this.readyState == 'loaded') {
                    if (this.childNodes.length==0) {
                        onfail.call(self);
                    }
                }
            };
        }
        this.pendingRequests[script.id] = script;
        var head = document.getElementsByTagName("head")[0];
        head.appendChild(script);
        return script;
    }

    });

(function() {
    var o = OpenLayers.Protocol.Script;
    var counter = 0;
    o.registry = {};

    /**
     * Function: OpenLayers.Protocol.Script.register
     * Register a callback for a newly created script.
     *
     * Parameters:
     * callback: {Function} The callback to be executed when the newly added
     *     script loads.  This callback will be called with a single argument
     *     that is the JSON returned by the service.
     *
     * Returns:
     * {Number} An identifier for retreiving the registered callback.
     */
    o.register = function(callback) {
        var id = ++counter;
        o.registry["regId" + id] = function() {
            o.unregister(id);
            callback.apply(this, arguments);
        };
        return id;
    };

    /**
     * Function: OpenLayers.Protocol.Script.unregister
     * Unregister a callback previously registered with the register function.
     *
     * Parameters:
     * id: {Number} The identifer returned by the register function.
     */
    o.unregister = function(id) {
        delete o.registry["regId" + id];
    };
})();

}

/**
 * Class: OpenLayers.Layer.GML
 * IGNF: adds clone() method
 */
if (OpenLayers.Layer && OpenLayers.Layer.GML) {

    OpenLayers.Layer.GML= OpenLayers.overload(OpenLayers.Layer.GML, {

    /**
     * APIMethod: addFeatures
     * Add Features to the layer.
     *      when formatOptions.extractFolders is true, this method should be overriden.
     *      Specially, a callback associated with event 'beforefeaturesadded'
     *      should be defined to filter features.
     *      If not, this method acts like if extractFolders was false ...
     * IGNF: check if feature is an OpenLayers.Feature.Vector
     *
     * Parameters:
     * features - {Array(<OpenLayers.Feature.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Feature/Vector-js.html>)}
     * options - {Object}
     */
    addFeatures: OpenLayers.Layer.Vector.prototype.addFeatures,

    /**
     * APIMethod: clone
     * Create a clone of this layer.
     *  IGNF: _addition_
     *
     * Note: Features of the layer are also cloned.
     *
     * Returns:
     * {<OpenLayers.Layer.Vector at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Vector-js.html>} An exact clone of this layer
     */
    clone: function (obj) {

        if (obj == null) {
            obj = new OpenLayers.Layer.GML(this.name, this.url, this.getOptions());
        }

        //get all additions from superclasses
        obj = OpenLayers.Layer.Vector.prototype.clone.apply(this, [obj]);

        // copy/set any non-init, non-simple values here

        //IGNF: begin
        //FIXME: GeoRM cloned ...
        obj.savedStates = {};
        //IGNF: end

        return obj;
    }

    });

}

/**
 * Class: OpenLayers.Layer.XYZ
 * IGNF: GeoRM additions
 */
if (OpenLayers.Layer && OpenLayers.Layer.XYZ) {

    OpenLayers.Layer.XYZ= OpenLayers.overload(OpenLayers.Layer.XYZ, {

    /**
     * APIMethod: getFullRequestString
     * Combine url with layer's params and these newParams.
     *      IGNF: _GeoRM addition_.
     *
     *    does checking on the serverPath variable, allowing for cases
     *    when it
     *     is supplied with trailing ? or &, as well as cases where not.
     *
     *    return in formatted string like this:
     *        "server?key1=value1&key2=value2&key3=value3"
     *
     * WARNING: The altUrl parameter is deprecated and will be removed in
     * 3.0.
     *
     * Parameters:
     * newParams - {Object}
     * altUrl - {String} Use this as the url instead of the layer's url
     *
     * Returns:
     * {String} the final full request.
     */
    getFullRequestString: OpenLayers.Layer.HTTPRequest.prototype.getFullRequestString

    });

}

/**
 * Class: OpenLayers.Popup.Framed
 * IGNF: bug fix for blocks property is not defined when drawing popup out of the map.
 */
if (OpenLayers.Popup && OpenLayers.Popup.Framed) {

    OpenLayers.Popup.Framed= OpenLayers.overload(OpenLayers.Popup.Framed, {

    /**
     * APIMethod: destroy
     *  IGNF: _check for blocks added_
     */
    destroy: function() {
        this.imageSrc = null;
        this.imageSize = null;
        this.isAlphaImage = null;

        this.fixedRelativePosition = false;
        this.positionBlocks = null;

        //remove our blocks
        if (this.blocks) {//IGNF
            for(var i = 0; i < this.blocks.length; i++) {
                var block = this.blocks[i];

                if (block.image) {
                    block.div.removeChild(block.image);
                }
                block.image = null;

                if (block.div) {
                    this.groupDiv.removeChild(block.div);
                }
                block.div = null;
            }
            this.blocks = null;
        }

        OpenLayers.Popup.Anchored.prototype.destroy.apply(this, arguments);
    }

    });

}

/**
 * Class: OpenLayers.Control.KeyboardDefaults
 * IGNF: Patch due to laptops under IE not having the right key code.
 */
if (OpenLayers.Control && OpenLayers.Control.KeyboardDefaults) {

    OpenLayers.Control.KeyboardDefaults= OpenLayers.overload(OpenLayers.Control.KeyboardDefaults, {

    /**
     * Method: defaultKeyPress
     * When handling the key event, we only use evt.keyCode. This holds
     * some drawbacks, though we get around them below. When interpretting
     * the keycodes below (including the comments associated with them),
     * consult the URL below. For instance, the Safari browser returns
     * "IE keycodes", and so is supported by any keycode labeled "IE".
     *
     *  IGNF: _-/6 (IE8 - laptop, no numeric pad - french keyboard)_
     *
     * Very informative URL:
     *    http://unixpapa.com/js/key.html
     * Very interesting URL:
     *    http://asquare.net/javascript/tests/KeyCode.html
     *
     * Parameters:
     * code - {Integer}
     */
    defaultKeyPress: function (evt) {
        //OpenLayers.Console.debug("altKey="+evt.altKey+" ctrlKey="+evt.ctrlKey+" shiftKey="+evt.shiftKey+" charCode="+evt.charCode+" keyCode="+evt.keyCode+" map="+this.map.baseLayer.name);
        var handled= true;
        switch(evt.keyCode) {
            case OpenLayers.Event.KEY_LEFT:
                this.map.pan(-this.slideFactor, 0);
                break;
            case OpenLayers.Event.KEY_RIGHT:
                this.map.pan(this.slideFactor, 0);
                break;
            case OpenLayers.Event.KEY_UP:
                this.map.pan(0, -this.slideFactor);
                break;
            case OpenLayers.Event.KEY_DOWN:
                this.map.pan(0, this.slideFactor);
                break;

            case 33: // Page Up. Same in all browsers.
                var size = this.map.getSize();
                this.map.pan(0, -0.75*size.h);
                break;
            case 34: // Page Down. Same in all browsers.
                var size = this.map.getSize();
                this.map.pan(0, 0.75*size.h);
                break;
            case 35: // End. Same in all browsers.
                var size = this.map.getSize();
                this.map.pan(0.75*size.w, 0);
                break;
            case 36: // Home. Same in all browsers.
                var size = this.map.getSize();
                this.map.pan(-0.75*size.w, 0);
                break;

            case 43:  // +/= (ASCII), keypad + (ASCII, Opera)
            case 61:  // +/= (Mozilla, Opera, some ASCII)
            case 187: // +/= (IE)
            case 107: // keypad + (IE, Mozilla)
                this.map.zoomIn();
                break;
            case 45:  // -/_ (ASCII, Opera), keypad - (ASCII, Opera)
            case 54:  // -/6 (IE8 - IGNF: laptop, no numeric pad - french keyboard)
            case 109: // -/_ (Mozilla), keypad - (Mozilla, IE)
            case 189: // -/_ (IE)
            case 95:  // -/_ (some ASCII)
                this.map.zoomOut();
                break;
            default:
                handled= false;
                break;
        }
        if (handled===true) {
            OpenLayers.Event.stop(evt);
        }
    }

    });

}
