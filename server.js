/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movie');
var Review = require('./Reviews');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});


router.route('/movies/:movies_title')
    //Retrieve reviews
    .get(authJwtController.isAuthenticated, function (req, res) {
        if (req.query && req.query.reviews && req.query.reviews === "true") {

            Movie.findOne({title: req.params.movies_title}, function (err, movies) {
                if (err) {
                    return res.status(403).json({success: false, message: "Unable to get reviews for title passed in"});
                } else if (!movies) {
                    return res.status(403).json({success: false, message: "Unable to find title passed in."});
                } else {

                    Movie.aggregate()
                        .match({_id: mongoose.Types.ObjectId(movies._id)})
                        .lookup({from: 'reviews', localField: '_id', foreignField: 'movies_id', as: 'reviews'})
                        .addFields({averaged_rating: {$avg: "$reviews.rating"}})
                        .exec(function (err, movies) {
                            if (err) {
                                res.status(500).send(err);
                            }
                            else {
                                res.json(movies);
                            }
                        })
                }
            })
        } else {
            //console.log(movies);
            res = res.status(200);
            //res.json({title: res.body.title}, {yearReleased: res.body.yearReleased},
                //{genre: res.body.genre}, {actors: res.body.actors});
            res.json({message: 'Reviews not shown.'});
        }
    })

    //Save reviews
    .post( authJwtController.isAuthenticated, function (req, res) {
            if (!req.params.movies_title || !req.body.reviewer || !req.body.quote || !req.body.rating) {
                res.json({success: false, msg: 'Please pass Movie Title, Reviewer, Quote, and Rating'});
            }
            else {
                Movie.findOne({title: req.params.movies_title}, function (err, movies) {
                    if (err) {
                        return res.status(403).json({
                            success: false,
                            message: "Unable to get reviews for title passed in"
                        });
                    } else if (!movies) {
                        return res.status(403).json({success: false, message: "Unable to find title passed in."});
                    } else {

                        var review = new Review();
                        review.movieTitle = req.params.movies_title;
                        review.reviewer = req.body.reviewer;
                        review.quote = req.body.quote;
                        review.rating = req.body.rating;

                        review.save(function (err, reviews) {
                            if (err) {
                                res.status(500).send(err);
                            }
                            else {
                                res.json({ message: 'Review successfully saved.' });
                                res.json(reviews);
                            }
                        })
                    }
                })
            }
        });


//router.route('/reviews/:movies_title')
    //Retrieve reviews
    /*.get(function (req, res) {
            var review = new Review();
            review.movieTitle = req.body.movieTitle;
            Review.findOne({movieTitle: review.movieTitle}, function (err, reviews) {
                if (err) {
                    return res.status(403).json({
                        success: false,
                        message: "Title not found"
                    })
                }
                else if (req.query.reviews === "true") {

                    console.log(reviews);
                    res = res.status(200);
                    res.json({success: true, msg: 'GET reviews.'});
                }

                });

    })*/

   //Save reviews
    /*.post( authJwtController.isAuthenticated, function (req, res) {
        if (!req.params.movies_title || !req.body.reviewer || !req.body.quote || !req.body.rating) {
            res.json({success: false, msg: 'Please pass Movie Title, Reviewer, Quote, and Rating'});
        }
        else {
            Movie.findOne({title: req.params.movies_title}, function (err, movies) {
                if (err) {
                    return res.status(403).json({success: false, message: "Unable to post reviews for title passed in"});
                } else if (!movies) {
                    return res.status(403).json({success: false, message: "Unable to find title passed in."});
                } else {
                    var review = new Review();
                    review.movieTitle = req.params.movies_title;
                    review.reviewer = req.body.reviewer;
                    review.quote = req.body.quote;
                    review.rating = req.body.rating;

                    review.save(function (err, reviews) {
                        if (err) {
                            res.status(500).send(err);
                        }
                        else {
                            res.json(movies);
                        }
                    })
                }
            })
        }
    });*/


app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


