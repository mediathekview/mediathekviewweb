var a = require('./build/Release/filmliste-parser-native');

var count = 0;

let begin = Date.now();

a.a("/home/patrick/filmliste", "({|,)?\\\"(Filmliste|X)\\\":", 100, (val) =>  {
  count += val.length;
}, (end) => {
    console.log('CALLBACK END', count, Date.now() - begin)
});
