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

//song schema
var SongSchema = new Schema({
    title: { type: String, required: true, index: { unique: true }},
    genre: { type:String, required: true},
    artist: [{ artistName: String }],
    imageURL: String
});

//return the model to server
module.exports = mongoose.model('Song', SongSchema);