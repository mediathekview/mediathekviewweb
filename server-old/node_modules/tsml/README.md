# tsml

**ES6 template string tag for multi-line cleaning - squash multi-line strings into a single line**

Use template strings to split up complex string creation over multiple lines and have the newlines and newline white-space prefixes cleaned for you.

`tsml` is primarily for code readability. Split up template strings over newlines, indent or add additional blank lines to space things out.

## Example

From [changelog-maker](https://github.com/rvagg/changelog-maker):

```js
const tsml = require('tsml')

function toStringSimple (data) {
  return tsml`

    * [${data.sha.substr(0, 10)}] - 
    ${data.semver.length ? '(' + data.semver.join(', ').toUpperCase() + ') ' : ''}
    ${data.revert ? 'Revert "' : ''}
    ${data.group ? data.group + ': ' : ''}
    ${data.summary} 
    ${data.revert ? '"' : ''}
    ${data.author ? '(' + data.author + ') ' : ''}
    ${data.pr}

  `
}

// -> * [7e88a9322c] - src: make accessors immune to context confusion (Ben Noordhuis) #1238
```

## License

**tsml** is Copyright (c) 2015 Rod Vagg [@rvagg](https://twitter.com/rvagg) and licenced under the MIT licence. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE.md file for more details.