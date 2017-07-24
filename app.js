const express = require('express');
const db = require('./models/db.js')
const router = require('./controller/router.js');
const session = require('express-session');


var app = express();
app.use(session({
    secret:'keyboard cat',
    resave:false,
    saveUninitialized:true
}))

app.set('view engine','ejs');
app.use(express.static('./public'));
app.use(express.static('./avatar'))

app.use('/regist',router.showregist)

app.use('/doregist',router.showdoregist);

app.use('/login',router.showlogin)



app.use('/exit',router.exit);

app.use('/dologin',router.dologin);

app.use('/avatar',router.showavatar);

app.use('/doavatar',router.showdoavatar)

app.use('/docut',router.docut)

app.use('/cut',router.showCut);

app.use('/speak',router.speak);

app.use('/getAllspeak',router.getAllspeak);

app.use('/getPerson',router.getPerson);

app.use('/getAllCount',router.getAllCount);

app.use('/user/:user',router.showPerson)

app.use('/myspeak',router.myspeak);

app.use('/showList',router.showList)

app.use('/',router.showindex);



app.listen(80);