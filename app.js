/*  app.js
Στο αρχείο αυτό βρίσκονται όλα τα routes και endpoints του ιστότοπου μας. Επίσης, καθορίζουμε στον server να ακούει στην θύρα 3500
χρησιμοποιώντας την εντολή "app.listen". Για να τρέξει ο server θα πρέπει πρώτα να εκτελεστεί το αρχείο αυτό.
*/

//=====================================================================================
// Τα modules-πακέτα-αρχεία που χρειαζόμαστε.
require("babel-core").transform("code"); // Npm πακέτο που χρησιμοποιούμε για τα exports-imports.

var dbconnect = require('./db.js');
const mysql = require('mysql');
var express = require('express'); // Web framework για την Node js(το χρησιμοποιούμε για τα request και για τα routes)
app = express();

//======== Αρχεία Javascript που έχουμε γράψει====================
const fileUpload = require('express-fileupload');
const {uploadFile}  = require("./dbManagement/upload");
const {deletedb}  = require("./dbManagement/deleterows");
const {displayMap}  = require("./map/mapDisplay");
const {blockEdit}  = require("./map/editBlock");
const {polsimulation}  = require("./map/adminsimulation");
const {userpolsimulation}  = require("./userMap/usersimulation");
const {userDisplayMap}  = require("./userMap/userMapDisplay");
const {scan}  = require("./userMap/dbScanCluster");
var fs = require('fs');
//==================================================================

//============= Login-Session ======================================
var session = require('express-session');
var path = require('path');
const bodyParser = require('body-parser');
const {adminLogin}  = require("./nodeLogin/login");

app.set ("view engine","ejs");

app.use(express.static('public'));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended : true}));
app.use(session({
    secret: 'tripaloski',
    resave: true,
    saveUninitialized: true
}));
//==================================================================

//============================== BACKEND ===========================

app.patch("/polygons/:id",blockEdit);//Με αυτο το route καλουμε την συναρτηση blockEdit οπου
                                     // προερχεται απο ο αρχειο editblock.js.
                                     // Ωστε να αλλαξουμε τις τιμες των πολυγονων  (για αυτο χρεισιμοποιουμε και
                                     // patch request) με update στην βαση δεδομενων

app.post("/adminsimulation", polsimulation);//Με αυτο το route καλουμε την συναρτηση polsimulation οπου
// προερχεται απο ο αρχειο adminsimulation.js
// ωστε να εκετελεσουμε εξομοιωση των θεσεων σταθμευσης
// για καποια χρονικη στιμγη που δινουμε σαν ορισμα στο post request
// το οποιο ως αποτελεσμα επιστρεφει τα δεδομενα σαν json αρχειο

app.post("/usersimulation", userpolsimulation);//Με αυτο το route καλουμε την συναρτηση userpolsimulation οπου
                                               // προερχεται απο το αρχειο usersimulation.js
                                               // ωστε να εκετελεσουμε εξομοιωση των θεσεσων σταθμευσης
                                               // για καποια χρονικη στιμγη(μπορει να ειναι η ωρα κατα την οποια εγινε
                                               // το request ή να δωσει ο χρηστης την ωρα που επιθυμει)
                                               // που δινουμε σαν ορισμα στο post request
                                               // το οποιο ως αποτελεσμα επιστρεφει τα δεδομενα σαν json αρχειο χωρις
                                               // αυτο να αποθηκευεται

app.post("/dbScan",scan);//Με αυτο το route καλουμε την συναρτηση scan οπου
                         // προερχεται απο ο αρχειο dbScanCluster.js
                         // ωστε να βρεθουν τα cluster που μας ζητηται στην εκφωνηση για καθε πολυγονο μεσα στην
                         // εμβελια που εχει δωσει ο χρηστης

app.get('/delete', function(req, res) { //Με αυτο το route καλουμε την συναρτηση deletedb οπου
    // προερχεται απο ο αρχειο deleterows.js
    // ωστε να διαγραψουμε το περιεχομενο της βασης δεδομενοων μας
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {
        deletedb(req,res);
    } else {
        res.redirect("/admin");
    }
    // res.end();
});

