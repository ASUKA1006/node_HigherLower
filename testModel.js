const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new Schema({
    username: String,
    password: String,
    age: String,
    city: String,
    score: Number,
    active: Boolean,
    questionCount: Number
});

var populationSchema = new Schema({
    _id: Number,
    theme: String,
    count: Number
})

var bonusSchema = new Schema({
    _id: Number,
    question: String,
    choice1: String,
    choice2: String,
    right: Number
})

var options = ({
    missingPasswordError: 'Wrong password'
});
userSchema.plugin(passportLocalMongoose, options);

mongoose.connect('mongodb://localhost/NoGame')



exports.userSchema = mongoose.model('User', userSchema);
exports.populationSchema = mongoose.model('Population', populationSchema);
exports.bonusSchema = mongoose.model('Bonus', bonusSchema);
