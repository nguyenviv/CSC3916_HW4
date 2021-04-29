var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

mongoose.Promise = global.Promise;

//connect method
//mongoose.connect(process.env.DB, { useNewUrlParser: true });
try {
    mongoose.connect( process.env.DB, () =>
        console.log("connected"));
}catch (error) {
    console.log("could not connect");
}
mongoose.set('useCreateIndex', true);

//playlist schema
var PlaylistSchema = new Schema({
    username: { type: String, required: true },
    songTitle: [{ songTitle: String}]
});

//return the model to server
module.exports = mongoose.model('Playlist', PlaylistSchema);