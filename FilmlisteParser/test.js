var a = require('./build/Release/filmliste-parser-native');

a.a("/home/patrick/filmliste", "({|,)?\\\"(Filmliste|X)\\\":", (val) => console.log(val), (end) => console.log(end));
