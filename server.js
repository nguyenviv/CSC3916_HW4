/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

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

/*router.post('/signup', function(req, res) {
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
});*/

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

/*
router.route('/movies')

    //Retrieve movies
    .get(function (req, res) {
            Movie.find({}, function (err,movies) {
                if (err) throw err;
                else
                    console.log(movies);
                    res = res.status(200);
                    res.json({success: true, msg: 'GET movies.'});
            });
        }
    )

    //Save movies
    .post( authJwtController.isAuthenticated, function (req, res) {
        if (!req.body.title || !req.body.genre || !req.body.yearReleased) {
            res.json({success: false, msg: 'Please pass Movie Title, Year released, Genre, and Actors(Actor Name and Character Name)'});
        }
        else {
            if(req.body.actors.length < 3) {
                res.json({ success: false, message: 'Please include at least three actors.'});
            }
            else {
                var movie = new Movie();
                movie.title = req.body.title;
                movie.yearReleased = req.body.yearReleased;
                movie.genre = req.body.genre;
                movie.actors = req.body.actors;

                movie.save(function(err, movies) {
                    if (err) {
                        if (err.code == 11000)
                            return res.json({ success: false, message: 'A movie with that title already exists.'});
                        else
                            return res.send(err);
                    }
                    res.json({ message: 'Movie successfully created.' });
                });
            }
        }
    })

    //Update movies
   .put(authJwtController.isAuthenticated, function(req, res) {
       if (!req.body.title) {
           res.json({success: false, msg: 'Please pass a Movie Title to update.'});
       } else {
           Movie.find({title: req.body.title}, function (err, movies) {
               if (err) throw err;
               else {
                   var movie = new Movie();
                   //movie.title = req.body.title;
                   movie.yearReleased = req.body.yearReleased;
                   movie.genre = req.body.genre;
                   movie.actors = req.body.actors;

                   movie.save(function (err, movies) {
                       if (err) throw err;
                       //else
                       //console.log(movies);
                       //res = res.status(200);
                       res.json({success: true, msg: 'Movie successfully updated.'});
                   })
               }
           })
       }
   })

    //Delete movies
    .delete(authJwtController.isAuthenticated, function(req, res) {
        if (!req.body.title) {
            res.json({success: false, msg: 'Please pass a Movie Title to delete.'});
        }
        else {
            Movie.findOneAndRemove({title: req.body.title}, function (err) {
                if (err) throw err;
                res.json({success: true, msg: 'Movie successfully deleted.'});
            })
                //}
            //})
        }
    });
*/

db.movies.aggregate([
    {
        $lookup:
            {
                from: "reviews",
                localField: "title",
                foreignField: "movieTitle",
                as: "movies reviews"
            }
    }
])

router.route('/reviews')

    //Retrieve reviews
    .get(function (req, res) {
            Movie.find({}, function (err,movies) {
                if (err) throw err;
                else
                    if (req.json({reviews: true})) {
                        console.log(reviews);
                        res = res.status(200);
                        res.json({success: true, msg: 'GET reviews.'});
                    }
            });
        }
    )

    //Save reviews
    .post( authJwtController.isAuthenticated, function (req, res) {
        if (!req.body.movieTitle || !req.body.reviewer || !req.body.quote || !req.body.rating) {
            res.json({success: false, msg: 'Please pass Movie Title, Reviewer, Quote, and Rating'});
        }
        else {
            var review = new Review();
            review.movieTitle = req.body.movieTitle;
            review.reviewer = req.body.reviewer;
            review.quote = req.body.quote;
            review.rating = req.body.rating;

            review.save(function(err, reviews) {
                if (err) throw err;
                res.json({ message: 'Review successfully created.' });
            });
        }
    });


app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


