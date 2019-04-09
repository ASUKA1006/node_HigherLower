const express = require('express');
var app = express();
var passport = require('passport');
var bodyParser = require('body-parser');
var model = require('./testModel');
var cookieSession = require('cookie-session');
var Userscore = 0
var cookieParser = require('cookie-parser');
var cookiesMap;
var sessionsMap = {};
var shajs = require('sha.js')


var model = require('./testModel');
var User = model.userSchema;

var session = require('express-session');

// var flash = require('connect-flash');

var User = model.userSchema;
var Controller = require ('./gameController.js') ;
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.use(session({
    domain: 'localhost:8001',
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie:{
    httpOnly: true,
    secure: false,
    maxage: 1000 * 60 * 30,
    sameSite: true
    }
  })); 

// app.use(flash());
app.use(passport.initialize());
app.use(passport.session());



// the most widely used way for websites to authenticate users is via a username and password. Support for this mechanism is provided by the passport-local module.
var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
    function(username, password, done){
        var cookieName = cookiesMap[username]
        sessionsMap[cookieName] = username
        exports.sessionsMap = sessionsMap;
        User.findOne({username: username}, function(err, user){
            if (err) return done(err);
            if (!user) return done(null, false, { message: 'ユーザーIDが正しくありません。' });
            if (user.password != password) return done(null, false, { message: 'パスワードが正しくありません。' });
            return done(null, user)
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

app.get('/', function(req, res){
    res.sendFile('index.html', {root : __dirname});
})

app.get('/login', function(req, res){
    var cookies = req.cookies;
    // var cookieVal = cookies[req.body.username]
    cookiesMap = cookies;
    res.sendFile('login.html', {root : __dirname});
})

function hashSubmit(document) {
    var oldVal = document.myform.password.value;
    var hashedPassword = shajs('sha256').update(oldVal).digest('hex');
    document.myform.password.value = hashedPassword;
    return true;
}

app.get('/register', function(req, res){
    res.render('register.ejs', {
        hash: hashSubmit,
    });
})

app.get('/login/success', async function(req, res){
    await Controller.resetQuestionCount(req, res, sessionsMap)
    res.sendFile('success.html', {root : __dirname});
})

app.get('/login/bonusgame', async function(req, res){
    var questionList = await Controller.bonus(req, res)
    var question = questionList[0]
    var choice1 = questionList[1]
    var choice2 = questionList[2]

    if (Userscore = 0){
        var Useranswer = 2
    }

    var choiceList = [choice1, choice2]

    return res.render('./bonusgame.ejs', {
        question: question,
        choiceList: choiceList,
        choice1: choice1,
        choice2: choice2,
        answer: Useranswer,
    });
})

app.get('/login/populationgame', async function(req, res){
    var list = await Controller.pickQuestions(req, res, sessionsMap)
    console.log(list)
    var title1 = list[0]
    var title2 = list[2]
    var Useranswer = 2
    var Userscore = list[4]
    
    exports.Useranswer = Useranswer;
    exports.title1 = title1;
    exports.title2 = title2;

    var titleList = [title1, title2];

    return res.render('./populationGame.ejs', {
        title1: title1,
        title2: title2,
        Userscore: Userscore,
        titleList: titleList,
        answer: Useranswer
    });
})



app.post('/register', async (req, res) => {
    new User({
        username: req.body.username,
        password: req.body.password,
        age: null,
        city: null,
        score: 0,
        active: true
    }).save(function(err){
        if (err) {
            console.log('err: ' + err);
            return;
        }
    })
    var userCookie = Math.random();
    res.cookie(req.body.username, userCookie, { path: '/'});
    await res.redirect('/login');
});

app.post('/login', 
    passport.authenticate('local', {failureRedirect: '/login', 
                                successRedirect: '/login/success'
    })
);

app.post('/login/populationgame', async function(req,res){
        var answerdata = await Controller.findData(sessionsMap)
        var Userresult = await Controller.rightOrWrong(req, res, sessionsMap, answerdata)
        title1 = Userresult[0];
        title2 = Userresult[1];
        Userscore = Userresult[2];
        Useranswer = Userresult[3];
        var titleList = [title1, title2];

        return res.render('./populationGame.ejs', {
            title1: title1,
            title2: title2,
            Userscore: Userscore,
            titleList: titleList,
            answer: Useranswer
        });

    
});

app.post('/login/bonusgame', async function(req,res){
    var Userresult = await Controller.bonusAnswer(req, res, sessionsMap)
    var choice1 = Userresult[0];
    var choice2 = Userresult[1];
    var Useranswer = Userresult[2];

    var choiceList = [choice1, choice2]

    return res.render('./bonusgame.ejs', {
        choice1: choice1,
        choice2: choice2,
        choiceList: choiceList,
        answer: Useranswer
    });


});


app.listen(8001);
