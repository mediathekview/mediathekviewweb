The light-weight Flash video player that makes Flash work like HTML5 video. This allows player skins, plugins, and other features to work with both HTML5 and Flash

This project doesn't need to be used if you simply want to use the Flash video player.  Head back to the main Video.js project if that's all you need, as the compiled SWF is checked in there.

## Installation

1. Install Node Packages.
```bash
    npm install
   ```
2. Compile SWF.
Development (places new SWF in /dist/):
```bash
    grunt mxmlc
   ```
Production/ Distribution (runs mxmlc task and copies SWF to dist/):
```bash
    grunt dist
   ```
3. Run Connect Server.
```bash
    grunt connect:dev
```
4. Open your browser at [http://localhost:8000/index.html](http://localhost:8000/index.html) to see a video play.  You can keep using grunt to rebuild the Flash code.

## Releasing

1. Make sure that the following file is modified with these values:

```
node_modules/flex-sdk/lib/flex_sdk/frameworks/flex-config.xml
```

```xml
<!-- Specifies the minimum player version that will run the compiled SWF. -->
<target-player>10.3</target-player>

<!-- Specifies the version of the compiled SWF -->
<swf-version>12</swf-version>
```

2. Run the commands:
```sh
npm version {major,minor,patch}
npm publish
```
The swf and changelog will be automatically built and added to the repo on version.

## Running Unit and Integration Tests

** Note - We want to drop all of this for grunt based / Karma testing.

For unit tests, this project uses [FlexUnit](http://flexunit.org/). The unit tests can be found in [project root]/src/com/videojs/test/

For integration tests, this project uses [qunit](http://qunitjs.com/). The integration tests can be found in [project root]/test

In order to run all of the tests, use the links at  [http://localhost:8000/index.html](http://localhost:8000/index.html)

There are very few tests.  Adding to them is a fantastic and much appreciated way to contribute.
