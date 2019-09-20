
module.exports.blockEdit =  function blockEdit(req,res) {
    var dbconnect = require('../db.js');
    const parid = req.params.id;
    const demandid = req.body.demandtype_id;

     //Validate id
    if(isNaN(parid)){
        const error = new Error();
        error.status = 400;
        error.message = "Bad request. Polygon id is not a number";
        res.json(error);
        return;
    }
    //Validate demandid
    if(isNaN(demandid)){
        const error = new Error();
        error.status = 400;
        error.message = "Bad request. Demandtype_id id is not a number";
        res.json(error);
        res.render("errorpage400");
        return;
    }
    else if (
               Number(demandid) !== 1
            && Number(demandid) !==2
    ){
        const error = new Error();
        error.status = 400;
        error.message = "Bad request. Demandtype_id is not in center or outskirts";
        res.json(error);
        return;
    }


    //validate request body
    if(
        !req.body.parkslots
        || isNaN(req.body.parkslots)
        || req.body.parkslots < 0
    ){
        const error = new Error();
        error.status = 400;
        error.message = "Bad request. Request body is malformed";
        res.json(error);
        return;
    }

    const selectSqlQuery = "select * from polygon where id = ?";
    dbconnect.query(selectSqlQuery, parid, function (err, result) {
        if(err) throw err;
        if(result.length === 0){
            const e = new Error();
            e.status= 404;
            e.message = "Not found";
            res.json(e);
            return;
        }

        const sql = "UPDATE polygon SET parkslots = ?, demandtype_id= ? WHERE id = ? ";
        dbconnect.query(sql, [req.body.parkslots,req.body.demandtype_id, parid], function (err, result) {
            if (err) throw err;

            if(result.affectedRows !== 1){
                const e = new Error();
                e.status= 500;
                e.message = "Server error";
                res.json(e);
                return;
            }

            const selectSqlQuery = "select * from polygon where id = ?";
            dbconnect.query(selectSqlQuery, parid, function (err, result) {
                if(err) throw err;

            });
        });
    });
};