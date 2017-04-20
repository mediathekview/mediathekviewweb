var fs=require("fs");
var Hjson=require("./hjson");

// allows you to require a hjson file, e.g.:
// require("hjson/lib/require-config");
// var cfg=require("./test.hjson");

require.extensions[".hjson"]=function(module, filename) {
  var content=fs.readFileSync(filename, "utf8");
  module.exports=Hjson.parse(content);
};
