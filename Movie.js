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

//movie schema
var MovieSchema = new Schema({
    title: { type: String, required: true, index: { unique: true }},
    yearReleased: {type: Number, min:[1900, 'Must be greater than 1899'], max:[2100,'Must be less than 2100'], required: true },
    genre: { type:String, required: true},
    actors: [{ actorName: String, characterName: String }]
});

//return the model to server
module.exports = mongoose.model('Movie', MovieSchema);