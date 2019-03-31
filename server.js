const express = require('express');
var app = express();
var passport = require('passport');
var bodyParser = require('body-parser');
var model = require('./testModel');
// var flash = require('connect-flash');


var User = model.userSchema;

app.use(bodyParser.urlencoded({extended: true}));
// app.use(flash());
app.use(passport.initialize());
// app.use(passport.session())

// the most widely used way for websites to authenticate users is via a username and password. Support for this mechanism is provided by the passport-local module.
var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
    function(username, password, done){
        User.findOne({username: username}, function(err, user){
            if (err) return done(err);
            if (!user) return done(null, false);
            if (user.password != password) return done(null, false);
            return done(null, user)
        });
    }
));

app.get('/', function(req, res){
    res.sendFile('index.html', {root : __dirname});
})

app.get('/login', function(req, res){
    res.sendFile('login.html', {root : __dirname});
})

app.get('/register', function(req, res){
    res.sendFile('register.html', {root: __dirname});
})

app.get('/login/success', function(rq, res){
    res.sendFile('success.html', {root : __dirname});
})

app.post('/register', async (req, res) => {
    new User({
        username: req.body.username,
        password: req.body.password,
        age: null,
        city: null,
        score: null,
        active: true
    }).save(function(err){
        console.log(err);
    })
    await res.redirect('/login');
});

app.post('/login', 
    passport.authenticate('local', {failureRedirect: '/login', 
                                    successRedirect: '/login/success', 
                                    failureFlash: true,
                                    session:false})
);

app.listen(8001);
