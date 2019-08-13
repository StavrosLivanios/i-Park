const geolib = require('geolib');
const randomLocation = require('random-location');
const axios = require('axios');
const clustering = require('density-clustering');
src="polygon-tools.min.js";


module.exports.scan = function scan(req,res) {
    var dbconnect = require('../db.js');

    //Validate Request Body
    if(
        !req.body.parktime
        || isNaN(req.body.parktime)
        || req.body.parktime < 0
        || req.body.parktime>23
    ){
        const error = new Error();
        error.status = 400;
        error.message = "Bad request. Request body is malformed";
        res.json(error);
        return;
    }

    if(
        !req.body.blockradius
        ||isNaN(req.body.blockradius)
        ||req.body.blockradius < 0
    ){
        const error = new Error();
        error.status = 400;
        error.message = "Bad request. Request body is malformed";
        res.json(error);
        return;
    }
    if(
        !req.body.coordx
        || !req.body.coordy
    ){
        const error = new Error();
        error.status = 400;
        error.message = "Bad request. Request body is malformed";
        res.json(error);
        return;
    }

    const currentDate = new Date();
    axios.post("http://localhost:3500/usersimulation", {
        time: currentDate.getHours()
    })
        .then(function (response) {
            if(response.status !== 200){
                throw new Error("failed")
            }

            const polygonsFromSimulation = response.data;
            const randomPairs = [];

            polygonsFromSimulation.forEach(function (leafPolygon) {

                const x = leafPolygon.centroid[0][0];
                const y =leafPolygon.centroid[0][1];

                const distance = geolib.getDistance(
                    { latitude: y, longitude: x },
                    { latitude:  req.body.coordy, longitude: req.body.coordx }
                );

                if (distance<=req.body.blockradius) {
                    for (let i = 0 ; i < leafPolygon.freeslots ; i++){

                        const P = {
                            latitude: req.body.coordy,
                            longitude: req.body.coordx
                        };

                        const R = 50; // meters

                        const randomPoint = randomLocation.randomCirclePoint(P, R);
                        randomPairs.push([randomPoint.longitude,randomPoint.latitude]);
                    }


                }

            });
            var dbscan = new clustering.DBSCAN();

            var clusters = dbscan.run(randomPairs,0.00007,2);
          //  console.log(clusters, dbscan.noise);
            var maxClusters = [clusters[0]];


            for (let i=1; i<clusters.length;i++){
                     if(clusters[i].length >= maxClusters[0].length){
                         if (clusters[i].length>maxClusters[0].length){
                             for(let p=0;p<maxClusters.length ; p++){
                                 maxClusters.pop();
                             }
                             maxClusters[0]=clusters[i];
                         } else{
                             maxClusters.push(clusters[i]);
                         }

                     }
            }
            const  polygons=[];
            var temppoly=[];
            var center =[];
            var objs =[];
            for (let i=0;i<maxClusters.length;i++){
                temppoly=[];
                objs=[];
                for(let j=0;j<maxClusters[i].length;j++){
                temppoly.push(randomPairs[maxClusters[i][j]]);
                   // console.log(randomPairs[maxClusters[i][j]]);
               }
                 objs = temppoly.map(function(x) {
                    return {
                        longitude: x[0],
                        latitude: x[1]

                    };

                });
                //var center =[];
               var discoords =geolib.getCenter(objs);
                const distance = geolib.getDistance(
                    { latitude: discoords.latitude, longitude: discoords.longitude },
                    { latitude:  req.body.coordy, longitude: req.body.coordx }
                );

                center.push([geolib.getCenter(objs),{distance:distance}]);

                //console.log(center);
                // polygons.push(temppoly);
                //for(let p=0;p<temppoly.length ; p++){
                  // temppoly.pop();
              // }
            }

            console.log(center);
            // var objs = temppoly.map(function(x) {
            //     return {
            //         longitude: x[0],
            //         latitude: x[1]
            //
            //     };
            // });
            // console.log(objs);

           //  var center =[];
           //  center.push(geolib.getCenter(objs));
           // console.log(center);
            res.json(center);

        })
        .catch(function (error) {
            res.json(error);
            return;
        });



};