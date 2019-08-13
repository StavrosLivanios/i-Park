const jsonfile = require('jsonfile');

module.exports.polsimulation =  function polsimulation(req,res) {
//todo:getMinutes from simulation form and add if clause for demandtime>0 && demandime<24

   const demandtime =req.body.time;
   var timechange = req.body.minute;
   var time = 0;


   console.log(timechange);


   //Validate req.body
   if(
        !req.body.time
        || isNaN(req.body.time)
        || req.body.time < 0
        || req.body.time>23
    ){
        const error = new Error();
        error.status = 400;
        error.message = "Bad request. Request body is malformed";
        res.json(error);
        return;
    }
    time = demandtime+(parseInt(timechange/60) );

    var dbconnect = require('../db.js');
    dbconnect.query('SELECT * FROM polygon', function (err, rows, fields) {
        if (err) throw err;

        const leafPolygons = [];
        rows.forEach(function (leafPolygon) {
            const set = [];
            leafPolygon.polcoord[0].forEach(function (coord) {
                set.push([coord.x, coord.y])
            });
            const set2 =[];

            set2.push([leafPolygon.centroidcoord.x,leafPolygon.centroidcoord.y]);
            var polcolor='grey';

            leafPolygons.push({
                coords: set,
                slots: leafPolygon.parkslots,
                centroid: set2,
                population: leafPolygon.population,
                id: leafPolygon.id,
                demandid:leafPolygon.demandtype_id,
                color:polcolor
            });

        });

        dbconnect.query(' SELECT * FROM demandtype ',function (err, rows, fields) {
       if (err) throw err;
            const simtime ="hour"+time;

         leafPolygons.forEach(function (polygon,key) {
             const demandid = polygon.demandid ;
             const demandperhour = rows[demandid-1][simtime];
             const demandedslots = 0.2 * polygon.population;
             const freeslots = polygon.slots - demandedslots ;
            var totalfreeslot;
             if(freeslots > 0){
                  totalfreeslot = Math.round((1 - demandperhour) * freeslots);
             }
             else
             { totalfreeslot=0;
             }
             var occupiesslotspercentage="";
             const occupiedslots= polygon.slots- totalfreeslot;
             if (polygon.slots==0){
                 occupiesslotspercentage=100;
             }else  occupiesslotspercentage= (100 * occupiedslots)/polygon.slots;
             if (occupiesslotspercentage>=0 && occupiesslotspercentage<=59) {
                 leafPolygons[key].color = 'green';
             }else if (occupiesslotspercentage>=60 && occupiesslotspercentage<=84) {
                 leafPolygons[key].color = 'yellow';
             }
             else leafPolygons[key].color = 'red';


         });
            const file = 'adminData.json' ;

            jsonfile.writeFile(file, leafPolygons, function (err) {
                if (err) console.error(err)
            });
            res.json(leafPolygons);
        });


});
};