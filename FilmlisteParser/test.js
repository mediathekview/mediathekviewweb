var a = require('./build/Debug/filmliste-parser-native');

var count = 0;

a.a("/home/timo/Downloads/Filmliste-akt", "({|,)?\\\"(Filmliste|X)\\\":", (val) =>  {
  count += val.length;
}, (end) => {
    
    console.log('CALLBACK END', count)
});

console.log("test");
