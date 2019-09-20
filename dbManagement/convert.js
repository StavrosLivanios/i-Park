require("babel-core").transform("code");
const xml2js = require("xml2js");
const {parserdb}  = require("./json-parser");


module.exports.kmlpop=  function kmlpop(upload_file, callback) {
    xml2js.parseString(upload_file.data, function (err, result) {
        if (err) console.log(err);
        var json= result ;
        for (var i = 0; i < json.Document.Folder[0].Placemark.length; i++) {
            json.Document.Folder[0].Placemark[i].population = (Math.floor(Math.random() * (1000 - 100) ));
        }
        parserdb(json, callback)
    });
};