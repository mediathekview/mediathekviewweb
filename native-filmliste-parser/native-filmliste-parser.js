let nativeFilmlisteParser = require('./build/Release/native-filmliste-parser');

module.exports.NativeFilmlisteParser = {
  parseFilmliste: function (file, regex, batchSize, batchCallback, endCallback) {
    if (endCallback != undefined) {
      nativeFilmlisteParser.parseFilmliste(file, regex, batchSize, batchCallback, endCallback);
    } else {
      return new Promise((resolve, reject) => {
        this.parseFilmliste(file, regex, batchSize, batchCallback, () => resolve());
      });
    }
  }
};
