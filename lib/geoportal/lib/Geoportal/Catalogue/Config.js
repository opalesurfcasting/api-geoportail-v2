/*
 * Copyright (c) 2008-2015 Institut National de l'Information Geographique et Forestiere (IGN) France.
 * Released under the BSD license.
 */
/**
 * Namespace: Geoportal.Catalogue.Configuration
 * The Geoportal framework configuration of services and layers.
 */
Geoportal= Geoportal || {};
Geoportal.Catalogue= Geoportal.Catalogue || {};
/**
 * Constant: Geoportal.Catalogue.CRSRESOLUTIONS
 * {Object} Mapping (ProjectionName -> array of resolutions in projection unit per pixel).
 *      The general public view uses WebMercator projection.
 */
Geoportal.Catalogue.CRSRESOLUTIONS= {};
/**
 * Constant: Geoportal.Catalogue.RESOLUTIONS
 * {Array({Float})} the Geoportal resolutions in meters per pixel.
 *      The general public view uses Equidistant Cylindrical
 *      and Miller projections.
 */
Geoportal.Catalogue.RESOLUTIONS= [];
/**
 * Constant: Geoportal.Catalogue.TERRITORIES
 * {Object} The territories properties.
 *      Includes bounding box, center, default projection, default
 *      geographic CRS and local base layers definition with min, max and
 *      default zoom levels.
 */
Geoportal.Catalogue.TERRITORIES= {};
/**
 * Constant: Geoportal.Catalogue.ORIGINATORS
 * {Object} The well-known originators properties.
 *      Each originator is an {Object} containing :
 *      * url - {String} the responsible party's URL (mandatory);
 *      * attribution - {String} the plain text name of responsible party;
 *      * bounds - {Array(Array({Number},{Number},{Number},{Number}))} the
 *      bounding box in longitudes, latitudes of the datasets under the
 *      governance of the responsible party;
 *      * pictureUrl - {String} the logo's URL of the responsible party. By
 *      default, pictureUrl can be retrieved by concatening
 *      'http://www.geoportail.fr/legendes/logo_', the originator id and the
 *      '.gif' suffix;
 */
Geoportal.Catalogue.ORIGINATORS= {};
/**
 * Method: Geoportal.Catalogue.getOriginator
 * Returns an originator object.
 *
 * Parameters:
 * oid - {String} originator identifier.
 * mnzl - {Integer} optional min zoom level.
 * mxzl - {Integer} optional max zoomlevel.
 *
 * Returns:
 * {Object}
 */
Geoportal.Catalogue.getOriginator= function(oid, mnzl, mxzl) {
    if (!oid) { oid= 'IGN'; }
    var o= Geoportal.Catalogue.ORIGINATORS[oid];
    if (!o) {
        oid= 'unknownAuthority';
        o= Geoportal.Catalogue.ORIGINATORS[oid];
    }
    var ori= OpenLayers.Util.extend({
        'logo':oid
    },o);
    if (!ori.attribution) { ori.attribution= oid.toUpperCase(); }
    // if attribution is a blank string, remove whitespaces !
    ori.attribution= OpenLayers.String.trim(ori.attribution);
    if (ori.attribution.length>0) {
        ori.attribution= '&copy; ' + ori.attribution;
    }
    if (!ori.url) { ori.url= '#'; }
    if (ori.bounds) {
        var l= ori.bounds.length;
        ori.extent= new Array(l);
        for (var i= 0; i<l; i++) {
            ori.extent[i]= OpenLayers.Bounds.fromArray(ori.bounds[i]);
        }
        delete ori.bounds;
    }
    if (mnzl!=undefined && mxzl!=undefined) {
        ori.minZoomLevel= mnzl;
        ori.maxZoomLevel= mxzl;
    }
    return ori;
};
/**
 * Constant: Geoportal.Catalogue.CATBASEURL
 * {String} - URL of geocatalogue to get the metadata element.
 * Defaults to *'http://www.geocatalogue.fr/Detail.do?fileIdentifier='*
 */
Geoportal.Catalogue.CATBASEURL= 'http://www.geocatalogue.fr/Detail.do?fileIdentifier=';
/**
 * Constant: Geoportal.Catalogue.PROFILES
 * Array({String}) name of profiles (e.g., 'geoportail', 'inspire', 'edugeo').
 */
Geoportal.Catalogue.PROFILES= [
    'geoportail', 'inspire', 'edugeo'
];
/**
 * Constant: Geoportal.Catalogue.SERVICES
 * {Object} - URLs of Geoportal's well-known services. Each service's type
 * holds an {Object} of domain's type (geoportail, inspire, edugeo) if
 * necessary. Each domain's type holds an {Array({String})} for the service's
 * URL.
 */
Geoportal.Catalogue.SERVICES= {
};
/**
 * Constant: Geoportal.Catalogue.LAYERNAMES
 * {Object} - Place holder for getting key in <Geoportal.Catalogue.CONFIG>.
 *      Each object contains :
 *      * a {String} the Geoportal's layer name (e.g.,
 *      'ORTHOIMAGERY.ORTHOPHOTOS') as key for an {Object} containing :
 *          * key - {String} the layer's key;
 *          * weight - {Integer} the layer's weight for view stacking;
 *          * deprecated - {String} the new Geoportal's layer alias (if any).
 */
Geoportal.Catalogue.LAYERNAMES= {};
/**
 * Constant: Geoportal.Catalogue.CONFIG
 * {Object} - Place holder for overlays configuration.
 *      Each overlay is an {Object} containing :
 *      * serviceParams - {Object} description of each service (WMSC, WMS,
 *      WFS) :
 *          * format - {String}
 *          * options - {Object} particular options for all services
 *      * layerOptions - {Object} particular viewer options :
 *          * opacity - {Number}
 *      * territories'options - {Object} (ATF, ASP, CHE, CRZ, FXX, etc ...) :
 *          * minZoomLevel - {Integer}
 *          * maxZoomLevel - {Integer}
 *          * originators - {Array({Object})}
 *              * id - {String}
 *              * mnzl - {Integer} minimum zoom level
 *              * mxzl - {Integer} maximum zoom level
 *          * bounds - {Array({Number})} geographical extent
 *          * fileIdentifiers - {Array({String})}
 *          * dataURL - {Array({String})}
 *      * thematics - {Array({String}) names of the overlay thematics
 *      * inspireThematics - {Array({String}) names of the overlay Inspire thematics
 */
