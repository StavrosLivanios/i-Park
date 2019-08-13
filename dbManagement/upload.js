require("babel-core").transform("code");
const express = require('express');
const fileUpload = require('express-fileupload');
const {kmlpop}  = require("./convert");
app = express();
app.use(fileUpload());

module.exports.uploadFile =  function uploadFile(req,res){

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
        res.redirect("/admin/menu/1/upload");
        return;
    }

    kmlpop(uploaded_file, function (err, result) {
        if(err) {res.redirect("/admin/menu/1/upload");}

        res.send('File uploaded!');
    })
};