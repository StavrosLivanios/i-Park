require("babel-core").transform("code");
var dbconnect = require('./db.js');
const mysql = require('mysql');
var express = require('express');
 app = express();
const fileUpload = require('express-fileupload');
const {uploadFile}  = require("./dbManagement/upload");
const {deletedb}  = require("./dbManagement/deleterows");
const {displayMap}  = require("./map/mapDisplay");
const {blockEdit}  = require("./map/editBlock");
const {polsimulation}  = require("./map/adminsimulation");
const {userpolsimulation}  = require("./userMap/usersimulation");
const {userDisplayMap}  = require("./userMap/userMapDisplay");
const {scan}  = require("./userMap/dbScanCluster");
const {adminLogin}  = require("./nodeLogin/login");

const bodyParser = require('body-parser');
var session = require('express-session');
var path = require('path');

app.set ("view engine","ejs");

app.use(express.static('public'));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended : true}));
app.use(session({
    secret: 'tripaloski',
    resave: true,
    saveUninitialized: true
}));

//============================== BACKEND

app.patch("/polygons/:id",blockEdit);

app.post("/adminsimulation", polsimulation);

app.post("/usersimulation", userpolsimulation);

app.post("/dbScan",scan);

// ============================= FRONTEND

app.get("/",userDisplayMap);

app.get("/admin",function (req, res) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {
        res.redirect('/admin/menu/2');
    } else {
        res.render("login");
    }
});
app.post('/auth',adminLogin);

app.get('/admin/menu', function(req, res) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {
        res.render("adminmenu");
    } else {
        res.redirect("/admin");
    }
    res.end();
});
app.get('/admin/menu/1', function(req, res) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {
        res.render("adminmenu1");
    } else {

        res.redirect("/admin");

    }
    //res.end();
});
app.get('/admin/menu/2', function(req, res) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {
        displayMap(req,res);
    } else {
        res.redirect("/admin");

    }
   // res.end();
});
app.get('/admin/menu/4', function(req, res) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {
        res.render("adminsimulation");
    } else {
        res.redirect("/admin");

    }
   // res.end();
});
app.get('/admin/menu/1/upload', function(req, res) {
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

app.get('/delete', function(req, res) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {
        deletedb(req,res);
    } else {
        res.redirect("/admin");
    }
   // res.end();
});
app.post('/upload', function(req, res) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {
        uploadFile(req,res);
    } else {
        res.redirect("/admin");
    }
    //res.end();
});

app.get('/logout', function(req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function(err) {
            if(err) {
                return next(err);
            } else {

                return res.redirect('/');
            }
        });
    }
});

app.get("/errorpage400",function (req, res) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {
        res.render("errorpage400");
    } else {

        res.render("errorpage400");
    }

});

app.get("/errorpage500",function (req, res) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {
        res.render("errorpage500");
    } else {

        res.render("errorpage500");
    }

});

app.get("/400notfound",function (req, res) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {
        res.render("400notfound");
    } else {

        res.render("404notfound");
    }

});

app.get("/failedpage",function (req, res) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    if (req.session.loggedin) {
        res.render("failedpage");
    } else {

        res.render("failedpage");
    }

});

app.get("/*",function (req, res) {
    res.render("page404");
});

app.listen(3500,function () {
    console.log("server listening to port 3500!!!");
});
