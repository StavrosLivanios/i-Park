const fs = require('fs');
require("babel-core").transform("code");
parseString = require("xml2js").parseString,
    xml2js = require("xml2js");

/*  Συνάρτηση parserdb
   Η parserdb πραγματοποιεί parsing στο αρχείο ώστε να εξάγει τις συντεταγμένες των πολυγώνων( και τις πληροφορίες που
 χρειαζόμαστε για αυτά) και τις αποθηκεύει στη βάση δεδομένων με χρήση Μysql, υπολογίζοντας ταυτόχρονα το κεντροειδές
 του κάθε πολυγώνου("Centroid" γραμμή 71).

 */

module.exports.parserdb =  function parserdb(parsedXmlFile, callback) {
    const dbconnect = require('../db.js');
    var obj = {
        polygons : []
    };


    /*      Συνάρτηση που υπολογίζει το κεντροειδές του πολυγώνου.
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
 */

    //validate that parsedXmlFile is of type: {Document: {Folder: [] }  }
    const polygonsToInsert = [];

    parsedXmlFile.kml.Document[0].Folder.forEach(function(folder) {
        if(!folder.Placemark){
            return;
        }


        folder.Placemark.forEach(function (placemark) {
            var polexist = 0;
            var pol_id = "";
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

            dbconnect.query('SELECT polcoord,id FROM polygon', function (err, rows, fields) {
                if (err) throw err;

                rows.forEach(function (polcoord2) {
                    var cptext ="";

                    for (let i = 0; i < polcoord2.polcoord[0].length; i++) {
                        if(i !=  polcoord2.polcoord[0].length-1 ){
                            cptext = cptext + polcoord2.polcoord[0][i].x +" "+ polcoord2.polcoord[0][i].y+ ", ";
                        }
                        else{cptext = cptext + polcoord2.polcoord[0][i].x +" "+ polcoord2.polcoord[0][i].y;}
                    }

                    if (cptext === polygonString)
                    {
                        polexist = 1;
                        pol_id=polcoord2.id;
                        // console.log(polexist);
                    }
                });

                if(polexist == 0){
                    const sql = `INSERT INTO polygon (polcoord,population,demandtype_id,centroidcoord) VALUES (ST_PolygonFromText('POLYGON((${polygonString}))'),  ${population}, ${demandType},Centroid(geomfromtext('POLYGON((${polygonString}))')))`;
                    // polygonsToInsert.push(sql);
                    dbconnect.query(sql, function (err, result) {
                        if (err) throw err;
                        console.log(result.affectedRows + " record(s) inserted");
                    });
                    // console.log("mhnnnn kane update");

                }
                else{

                    var sql = "UPDATE polygon SET population = "+ population +" WHERE id = "+pol_id;
                    dbconnect.query(sql, function (err, result) {
                        if (err) throw err;
                        console.log(result.affectedRows + " record(s) updated");
                    });

                    // console.log("kane update");

                }
            });
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

