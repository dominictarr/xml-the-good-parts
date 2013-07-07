# xml-the-good-parts

Convert a subset of XML into JSON.

If you have tidy XML that has tags but no attributes,
then with this module you can convert it into JSON.

If someplace it has more complex stuff, it'll probably barf.
**NO WARRANTY EXPRESSED OR IMPLIED**

## Example

``` js
var xml2json = require('xml-the-good-parts')

process.stdin.pipe(xml2json()).pipe(process.stdout)
```

or as cli tool.

``` js
npm install -g xml-the-good-parts

xml-the-good-parts < evil.xml > nice.json
```



## License

MIT
