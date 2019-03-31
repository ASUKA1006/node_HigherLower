const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new Schema({
    username: String,
    password: String,
    age: String,
    city: String,
    score: String,
    active: Boolean
});

var options = ({
    missingPasswordError: 'Wrong password'
});
userSchema.plugin(passportLocalMongoose, options);

mongoose.connect('mongodb://localhost/NoGame')
exports.userSchema = mongoose.model('User', userSchema);