Geoportal.Catalogue.CONFIG= {};
/**
 * Constant: Geoportal.Catalogue.REGIONS
 * {Object} The regions properties.
 *      Includes bounding box, region code, and parent territory.
 */
Geoportal.Catalogue.REGIONS= {
	'ALSACE'			: { code:'42', geobbox: [ 6.842990340401051, 47.419907582250964, 8.230294974643360, 49.077891304419545 ], parent:'FXX' },
	'AQUITAINE'			: { code:'72', geobbox: [ -1.791273555702342, 42.779124585115142, 1.448261543932212, 45.714569989772691 ], parent:'FXX' },
	'AUVERGNE'			: { code:'83', geobbox: [ 2.062901607729930, 44.615531676529834, 4.488917967832163, 46.803876576773312 ], parent:'FXX' },
	'BASSE-NORMANDIE'		: { code:'25', geobbox: [ -1.946709660748949, 48.180091347687778, 0.976415754774005, 49.726102843892576 ], parent:'FXX' },
	'BOURGOGNE'			: { code:'26', geobbox: [ 2.845187159794131, 46.156815837115090, 5.518538729512594, 48.399027781326652 ], parent:'FXX' },
	'BRETAGNE'			: { code:'53', geobbox: [ -5.139017285433225, 47.281047781715799, -1.018203048926480, 48.883748989632359 ], parent:'FXX' },
	'CENTRE'			: { code:'24', geobbox: [ 0.053794043756639, 46.347218495872966, 3.128229945417917, 48.941053606155158 ], parent:'FXX' },
	'CHAMPAGNE-ARDENNE'		: { code:'21', geobbox: [ 3.384093581302576, 47.576550708574622, 5.890574696908842, 50.167643091593774 ], parent:'FXX' },
	'CORSE'				: { code:'94', geobbox: [ 8.538297771732212, 41.362757426457222, 9.559823318166366, 43.010730668102084 ], parent:'FXX' },
	'FRANCHE-COMTE'			: { code:'43', geobbox: [ 5.252042768109230, 46.260693207098299, 7.142173394204400, 48.024084417358736 ], parent:'FXX' },
	'HAUTE-NORMANDIE'		: { code:'23', geobbox: [ 0.065457770706589, 48.666524151606978, 1.802660237500302, 50.071551006839677 ], parent:'FXX' },
	'ILE-DE-FRANCE'			: { code:'11', geobbox: [ 1.447279504766020, 48.120541543740551, 3.555686958558568, 49.237190707363112 ], parent:'FXX' },
	'LANGUEDOC-ROUSSILLON'		: { code:'91', geobbox: [ 1.688419720914751, 42.333488624806378, 4.845553900676586, 44.975723025570133 ], parent:'FXX' },
	'LIMOUSIN'			: { code:'74', geobbox: [ 0.629742463952440, 44.920287985294770, 2.609396304838669, 46.454906285872802 ], parent:'FXX' },
	'LORRAINE'			: { code:'41', geobbox: [ 4.888760929797642, 47.813053724588585, 7.639294241449073, 49.617087738502768 ], parent:'FXX' },
	'MIDI-PYRENEES'			: { code:'73', geobbox: [ -0.326875042893179, 42.572320324675559, 3.450981399748263, 45.044665633874651 ], parent:'FXX' },
	'NORD-PAS-DE-CALAIS'		: { code:'31', geobbox: [ 1.555964865344545, 49.970657701950451, 4.230134246921591, 51.089000310506115 ], parent:'FXX' },
	'PAYS DE LA LOIRE'		: { code:'52', geobbox: [ -2.557543229782619, 46.267037039064952, 0.916650480581802, 48.567999494061702 ], parent:'FXX' },
	'PICARDIE'			: { code:'22', geobbox: [ 1.379691087706571, 48.837427758921905, 4.255733826690897, 50.366217026185026 ], parent:'FXX' },
	'POITOU-CHARENTES'		: { code:'54', geobbox: [ -1.562732963156553, 45.089248428186394, 1.213065862887220, 47.175757850319748 ], parent:'FXX' },
	"PROVENCE-ALPES-COTE D'AZUR"	: { code:'93', geobbox: [ 4.230283393392479, 42.982033055948513, 7.716127328151051, 45.126847913866314 ], parent:'FXX' },
	'RHONE-ALPES'			: { code:'82', geobbox: [ 3.693391010912046, 44.115719347788371, 7.184201901627929, 46.517675429368794 ], parent:'FXX' },
	'GUADELOUPE'			: { code:'01', geobbox: [-61.80874, 15.83977, -61.0034,  16.51071], parent:'GLP' },
	'GUYANE'			: { code:'03', geobbox: [-54.59434, 2.11396,  -51.62208,  5.75387], parent:'GUF' },
	'LA REUNION'			: { code:'04', geobbox: [ 55.2171, -21.38824,  55.83604,-20.87173], parent:'REU' },
	'MARTINIQUE'			: { code:'02', geobbox: [-61.22895, 14.39595, -60.81124, 14.87859], parent:'MTQ' },
	'MAYOTTE'			: { code:'06', geobbox: [ 45.01978,-12.99974,  45.29765,-12.63733], parent:'MYT' }
//FIXME: DOM/TOM/COM
};

/**
 * Constant: Geoportal.Catalogue.DEPARTMENTS
 * {Object} The departments properties.
 *      Includes bounding box, department code, and parent region code.
 */
