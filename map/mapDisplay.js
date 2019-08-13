require("babel-core").transform("code");
const jsonfile = require('jsonfile');

module.exports.displayMap =  function displayMap(req,res) {
    var dbconnect = require('../db.js');
    var file = 'adminData.json';

    jsonfile.readFile(file, function (err, obj) {
        if (!err) {
            //leafPolygons.push(obj);
            res.render("mapDisplay", {leafPolygons: obj});

        }else {
            dbconnect.query('SELECT * FROM polygon', function (err, rows, fields) {
                const leafPolygons = [];

                if (err) throw err;

                //var leafPolygons = [];
                rows.forEach(function (leafPolygon) {
                    const set = [];
                    leafPolygon.polcoord[0].forEach(function (coord) {
                        set.push([coord.x, coord.y])
                    });
                    const set2 =[];
                    set2.push([leafPolygon.centroidcoord.x,leafPolygon.centroidcoord.y]);





                    leafPolygons.push({
                        coords: set,
                        slots: leafPolygon.parkslots,
                        centroid: set2,
                        population: leafPolygon.population,
                        id: leafPolygon.id,
                        demandid: leafPolygon.demandtype_id,
                        color: 'grey'
                    });
                });

                res.render("mapDisplay", {leafPolygons: leafPolygons});

            });


        }
            });


};
