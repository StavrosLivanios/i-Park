    var mysql = require('mysql');

    const connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "projectweb"
    });

    connection.connect(function (err) {
        if (err) throw err;
    });


    module.exports = connection;

