var NativeFilmlisteParser = require('./build/Release/filmliste-parser-native');

var count = 0;

let begin = Date.now();


NativeFilmlisteParser.parseFilmliste("/home/patrick/filmliste", "({|,)?\\\"(Filmliste|X)\\\":", 250, (val) => {
  count += val.length;
  if (count % 5000 == 0) {
    console.log(count);
  }
}, (end) => {
  console.log('CALLBACK END', count, Date.now() - begin)
});
