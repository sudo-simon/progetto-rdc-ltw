const express = require('express');
const { request } = require('http');
const app = express();

const DB = require('../DB');
var database = new DB("sapiens-db");

const port = process.env.PORT || 3001;
const host= "http://localhost"

/**
 * @api {get} /api/user/:username Request User information by username (surname+student id)
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {String} User unique username (surname+student id).
 *
 * @apiSuccess {String} name Firstname of the User.
 * @apiSuccess {String} surname  Lastname of the User.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "Dario",
 *       "surname": "Basile"
 *     }
 *
 * @apiError UsernameFound The username User of the student was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UsernameNotFound"
 *     }
 *
 * 
 * @apiError DatabaseNotFound The database you are searching in was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "DatabaseNotFound"
 *     }
 * 
 * 
 */

app.get('/api/user/:username', function (req, res){    
    var {username}=req.params; 
    console.log("user request: "+username);
    return database.db.partitionedFind('user',{ 'selector' : { 'username' : username}}).then((data) => {
        if(data.docs.length != 0){
            var response={
                name:data.docs[0].nome,
                surname:data.docs[0].cognome
            }
            res.status(200).json(response);
        }
        else{ 
            res.status(404).send({error:"UsernameNotFound"}).end();
        }
    }).catch((err) => {
        res.status(404).send({error:"DatabaseNotFound"}).end();
        return -1;
    });
});



app.listen(port,() => {
    console.log('Sapiens api server listening at '+host+':'+port);
});
