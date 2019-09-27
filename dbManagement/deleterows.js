require("babel-core").transform("code");

/*  Συνάρτηση deletedb
   Πραγματοποιεί τη διαγραφή της βάσης δεδομένων.

*/
module.exports.deletedb =  function deletedb(req,res) {
    var dbconnect = require('../db.js');
    var fs = require('fs');

        dbconnect.query("DELETE FROM polygon", function (err, result, fields) {
            // if any error while executing above query, throw error
            if (err) {
                const error = new Error();
                error.status = 500;
                error.message = "Server error";
                res.json(error);
                return;
            }
            // if there is no error, you have the result
            console.log(result);
        });

   // });
     var path = "./adminData.json";
    if(fs.existsSync(path)) {
        fs.unlinkSync("adminData.json");
    }

    res.redirect("/admin/menu/1");

};