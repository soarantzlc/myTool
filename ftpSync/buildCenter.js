var fileCenter = require("./fileCenter.js")
var packageCenter = require("./packageCenter.js")
function localPublish(rootinfo,toinfo,logurl,callback){
    console.log("-------开始本地同步--------")
    fileCenter.toDir(rootinfo,toinfo.rooturl,logurl,function(){
         callback();
    })

}


function sftpPublish(rootinfo,toinfo,logurl,callback){
    console.log("-------开始发布操作--------")
    fileCenter.toFTP(rootinfo,toinfo,logurl,function(){
        callback();
    })
}

function compressPackPublish(rootinfo,toinfo,logurl,callback){
    console.log("打包压缩发布")
    var packageInfo = [
        {
            compressexp:'/js/service/*Service.js',
            outpath:"/js/heimdall_service.js"
        },
        {
            compressexp:'/js/base/ody-**/controller.js',
            outpath:"/js/heimdall_directive.js"
        },
        {
            compressexp:'/js/controllers/**.js',
            outpath:"/js/heimdall_controllers.js"
        }
    ]
    packageCenter.compressPack(rootinfo,packageInfo,function(){
        console.log("打包压缩完毕")
        console.log("开始上传")
        var uploadInfo = [
            "js/heimdall_controllers.js",
            "js/heimdall_directive.js",
            "js/heimdall_service.js",
            "js/app.js"
        ]
        fileCenter.toFTPbyPath(rootinfo,toinfo,uploadInfo,function(){
            callback();
        })
    })
}



function publishResource(rootinfo,toinfo,logurl,callback){
    console.log("开始上传指定资源")
    var condition = ["Ctrl","Service","controller.js","app.js","base.js"];
    fileCenter.publishByCondition(rootinfo,condition,toinfo,logurl,function(){
        callback();
    })
}

exports.publishResource = publishResource;
exports.localPublish = localPublish;
exports.sftpPublish = sftpPublish;
exports.compressPackPublish = compressPackPublish;