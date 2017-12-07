/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/*
 * @requires Geoportal/Layer.js
 * @requires Geoportal/Tile/Image.js
 */
/**
 * Class: Geoportal.Layer.Grid
 * The Geoportal framework grid class for cylindrical projections
 *      (plate-carre, equidistant cylindrical, web mercator).
 * Base class for layers that use a lattice of tiles.  Create a new grid
 * layer with the <Geoportal.Layer.Grid> constructor.
 *      This class support tile resizing for compatible projections (there is
 *      an affine transformation between the native server's projection and
 *      the map's projection).
 *
 * Inherits from:
 *  - {<OpenLayers.Layer.Grid at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Grid-js.html>}
 */
Geoportal.Layer.Grid = OpenLayers.Class(OpenLayers.Layer.Grid, {

    /**
     * APIProperty: tileClass
     * {<Geoportal.Tile>} The tile class to use for this layer.
     *     Defaults is Geoportal.Tile.Image.
     */
    tileClass: Geoportal.Tile.Image,

    /**
     * APIProperty: nativeTileOrigin
     * {<OpenLayers.LonLat at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/LonLat-js.html>} origin of the grid tiles for all
     *      resolution expressed in layr's native projection.
     */
    nativeTileOrigin: null,

    /**
     * APIProperty: nativeTileSize
     * {<Openlayers.Size>} Size in pixels of tile on the server side
     */
    nativeTileSize: null,

    /**
     * APIProperty: nativeResolutions
     * {Array(Float)} List of server allowed resolutions.
     *      If none use the baseLaser resolutions.
     */
    nativeResolutions: null,

    /**
     * APIProperty: nativeMaxExtent
     * {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>}  the maxExtent property expressed in
     *      layer's native projection.
     */
    nativeMaxExtent: null,

    /**
     * Property: resample
     * {Boolean} when true indicates to modify tiles' size, otherwise keep
     * size.
     *      Defaults to *false*.
     */
    resample: false,
    
    /**
     * Constructor: Geoportal.Layer.Grid
     * Create a new grid layer
     *
     * Parameters:
     * name - {String}
     * url - {String}
     * params - {Object}
     * options - {Object} Hashtable of extra options to tag onto the layer
     */
    initialize: function(name, url, params, options) {
        options= options || {};
        if (options.gridOrigin) {
            // OL 2.12 uses now tileOrigin !
            options.tileOrigin= options.gridOrigin.clone();
            delete options.gridOrigin;
        }
        OpenLayers.Layer.Grid.prototype.initialize.apply(this, arguments);
        // maxExtent is expressed at initialization time in native
        // projection as well as nativeMaxExtent !
        if (!this.maxExtent && this.nativeMaxExtent) {
            this.maxExtent= this.nativeMaxExtent.clone();
        }
        if (!this.nativeMaxExtent && this.maxExtent) {
            this.nativeMaxExtent= this.maxExtent.clone();
        }
        this.tileOrigin= this.getTileOrigin();
        this.nativeTileOrigin= this.tileOrigin.clone();
        this.nativeTileSize= this.nativeTileSize || new OpenLayers.Size(OpenLayers.Map.TILE_WIDTH, OpenLayers.Map.TILE_HEIGHT);
        if (this.nativeResolutions) {//OL 2.12 ...
            this.serverResolutions= this.nativeResolutions.slice(0);
        }
        // avoid to use the same javascript Object for all layers cause it can
        // be modified ...
        this.tileSize = this.tileSize?
            this.tileSize.clone()
        :   new OpenLayers.Size(OpenLayers.Map.TILE_WIDTH, OpenLayers.Map.TILE_HEIGHT);
        this.saveBuffer = this.buffer;
    },

    /**
     * Method: setMap
     * Set the map property for the layer. This is done through an accessor
     *     so that subclasses can override this and take special action once
     *     they have their map variable set.
     *
     *     Here we take care to bring over any of the necessary default
     *     properties from the map.
     *     IGNF: tileOrigin reprojection (as the initialize method does not
     *     know the map).
     *
     * Parameters:
     * map - {<OpenLayers.Map at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Map-js.html>}
     */

    setMap: function(map) {
        OpenLayers.Layer.Grid.prototype.setMap.apply(this, arguments);
        // now maxExtent is expressed in map's projection ...
        if (!this.nativeMaxExtent && this.maxExtent) {
            this.nativeMaxExtent= this.maxExtent.clone().transform(this.map.getProjection(), this.getNativeProjection());
        }
        this.tileOrigin.transform(this.getNativeProjection(), this.map.getProjection());
    },

    /**
     * APIMethod: destroy
     * Deconstruct the layer and clear the grid.
     */
    destroy: function() {
        this.tileOrigin= null;
        this.nativeTileOrigin= null;
        this.nativeTileSize= null;
        this.nativeResolutions= null;
        this.serverResolutions= null;//OL 2.12
        this.nativeMaxExtent= null;
        this.resample= false;

        OpenLayers.Layer.Grid.prototype.destroy.apply(this, arguments);
    },

    /**
     * APIMethod: clone
     * Create a clone of this layer
     *
     * Parameters:
     * obj - {Object} Is this ever used?
     *
     * Returns:
     * {<OpenLayers.Layer.Grid at * http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer/Grid-js.html>} An exact clone of this <Geoportal.Layer.Grid>
     */
    clone: function (obj) {
        if (obj == null) {
            obj = new Geoportal.Layer.Grid(this.name,
                                           this.url,
                                           this.params,
                                           this.options);
        }

        //get all additions from superclasses
        obj = OpenLayers.Layer.HTTPRequest.prototype.clone.apply(this, [obj]);

        // copy/set any non-init, non-simple values here
        if (this.tileSize != null) {
            obj.tileSize = this.tileSize.clone();
        }
        if (this.tileOrigin != null) {
            obj.tileOrigin= this.tileOrigin.clone();
        }
        if (this.nativeTileOrigin != null) {
            obj.nativeTileOrigin= this.nativeTileOrigin.clone();
        }
        if (this.nativeTileSize != null) {
            obj.nativeTileSize= this.nativeTileSize.clone();
        }
        if (this.nativeResolutions != null) {
            obj.nativeResolutions= this.nativeResolutions.slice(0);
            obj.serverResolutions= obj.nativeResolutions.slice(0);//OL 2.12
        }

        // we do not want to copy reference to grid, so we make a new array
        obj.grid = [];

        return obj;
    },

    /**
     * Method: moveTo
     * This function is called whenever the map is moved. All the moving
     * of actual 'tiles' is done by the map, but moveTo's role is to accept
     * a bounds and make sure the data that that bounds requires is pre-loaded.
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>}
     * zoomChanged - {Boolean}
     * dragging - {Boolean}
     */
    moveTo:function(bounds, zoomChanged, dragging) {

        OpenLayers.Layer.HTTPRequest.prototype.moveTo.apply(this, arguments);

        bounds= bounds || this.map.getExtent();

        if (bounds != null) {

            // if grid is empty or zoom has changed, we *must* re-tile
            var forceReTile= !this.grid.length || zoomChanged;

            // DGR 2011-04-30 : when deactivated : avoid blicking when
            // resample is true, but a line of 1 px height may appear between
            // tiles from time to time due to rounding issues ...
            /* 
            // avoid row and colums shifts when width or height is non integer
            if (this.resample) {
                forceReTile= true;
            }
             */

            // total bounds of the tiles
            var tilesBounds= this.getTilesBounds();

            // the new map resolution
            var resolution= this.map.getResolution();

            // the server-supported resolution for the new map resolution
            var serverResolution= this.getServerResolution(resolution);

            if (this.resample && tilesBounds) {
                tilesBounds.transform(this.getNativeProjection(), this.map.getProjection(),true);
            }

            if (this.singleTile) {

                // We want to redraw whenever even the slightest part of the
                //  current bounds is not contained by our tile.
                //  (thus, we do not specify partial -- its default is false)
                if ( forceReTile ||
                     (!dragging && !tilesBounds.containsBounds(bounds))) {

                    // In single tile mode with no transition effect, we insert
                    // a non-scaled backbuffer when the layer is moved. But if
                    // a zoom occurs right after a move, i.e. before the new
                    // image is received, we need to remove the backbuffer, or
                    // an ill-positioned image will be visible during the zoom
                    // transition.

                    if (zoomChanged && this.transitionEffect !== 'resize') {
                        this.removeBackBuffer();
                    }

                    if (!zoomChanged || this.transitionEffect === 'resize') {
                        this.applyBackBuffer(serverResolution);
                    }

                    this.initSingleTile(bounds);
                }
            } else {

                // if the bounds have changed such that they are not even 
                // *partially* contained by our tiles (e.g. when user has 
                // programmatically panned to the other side of the earth on
                // zoom level 18), then moveGriddedTiles could potentially have
                // to run through thousands of cycles, so we want to reTile
                // instead (thus, partial true).  
                forceReTile= forceReTile ||
                    !tilesBounds.intersectsBounds(bounds, {
                        worldBounds: this.map.baseLayer.wrapDateLine &&
                            this.map.getMaxExtent()
                    });

               /* if (resolution !== serverResolution) {
                    var mp = this.map.getProjection();
                    var np = this.getNativeProjection();
                    bounds.transform(mp,np);
                    if (forceReTile) {
                        // stretch the layer div
                        var scale = serverResolution / resolution;
                        //this.transformDiv(scale);
                    }
                    
                } else {*/
                    // reset the layer width, height, left, top, to deal with
                    // the case where the layer was previously transformed
                    this.div.style.width = '100%';
                    this.div.style.height = '100%';
                    this.div.style.left = '0%';
                    this.div.style.top = '0%';
                //}

                if (forceReTile) {
                    if (zoomChanged && this.transitionEffect === 'resize') {
                        this.applyBackBuffer(this.nativeResolution);
                    }
                    this.initGriddedTiles(bounds);
                } else {
                    this.moveGriddedTiles();
                }

            }
            // DGR 2011-04-30 : désactivé lors du passage à OL2.12
            /* */
         /*   if (!forceReTile && this.resample && this.getVisibility()) {
                if (this.forceRedrawTimer) {
                    window.clearTimeout(this.forceRedrawTimer);
                }
                this.forceRedrawTimer= window.setTimeout(
                    OpenLayers.Function.bind(function() {
                        this.moveTo(bounds,true,dragging);
                        this.forceRedrawTimer= null;
                    },this),
                    500);
            } */
        }
    },
    
    /**
     * Method: moveGriddedTiles
     *
     * Parameter:
     * deferred - {Boolean} true if this is a deferred call that should not
     * be delayed.
     */
    moveGriddedTiles: function(deferred) {
        if (!deferred && !OpenLayers.Animation.isNative) {
            if (this.moveTimerId != null) {
                window.clearTimeout(this.moveTimerId);
            }
            this.moveTimerId = window.setTimeout(
                this.deferMoveGriddedTiles, this.tileLoadingDelay
            );
            return;
        }
        var buffer = this.buffer || 0;
        var scale = this.getResolutionScale();
        if (isNaN(parseInt(this.div.style.left))) {
            this.div.style.left="0px";
        }
        if (isNaN(parseInt(this.div.style.top))) {
            this.div.style.top="0px";
        }

	//Dans le cas du stretching, comme le nombre de ligne de la grille est fixe, du blanc peut apparaitre
	//On place le blanc en haut si la proportion d'hemisphère nord est suppérieur à la proportion d'hemisphère sud
        var limitehysteresis = 2*(new OpenLayers.LonLat(this.nativeTileSize.h*this.nativeResolution,0)).transform(this.projection,OpenLayers.Projection.CRS84).lon
        var milieu = (this.grid[0][0].bounds.clone().transform(this.projection,OpenLayers.Projection.CRS84).top+this.grid[this.grid.length-1][0].bounds.clone().transform(this.projection,OpenLayers.Projection.CRS84).bottom)/2;
        if (this.rowSign==-1) {
            if (milieu<-limitehysteresis) {
                this.rowSign=1;
            }
        } else {
            if (milieu>limitehysteresis) {
                this.rowSign=-1;
            }
                
        }

	
	
        var n=0;
        while(true) {
            n++;
           if (n>100) {
              // alert("trop long");
               break;
           }
            var tlViewPort = {
                x: (this.grid[0][0].position.x * scale) +
                    parseInt(this.div.style.left, 10) +
                    parseInt(this.map.layerContainerDiv.style.left),
                y: (this.grid[0][0].position.y * scale) +
                    parseInt(this.div.style.top, 10) +
                    parseInt(this.map.layerContainerDiv.style.top)
            };
            var blViewPort = {
                x: (this.grid[this.grid.length-1][this.grid[this.grid.length-1].length-1].position.x * scale) +
                    parseInt(this.div.style.left, 10) +
                    parseInt(this.map.layerContainerDiv.style.left),
                y: (this.grid[this.grid.length-1][this.grid[this.grid.length-1].length-1].position.y * scale) +
                    parseInt(this.div.style.top, 10) +
                    parseInt(this.map.layerContainerDiv.style.top) +
                    this.grid[this.grid.length-1][this.grid[this.grid.length-1].length-1].size.h
            };
            var tileSize = {
                w: this.grid[0][0].size.w * scale,
                h: this.grid[0][0].size.h * scale
            };
            var tileSizetop = tileSize;
            var tileSizebottom = {
                w: this.grid[this.grid.length-1][0].size.w * scale,
                h: this.grid[this.grid.length-1][0].size.h * scale
            };
           

            if (tlViewPort.x > -tileSize.w * (buffer )) {
                this.shiftColumn(true);
            } else if (tlViewPort.x < -tileSize.w * (buffer+1)) {
                this.shiftColumn(false);
            } else if ((!this.resample || this.rowSign==1) && (tlViewPort.y > -tileSize.h * (buffer))) {
                this.shiftRow(true);
            } else if ((!this.resample || this.rowSign==1) && (tlViewPort.y < -tileSize.h * (buffer+1))) {
                this.shiftRow(false);
            } else if (this.resample && this.rowSign==-1 && ((blViewPort.y-this.map.size.h) > tileSizebottom.h * buffer)) {
                this.shiftRow(true);
            } else if (this.resample && this.rowSign==-1 && ((blViewPort.y-this.map.size.h) < tileSizebottom.h * (buffer-1))) {
                this.shiftRow(false);
            } else {
                break;
            }
        }
    },

    /**
     * Method: getServerResolution
     * Return the closest highest server-supported resolution. Throw an
     * exception if none is found in the serverResolutions array.
     *
     * Parameters:
     * resolution - {Number} The base resolution. If undefined the
     *     map resolution is used.
     *
     * Returns:
     * {Number} The closest highest server resolution value.
     */
    getServerResolution: function(resolution) {
        this.resample= false;
        var np= this.getNativeProjection(), mp= this.map.getProjection();
        // display resolution for the current map's projection :
        resolution= resolution || this.map.getResolution();
        this.nativeResolution= resolution;

        // avoids rounding problems when the projections are equals
        // FIXME : test commented : in case of overlay with two layers
        // with same projection, but with different resolutions, we need
        // in the end to stretch tiles.
        //if (np.equals(mp)) {
        //    return;
        //}
        if (!(np.isCompatibleWith(mp))) {
            throw 'no appropriate resolution in serverResolutions';//TODO: i18n
            return; // ceinture et bretelles :)
        }

        var pt1= new OpenLayers.LonLat(1, 1);
        pt1.transform(np, mp);

        //we are looking for the best easting/longitude resolution (closest)
        if (this.nativeResolutions) {
            var bestdist= Number.POSITIVE_INFINITY;
            // for each native resolutions :
            for (var i= Math.max(0,this.minZoomLevel), len= Math.min(this.nativeResolutions.length,this.maxZoomLevel+1); i<len; i++) {
                var dist= Math.abs(this.nativeResolutions[i] * pt1.lon - resolution);
                if (dist<=bestdist) {
                    bestdist= dist;
                    this.nativeResolution= this.nativeResolutions[i];
                }
            }
        }
        //do we need to strech tiles ?
        this.resample= (((this.nativeResolution/resolution)*pt1.lat!= 1) ||
                        ((this.nativeResolution/resolution)*pt1.lon!= 1));
        return this.nativeResolution;

    },

    /**
     * Method: getServerZoom
     * Return the zoom value corresponding to the best matching server
     * resolution, taking into account <serverResolutions> and <zoomOffset>.
     *
     * Returns:
     * {Number} The closest server supported zoom. This is not the map zoom
     *     level, but an index of the server's resolutions array.
     */
    getServerZoom: function() {
        var resolution= this.getServerResolution();
        resolution = this.nativeResolution;
        return this.serverResolutions ?
            this.nativeResolution :
            this.map.getZoomForResolution(resolution) + (this.zoomOffset || 0);
    },

    /**
     * Method: initGriddedTiles
     * Compute the grid matrix in the source space (always regular).
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>}
     */
    initGriddedTiles:function(bounds) {
        this.clearTileQueue();
        
        

        // work out mininum number of rows and columns; this is the number of
        // tiles required to cover the viewport plus at least one for panning

        // basically, the idea is to have the regular grid in native
        // projection, and compute the streching ratio in latitude
        // for the final tiles ...
	
	 var viewSize = this.map.getSize();
	 var mp = this.map.getProjection();
	 var np = this.getNativeProjection();
         
         var nativebounds = bounds.clone().transform(mp,np);
        
        var origin = this.getTileOrigin().clone();
        origin.transform(mp,np);
        var resolution = this.map.getResolution(),
            serverResolution = this.getServerResolution(),
            ratio = resolution / serverResolution,
            tileSize = {
                w: this.tileSize.w / ratio,
                h: this.tileSize.h / ratio
            };
         
        //TC 07/08/2013 : force buffer++ if resample : more beautiful
        if (this.resample){
            this.buffer = this.saveBuffer +1;
        }
        
	var boundsW = nativebounds.right-nativebounds.left;
	var boundsH = nativebounds.top-nativebounds.bottom;
	
	
	var tilegroundH = this.tileSize.h*serverResolution;
	var tilegroundW = this.tileSize.w*serverResolution;
       
	var minRows = Math.ceil(boundsH/tilegroundH) + 
                      2 * this.buffer +1;
        var minCols = Math.ceil(boundsW/tilegroundW) +
                      2 * this.buffer +1;
		      
	var tileLayout = this.calculateGridLayout(nativebounds, origin, serverResolution);
        this.gridLayout = tileLayout;
	
        var tilelon = tileLayout.tilelon;
        var tilelat = tileLayout.tilelat;
        
        
        //TC 13/08/2013 : layerContainerOriginPx ajouté dans OL 2.13
        //layerContainerOriginPx = coin en haut à gauche
        //layerContainerOrigin = initialisé au centre de la carte puis modifié par les déplacement de celle-ci
        
        this.map.layerContainerOriginPx = this.map.getPixelFromLonLat(this.map.layerContainerOrigin);
        this.map.layerContainerOriginPx.x-=Math.round(this.map.size.w/2);
        this.map.layerContainerOriginPx.y-=Math.round(this.map.size.h/2);
        
        var layerContainerDivLeft = this.map.layerContainerOriginPx.x;
        var layerContainerDivTop = this.map.layerContainerOriginPx.y;
        
        

        var tileBounds = this.getTileBoundsForGridIndex(0, 0,origin);
        var startPt = new OpenLayers.LonLat(tileBounds.left, tileBounds.top);
        if (this.resample) {
            startPt.transform(np,mp);
        }
                

        var startPx = this.map.getViewPortPxFromLonLat(startPt);
        startPx.x = Math.round(startPx.x) - layerContainerDivLeft;
        startPx.y = Math.round(startPx.y) - layerContainerDivTop;

        var tileData = [], center = this.map.getCenter();

        var nativeTileBounds,tileSizew,tileSizeh;
        var rowidx = 0;
        do {
            var row = this.grid[rowidx];
            if (!row) {
                row = [];
                this.grid.push(row);
            }
            
            var colidx = 0;
            do {
                nativeTileBounds = this.getTileBoundsForGridIndex(rowidx, colidx,origin);
                tileBounds = nativeTileBounds.clone().transform(np,mp);
                tileSizew = this.resample?Math.ceil((tileBounds.right-tileBounds.left)/resolution):this.tileSize.w;
                tileSizeh = this.resample?Math.ceil((tileBounds.top-tileBounds.bottom)/resolution):this.tileSize.h;
                
                var px = startPx.clone();
                px.x = px.x + ((tileBounds.left-startPt.lon)/resolution);
                px.y = px.y + ((startPt.lat-tileBounds.top)/resolution);
                var tile = row[colidx];
                if (!tile) {
                    tile = this.addTile(nativeTileBounds, px);
                    tile.setSize(new OpenLayers.Size(tileSizew,tileSizeh));
                    this.addTileMonitoringHooks(tile);
                    row.push(tile);
                } else {
                    tile.moveTo(nativeTileBounds, px, false);
                    tile.setSize(new OpenLayers.Size(tileSizew,tileSizeh));
                }
                var tileCenter = tileBounds.getCenterLonLat();
                tileData.push({
                    tile: tile,
                    distance: Math.pow(tileCenter.lon - center.lon, 2) +
                        Math.pow(tileCenter.lat - center.lat, 2)
                });
     
                colidx += 1;
            } while (colidx < minCols);
             
            rowidx += 1;
        } while(rowidx < minRows);
        
        //shave off excess rows and columns
        this.removeExcessTiles(rowidx, colidx);

        var resolution = this.getServerResolution();
        // store the resolution of the grid
        this.gridResolution = resolution;

        //now actually draw the tiles
        tileData.sort(function(a, b) {
            return a.distance - b.distance; 
        });
        for (var i=0, ii=tileData.length; i<ii; ++i) {
            tileData[i].tile.draw();
        }
    },

    getTileBoundsForGridIndex: function(row, col, origin) {
        var mp = this.map.getProjection();
        var np = this.getNativeProjection(); 
   
        var tileLayout = this.gridLayout;
        var tilelon = tileLayout.tilelon;
        var tilelat = tileLayout.tilelat;
        var startcol = tileLayout.startcol;
        var startrow = tileLayout.startrow;
        var rowSign = this.rowSign;
        var bounds = new OpenLayers.Bounds(
            origin.lon + (startcol + col) * tilelon,
            origin.lat - (startrow + row * rowSign) * tilelat * rowSign,
            origin.lon + (startcol + col + 1) * tilelon,
            origin.lat - (startrow + (row - 1) * rowSign) * tilelat * rowSign
        );
        return bounds;
    },
    
    /**
     * APIMethod: addTile
     * Creates a tile, initializes it at a given (projection) bounds
     * a given (pixel) position and (pixel) size
     *
     * Parameters:
     * bounds - {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>}
     * position - {<OpenLayers.Pixel at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Pixel-js.html>}
     * size - {<OpenLayers.Size at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Size-js.html>}
     *
     * @returns {OpenLayers.Tile.Image} The added Geoportal.Tile.Image
     */
    addTile:function(bounds,position,size) {
        var tile= new this.tileClass(
            this, position, bounds, null, size || this.tileSize, this.tileOptions
        );
        tile.events.register("beforedraw", this, this.queueTileDraw);
        return tile;
    },

    /**
     * APIMethod: getDataExtent
     * Returns the max extent.
     *
     * Returns:
     * {<OpenLayers.Bounds at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Bounds-js.html>}
     */
    getDataExtent: function () {
        return this.maxExtent;
    },

    /**
     * APIMethod: changeBaseLayer
     * Listener of the map's event 'changebaselayer'.
     *      Reproject its maxExtent according to the new
     *      base layer if it is not a base layer itself.
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
        // saving old visibility and opacity before calling prototype that will eventually 
        // change their value and thus corrupting the values for savedStates.
        var v= this.getVisibility() ;
        var o= this.opacity ;
        // FIXME : should be OpenLayers.Layer.Grid.prototype ?
        if (OpenLayers.Layer.prototype.changeBaseLayer.apply(this,arguments)===false) {
            return false;
        }
        if (!this.isBaseLayer) {
            // for each layer if its projection is compatible with the
            // new baseLayer : proceed.
            //Otherwise,
            // hide it (displayInLayerSwitcher to false and visibility to false).
            if (this.getCompatibleProjection(evt.layer)!=null) {
                if (this.map.baseLayer.territory && this.territory && this.territory == this.map.baseLayer.territory){
			this.displayInLayerSwitcher= true;
		}
		if (typeof(this.savedStates[evt.layer.id])=='object') {
                    if (this.savedStates[evt.layer.id].opacity!=undefined) {
                        this.opacity= undefined;//force update
                        this.setOpacity(this.savedStates[evt.layer.id].opacity);
                    }
                    this.setVisibility(this.savedStates[evt.layer.id].visibility);
                } else {
                    //no need to update opacity ...
                    this.setVisibility(this.getVisibility() && this.calculateInRange());
                }
                return true;
            }
            //saved state:
            if (this.getCompatibleProjection(evt.baseLayer)!=null) {
                if (!this.savedStates[evt.baseLayer.id]) {
                    this.savedStates[evt.baseLayer.id]= {};
                }
                this.savedStates[evt.baseLayer.id].visibility= v ;
                this.savedStates[evt.baseLayer.id].opacity= o ;
            }
            if (this.aggregate==undefined) {
                this.displayInLayerSwitcher= false;
                this.visibility= true;//force update
            }
            this.setVisibility(false);
        }
        return true;
    },
    
    /**
     * Method: shiftRow
     * Shifty grid work
     *
     * Parameters:
     * prepend - {Boolean} if true, prepend to beginning.
     *                          if false, then append to end
     */
    shiftRow:function(prepend) {
        var modelRowIndex = (prepend) ? 0 : (this.grid.length - 1);
        var grid = this.grid;
        var modelRow = grid[modelRowIndex];
        var mp= this.map.getProjection(), np= this.getNativeProjection();
        this.getServerResolution();
        var nresolution = this.nativeResolution;
        var mresolution= this.map.getResolution();
        var row = (prepend) ? grid.pop() : grid.shift();

        for (var i=0, len=modelRow.length; i<len; i++) {
            var modelTile = modelRow[i];
            var bounds = modelTile.bounds.clone();
            
            if (prepend) {
                bounds.top += this.nativeTileSize.h*nresolution;
                bounds.bottom += this.nativeTileSize.h*nresolution;
            } else {
                bounds.top -= this.nativeTileSize.h*nresolution;
                bounds.bottom -= this.nativeTileSize.h*nresolution;
            }
            var mbounds = bounds.clone().transform(np,mp,true);
            var sh= Math.round((mbounds.top-mbounds.bottom)/mresolution);
            var sz= new OpenLayers.Size(row[i].size.w, sh);
            
            var position = modelTile.position.clone();
            if (!prepend) {
                position.y+=modelTile.size.h;//On ajout la taille de la tuille du dessus, pas la courante!
            } else {
                position.y-=sh;
            }
            row[i].moveTo(bounds, position);
            row[i].setSize(sz);
        }

        if (prepend) {
            grid.unshift(row);
        } else {
            grid.push(row);
        }
    },

    /**
     * Method: shiftColumn
     * Shift grid work in the other dimension
     *
     * Parameters:
     * prepend - {Boolean} if true, prepend to beginning.
     *                          if false, then append to end
     */
    shiftColumn: function(prepend) {
        
        var deltaX = (prepend) ? -this.grid[0][0].size.w : this.grid[0][0].size.w;
        this.getServerResolution();
        var resolution = this.map.resolution;
        var mp= this.map.getProjection(), np= this.getNativeProjection();
        var pt = new OpenLayers.LonLat(resolution,0);
        pt.transform(mp,np,true);
        resolution = pt.lon;
        var deltaLon = resolution * deltaX;
        for (var i=0, len=this.grid.length; i<len; i++) {
            var row = this.grid[i];
            var modelTileIndex = (prepend) ? 0 : (row.length - 1);
            var modelTile = row[modelTileIndex];
            
            var bounds = modelTile.bounds.clone();
            var position = modelTile.position.clone();
            bounds.left = bounds.left + deltaLon;
            bounds.right = bounds.right + deltaLon;
            position.x = position.x + deltaX;

            var tile = prepend ? this.grid[i].pop() : this.grid[i].shift();
            tile.moveTo(bounds, position);
            if (prepend) {
                row.unshift(tile);
            } else {
                row.push(tile);
            }
        }
    },

    /**
     * Method: getCompatibleProjection
     * Check whether the layer's projection is displayable with the given base layer.
     *
     * Params:
     * blayer - {<OpenLayers.Layer at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Layer-js.html>} the baseLayer to compare with.
     *      if none, use current baseLayer from the map.
     *
     * Returns:
     * {<OpenLayers.Projection at http://dev.openlayers.org/releases/OpenLayers-${openlayers.version}/doc/apidocs/files/OpenLayers/Projection-js.html>} if compatible,
     * undefined if not relevant, null otherwise.
     */
    getCompatibleProjection: function(blayer) {
        var lproj= OpenLayers.Layer.prototype.getCompatibleProjection.apply(this,arguments);
        if (!lproj) {
            return lproj;//may be null or undefined
        }
        blayer= blayer || this.map.baseLayer;
        var bproj= blayer.getNativeProjection();
        // the layer's extent has to intersect the baselayer's extent (if it exists)
        var x= this.restrictedExtent || this.maxExtent;
        if (!x) {
            return lproj;
        }
        if (!this.map) {//maxExtent is in layer's native projection... See *.Map.addLayer()
            x= x.clone().transform(lproj,bproj);
        }
        if (blayer.maxExtent.containsBounds(x,true,true) ||
            x.containsBounds(blayer.maxExtent,true,true)) {
            return lproj;
        }
        return null;
    },

    /**
     * Constant: CLASS_NAME
     * {String} *"Geoportal.Layer.Grid"*
     */
    CLASS_NAME: "Geoportal.Layer.Grid"
});
