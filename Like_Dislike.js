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

//like dislike schema
var Like_Dislike_Schema = new Schema({
    songTitle: { type: String, required: true },
    reviewer: { type: String, required: true },
    like: { type: Number },
    dislike: { type: Number }
});

//return the model to server
module.exports = mongoose.model('Like_Dislike', Like_Dislike_Schema);