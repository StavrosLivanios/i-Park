require("babel-core").transform("code");
const express = require('express');
const fileUpload = require('express-fileupload');
const {kmlpop}  = require("./convert");
app = express();
app.use(fileUpload());

/*    Συνάρτηση UploadFile
    Πραγματοποιεί το upload του αρχείου. Αρχικά ελέγχει αν επιλέχθηκε αρχείο και αν  το αρχείο που επέλεξε ο διαχειριστής
   έιναι τύπου Kml. Επίσης καλεί την συνάρτηση kmlpop για να μετατρέψει το Kml αρχείο σε Json.
 */

module.exports.uploadFile =  function uploadFile(req,res){
    var fs = require('fs');

    if (
        !req.files
        || Object.keys(req.files).length === 0
    ) {
        console.log(Object.keys(req.files).length);
        return res.status(400).send('No files were uploaded.');
    }

    const filesKey = Object.keys(req.files)[0];
    const  uploaded_file = req.files[filesKey];

    if (uploaded_file.name.search(".kml") === -1) {
        console.log("this is an error,you should upload a kml file");
        const error = new Error();
        error.status = 400;
        error.message = "Bad request. Request body is malformed";
        res.json(error);
        return;
    }
    var path = "./adminData.json";
    if(fs.existsSync(path)) {
        fs.unlinkSync("adminData.json");
    }

    kmlpop(uploaded_file, function (err, result) {
        if(err) {res.redirect("/admin/menu/1/upload");}
        // res.redirect("/admin/menu/2");
        res.json('File uploaded!');
        return;

    })
};