Geoportal.Catalogue.DEPARTMENTS= {
        'AIN'				: { code:'01', geobbox: [ 4.73058154440788, 45.6114938041312, 6.16845115155231, 46.5176754293688 ], parent:'82' },
        'AISNE'				: { code:'02', geobbox: [ 2.95873860742351, 48.838474288456, 4.2557338266909, 50.0692746359635 ], parent:'22' },
        'ALLIER'			: { code:'03', geobbox: [ 2.27841636602015, 45.9307323564124, 4.00455842921635, 46.8038765767733 ], parent:'83' },
        'ALPES-DE-HAUTE-PROVENCE'	: { code:'04', geobbox: [ 5.49816529351772, 43.6682884339206, 6.96708571531756, 44.6597963885516 ], parent:'93' },
        'HAUTES-ALPES'			: { code:'05', geobbox: [ 5.41839741766945, 44.1864833718316, 7.07587151976948, 45.1268479138663 ], parent:'93' },
        'ALPES-MARITIMES'		: { code:'06', geobbox: [ 6.63603868812941, 43.480068010885, 7.71612732815105, 44.3610568287277 ], parent:'93' },
        'HAUTE-CORSE'			: { code:'2B', geobbox: [ 8.57341106810862, 41.8321452359409, 9.55982331816637, 43.0107306681021 ], parent:'94' },
        'ARDECHE'			: { code:'07', geobbox: [ 3.86252732812711, 44.2644248574895, 4.88658929984345, 45.3656812630267 ], parent:'82' },
        'ARDENNES'			: { code:'08', geobbox: [ 4.02626145095538, 49.2265769718056, 5.39353665832851, 50.1676430915938 ], parent:'21' },
        'LANDES'			: { code:'40', geobbox: [ -1.5248665484221, 43.4885916619551, 0.136731215823359, 44.5321945716776 ], parent:'72' },
        'ARIEGE'			: { code:'09', geobbox: [ 0.826681542119149, 42.5723203246756, 2.17552137741738, 43.3154902525248 ], parent:'73' },
        'AUBE'				: { code:'10', geobbox: [ 3.38409358130258, 47.9237793453152, 4.86243610033147, 48.7166733661605 ], parent:'21' },
        'HAUT-RHIN'			: { code:'68', geobbox: [ 6.84299034040105, 47.4203012112159, 7.62215723743944, 48.3108891269821 ], parent:'42' },
        'AUDE'				: { code:'11', geobbox: [ 1.68841972091475, 42.6489010194418, 3.24056113717041, 43.4601129585518 ], parent:'91' },
        'AVEYRON'			: { code:'12', geobbox: [ 1.83967146025188, 43.6916457755152, 3.45098139974826, 44.9412221847367 ], parent:'73' },
        'BOUCHES-DU-RHONE'		: { code:'13', geobbox: [ 4.23028339339248, 43.1623707529158, 5.81324840035912, 43.9240684708176 ], parent:'93' },
        'CALVADOS'			: { code:'14', geobbox: [ -1.15797428032603, 48.7522291472338, 0.446051929418346, 49.429861637283 ], parent:'25' },
        'YVELINES'			: { code:'78', geobbox: [ 1.44727950476602, 48.4400101876368, 2.22719411117819, 49.0842851363212 ], parent:'11' },
        'CANTAL'			: { code:'15', geobbox: [ 2.06290160772993, 44.6155316765298, 3.37146553482871, 45.4823903645155 ], parent:'83' },
        'CHARENTE'			: { code:'16', geobbox: [ -0.463154085816001, 45.191632555616, 0.943329049906428, 46.1389646910567 ], parent:'54' },
        'HAUTS-DE-SEINE'		: { code:'92', geobbox: [ 2.14587252260782, 48.7294917478758, 2.33597931039204, 48.9509667880772 ], parent:'11' },
        'CHARENTE-MARITIME'		: { code:'17', geobbox: [ -1.56273296315655, 45.0892484281864, 0.00586644262893199, 46.3709353812297 ], parent:'54' },
        'CHER'				: { code:'18', geobbox: [ 1.77445145081256, 46.420405373181, 3.07933730997611, 47.629054990991 ], parent:'24' },
        'CORREZE'			: { code:'19', geobbox: [ 1.22705998915047, 44.9202879852948, 2.52868364408504, 45.7636718955746 ], parent:'74' },
        "COTE-D'OR"			: { code:'21', geobbox: [ 4.0651984622774, 46.9009541355769, 5.51853872951259, 48.0313759686354 ], parent:'26' },
        "COTES-D'ARMOR"			: { code:'22', geobbox: [ -3.66353556729797, 48.0325401797206, -1.9089961926263, 48.8836013813589 ], parent:'53' },
        'CREUSE'			: { code:'23', geobbox: [ 1.37452137996296, 45.6642395042393, 2.60939630483867, 46.4549062858728 ], parent:'74' },
        'DORDOGNE'			: { code:'24', geobbox: [ -0.0415138998487501, 44.5707739252791, 1.44826154393221, 45.7145699897727 ], parent:'72' },
        'DOUBS'				: { code:'25', geobbox: [ 5.69872619467738, 46.5535721427229, 7.06029531241506, 47.5799061446341 ], parent:'43' },
        'DROME'				: { code:'26', geobbox: [ 4.64683712406175, 44.1157193477884, 5.82988436213845, 45.3439846178268 ], parent:'82' },
        'EURE'				: { code:'27', geobbox: [ 0.297224420290615, 48.666524151607, 1.8026602375003, 49.4844665138576 ], parent:'23' },
        'EURE-ET-LOIR'			: { code:'28', geobbox: [ 0.756826368076685, 47.9537490548553, 1.99408471805938, 48.9410536061552 ], parent:'24' },
        'CORSE-DU-SUD'			: { code:'2A', geobbox: [ 8.53823242096776, 41.3627574264572, 9.407123931761, 42.3814057120503 ], parent:'94' },
        'SEINE-SAINT-DENIS'		: { code:'93', geobbox: [ 2.2884607724429, 48.807436629376, 2.60259843143198, 49.0123995600171 ], parent:'11' },
        'FINISTERE'			: { code:'29', geobbox: [ -5.13901728543322, 47.7635615765894, -3.38802544841603, 48.7526158728705 ], parent:'53' },
        'GARD'				: { code:'30', geobbox: [ 3.26311258845482, 43.4601854327264, 4.84555390067659, 44.4597975558632 ], parent:'91' },
        'GERS'				: { code:'32', geobbox: [ -0.282111589196039, 43.3108859915855, 1.20030064488225, 44.0792633802986 ], parent:'73' },
        'HAUTE-GARONNE'			: { code:'31', geobbox: [ 0.441704831511497, 42.6913486808669, 2.0482898262114, 43.9210957133889 ], parent:'73' },
        'INDRE-ET-LOIRE'	        : { code:'37', geobbox: [ 0.0537397848495228, 46.7366210426403, 1.36446576002727, 47.708089518433 ], parent:'24' },
        'GIRONDE'	                : { code:'33', geobbox: [ -1.26156091294416, 44.1940166710363, 0.315043080115652, 45.5735853922635 ], parent:'72' },
        'HERAULT'	                : { code:'34', geobbox: [ 2.53991734469627, 43.2128086330841, 4.19381781155392, 43.9706897224518 ], parent:'91' },
        'VAL-DE-MARNE'	                : { code:'94', geobbox: [ 2.30988229458844, 48.6890252711783, 2.61481690616404, 48.861409850049 ], parent:'11' },
        'ILLE-ET-VILAINE'	        : { code:'35', geobbox: [ -2.28753886020226, 47.6313598440143, -1.01820304892648, 48.7115691614362 ], parent:'53' },
        'INDRE'	                        : { code:'36', geobbox: [ 0.867468880708157, 46.347218495873, 2.2037884222747, 47.2771385931104 ], parent:'24' },
        'ISERE'                 	: { code:'38', geobbox: [ 4.7439913610838, 44.6969650242906, 6.35855018246407, 45.8827813321709 ], parent:'82' },
        'JURA'	                        : { code:'39', geobbox: [ 5.25204276810923, 46.2606932070983, 6.20657472346847, 47.305843036758 ], parent:'43' },
        'LOIR-ET-CHER'	                : { code:'41', geobbox: [ 0.58031547394897, 47.1862252339445, 2.24774501529762, 48.1328347595991 ], parent:'24' },
        'LOIRE'	                        : { code:'42', geobbox: [ 3.69339101091205, 45.2322110017572, 4.75995345936003, 46.2759144434065 ], parent:'82' },
        'HAUTE-LOIRE'           	: { code:'43', geobbox: [ 3.08538944280753, 44.7438724371486, 4.48891796783216, 45.4276329992512 ], parent:'83' },
        'LOIRE-ATLANTIQUE'	        : { code:'44', geobbox: [ -2.55670587240236, 46.8600798343647, -0.923468920280055, 47.8348596707559 ], parent:'52' },
        "VAL-D'OISE"	                : { code:'95', geobbox: [ 1.60879607062992, 48.9086793298905, 2.59447416723085, 49.2371907073631 ], parent:'11' },
        'LOIRET'	                : { code:'45', geobbox: [ 1.51465722436234, 47.4831887872082, 3.12822994541792, 48.3449441557612 ], parent:'24' },
        'LOT'	                        : { code:'46', geobbox: [ 0.981507059196262, 44.2033443628775, 2.21047650650625, 45.0446656338747 ], parent:'73' },
        'LOT-ET-GARONNE'        	: { code:'47', geobbox: [ -0.140688977601515, 43.9732082639777, 1.07795122623525, 44.7641935250676 ], parent:'72' },
        'LOZERE'	                : { code:'48', geobbox: [ 2.98167698653043, 44.1143717516483, 3.99816298776397, 44.9757230255701 ], parent:'91' },
        'MAYENNE'               	: { code:'53', geobbox: [ -1.23825173432567, 47.733381378006, -0.0505388875447988, 48.5679994940617 ], parent:'52' },
        'MAINE-ET-LOIRE'        	: { code:'49', geobbox: [ -1.35420364185724, 46.9704655722341, 0.234568112476669, 47.8099914629707 ], parent:'52' },
        'MANCHE'	                : { code:'50', geobbox: [ -1.94670966074895, 48.4568749243268, -0.736267312130707, 49.7261028438926 ], parent:'25' },
        'MARNE'	                        : { code:'51', geobbox: [ 3.39712958466865, 48.5151739162974, 5.03775651961035, 49.4077249196893 ], parent:'21' },
        'HAUTE-MARNE'	                : { code:'52', geobbox: [ 4.62682990793103, 47.5765507085746, 5.89057469690884, 48.6888516838792 ], parent:'21' },
        'MEURTHE-ET-MOSELLE'	        : { code:'54', geobbox: [ 5.42599032483599, 48.3500388831168, 7.12316536902857, 49.5622518629105 ], parent:'41' },
        'MEUSE'	                        : { code:'55', geobbox: [ 4.88876092979764, 48.4093347310975, 5.85347643091997, 49.6170877385028 ], parent:'41' },
        'MORBIHAN'              	: { code:'56', geobbox: [ -3.73319097352884, 47.2785723824613, -2.03605808668459, 48.2100163334276 ], parent:'53' },
        'PYRENEES-ORIENTALES'	        : { code:'66', geobbox: [ 1.72401059413076, 42.3334886248064, 3.17560928422705, 42.918341437261 ], parent:'91' },
        'MOSELLE'	                : { code:'57', geobbox: [ 5.89340158922053, 48.5275964435493, 7.63929424144907, 49.5121803763668 ], parent:'41' },
        'NIEVRE'	                : { code:'58', geobbox: [ 2.84518715979413, 46.6516513888404, 4.23087531089952, 47.587923653216 ], parent:'26' },
        'NORD'	                        : { code:'59', geobbox: [ 2.06769781245755, 49.9706577019505, 4.23013424692159, 51.0890003105061 ], parent:'31' },
        'BAS-RHIN'	                : { code:'67', geobbox: [ 6.94146755311435, 48.1203775050917, 8.23029497464336, 49.0778913044195 ], parent:'42' },
        'OISE'	                        : { code:'60', geobbox: [ 1.68861991590973, 49.0604588166992, 3.16619299476867, 49.7621154477532 ], parent:'22' },
        'ORNE'	                        : { code:'61', geobbox: [ -0.860362915434868, 48.1800913476878, 0.976415754774005, 48.9725578529906 ], parent:'25' },
        'PAS-DE-CALAIS'	                : { code:'62', geobbox: [ 1.55596486534455, 50.0210757580314, 3.1868508332076, 51.006505048771 ], parent:'31' },
        'PUY-DE-DOME'	                : { code:'63', geobbox: [ 2.38800755058955, 45.2870664026082, 3.98562929441086, 46.2565897578473 ], parent:'83' },
        'PYRENEES-ATLANTIQUES'	        : { code:'64', geobbox: [ -1.78927065469002, 42.7791245851151, 0.0286653361704553, 43.5968319192209 ], parent:'72' },
        'HAUTES-PYRENEES'	        : { code:'65', geobbox: [ -0.326875042893179, 42.6750381998866, 0.645958542499811, 43.6110151518302 ], parent:'73' },
        'RHONE'	                        : { code:'69', geobbox: [ 4.24383956873539, 45.4542105234082, 5.15923090286338, 46.3045177162748 ], parent:'82' },
        'HAUTE-SAONE'	                : { code:'70', geobbox: [ 5.37060312184662, 47.2531171722977, 6.82467151075771, 48.0240844173587 ], parent:'43' },
        'SAONE-ET-LOIRE'	        : { code:'71', geobbox: [ 3.62280167498711, 46.1568158371151, 5.46302217273112, 47.1554116835445 ], parent:'26' },
        'SARTHE'	                : { code:'72', geobbox: [ -0.447914016040585, 47.5685259333078, 0.916650480581802, 48.4845765333341 ], parent:'52' },
        'SAVOIE'	                : { code:'73', geobbox: [ 5.6236771221683, 45.0523734133462, 7.18420190162793, 45.9384595782932 ], parent:'82' },
        'HAUTE-SAVOIE'	                : { code:'74', geobbox: [ 5.80547202595325, 45.6827069357963, 7.04116340941196, 46.4081778210384 ], parent:'82' },
        'PARIS'	                        : { code:'75', geobbox: [ 2.22422457022508, 48.8157571461016, 2.46724594319785, 48.9016517752508 ], parent:'11' },
        'SEINE-MARITIME'	        : { code:'76', geobbox: [ 0.0657060459778601, 49.2519741450731, 1.78863341194128, 50.0715510068397 ], parent:'23' },
        'SEINE-ET-MARNE'	        : { code:'77', geobbox: [ 2.39237152446175, 48.1205415437406, 3.55568695855857, 49.1175542188162 ], parent:'11' },
        'DEUX-SEVRES'	                : { code:'79', geobbox: [ -0.902217134528063, 45.969659985238, 0.218931968181321, 47.1084160627862 ], parent:'54' },
        'SOMME'	                        : { code:'80', geobbox: [ 1.37969108770657, 49.5717641083625, 3.20272196050972, 50.3661272627017 ], parent:'22' },
        'TARN'	                        : { code:'81', geobbox: [ 1.53526757807792, 43.3826145540765, 2.93545056525751, 44.2005428225172 ], parent:'73' },
        'TARN-ET-GARONNE'	        : { code:'82', geobbox: [ 0.738908962885049, 43.7682419836351, 1.99705447201444, 44.3938762830875 ], parent:'73' },
        'VAR'	                        : { code:'83', geobbox: [ 5.65691958916954, 42.9820330559485, 6.93372623645342, 43.8069759192297 ], parent:'93' },
        'VAUCLUSE'	                : { code:'84', geobbox: [ 4.64922366610049, 43.6586859051648, 5.7573329775827, 44.4298461845612 ], parent:'93' },
        'VENDEE'	                : { code:'85', geobbox: [ -2.39883533384168, 46.2669296147409, -0.53780049801211, 47.0842685066335 ], parent:'52' },
        'VIENNE'	                : { code:'86', geobbox: [ -0.102121473880653, 46.049088674625, 1.21306586288722, 47.1757578503197 ], parent:'54' },
        'HAUTE-VIENNE'	                : { code:'87', geobbox: [ 0.62974246395244, 45.437605335213, 1.90944070649067, 46.4015983835496 ], parent:'74' },
        'VOSGES'	                : { code:'88', geobbox: [ 5.39383756038222, 47.8130537245886, 7.19828225379745, 48.5135922655566 ], parent:'41' },
        'YONNE'	                        : { code:'89', geobbox: [ 2.84865016049049, 47.3123467676337, 4.34029687115421, 48.3990277813267 ], parent:'26' },
        'TERRITOIREDEBELFORT'	        : { code:'90', geobbox: [ 6.75763848367051, 47.4336991246288, 7.1421733942044, 47.8247819220456 ], parent:'43' },
        'ESSONNE'	                : { code:'91', geobbox: [ 1.9165394406085, 48.2853193664117, 2.58407400388371, 48.7761020316218 ], parent:'11' },
        'GUADELOUPE'                    : { code:'971', geobbox: [-61.80874, 15.83977, -61.0034,  16.51071], parent:'01' },
        'GUYANE'                        : { code:'973', geobbox: [-54.59434,  2.11396, -51.62208,  5.75387], parent:'03' },
        'LA REUNION'                    : { code:'974', geobbox: [ 55.2171, -21.38824,  55.83604,-20.87173], parent:'04' },
        'MARTINIQUE'                    : { code:'972', geobbox: [-61.22895, 14.39595, -60.81124, 14.87859], parent:'02' },
        'MAYOTTE'                       : { code:'976', geobbox: [ 45.01978,-12.99974,  45.29765,-12.63733], parent:'06' }
};

