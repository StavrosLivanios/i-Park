const jsonfile = require('jsonfile')

module.exports.userpolsimulation =  function userpolsimulation(req,res) {
    const demandtime =req.body.time;
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

    var dbconnect = require('../db.js');
    dbconnect.query('SELECT * FROM polygon', function (err, rows, fields) {
        if (err) throw err;

        const leafPolygons = [];
        const freeslotsid = [];
        rows.forEach(function (leafPolygon) {
            const set = [];
            leafPolygon.polcoord[0].forEach(function (coord) {
                set.push([coord.x, coord.y])
            });
            const set2 =[];
            set2.push([leafPolygon.centroidcoord.x,leafPolygon.centroidcoord.y]);

            var polcolor='grey';
            //todo:Make if statement to color polygon after simulation

            leafPolygons.push({
                coords: set,
                slots: leafPolygon.parkslots,
                centroid:set2,
                population: leafPolygon.population,
                id: leafPolygon.id,
                demandid:leafPolygon.demandtype_id,
                color:polcolor,
                freeslots:""
            });

        });

        dbconnect.query(' SELECT * FROM demandtype ',function (err, rows, fields) {
            if (err) throw err;
            const simtime ="hour"+demandtime;

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
               leafPolygons[key].freeslots=totalfreeslot;
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

            res.json(leafPolygons);


        });


    });
};