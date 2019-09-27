require("babel-core").transform("code");
const polygons =  require('./usersimulation.js');
const axios = require('axios');
/*
Συναρτηση userDisplayMap

Eδω με axios request παιρνουμε τις πληροφοριες απο το usersimulation.js και κανουμε  render  το userMapDisplay.ejs
περνώντας του σαν ορισμα ενα object leafPolygons που περιεχει τα πολυγωνα.

 */


module.exports.userDisplayMap =  function userDisplayMap(req,res) {

    const currentDate = new Date();
    axios.post("http://localhost:3500/usersimulation", {
        time: currentDate.getHours()
    })
        .then(function (response) {
            if(response.status !== 200){
                throw new Error("failed")
            }

            const currentDate = new Date();
            axios.post("http://localhost:3500/dbscan", {
                time: currentDate.getHours()

            })
                .then(function (response) {
                    if(response.status !== 200){
                        throw new Error("failed")
                    }
                    res.render("userMapDisplay", {leafPolygons: response.data});

                })
                .catch(function (error) {
                    res.render("failedpage"); //todo: error page
                });

             res.render("userMapDisplay", {leafPolygons: response.data});

        })
        .catch(function (error) {
           res.render("failedpage"); //todo: error page
        });

};