var a = require('./build/Debug/filmliste-parser-native');

a.a("/home/patrick/filmliste", "({|,)?\\\"(Filmliste|X)\\\":", (val) => { }, (end) => console.log('CALLBACK END'));
