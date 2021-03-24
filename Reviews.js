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

//reviews schema
var ReviewsSchema = new Schema({
    movieTitle: { type: String, required: true, index: { unique: true }},
    reviewer: {type: String, required: true},
    quote: {type: String, required: true},
    rating: {type: Number, min:[1, 'Must be at least 1'], max:[5,'Must be at most 5'], required: true}
});

//return the model to server
module.exports = mongoose.model('Reviews', ReviewsSchema);