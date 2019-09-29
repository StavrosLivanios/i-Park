const jsonfile = require('jsonfile');
/*                                      Συναρτηση polsimulation
                            Σε αυτην την συναρττηση εκτελειται η εξομοιωση
 */

module.exports.polsimulation =  function polsimulation(req,res) {

   const demandtime =req.body.time;
   var timechange = req.body.minute;
   var minuteshour=req.body.minuteshour;
   var time = 0;

if (isNaN(req.body.minuteshour)){
    minuteshour=0;
}
if (isNaN(timechange)) {
    timechange=0;
}

    //Ελεγχος αν  το body του request που εισηχθηκε ειναι σωστο
   if(
         isNaN(req.body.time)
        || req.body.time < 0
        || req.body.time >23
        || req.body.minuteshour <0
        || req.body.minuteshour >60
        || req.body.minute <0
    ){
        const error = new Error();
        error.status = 400;
        error.message = "Bad request. Request body is malformed";
        res.json(error);
        return;
    }
    time = demandtime+(parseInt((timechange+minuteshour)/60) );

    var dbconnect = require('../db.js');
    //Εδω δημιουργειται ενα object leafpolygons που περιεχει τα στοιχεια των πολυγωνων απο την βαση

    dbconnect.query('SELECT * FROM polygon', function (err, rows,result, fields) {
        if (err) throw err;
        if(result.length === 0){
            const e = new Error();
            e.status= 404;
            e.message = "Not found";
            res.json(e);
            return;
        }

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
        //Εδω προσκομιζουμε την τιμη της καμπυλης ζητησης για καθε πολυγωνο για την συγκεκριμενη χρονικη στιμγη
        // και υπολογιζουμε τις ελευθερες θεσεις σταθμευσης. Eπειτα εισαγουμε το ανοτιστιχο χρωμα αναλογως το ποσοστο
        //των θεσεων σταθμευσης του πολυγωνου και αποθηκευεται στο object leafPolygon
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
                if (err) console.log(err)

            });
            if (req.session.loggedin) {
                res.json(leafPolygons);
               // res.end();

            } else {
                res.send('Please login to view this page!');
                //res.end();

            }

        });


});
};