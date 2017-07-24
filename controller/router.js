const db = require('../models/db.js');
const formidable = require('formidable');
const crypto = require('crypto');
const path = require('path')
const fs =require('fs');
const gm = require('gm');

exports.showindex = function(req,res,next){
     if(req.session.login == '1'){
            var login = true;
            var user = req.session.username;
          
        }else{
            var login = false;
            var user = '';
          
        }
    db.find('ludong',{'username':user},(err,result)=>{
       if(result.length != 0){
          var avatar = result[0].advadar;
       }else{
           var avatar = 'moren.jpg'
       }
        if(err){
            throw err;
        }
      
         res.render('index',{
            login:login,
            username:user,
            avatar:avatar
        }) 
    })
  
}

exports.showlogin =function(req,res){
    res.render('login',{
        login:false,
        username:''
    })
}

exports.showregist = function(req,res){
    res.render('regist',{
        login:false,
        username:''
    })
}

exports.showdoregist = function(req,res){
  var form = new formidable.IncomingForm();
  form.parse(req,(err,field,files)=>{
      var pass = md(md(field.password)+'chang')
      db.find('ludong',{'username':field.username},(err,result)=>{
          if(result.length == 0){
              db.insertMany('ludong',[{
                'username':field.username,
                'password':pass,
                'advadar':'moren.jpg'
            }],(err,result)=>{
                if(err){
                    res.json('-1');//账号注册失败
                    return;
                }

                    req.session.login = '1';
                    req.session.username = field.username;
                   
                    res.json('1');
                   
                    return;
            })
            }else{
                res.json('-2');//账号已被注册
            }
      })
  })
}

exports.dologin = function(req,res){
    var formdologin = new formidable.IncomingForm();
    formdologin.parse(req,(err,field,files)=>{
        if(err){
            throw err;
        }
        var userL = field.username;
        var passl = field.password;
        console.log(field)
        db.find('ludong',{'username':userL},(err,result)=>{
            if(err){
                throw err;
            }
            if(result.length == 0){
                res.json('-2')//没有该用户;
                return;
            }
            var mdpass = md(md(passl)+'chang');
            if(result[0].password == mdpass){
                req.session.login = '1';
                req.session.username = userL;
                res.json('1');
                return;
            }else{
                res.json('-1');
                return;
            }
        })
    })
}

exports.showavatar = function(req,res){
  
    if(req.session.login == '1'){
        var username = req.session.username
     db.find('ludong',{'username':username},(err,result)=>{
         res.render('avatar',{
            login:true,
            username:username,
            avatar:result[0].advadar
        })
    })
       
    }else{
        res.redirect('/login')
    }
}

exports.exit  = function(req,res){
    req.session.login='-1';
    req.session.username = '';
    res.redirect('/');
}

exports.showCut = function(req,res){
 if(req.session.login == '1'){
    var user = req.session.username;
   db.find('ludong',{'username':user},(err,result)=>{
       if(result.length == 0){
           res.redirect('/login');
           return;
       }else{
           res.render('cut',{
               login:true,
               username :user,
               avatar:result[0].advadar
           })
       }
   })
 }else{
     res.redirect('/login')
 }
}


exports.showdoavatar =function(req,res){
    var formPhoto = new formidable.IncomingForm();
    formPhoto.uploadDir = './avatar';
    var user = req.session.username;
    formPhoto.parse(req,(err,field,files)=>{
        if(err) throw err;
        var oldpath = path.join(__dirname,'../',files.photo.path);
        var newpath = path.join(__dirname,'../','/avatar/'+user+'.jpg')
        if(files.photo.name){
            fs.rename(oldpath,newpath,(err)=>{
            if(err){throw err;}
            db.update('ludong',{'username':user},{$set:{'advadar':user+'.jpg'}},(err,result)=>{
             if(err){
                 console.log('更改数据文件失败！');
                 return;
             }
               res.redirect('/cut')
            })
            })
        }else{
             res.redirect('/cut')
        }
    })
}

exports.docut =function(req,res){
   if(req.session.login == '1'){
       var form = new formidable.IncomingForm();
       form.parse(req,(err,field,files)=>{
            var user =  req.session.username;
            var imgPath = path.join(__dirname,'../avatar/'+user+'.jpg');
            gm(imgPath)
            .crop(field.w,field.h,field.x,field.y)
            .resize(100,100,'!')
            .write(imgPath,(err)=>{
                if(err){
                   res.json('-1')
                    return;
                }
                res.json('1')
            })
        })
   }
} 

exports.speak = function(req,res){
 if(req.session.login == '1'){
      var user = req.session.username;
       console.log('user')
    var form = new formidable.IncomingForm();
    form.parse(req,(err,field,files)=>{
        db.insertMany('ludongM',[{
            'username':user,
            'message':field.text,
            tiem:new Date()
        }],(err,result)=>{
            if(err){
                res.json('-1');
                return;
            }
            res.json('1');
        })
    })  
 }else{
     res.redirect('/login')
 }
}

exports.getAllspeak = function(req,res){
    var page = req.query.page;
    db.find('ludongM',{},{'page':page,'pageCount':10,'sort':{'tiem':-1}},(err,result)=>{
        if(err){
            console.log(err);
        }
        res.json(result);
    })
}

exports.getPerson = function(req,res){
    var user = req.query.username;
    db.find('ludong',{'username':user},(err,result)=>{
        if(err){
            res.json('-5');
        }
        res.json(result);
    })
}

exports.getAllCount = function(req,res){
    db.getAllCount('ludongM',(count)=>{
           res.json(count)
    })
}

exports.showPerson = function(req,res){
  if(req.session.login == '1'){
      var user = req.params['user'];
        db.find('ludong',{'username':user},(err,result)=>{
        res.render('person',{
            login:true,
            username:req.session.username,
            advadar:result[0].advadar
        }) 
        })
  }else{
      res.redirect('/');
  }
}

exports.myspeak =function(req,res){
    if(req.session.login == '1'){
      var user = req.session.username;
      db.find('ludongM',{'username':user},{sort:{'tiem':-1}},(err,result)=>{
          if(err){
              console.log(err);
              return;
          }
            res.json(result);
      })
    }else{
        res.redirect('/')
    }
}

exports.showList = function(req,res){
    db.find('ludong',{},(err,result)=>{
        res.render('List',{
            login:true,
            username:req.session.username,
            result:result
        })
    })
}

function md(sub){
    var pass = crypto.createHash('md5').update(sub).digest('base64');
    return pass;
}