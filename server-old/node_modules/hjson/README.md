# hjson-js

[![Build Status](https://img.shields.io/travis/hjson/hjson-js.svg?style=flat-square)](http://travis-ci.org/hjson/hjson-js)
[![NPM version](https://img.shields.io/npm/v/hjson.svg?style=flat-square)](http://www.npmjs.com/package/hjson)
[![License](https://img.shields.io/github/license/hjson/hjson-js.svg?style=flat-square)](https://github.com/hjson/hjson-js/blob/master/LICENSE)

[Hjson](http://hjson.org), a user interface for JSON

![Hjson Intro](http://hjson.org/hjson1.gif)

JSON is easy for humans to read and write... in theory. In practice JSON gives us plenty of opportunities to make mistakes without even realizing it.

Hjson is a syntax extension to JSON. It's NOT a proposal to replace JSON or to incorporate it into the JSON spec itself. It's intended to be used like a user interface for humans, to read and edit before passing the JSON data to the machine.

```Hjson
{
  # specify rate in requests/second (because comments are helpful!)
  rate: 1000

  // prefer c-style comments?
  /* feeling old fashioned? */

  # did you notice that rate doesn't need quotes?
  hey: look ma, no quotes for strings either!

  # best of all
  notice: []
  anything: ?

  # yes, commas are optional!
}
```

The JavaScript implementation of Hjson is based on [JSON-js](https://github.com/douglascrockford/JSON-js). For other platforms see [hjson.org](http://hjson.org).

# Install from npm

```
npm install hjson
```

# Usage

```
var Hjson = require('hjson');

var obj = Hjson.parse(hjsonText);
var text2 = Hjson.stringify(obj);
```

To keep comments intact see [API](#modify--keep-comments).

## From the Commandline

Install with `npm install hjson -g`.

```
Usage:
  hjson [OPTIONS]
  hjson [OPTIONS] INPUT
  hjson (-h | --help | -?)
  hjson (-V | --version)

INPUT can be in JSON or Hjson format. If no file is given it will read from stdin.
The default is to output as Hjson.

Options:
  (-j | -json)  output as formatted JSON.
  (-c | -json=compact)  output as JSON.
Options for Hjson output:
  -sl         output the opening brace on the same line
  -quote      quote all strings
  -quote=all  quote keys as well
  -js         output in JavaScript/JSON compatible format
              can be used with -rt and // comments
  -rt         round trip comments
  -nocol      disable colors

Domain specific formats are optional extensions to Hjson and can be enabled with the following options:
  +math: support for Inf/inf, -Inf/-inf, Nan/naN and -0
  +hex: parse hexadecimal numbers prefixed with 0x
  +date: support ISO dates
```

Sample:
- run `hjson -j test.hjson > test.json` to convert to JSON
- run `hjson test.json > test.hjson` to convert to Hjson
- run `hjson test.json` to view colorized output


# API

The API is the same for the browser and node.js version.

**NOTE that the DSF api is considered experimental**

### Hjson.parse(text, options)

This method parses *JSON* or *Hjson* text to produce an object or array.

- *text*: the string to parse as JSON or Hjson
- *options*: object
  - *keepWsc*: boolean, keep white space and comments. This is useful if you want to edit an hjson file and save it while preserving comments (default false)

### Hjson.stringify(value, options)

This method produces Hjson text from a JavaScript value.

- *value*: any JavaScript value, usually an object or array.
- *options*: object
  - *keepWsc*: boolean, keep white space. See parse.
  - *bracesSameLine*: boolean, makes braces appear on the same line as the key name. Default false.
  - *emitRootBraces*: boolean, show braces for the root object. Default true.
  - *quotes*: string, controls how strings are displayed. (setting separator implies "strings")
    - "min": no quotes whenever possible (default)
    - "keys": use quotes around keys
    - "strings": use quotes around string values
    - "all": use quotes around keys and string values
  - *multiline*: string, controls how multiline strings are displayed. (setting quotes implies "off")
    - "std": strings containing \n are shown in multiline format (default)
    - "no-tabs": like std but disallow tabs
    - "off": show in JSON format
  - *separator*: boolean, output a comma separator between elements. Default false
  - *space*: specifies the indentation of nested structures. If it is a number, it will specify the number of spaces to indent at each level. If it is a string (such as '\t' or '&nbsp;'), it contains the characters used to indent at each level.
  - *eol*: specifies the EOL sequence (default is set by Hjson.setEndOfLine())
  - *colors*: boolean, output ascii color codes

### Hjson.endOfLine(), .setEndOfLine(eol)

Gets or sets the stringify EOL sequence ('\n' or '\r\n'). When running with node.js this defaults to os.EOL.

### Hjson.rt { parse, stringify }

This is a shortcut to roundtrip your comments when reading and updating a config file. It is the same as specifying the keepWsc option for the parse and stringify functions.

### Hjson.version

The version number.

### require-hook

Require a config file directly.

```
require("hjson/lib/require-config");
var cfg=require("./config.hjson");
```

## modify & keep comments

You can modify a Hjson file and keep the whitespace & comments intact (round trip). This is useful if an app updates its config file.

```
// parse, keep whitespace and comments
// (they are stored in a non enumerable __COMMENTS__ member)
var data = Hjson.rt.parse(text);

// modify like you normally would
data.foo = "text";

// convert back to Hjson
console.log(Hjson.rt.stringify(data));
```
# Build

To run all tests and create the bundle output, first install the dev dependencies with `npm i` and then run `npm run build`.

# History

[see history.md](history.md)

