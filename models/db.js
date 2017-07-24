const mongodb = require('mongodb').MongoClient;
var set = require('../setting.js');
function _Connect(callback){
    var url = set.localUrl;

    mongodb.connect(url,(err,db)=>{
        callback(err,db);

    })
}
//数组的增加
exports.insertMany = function(collectionName,arr,callback){
    _Connect((err,db)=>{
        if(err){
            console.log('数据库连接失败！');
            return;
        }
        //添加个数组不是对象
        db.collection(collectionName).insertMany(arr,(err,result)=>{
           
            callback(err,result);
            db.close();
        })
    })
}

//数据库的删除
exports.deleteMany = function(collectionName,json,callback){
   _Connect((err,db)=>{
       if(err){
           console.log(err);
           return;
       }
        db.collection(collectionName).deleteMany(json,(err,result)=>{
            callback(err,result);
            db.close();
        })
   })
}

//数据库的更改
exports.update = function(collectionName,json1,json2,callback){
    _Connect((err,db)=>{
        db.collection(collectionName).updateMany(json1,json2,(err,result)=>{
            callback(err,result);
            db.close();
        })
    })
}

//数据库的查找
exports.find = function(collectionName,json,c,d){
    if(arguments.length == 3){
        var callback =c;
        var page = 0 ;
        var pageCount = 0;
        var sort = {};
    }else if(arguments.length ==4){
        var args = c;
        var callback =d;
        var page = parseInt(args.page) ||0;
        var pageCount = parseInt(args.pageCount) ||0;
        var sort = args.sort ||{};
    }else{
        console.log('输入3个或4个参数');
        var err = new Error();
        throw err;
    }
    _Connect((err,db)=>{
        db.collection(collectionName).find(json).skip(page*pageCount).limit(pageCount).sort(sort).toArray((err,docs)=>{
            callback(err,docs);
        })
    })
}

//初始化创建索引
exports.init = function(collectionName,str){
    _Connect((err,db)=>{
        db.collection(collectionName).createInex({str:1},null,(err,res)=>{
            if(err){
                console.log(err);
                return;
            }
            console.log('初始化成功！');
            db.close();
        })
    })
}
//查询总数量
exports.getAllCount = function(collectionName,callback){
    _Connect((err,db)=>{
        if(err){
            throw err;
        }
        db.collection(collectionName).count({}).then((count)=>{
            callback(count);
            db.close();
        })
    })
}