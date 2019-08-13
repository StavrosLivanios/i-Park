//import * as connection from "mysql";

require("babel-core").transform("code");
//var db = require('./db');


module.exports.deletedb =  function deletedb(req,res) {
    var dbconnect = require('../db.js');


        dbconnect.query("DELETE FROM polygon", function (err, result, fields) {
            // if any error while executing above query, throw error
            if (err) throw err;
            // if there is no error, you have the result
            console.log("egine i diagrafi");
            console.log(result);
        });

   // });
    res.redirect("/admin/menu/1");

}