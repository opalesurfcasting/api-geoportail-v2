/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Control.js
 */
/**
 * Class: Geoportal.Control.GraphicScale
 * The Geoportal framework graphic scale widget.
 */
Geoportal.Control.GraphicScale= OpenLayers.Class( Geoportal.Control, {

    /**
     * Constant: METRICSUIMETER
     * {Array({Float})} Ratios for having meter units for the metric system.
     */
    METRICSUIMETER: [1000, 1, 0.01, 0.001],

    /**
     * Constant: METRICSUISYMBOL
     * {Array({String})} Supported metric units.
     */
    METRICSUISYMBOL: ["km", "m", "cm", "mm"],

    /**
     * APIProperty: barAreaWidth
     * {Integer} Length of scale bar in pixels.
     *      Defaults to *150*
     */
    barAreaWidth: 150,

    /**
     * Property: currentUnitInfo
     */
    currentUnitInfo: null,

    /**
     * Property: currentUiSymbol
     */
    currentUiSymbol: null,

    /**
     * Property: currentWidth
     */
    currentWidth: null,

    /**
     * Property: currentDistance
     */
    currentDistance: null,

    /**
     * Property: currentDivisionCount
     */
    currentDivisionCount: null,

    /**
     * Property: listBlocks
     */
    listBlocks: null,

    /**
     * Constructor: Geoportal.Control.GraphicScale
     * Initialize the scale bar.
     */
    initialize: function() {
        Geoportal.Control.prototype.initialize.apply(this, arguments);
        this.listBlocks= [];
    },

    /**
     * APIMethod: destroy
     * Clean the scale bar.
     */
    destroy: function() {
        if (this.map) {
            this.map.events.unregister("zoomend", this, this.redraw);
            this.map.events.unregister("changebaselayer", this, this.redraw);
        }

        if (this.listBlocks) {
            for (var i= 0, len= this.listBlocks.length; i<len; i++) {
                if (this.listBlocks[i]) {
                    if (this.listBlocks[i].parentNode) {
                        this.listBlocks[i].parentNode.removeChild(this.listBlocks[i]);
                    }
                    this.listBlocks[i]= null;
                }
            }
            this.listBlocks= null;
        }

        if (this.divLegend && this.divLegend.parendNode) {
            this.divLegend.parendNode.removeChild(this.divLegend);
            this.divLegend= null;
        }

        if (this.divText1) {
            if (this.divText1.parentNode) {
                this.divText1.parentNode.removeChild(this.divText1);
            }
            this.divText1= null;
        }

        if (this.divText2) {
            if (this.divText2.parentNode) {
                this.divText2.parentNode.removeChild(this.divText2);
            }
            this.divText2= null;
        }

        Geoportal.Control.prototype.destroy.apply(this, arguments);
    },

    /**
     * APIMethod: setMap
     *
     * Parameters:
     * map - {OpenLayers.Map} the map supporting this control.
     */
    setMap: function(map) {
        Geoportal.Control.prototype.setMap.apply(this, arguments);
        this.map.events.register("zoomend", this, this.redraw);
        this.map.events.register("changebaselayer", this, this.redraw);
    },

    /**
     * APIMethod: draw
     *
     * Parameters:
     * px - {OpenLayers.Pixel} the position where to draw this control.
     */
    draw: function(px) {
        Geoportal.Control.prototype.draw.apply(this, arguments);

        this.divText2= this.div.ownerDocument.createElement("div");
        this.divText2.className= this.getDisplayClass() + "Text2";
        this.div.appendChild(this.divText2);

        this.divText1= this.div.ownerDocument.createElement("div");
        this.divText1.className= this.getDisplayClass() + "Text1";
        this.divText1.innerHTML= "0";
        this.div.appendChild(this.divText1);

        this.divLegend= this.div.ownerDocument.createElement("div");
        this.divLegend.className= this.getDisplayClass() + "Legend";
        this.div.appendChild(this.divLegend);

        this.redraw() ;

        return this.div;
    },

    /**
     * APIMethod: redraw
     * Clear the div and start over.
     */
    redraw: function() {
        this.computeBarMetrics();
        this.drawBar();
    },

    /**
     * Method: computeBarMetrics
     */
    computeBarMetrics: function() {
        // algorithme en provenance de htc-scale
        var bFound= false;
        var res= this.map.getResolution();
        if (this.map.getProjection() && this.map.getProjection().getProjName()=='longlat') {
            var center= this.map.getCenter();
            if (!center) {
                center= this.map.getMaxExtent().getCenterLonLat();
            }
            var a= this.map.getProjection().getProperty('semi_major');
            var b= this.map.getProjection().getProperty('semi_minor');
            if (!(a && b)) {
                // approx is to calculate the resolution at the center's latitude :
                //res*= 6378137*3.141592653589793238*Math.cos(center.lat*3.141592653589793238/180.0)/180.0
                res*= 111319.490793273573*Math.cos(center.lat*0.0174532925199432958);
            } else {
                // approximation of a longitudinal degree at latitude phi :
                var cosphi= Math.cos(center.lat*0.0174532925199432958);
                var cosphi2= cosphi*cosphi;
                var sinphi= Math.sin(center.lat*0.0174532925199432958);
                var sinphi2= sinphi*sinphi;
                var a2= a*a;
                var a4= a*a*a*a;
                var b2= b*b;
                var b4= b*b*b*b;
                res*= 0.0174532925199432958*cosphi*Math.sqrt((a4*cosphi2+b4*sinphi2)/(a2*cosphi2+b2*sinphi2));
            }
        } else {
          // use geodesic resolution to have a scale bar that fits the terrain
          res= this.map.getGeodesicPixelSize().h*1000 ;
        }

        for (var i= 0; i < this.METRICSUIMETER.length && !bFound; i++) {
            var testMultiplier= 100000;
            var unitInfo= this.METRICSUIMETER[i];
            while ((Math.round(testMultiplier) > 0) && !bFound) {
                var calculatedWidth= Math.round((testMultiplier*unitInfo)/res);
                if (calculatedWidth < this.barAreaWidth) {
                    bFound= true;
                    this.currentUnitInfo= this.METRICSUIMETER[i];
                    this.currentUiSymbol= this.METRICSUISYMBOL[i];
                    this.currentWidth= calculatedWidth;
                    this.currentDistance= testMultiplier;
                } else {
                    testMultiplier /= 10;
                }
            }
        }
        var divisionCount= 1;
        while (divisionCount < 5) {
            if ((this.currentWidth * (divisionCount + 1)) < this.barAreaWidth) {
                divisionCount++;
            } else {
                break;
            }
        }
        this.currentDivisionCount= divisionCount;
        this.currentWidth *= divisionCount;
        this.currentDistance *= divisionCount;
        this.divText2.innerHTML= this.currentDistance + " " + this.currentUiSymbol;
        this.divText2.style.left= this.currentWidth + "px";
    },
    
    /**
     * Method: getDivLegendMargin
     * Get the CSS margin value of the legend div
     * 
     * Parameters:
     * margin - {String} 'left' or 'right' margin value ?
     * 
     * Returns:
     * {Integer} the CSS margin property value of the legend div or 0.
     */
    getDivLegendMargin: function(margin){
        return Geoportal.Util.getComputedStyle(this.divLegend,'margin-'+margin,true);
    },

    /**
     * Method: drawBar
     */
    drawBar: function () {

        var i;
        this.divLegend.style.width= this.currentWidth + "px";
        var marginLeft = this.getDivLegendMargin('left');
        var marginRight = this.getDivLegendMargin('right');
        this.div.style.width= (this.currentWidth + marginLeft + marginRight) + "px";

        if (this.currentDivisionCount == 1) {
            this.currentDivisionCount= 5;
        }

        for (i= 0; i < this.currentDivisionCount; i++) {
            if (! this.listBlocks[i]) {
                var divBlock= this.div.ownerDocument.createElement("div");
                if ((i % 2) === 0) {
                    divBlock.className= this.getDisplayClass() + "FullBlock";
                } else {
                    divBlock.className= this.getDisplayClass() + "EmptyBlock";
                }
                this.divLegend.appendChild(divBlock);
                this.listBlocks[i]= divBlock;
            } else {
                this.listBlocks[i].style.display= "block";
            }
            this.listBlocks[i].style.width= this.currentWidth / this.currentDivisionCount + "px";
        }

        for (i= this.currentDivisionCount; i < 5; i++) {
            if (this.listBlocks[i]) {
                this.listBlocks[i].style.display= "none";
            }
        }

    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Control.GraphicScale"*
     */
    CLASS_NAME: "Geoportal.Control.GraphicScale"
});
