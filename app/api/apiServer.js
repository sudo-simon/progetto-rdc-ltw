const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname+'/public')));

const DB = require('../DB');
var database = new DB("sapiens-db");

const port = process.env.PORT || 3001;
const host= "http://localhost";

/**
 * @api {get} /api/user/:username User
 * @apiName GetUser
 * @apiGroup User
 * 
 * @apiDescription Check if is present an User by his username (surname + student id)
 *
 * @apiParam {String} username Unique username of the student (surname + student id).
 *
 * @apiSuccess {String} name Firstname of the User.
 * @apiSuccess {String} surname  Surname of the User.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "Dario",
 *       "surname": "Basile"
 *     }
 *
 * @apiError UsernameNotFound The username User of the student was not found.
 * @apiError CantReachTheServer Unable to reach the server.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UsernameNotFound"
 *     }
 *
 * 
 * 
 * 
 */

app.get('/api/user/:username', function (req, res){    
    var {username}=req.params; 
    console.log("user request: "+username);
        database.db.partitionedFind('user',{ 'selector' : { 'username' : username}}).then((data) => {
        if(data.docs.length != 0){
            var response={
                name:data.docs[0].nome,
                surname:data.docs[0].cognome
            }
            console.log("Risposta richiesta api inviata");
            res.status(200).json(response);
        }
        else{ 
            console.log("Risposta richiesta api non inviata correttamenta: UsernameNotFound");
            res.status(404).send({error:"UsernameNotFound"}).end();
        }
    }).catch((err) => {
        console.log("Risposta richiesta api non inviata correttamenta: CantReachTheServer");
        res.status(404).send({error:"CantReachTheServer"}).end();
        return -1;
    });
});


/**
 * @api {get} /api/user/info/:username Info
 * @apiName Info
 * @apiGroup User
 * 
 * @apiDescription Request description of the user using his username (surname + student id)
 *
 * @apiParam {String} username Unique username of the student (surname + student id).
 *
 * @apiSuccess {String} name Firstname of the User.
 * @apiSuccess {String} surname Surname of the User.
 * @apiSuccess {String} email Email the user used during registration.
 * @apiSuccess {String} description Description shown in the user profile page.
 * @apiSuccess {String} date Date of registration of the user.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "Dario",
 *       "surname": "Basile",
 *       "email":"basile.1845116@studenti.uniroma1.it",
 *       "description":"this is my profile description",
 *       "date":"1/1/2021"
 *     }
 *
 * @apiError UsernameNotFound The username User of the student was not found.
 * @apiError CantReachTheServer Unable to reach the server.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UsernameNotFound"
 *     }
 *
 * 
 * 
 * 
 */

 app.get('/api/user/info/:username', function (req, res){    
    var {username}=req.params; 
    console.log("user request: "+username);
    return database.db.partitionedFind('user',{ 'selector' : { 'username' : username}}).then((data) => {
        if(data.docs.length != 0){
            var response={
                name:data.docs[0].nome,
                surname:data.docs[0].cognome,
                email:data.docs[0].email,
                description:data.docs[0].infos.description,
                subscriptionDate:data.docs[0].infos.subscriptionDate
            }
            res.status(200).json(response);
        }
        else{ 
            res.status(404).send({error:"UsernameNotFound"}).end();
        }
    }).catch((err) => {
        res.status(404).send({error:"CantReachTheServer"}).end();
        return -1;
    });
});

/**
 * @api {get} /api/user/activities/:username Activities
 * @apiName Activities
 * @apiGroup User
 * 
 * @apiDescription Request a summary of activities of the user using his username (surname + student id)
 *
 * @apiParam {String} username Unique username of the student (surname + student id).
 *
 * @apiSuccess {String} name Firstname of the User.
 * @apiSuccess {String} surname Surname of the User.
 * @apiSuccess {Number} post Number of the post by the user.
 * @apiSuccess {Number} CFU Number of CFU assigned to this user by others.
 * @apiSuccess {String} last Date of the last post of the user.
 * @apiSuccess {Number} average Averege of CFU for each Post.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "Dario",
 *       "surname": "Basile",
 *       "post":12,
 *       "cfu":24,
 *       "last":"07/07/2021",
 *       "average":2
 *     }
 *
 * @apiError UsernameNotFound The username User of the student was not found.
 * @apiError CantReachTheServer Unable to reach the server.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UsernameNotFound"
 *     }
 *
 * 
 * 
 * 
 */

 app.get('/api/user/activities/:username', function (req, res){    
    var {username}=req.params; 
    console.log("user request: "+username);
    return database.db.partitionedFind('user',{ 'selector' : { 'username' : username}}).then((data) => {
        if(data.docs.length != 0){
            var response={
                name:data.docs[0].nome,
                surname:data.docs[0].cognome,
                post:data.docs[0].postList.length,
                cfu:data.docs[0].infos.cfu,
                last:data.docs[0].postList[0].creationDate,
                average:(data.docs[0].infos.cfu/data.docs[0].postList.length)
            }
            res.status(200).json(response);
        }
        else{ 
            res.status(404).send({error:"UsernameNotFound"}).end();
        }
    }).catch((err) => {
        res.status(404).send({error:"CantReachTheServer"}).end();
        return -1;
    });
});


/**
 * @api {get} /api/user/social/:username Social
 * @apiName Social
 * @apiGroup User
 * 
 * @apiDescription Request a summary of social interaction of the user using his username (surname + student id)
 *
 * @apiParam {String} username Unique username of the student (surname + student id).
 *
 * @apiSuccess {String} name Firstname of the User.
 * @apiSuccess {String} surname Surname of the User.
 * @apiSuccess {Number} chat Number of the chat the user is in.
 * @apiSuccess {Number} following Number of user followed by this user.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "Dario",
 *       "surname": "Basile",
 *       "chat":2,
 *       "following":5
 *     }
 *
 * @apiError UsernameNotFound The username User of the student was not found.
 * @apiError CantReachTheServer Unable to reach the server.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UsernameNotFound"
 *     }
 *
 * 
 * 
 */

 app.get('/api/user/social/:username', function (req, res){    
    var {username}=req.params; 
    console.log("user request: "+username);
    return database.db.partitionedFind('user',{ 'selector' : { 'username' : username}}).then((data) => {
        if(data.docs.length != 0){
            var response={
                name:data.docs[0].nome,
                surname:data.docs[0].cognome,
                chat:data.docs[0].chatList.length,
                following:data.docs[0].friendList.length
            }
            res.status(200).json(response);
        }
        else{ 
            res.status(404).send({error:"UsernameNotFound"}).end();
        }
    }).catch((err) => {
        res.status(404).send({error:"CantReachTheServer"}).end();
        return -1;
    });
});

app.get("/api/apidoc",function(req,res){
    res.sendFile(path.join(__dirname+"/public/apidoc/index.html"));
})

app.listen(port,() => {
    console.log('Sapiens api server listening at '+host+':'+port);
});
