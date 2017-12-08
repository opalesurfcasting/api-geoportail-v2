# api-geoportail-v2


Canonicalize Géoportail API V2.12 using jsDelivr Github CDN and mod_pagespeed.

## In Apache pagespeed.conf:

This will enable canonicalization for GeoportalExtended.js (API geoportail V2.1.2) using [jsDelivr Github CDN](https://www.jsdelivr.com/feature) - The parameter below will enable detection from this librarie size and checksum :
```
ModPagespeedEnableFilters canonicalize_javascript_libraries
```
Adding this :
```
 ModPagespeedLibrary 2500817 t1KCnbbw9WCA9AxmAnMKY \
    //cdn.jsdelivr.net/gh/opalesurfcasting/api-geoportail-v2@V2.1.2/GeoportalExtended.min.js
```    
will enable canonicalization for GeoportalExtended.js, also based on file size 2500817 and checksum. This is needed as this file is not in default [canonicalized libraries list](https://github.com/pagespeed/mod_pagespeed/blob/master/net/instaweb/genfiles/conf/pagespeed_libraries.conf).

Find the size and checksum :

`pagespeed_js_minify --print_size_and_hash GeoportalExtended.js` - [Find the size and checksum](https://www.modpagespeed.com/doc/filter-canonicalize-js)

## Direct urls :

[![](https://data.jsdelivr.com/v1/package/gh/opalesurfcasting/api-geoportail-v2/badge)](https://www.jsdelivr.com/package/gh/opalesurfcasting/api-geoportail-v2)

minified : https://cdn.jsdelivr.net/gh/opalesurfcasting/api-geoportail-v2@V2.1.2/GeoportalExtended.min.js

## Notes :

When canonicalized, libraries will not be combined or minifyed by mod_pagespeed, but it can be done through jsdlivr. It's up to you to check what is the best.

https://www.developpez.net/forums/d1784282/applications/sig-systeme-d-information-geographique/ign-api-geoportail/geoportalextended-js-github-ign-jsdelivr-net/

https://geoservices.ign.fr/