/**
 * APIFunction: Geoportal.Catalogue.completeConfiguration
 * Complete the auto-configuration. Fill the Geoportal.Catalogue constants with
 * auto-configuration result.
 * 
 * Parameters:
 * configuration - {Object} Result from auto-configuration parser
 * 
 * See {<Geoportal.GeoRMHandler.getConfig>}
 */
Geoportal.Catalogue.completeConfiguration= function(configuration){
    var general= configuration.generalOptions;
    var layers= configuration.layersContext;

    for (var tms in general.tileMatrixSets) {
        var tileMatrixSet= general.tileMatrixSets[tms];
        // IGN's WMTS bug : epsg:nnnn instead of EPSG:nnnn
        var crs= tileMatrixSet.supportedCRS= tileMatrixSet.supportedCRS.replace(/epsg/,"EPSG");
        if (!Geoportal.Catalogue.CRSRESOLUTIONS.hasOwnProperty(crs)) {
            var p= new OpenLayers.Projection(crs);
            Geoportal.Catalogue.CRSRESOLUTIONS[crs]= [];
            var matrixIds= tileMatrixSet.matrixIds;
            for (var i= 0, li= matrixIds.length; i<li; ++i) {
                var mid= matrixIds[i];
                Geoportal.Catalogue.CRSRESOLUTIONS[crs].push(
                    0.00028*mid.scaleDenominator
                   /(OpenLayers.METERS_PER_INCH*OpenLayers.INCHES_PER_UNIT[p.getUnits()]));
                mid.supportedCRS= mid.supportedCRS.replace(/epsg/,"EPSG");
            }
            Geoportal.Catalogue.CRSRESOLUTIONS[crs].sort(function (a,b){ return b-a; });
        }
    }
    var llR= Geoportal.Catalogue.CRSRESOLUTIONS['CRS:84'];
    if (!llR) {
        llR= Geoportal.Catalogue.CRSRESOLUTIONS['CRS:84']= general.resolutions.slice();
    }
    var wmR= Geoportal.Catalogue.CRSRESOLUTIONS['EPSG:3857'];
    if (!wmR) {//FIXME : should never happened !!
        // reproject resolutions from CRS84 to WebMercator (transform resolutions from degree/px to meter/px)
        wmR= Geoportal.Catalogue.CRSRESOLUTIONS['EPSG:3857']= new Array(llR.length);
        for (var i= 0, len= llR.length; i<len; i++) {
            var pt= new OpenLayers.LonLat(llR[i], 0);
            pt.transform(OpenLayers.Projection.CRS84, OpenLayers.Projection.WebMercator);
            wmR[i]= pt.lon;
        }
    }
    Geoportal.Catalogue.RESOLUTIONS= wmR;

    var getResolutionsFromCRS= function(crs) {
        if (OpenLayers.Projection.WebMercator.isAliasOf(crs)) {
            return wmR;
        }
        if (OpenLayers.Projection.CRS84.isAliasOf(crs)) {
            return llR;
        }
        return Geoportal.Catalogue.CRSRESOLUTIONS[crs]?Geoportal.Catalogue.CRSRESOLUTIONS[crs]:null ;
    };
    var retrieveZoomFromResolution= function(resolutions, resolution) {
        for (var i= 0, li= resolutions.length; i<li; i++) {
            if (resolutions[i]-resolution <= resolutions[li-1]) {
                return i;
            }
        }
        return -1;
    };
    var getZoomLevelFromScaleDenominator= function(scaleDenominator,crs) {
        var resolution= scaleDenominator * 0.00028;
        var R= getResolutionsFromCRS(crs);
        if (R) {
            return retrieveZoomFromResolution(R,resolution);
        }
        resolution= resolution/(OpenLayers.METERS_PER_INCH * OpenLayers.INCHES_PER_UNIT["degrees"]);
        return retrieveZoomFromResolution(llR,resolution);
    };
    var getZoomLevelFromResolution= function(resolution,crs){
        var R= getResolutionsFromCRS(crs);
        if (R) {
            return retrieveZoomFromResolution(R,resolution);
        }
        var pt0= new OpenLayers.LonLat(0, 0);
        var pt1= new OpenLayers.LonLat(1, 0);
        pt0.transform(new OpenLayers.Projection(crs),OpenLayers.Projection.CRS84);
        pt1.transform(new OpenLayers.Projection(crs),OpenLayers.Projection.CRS84);
        resolution= resolution*(Math.abs(pt1.lon-pt0.lon));
        return retrieveZoomFromResolution(llR,resolution);
    };

    var Ts= general.territories || {};
    for (var i=0, li= Ts.length; i<li; i++) {
        var T= Ts[i];

        if (!Geoportal.Catalogue.TERRITORIES.hasOwnProperty(T.id)) {
            var baseLayers= {};
            // FIXME AutoConf returns only one defaultCRS. defaultCRS must be webmercator for all territories
            // FIXME sld:MaxScaleDenominator is wrong (128209039), should be :
            //       559082264 for allTerritories
            //       maintenant : les baseLayers sont créés à partir du paramètre 
            //                    territoy du viewer.
            //       Si territory=='FXX' alors baseLayer ='_FXX_territory_
            //                                 (et limitation de la navigation à 
            //                                  l'emprise du territoire)
            //       Si territory=='WLD' alors baseLayer ='__WLD__' 
            T.minScale= 559082264 ;
            baseLayers[T.defaultCRS]= {
                minZoomLevel    : getZoomLevelFromScaleDenominator(T.minScale,T.defaultCRS),
                maxZoomLevel    : getZoomLevelFromScaleDenominator(T.maxScale,T.defaultCRS),
                defaultZoomLevel: getZoomLevelFromResolution(T.resolution,T.defaultCRS)
            };
            Geoportal.Catalogue.TERRITORIES[T.id]= {
                isDefault     : T.isDefault,
                geobbox       : T.boundingBox,
                geocenter     : [T.center.lon, T.center.lat],
                defaultCRS    : [T.defaultCRS],
                geoCRS        : [OpenLayers.Projection.CRS84],
                displayCRS    : [T.defaultCRS],
                baseLayers    : baseLayers,
                defaultLayers : OpenLayers.Util.extend({}, T.defaultLayers)
            };
            Geoportal.Catalogue.TERRITORIES[T.id].displayCRS=
                Geoportal.Catalogue.TERRITORIES[T.id].displayCRS.concat(
                    T.additionalCRS?
                        T.additionalCRS
                    :   [OpenLayers.Projection.CRS84]
                );
        }
    }

    for (var i= 0, il= layers.length; i<il; i++) {
        var layer= layers[i];
        var layerKey= layer.id;
        var serviceType= layer.metadata && layer.metadata.type?
            layer.metadata.type.split(':').pop() || 'WMTS'
        :   '';
        var serviceSubType= (serviceType+';').split(';')[1];
        if (serviceSubType.length>0) {
            // OPENLS;xxx case for instance :
            serviceType= serviceType.split(';')[0];
            layer.name+= ';'+serviceSubType;
            layerKey+= ';'+serviceSubType;
        }
        if (layer.aggregate) {
            // GEOGRAPHICALGRIDSYSTEMS.MAPS$GEOPORTAIL:OGC:WMTS@aggregate
            //serviceType= serviceType.split('@')[0];
            //layer.name= layer.name.split('$')[0];
        }
        if (!Geoportal.Catalogue.LAYERNAMES.hasOwnProperty(layer.name) || serviceType=='WMTS') {
            // the first wmts wins ! // FIXME : several layers with same name and different serviceType (wms, wmts) ?
            Geoportal.Catalogue.LAYERNAMES[layer.name]= {
                key   : layerKey,
                weight: layer.options.order
            };
        }

        var originators= layer.options.originators;
        if (originators) {
            for (var o=0, ol= originators.length; o<ol; o++) {
                var originator= originators[o];
                if (!Geoportal.Catalogue.ORIGINATORS[originator.name]) {
                    Geoportal.Catalogue.ORIGINATORS[originator.name]= {
                        url        : originator.url,
                        attribution: originator.attribution || '',
                        bounds     : [],
                        pictureUrl : originator.pictureUrl
                    };
                }
                var bounds= Geoportal.Catalogue.ORIGINATORS[originator.name].bounds;
                for (var c= 0, cl= originator.constraints.length; c<cl ;c++) {
                    var bc= OpenLayers.Bounds.fromArray(originator.constraints[c].boundingBox);
                    var inb= false;
                    for (var co= 0, col= bounds.length; co<col; co++) {
                        var bco= OpenLayers.Bounds.fromArray(bounds[co]);
                        inb= inb || bco.containsBounds(bc) || bc.containsBounds(bco);
                        // already in !
                        if (inb) { break; }
                    }
                    if (!inb) {
                        bounds.push(originator.constraints[c].boundingBox);
                    }
                }
            }
        }

        var serviceParams= { 
            options: { 
               visibility: false    //auto-configuration not yet correct, when fixed use layer.visibility
            } 
        };
        var format= null;
        if (layer.formats) {
            for (var f= 0, fl=layer.formats.length; f<fl; f++) {
                if (layer.formats[f].current) {
                    format= layer.formats[f].value;
                    break;
                }
            }
        }
        format= format || 'image/jpeg';//may happened for aggregate ?!
        if (serviceType) {
            serviceParams[serviceType]= {
                format : format,
                version: layer.version
            };
        }

        var layerConfig= Geoportal.Catalogue.CONFIG[layerKey]= {
            serviceParams : serviceParams,
            layerOptions  : {
                opacity               : layer.options.opacity,
                displayInLayerSwitcher: layer.options.displayInLayerSwitcher
            }
        };

        var layerOptions= layerConfig.layerOptions;
        if (layer.title) {
            layerOptions.title= layer.title;
        }
        if (layer['abstract']) {
            layerOptions.description= layer['abstract'];
        }
        if (layer.options.legends) {
            layerConfig.legends= layer.options.legends.slice();
        }
        if (layer.options.thematics) {
            layerConfig.thematics= layer.options.thematics.slice();
        }
        if (layer.options.inspireThematics) {
            layerConfig.inspireThematics= layer.options.inspireThematics.slice();
        }
        if (layer.options.constraints) {
            layerConfig.constraints= layer.options.constraints.slice();
        }
        var layerP= layer.projection;
        if (serviceType=="WMTS" && layer.options.tileMatrixSetLink) { // WMTS specific layer options
            var tileMatrixSet= layer.options.tileMatrixSetLink.tileMatrixSet;
            layerOptions.matrixSet= tileMatrixSet;
            for (var s= 0, sl= layer.styles.length; s<sl; s++) {
                if (layer.styles[s].current) {
                    layerOptions.style= layer.styles[s].name;
                    break;
                }
            }
            layerP= general.tileMatrixSets[tileMatrixSet].supportedCRS;
            layerOptions.matrixIds= general.tileMatrixSets[tileMatrixSet].matrixIds;
            layerOptions.nativeResolutions= (getResolutionsFromCRS(layerP) || llR).slice();
        }
        layerOptions.projection= layerP;

        for (var t_id in Geoportal.Catalogue.TERRITORIES) {
            var T= Geoportal.Catalogue.TERRITORIES[t_id], layerT, zn, zx;
            if (layerConfig.constraints) {
                for (var iC=0, iCL=layerConfig.constraints.length; iC<iCL;iC++) {
                    var constraint= layerConfig.constraints[iC];
                    if (OpenLayers.Bounds.fromArray(T.geobbox).intersectsBounds(OpenLayers.Bounds.fromArray(constraint.boundingBox))) {
                        //prevent minZoomLevel, maxZoomLevel not to be within territory's zoom levels :
                        //FIXME: minScale, maxScale are expressed in layer's projection !
                        zn= getZoomLevelFromScaleDenominator(constraint.minScale,layerP);
                        zn= Math.max(zn,T.baseLayers[T.defaultCRS].minZoomLevel);
                        zx= getZoomLevelFromScaleDenominator(constraint.maxScale,layerP);
                        zx= Math.min(zx,T.baseLayers[T.defaultCRS].maxZoomLevel);
                        if (zn>zx) {
                            var z0= zn;
                            zn= zx;
                            zx= z0;
                        }
                        constraint.minZoomLevel= zn;
                        constraint.maxZoomLevel= zx;
                        constraint.minResolution= (getResolutionsFromCRS(T.defaultCRS) || llR)[constraint.maxZoomLevel];
                        constraint.maxResolution= (getResolutionsFromCRS(T.defaultCRS) || llR)[constraint.minZoomLevel];
                        constraint.maxExtent= OpenLayers.Bounds.fromArray(constraint.boundingBox);
                    }
                }
            }
            if (layer.options.boundingBox && 
                OpenLayers.Bounds.fromArray(T.geobbox).intersectsBounds(OpenLayers.Bounds.fromArray(layer.options.boundingBox))) {
                //prevent minZoomLevel, maxZoomLevel not to be within territory's zoom levels :
                //FIXME: minScale, maxScale are expressed in layer's projection !
                if (typeof layer.maxScale !== 'undefined') {
                    zx= getZoomLevelFromScaleDenominator(layer.maxScale,layerP);
                    zx= Math.min(zx,T.baseLayers[T.defaultCRS].maxZoomLevel);
                } else {
                    zx= T.baseLayers[T.defaultCRS].maxZoomLevel;
                }
                if (typeof layer.minScale !== 'undefined') {
                    zn= getZoomLevelFromScaleDenominator(layer.minScale,layerP);
                    zn= Math.max(zn,T.baseLayers[T.defaultCRS].minZoomLevel);
                } else {
                    zn= T.baseLayers[T.defaultCRS].minZoomLevel;
                }
                layerT= layerConfig[t_id]= {
                    bounds          : layer.options.boundingBox,
                    maxZoomLevel    : zx,
                    minZoomLevel    : zn,
                    fileIdentifiers : [],
                    originators     : []
                };
                if (layer.options.metadataURL) {
                    for (var m= 0, ml= layer.options.metadataURL.length; m<ml; m++) {
                        layerT.fileIdentifiers.push(layer.options.metadataURL[m].href);
                    }
                }
                if (originators) {
                    for (var o=0, ol= originators.length; o<ol; o++) {
                        var originator= originators[o];
                        for (var c= 0, cl= originator.constraints.length; c<cl; c++) {
                            //prevent minZoomLevel, maxZoomLevel not to be within territory's zoom levels :
                            //FIXME: minScale, maxScale are expressed in layer's projection !
                            zn= getZoomLevelFromScaleDenominator(originator.constraints[c].minScale,layerP);
                            zn= Math.max(zn,T.baseLayers[T.defaultCRS].minZoomLevel);
                            zx= getZoomLevelFromScaleDenominator(originator.constraints[c].maxScale,layerP);
                            zx= Math.min(zx,T.baseLayers[T.defaultCRS].maxZoomLevel);
                            layerT.originators.push({
                                id  : originator.name,
                                //FIXME: exclusive on constraint
                                mnzl: zn,
                                mxzl: zx
                            });
                        }
                    }
                }
                if (Geoportal.Catalogue.TERRITORIES[t_id].defaultLayers[layerKey]) {
                    layerT.isDefault= true;
                    layerConfig.serviceParams.options.visibility= true; // auto-configuration not yet correct, when fixed remove this line
                    Geoportal.Catalogue.TERRITORIES[t_id].defaultLayers[layerKey]= layerT;
                }
            }
        }
        if (layer.aggregate) {
            layerConfig.aggregate= true;
            layerConfig.hasMoreInformations= layer.hasMoreInformations;
        }
    }/* for each layer */

    // Improve Originators as many layers put same bounds in:
    var originators= Geoportal.Catalogue.ORIGINATORS;
    for (var o in originators) {
        var bs= originators[o].bounds;
        var nbs= [];
        for (var i= 0, l= bs.length; i<l; i++) {
            var b= OpenLayers.Bounds.fromArray(bs[i]), inB= false;
            for (var j=0, n= nbs.length; j<n; j++) {
                var nb= OpenLayers.Bounds.fromArray(nbs[j]);
                inB= nb.intersectsBounds(b);
                if (inB) {
                    nb.extend(b);
                    nbs[j]= nb.toArray();
                    break;
                }
            }
            if (!inB) {
                nbs.push(bs[i]);
            }
        }
        nbs.sort(function(a, b) {
            var r= a.left-b.left;
            if (Math.abs(r)>0.000028) return 1000.0*r;
            r= a.bottom-b.bottom;
            if (Math.abs(r)>0.000028) return 100.0*r;
            r= a.right-b.right;
            if (Math.abs(r)>0.000028) return 10.0*r;
            r= a.top-b.top;
            if (Math.abs(r)>0.000028) return r;
            return 0.0;
        });
        originators[o].bounds= nbs;
    }
    // Add unknown authority originator
    originators['unknownAuthority']= {
        'attribution':'-',
        'bounds':[-179.9, -90, 179.9, 90],
        'pictureUrl':Geoportal.Util.getImagesLocation()+'logo_unknownAuthority.gif',
        'url':'javascript:void(0)'
    };

    // Clean up territories
    var Ts= Geoportal.Catalogue.TERRITORIES;
    for (var t in Ts) {
        var te= Ts[t];
        for (var l in te.defaultLayers) {
            var ly= te.defaultLayers[l];
            if (ly.isDefault!==true) {
                delete te.defaultLayers[l];
            }
        }
    }

    // Finish with deprecated layers :
    var oldNewMap= {
        'ELEVATION.SLOPS'    :'ELEVATION.SLOPES',
        'SEAREGIONS.LEVEL0'  :'ELEVATION.LEVEL0',
        'TOPONYMS.ALL'       :'PositionOfInterest;Geocode',
        'ADDRESSES.CROSSINGS':'StreetAddress;Geocode'
    };
    for (var ln in oldNewMap) {
        var layerN= Geoportal.Catalogue.LAYERNAMES[oldNewMap[ln]];
        if (layerN) {
            Geoportal.Catalogue.LAYERNAMES[ln]= {
                key       : layerN.key,
                weight    : layerN.weight,
                deprecated: oldNewMap[ln]
            };
        }
    }

};
