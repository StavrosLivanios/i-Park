require("babel-core").transform("code");
const xml2js = require("xml2js");
const {parserdb}  = require("./json-parser");


module.exports.kmlpop=  function kmlpop(upload_file, callback) {
    xml2js.parseString(upload_file.data, function (err, result) {
        if (err) console.log(err);
        var json= result ;
        for (var j = 0; j < json.kml.Document[0].Folder.length; j++) {
            for (var i = 0; i <json.kml.Document[0].Folder[j].Placemark.length; i++) {
                json.kml.Document[0].Folder[j].Placemark[i].population = (Math.floor(Math.random() * (1000 - 100)));
            }
        }
        parserdb(json, callback)
    });
};