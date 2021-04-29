/*
CSC3916 Project
File: Server.js
Description: Web API scaffolding for Spotify-like API
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
var Song = require('./Song');
var SongReview = require('./SongReview');
var Playlist = require('./Playlist');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForSongRequirement(req) {
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


router.route('/song/:song_title')
    //Retrieve reviews
    .get(authJwtController.isAuthenticated, function (req, res) {
        if (req.query && req.query.reviews && req.query.reviews === "true") {

            Song.findOne({title: req.params.song_title}, function (err, song) {
                if (err) {
                    return res.status(403).json({success: false, message: "Unable to get data for title passed in"});
                } else if (!song) {
                    return res.status(403).json({success: false, message: "Unable to find title passed in."});
                } else {

                    Song.aggregate()
                        .match({_id: mongoose.Types.ObjectId(song._id)})
                        .lookup({from: 'songreview', localField: 'title', foreignField: 'songTitle', as: 'songreview'})
                        .addFields({total_like: {$total: "$songreview.like"}})
                        .addFields({total_dislike: {$total: "$songreview.dislike"}})
                        .exec(function (err, song) {
                            if (err) {
                                res.status(500).send(err);
                            }
                            else {
                                res.json(song);
                            }
                        })
                }
            })
        } else {
            res = res.status(200);
            res.json({message: 'Reviews not shown.'});
        }
    })

    //Save song reviews
    .post( authJwtController.isAuthenticated, function (req, res) {
            if (!req.params.song_title || !req.body.reviewer || !req.body.like || !req.body.dislike) {
                res.json({success: false, msg: 'Please pass Song Title, Reviewer, and Song Review'});
            }
            else {
                Song.findOne({title: req.params.song_title}, function (err, song) {
                    if (err) {
                        return res.status(403).json({
                            success: false,
                            message: "Unable to get data for title passed in"
                        });
                    } else if (!song) {
                        return res.status(403).json({success: false, message: "Unable to find title passed in."});
                    } else {

                        var review = new SongReview();
                        review.songTitle = req.params.song_title;
                        review.reviewer = req.body.reviewer;
                        review.like = req.body.like;
                        review.dislike = req.body.dislike;

                        review.save(function (err, songreview) {
                            if (err) {
                                res.status(500).send(err);
                            }
                            else {
                                res.json({ message: 'Song review successfully saved.' });
                                res.json(songreview);
                            }
                        })
                    }
                })
            }
        });

router.route('/song')
    .get(authJwtController.isAuthenticated, function (req, res) {
        if (req.query && req.query.reviews && req.query.reviews === "true") {
            Song.find({}, function (err, song) {
                if (err) throw err;
                else
                    Song.aggregate()
                res.json(song);
            });
        }
    })

    //Save songs
    .post( authJwtController.isAuthenticated, function (req, res) {
        if (!req.body.title || !req.body.genre || !req.body.artist) {
            res.json({success: false, msg: 'Please pass Song Title, Genre, and Artist.'});
        }
        else {
            var song = new Song();
            song.title = req.body.title;
            song.genre = req.body.genre;
            song.artist = req.body.artist;
            song.imageURL = req.body.imageURL;

            song.save(function(err, song) {
                if (err) {
                    if (err.code == 11000)
                        return res.json({ success: false, message: 'A song with that title already exists.'});
                    else
                        return res.send(err);
                }
                res.json({ message: 'Song successfully created.' });
            });
        }
    })

    //Update songs
    .put(authJwtController.isAuthenticated, function(req, res) {
        if (!req.body.title) {
            res.json({success: false, msg: 'Please pass a Song Title to update.'});
        } else {
            Song.findOne({title: req.body.title}, function (err, song) {
                if (err) throw err;
                else {
                    song.title = req.body.title;
                    song.genre = req.body.genre;
                    song.artist = req.body.artist;
                    song.imageURL = req.body.imageURL;

                    song.save(function (err) {
                        if (err) throw err;
                        res.json({success: true, msg: 'Song successfully updated.'});
                    })
                }
            })
        }
    });

// Get playlist
router.route('/playlist/:username')
.get(authJwtController.isAuthenticated, function (req, res) {
    if (req.query && req.query.reviews && req.query.reviews === "true") {

        Playlist.findOne({username: req.params.username}, function (err, playlist) {
            if (err) throw err;
            else {

                Playlist.aggregate()
                    .lookup({from: 'playlist', localField: 'songTitle'})

                    .exec(function (err, playlist) {
                        if (err) {
                            res.status(500).send(err);
                        } else {
                            res.json(playlist);
                        }
                    })
            }
        })

    }
});

router.route('/playlist/:song_title')

    //Save playlist
    .post( authJwtController.isAuthenticated, function (req, res) {
        if (!req.params.song_title) {
            res.json({success: false, msg: 'Please pass Song Title.'});
        } else {
            Song.findOne({title: req.params.song_title}, function (err, song) {
                if (err) {
                    return res.status(403).json({
                        success: false,
                        message: "Unable to get data for title passed in"
                    });
                } else if (!song) {
                    return res.status(403).json({success: false, message: "Unable to find title passed in."});
                } else {
                    var playlist = new Playlist();
                    playlist.username = req.body.username;
                    playlist.songTitle = req.params.song_title;

                    playlist.save(function (err, playlist) {
                        if (err) {
                            if (err.code == 11000)
                                return res.json({success: false, message: 'A song already exists in this playlist.'});
                            else
                                return res.send(err);
                        }
                        res.json({message: 'Song successfully added to playlist.'});
                    });
                }
            })
        }
    });


app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only

