var fs = require("fs");
var path = require('path');
var Client = require('ssh2').Client;
var  getfile =function(root,callback){
    fs.readFile(root, function(err, data) {
        if (err) {
            throw err;
        }
        var array = data.toString().split("\r\n");
        callback(array)
    });
}


var createFolder = function(to) { //文件写入
    var sep = path.sep
    var folders = path.dirname(to).split("/");
    var p = '';
    while (folders.length) {
        p += folders.shift() + sep;
        if (!fs.existsSync(p)) {
            fs.mkdirSync(p);
        }
    }
};

var toDir = function(rooturl,tourl,logurl,callback){
    function copy (index,files,complete){
        if(index<files.length){
            var src = rooturl  + files[index];
            var topath = tourl + files[index];
            console.log("将文件" + src + "同步到" + topath);
            var isExit = fs.stat(topath,function(result){
                if(result != null){
                    createFolder(topath)
                }
                fs.writeFile(topath, fs.readFileSync(src),function(){
                    index = index + 1
                    console.log("复制完成!");
                    copy(index,files,complete);
                });
            });
        }else{
            complete()
        }
    }

    getfile(logurl,function(files){
        copy(0,files,function(){
            console.log("操作完毕")
        })
    })
}



function toFTP(rooturl,toInfo,logurl,callback){
    getfile(logurl,function(files){
        var conn = new Client();
        if(files.length != 0){
            conn.on('ready', function() {
                conn.sftp(function(err, sftp) {
                    if(err){
                        console.log(err);
                    }else{
                        var fileCount = files.length;
                        var loadCount = 0;
                        function addloadCount(){
                            loadCount ++;
                            if(loadCount == fileCount){
                                console.log("上传完毕...")
                                conn.end();
                            }
                        }
                        console.log("需要同步" + fileCount +"个文件");
                        syncDirs(conn,toInfo,files,function(){
                            for(var i = 0 ; i < files.length;i++){
                                var  localpath = rooturl + files[i];
                                var  topath ="/" + toInfo.rooturl + files[i];
                                console.log("将文件:" +  localpath + "上传到:" + topath );
                                sftp.fastPut(localpath,topath, function(err, result){
                                    if(err != undefined){
                                        console.log(err)
                                    }else{
                                        console.log("上传成功");
                                    }
                                    addloadCount();
                                })
                            }
                        })

                    }
                })
            }).connect(toInfo)
        }else{
            console.log("未匹配到更新文件")
        }
    })
}

function toFTPbyPath(rooturl,toInfo,files,callback){
    var conn = new Client();
    if(files.length != 0){
        conn.on('ready', function() {
            conn.sftp(function(err, sftp) {
                if(err){
                    console.log(err);
                }else{
                    var fileCount = files.length;
                    var loadCount = 0;
                    function addloadCount(){
                        loadCount ++;
                        if(loadCount == fileCount){
                            console.log("上传完毕...")
                            conn.end();
                            callback();

                        }
                    }
                    console.log("需要同步" + fileCount +"个文件");
                    syncDirs(conn,toInfo,files,function(){
                        for(var i = 0 ; i < files.length;i++){
                            var  localpath = rooturl + files[i];
                            var  topath ="/" + toInfo.rooturl + files[i];
                            console.log("将文件:" +  localpath + "上传到:" + topath );
                            sftp.fastPut(localpath,topath, function(err, result){
                                if(err != undefined){
                                    console.log(err)
                                }else{
                                    console.log("上传成功");
                                }

                                addloadCount();
                            })
                        }
                    })

                }
            })
        }).connect(toInfo)
    }else{
        console.log("未匹配到更新文件")
    }

}

function syncDirs(conn,toInfo,files,callback){
    var uplog = []
    function syncdir(index,files,fun){
        if(index < files.length){
            var dir = "/" + toInfo.rooturl.substring(0,toInfo.rooturl.length - 1)
            for(var i =0 ; i < files[index].split("/").length - 1;i++){
                dir = dir + "/" + files[index].split("/")[i];
            }
            if(uplog.indexOf(dir) == -1){
                conn.exec("mkdir -p " + dir + "  \r\n exit\r\n ", function(err){
                    console.log("同步目录" + dir)
                    uplog.push(dir)
                    index = index + 1;
                    syncdir(index,files,fun);
                })
            }else{
                index = index + 1;
                syncdir(index,files,fun);
            }
        }else{
            fun()
        }
    }
    syncdir(0,files,callback);
}

function initTypes (ary,types){
    var result1 = [];
    var result2 = [];
    //var types = ["Ctrl","Service","controller.js","app.js","base.js"]
    for(var i = 0 ;i < ary.length ; i ++){
        var isPush = false;
        for(j = 0 ; j< types.length ; j++){
            if(ary[i] == "js/base-color/ody-apptracker/controller.css"){
                //console.log(types[j])
                //console.log(ary[i])
            }
            if( ary[i].indexOf(types[j]) != -1){
                if(!isPush){
                    result1.push(ary[i]);
                }
                isPush = true;
            }
        }
        if(ary[i] == "js/base-color/ody-apptracker/controller.css"){
            // console.log(isPush)
        }
        if(!isPush){
            result2.push(ary[i]);
        }
    }
    return [result1,result2]
}

function publishByCondition(root,exp,toInfo,logpath,callback){
    getfile(logpath,function(files){
         var ary =  initTypes(files,exp)
         var inCondition = ary[1];
        toFTPbyPath(root,toInfo,inCondition,function(){
            callback();
        })
    })
}



exports.publishByCondition = publishByCondition;
exports.toFTPbyPath = toFTPbyPath;
exports.toDir =toDir;
exports.toFTP =toFTP;