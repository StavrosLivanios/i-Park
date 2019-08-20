const fs = require('fs');
require("babel-core").transform("code");
parseString = require("xml2js").parseString,
    xml2js = require("xml2js");
module.exports.parserdb =  function parserdb(parsedXmlFile, callback) {
    const dbconnect = require('../db.js');
    var obj = {
        polygons : []
    };


    function get_polygon_centroid(pts) {

        var first = pts[0], last = pts[pts.length-1];
        if (first.x != last.x || first.y != last.y) pts.push(first);
        var twicearea=0,
            x=0, y=0,
            nPts = pts.length,
            p1, p2, f;
        for ( var i=0, j=nPts-1 ; i<nPts ; j=i++ ) {
            p1 = pts[i]; p2 = pts[j];
            f = p1.x*p2.y - p2.x*p1.y;
            twicearea += f;
            x += ( p1.x + p2.x ) * f;
            y += ( p1.y + p2.y ) * f;
        }
        f = twicearea * 3;
        return { x:x/f, y:y/f };
    }

    //validate that parsedXmlFile is of type: {Document: {Folder: [] }  }
    const polygonsToInsert = [];

    parsedXmlFile.Document.Folder.forEach(function(folder) {
        if(!folder.Placemark){
            return;
        }


        folder.Placemark.forEach(function (placemark) {
            const population = placemark.population;
            const demandType = 1; //todo: MUST add a property code in demand type table in order to find out the default demand type by making a query
            let polygonString = "";

            try{
                placemark.Polygon[0].outerBoundaryIs[0].LinearRing[0].coordinates.forEach(function (coords) {
                    const splittedPerLine = coords.split('\n');
                    splittedPerLine.forEach(function (line) {

                        const splittedLine = line.split(",");
                        if(splittedLine.length >= 2){
                            const previousPolygonString = polygonString ? (polygonString + ', ' ) : polygonString;
                            polygonString = previousPolygonString +  `${splittedLine[1].trim()} ${splittedLine[0].trim()}`                            //console.log(polygonString);
                        }
                    })
                })
            } catch (e) {
                polygonString = "";
            }

            //todo:UPDATE EXISTING ROWS IN TABLE
            const sql = `INSERT INTO polygon (polcoord,population,demandtype_id,centroidcoord) VALUES (ST_PolygonFromText('POLYGON((${polygonString}))'),  ${population}, ${demandType},Centroid(geomfromtext('POLYGON((${polygonString}))')))`;
            polygonsToInsert.push(sql);
        })
    });
    polygonsToInsert.forEach(function (polygonSql) {
        dbconnect.query(polygonSql, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
        });
    });
    callback(null, "records created")
};

