const express = require('express');
var app = express();
var ejs = require('ejs');
var model = require('./testModel');
var populationMaster = require('./populationList.json');
var bonusMaster = require('./bonusQuestion.json');
var User = model.userSchema;
var Bonus = model.bonusSchema;
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));

app.engine('ejs', ejs.renderFile)

var count1=0;
var count2=0;
var Userscore =0;
var right = 0;
var questionCount =0;

exports.resetQuestionCount = async function resetQuestionCount(req, res, sessionsMap){
    var Name = Object.values(sessionsMap)
    const result = await User.find({username: Name[0]});
    var initializeObj ={};
    initializeObj['questionCount'] = 0;
    await User.update(
        {username: Name[0]},
        { $set: initializeObj},
        function(err){
            if(err) throw err;
        }
    );
    
}


exports.pickQuestions = async function pickQuestions(req, res, sessionsMap){
    var theme1 = undefined
    var theme2 = undefined
    var Name = Object.values(sessionsMap)
    const result = await User.find({username: Name[0]});

    if (!result) {
        return undefined;
    }
    questionCount +=1 ;
    var setobj ={};
    setobj['questionCount'] = questionCount;
    await User.update(
        {username: Name[0]},
        { $set: setobj},
        function(err){
            if(err) throw err;
        }
    );
    var presentScore = result[0].questionCount

    // キーがundefinedにならないようにする
    do{
        var random1 = Math.floor(Math.random()*44);
        var random2 = Math.floor(Math.random()*44);

        // 同じクイズ問題じゃないかのチェック
        do {
            var random2 = Math.floor(Math.random()*44);
        }while(random1 === random2)

        for (i = 0; i<populationMaster.length; i++){
            if(random1 === populationMaster[i]._id){
                var theme1 = populationMaster[i].theme
                count1 = populationMaster[i].count
            }
            if(random2 === populationMaster[i]._id){
                var theme2 = populationMaster[i].theme
                count2 = populationMaster[i].count
            }
        }
    }while(theme1 === undefined || theme2 === undefined)



    var list = [theme1, count1, theme2, count2, presentScore]
    return list  

};

exports.rightOrWrong = async function rightOrWrong(req, res, sessionsMap, Useranswer){
    var titleList = req.body
    var value = Object.values(titleList)
    // ex: value = Array(1) ["千葉市 花見川区,大阪市　生野区"]
    var split = value[0].split(',');
    var title1 = split[0]
    var title2 = split[1]
    var keys = Object.keys(req.body)

    var Name = Object.values(sessionsMap)
    console.log('Name: ' + Name[0])

    //正解パターン
    if ((count1 > count2 && keys[0] === 'title1')|| (count2> count1 && keys[0] === 'title2')){
        Userscore +=1;
        var obj ={};
        obj['score'] = Userscore;
        const data = await User.find({username: Name[0]});

        if (!data) {
            return undefined;
        }
        if (data[0].score < Userscore){
            await User.update(
                {username: Name[0]},
                { $set: obj},
                function(err){
                    if(err) throw err;
                }
            );
        }
        var result = [title1, title2, Userscore, Useranswer, questionCount]
        return result
    }
    questionCount = 0;
    var result = [title1, title2, Userscore, Useranswer=0, questionCount]
    return result
};

exports.findData = async function findData(sessionsMap){
    var Name = Object.values(sessionsMap)
    const result = await User.find({username: Name[0]});
    
    if (!result) {
        return undefined;
    }
    var userscore = result[0].questionCount
    var chance = userscore % 3;
    if ( chance === 0){
        return 3
    }else{
        return 1
    }
}

exports.bonus = async function bonus(req, res){
    var choice1 = undefined
    var choice2 = undefined

    var randomQuestionNum = Math.floor(Math.random()*18);
    const result = await Bonus.find({ _id : randomQuestionNum});

    if (!result) {
        return undefined;
    }
    question = result[0].question
    choice1 = result[0].choice1
    choice2 = result[0].choice2
    right = result[0].right

    var bonuslist = [question, choice1, choice2]
    return bonuslist  

}

exports.bonusAnswer = async function bonusAnswer(req, res, sessionsMap, Useranswer){
    var choiceList = req.body
    var value = Object.values(choiceList)
    // ex: value = Array(1) ["千葉市 花見川区,大阪市　生野区"]
    var split = value[0].split(',');
    var choice1 = split[0]
    var choice2 = split[1]

    var keys = Object.keys(req.body)

    var Name = Object.values(sessionsMap)
    console.log('Name: ' + Name[0])

    //正解パターン
    if (keys[0]==='choice1' && right === 1 || keys[0]==='choice2' && right ===2){
        Userscore +=2;
        var obj ={};
        obj['score'] = Userscore;
        await User.update(
            {username: Name[0]},
            { $set: obj},
            function(err){
                if(err) throw err;
            }
        );

        var result = [choice1, choice2, 1]
        return result  
    }

    var result = [choice1, choice2, 0]
        return result  
}
