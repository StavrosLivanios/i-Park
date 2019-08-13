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

const bodyParser = require('body-parser');

app.set ("view engine","ejs");

app.use(express.static('public'));
app.use(bodyParser.json());

//============================== BACKEND

app.patch("/polygons/:id",blockEdit);

app.post("/adminsimulation", polsimulation);

app.post("/upload", uploadFile);

app.post("/usersimulation", userpolsimulation);

app.post("/dbScan",scan);

// ============================= FRONTEND
app.get("/admin/menu/1/upload",function (req, res) {
    res.render("fileupload");
});

app.get("/admin/menu/1",function (req, res) {
   res.render("adminmenu1");
});
app.get("/delete",deletedb);

app.get("/admin/menu/2",displayMap);

app.get("/admin/menu",function (req, res) {
    res.render("adminmenu");
});
app.get("/admin/menu/4",function (req, res) {
    res.render("adminsimulation");
});

app.get("/",userDisplayMap);


app.listen(3500,function () {
    console.log("server listening to port 3500!!!");
});
