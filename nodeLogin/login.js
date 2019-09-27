
var session = require('express-session');
var path = require('path');
const bodyParser = require('body-parser');

/*       Συνάρτηση adminLogin
   Ελέγχουμε το username και password που εισήγαγε ο διαχειριστής με τα προφίλ χρηστών στη βάση δεδομένων. Αν τα στοιχεία
   ταιριάζουν με κάποιο προφίλ, τότε πραγματοποιείται το Login και δημιουργείται ένα session για αυτό.

 */
module.exports.adminLogin=  function adminLogin(req,res) {
    var dbconnect = require('../db.js');

    var username = req.body.username;
    var password = req.body.password;
    if (username && password) {
        dbconnect.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect('/admin/menu/2');
            } else {
                res.redirect('/admin');
            }
        });
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }


};