app.post('/upload', function(req, res) {    //Με αυτο το route καλουμε την συναρτηση uploadFile οπου
    // προερχεται απο ο αρχειο upload.js
    // ωστε να ανεβασουμε το αρχειο που μας επιθημει ο διαχειριστης
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {
        uploadFile(req,res);
    } else {
        res.redirect("/admin");
    }
    //res.end();
});

app.get('/logout', function(req, res, next) {    //Με αυτο το route καλουμε την συναρτηση req.session.destroy οπου
    // την χρεισιμοποιουμε για να αποσυνδεσουμε τον διαχειριστη
    // κλεινοντας το session που ειχαμε δημιουργησει κατα το log in του
    if (req.session) {
        // delete session object

        var path = "./adminData.json";
        if(fs.existsSync(path)) {
            fs.unlinkSync("adminData.json");
        }
        req.session.destroy(function(err) {
            if(err) {
                return next(err);
            } else {

                return res.redirect('/');
            }
        });
    }
});

// ============================= FRONTEND ===========================

app.get("/",userDisplayMap); // Η Αρχική σελίδα-χάρτης που εμφανίζεται στον χρήστη.


app.get("/admin",function (req, res) { // Login Page
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {// αν ειναι συνδεδεμενος ο διαχεισρηστης εκτελουντε οι επομενες ενολες
        res.redirect('/admin/menu/2');
    } else {// αλλιως τον επιστρεφουμε στην σελιδα login in για να κανει συνδεση
        res.render("login");
    }
});
app.post('/auth',adminLogin); //Authentication για το login του διαχειριστή.

/*
app.get('/admin/menu', function(req, res) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {
        res.render("adminmenu");
    } else {
        res.redirect("/admin");
    }
    res.end();
});
 */

app.get('/admin/menu/1', function(req, res) { // Σελίδα Διαχείρισης Βάσης.
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {
        res.render("adminmenu1");
    } else {

        res.redirect("/admin");

    }
    //res.end();
});
app.get('/admin/menu/2', function(req, res) { //Αρχική-σελίδα/Απεικόνιση χάρτη για τον διαχειριστή.
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {
        displayMap(req,res);
    } else {
        res.redirect("/admin");

    }
    // res.end();
});
app.get('/admin/menu/4', function(req, res) {// Σελίδα με την φόρμα καθορισμού της χρονικής στιγμής για την οποία
    //πραγματοποείται η εξομοίωση.
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {
        res.render("adminsimulation");
    } else {
        res.redirect("/admin");

    }
    // res.end();
});
app.get('/admin/menu/1/upload', function(req, res) { // Σελίδα με την φόρμα για το upload αρχείου kml.
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {
        res.render("fileupload");
    } else {
        res.redirect("/admin");
    }
    // res.end();
});

app.get('/admin/menu/1/uploaderror', function(req, res) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {
        res.render("fileuploaderror");
    } else {
        res.redirect("/admin");
    }
    // res.end();
});






//=================== Error Pages=======================================================================================

app.get("/errorpage400",function (req, res) {//error page
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {
        res.render("errorpage400");
    } else {

        res.render("errorpage400");
    }

});

app.get("/errorpage500",function (req, res) { //error page
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {
        res.render("errorpage500");
    } else {

        res.render("errorpage500");
    }

});

app.get("/400notfound",function (req, res) { //error page
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {
        res.render("400notfound");
    } else {

        res.render("404notfound");
    }

});

app.get("/failedpage",function (req, res) { //error page
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {
        res.render("failedpage");
    } else {

        res.render("failedpage");
    }

});

app.get("/*",function (req, res) {// Ειναι σελιδα που θα εμφανιζεται οταν εισαγεται url για την οποια δεν υπαρχει route
    res.render("page404");
});
//======================================================================================================================

app.listen(3500,function () {
    console.log("server listening to port 3500!!!");
});
