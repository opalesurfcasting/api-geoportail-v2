# api-geoportail-v2


Canonicalize Géoportail API V2.12 using jsDelivr Github CDN and mod_pagespeed, or, included as a simple direct url.

[![](https://data.jsdelivr.com/v1/package/gh/opalesurfcasting/api-geoportail-v2/badge)](https://www.jsdelivr.com/package/gh/opalesurfcasting/api-geoportail-v2)

## Using Apache [mod_pagespeed](https://github.com/pagespeed/mod_pagespeed/) - In pagespeed.conf:

This will enable canonicalization for GeoportalExtended.js (API geoportail V2.1.2) using [jsDelivr Github CDN](https://www.jsdelivr.com/feature) - The parameter below will enable detection from this librarie size and checksum :
```
ModPagespeedEnableFilters canonicalize_javascript_libraries
```
Adding this :
```
 ModPagespeedLibrary 2501271 FrwjyP7bsCs63wx0OzIIA \
    //cdn.jsdelivr.net/gh/opalesurfcasting/api-geoportail-v2@V2.1.2.002/GeoportalExtended.min.js
```    
will enable canonicalization for GeoportalExtended.js, also based on file size 2501271 and checksum. This is needed as this file is not in default [canonicalized libraries list](https://github.com/pagespeed/mod_pagespeed/blob/master/net/instaweb/genfiles/conf/pagespeed_libraries.conf).

Find the size and checksum :

`pagespeed_js_minify --print_size_and_hash GeoportalExtended.js` - [Find the size and checksum](https://www.modpagespeed.com/doc/filter-canonicalize-js)

## Including direct urls :

minified : https://cdn.jsdelivr.net/gh/opalesurfcasting/api-geoportail-v2@V2.1.2.002/GeoportalExtended.min.js

## Update since last IGN release (V2.1.2)

### V2.1.2.001

fix `target='_blank'` without `rel='noopener'` in GeoportalExtended.js https://mathiasbynens.github.io/rel-noopener/

### V2.1.2.002

fix CGU url

## Notes :

When canonicalized, [libraries will not be combined or minifyed by mod_pagespeed](https://www.modpagespeed.com/doc/filter-canonicalize-js), but it can be done through [jsdlivr](https://www.jsdelivr.com/features). It's up to you to check what is the best.

https://www.developpez.net/forums/d1784282/applications/sig-systeme-d-information-geographique/ign-api-geoportail/geoportalextended-js-github-ign-jsdelivr-net/

IGN (Géoportail) Sources repository : https://depot.ign.fr/geoportail/api/develop/tech-docs-js/fr/developpeur/download.html

https://geoservices.ign.fr/

## Informations de licence

https://github.com/opalesurfcasting/api-geoportail-v2/blob/master/LICENSE

## l'API Géoportail V3 :
- [Kit de Développement (SDK) Géoportail](https://github.com/IGNF/geoportal-sdk)
- [Bibliothèque d'accès aux ressources du Géoportail](https://github.com/IGNF/geoportal-access-lib)
- [Extensions Géoportail pour Leaflet et Openlayers](https://github.com/IGNF/geoportal-extensions)
