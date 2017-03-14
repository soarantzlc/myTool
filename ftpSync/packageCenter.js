var webpack = require('webpack');
var fs = require('fs');
var path = require('path');
var glob = require('glob');

function entries (globPath,dir) {
    var files = glob.sync(globPath);
    var entries = {}, entry, dirname, basename;
    entries.app = []
    for (var i = 0; i < files.length; i++) {
        entry = files[i].replace(dir,"")
        dirname = path.dirname(entry);
        basename = path.basename(entry, '.js');
        entries.app.push( './' + entry)
        /*  console.log(entries)*/
        //entries[path.join(dirname, basename)] = './' + entry;
    }
    return entries;
}


function compressPack(rootinfo,packageInfo,callback){
    var length = packageInfo.length
    var packCount = 0
    console.log("需要压缩"+length+"个文件");
    function packageComplete(){

        if(packCount == length){
            callback()
        }
    }
    for(var i = 0 ; i < packageInfo.length ; i ++){
        var basePath = entries( rootinfo  + packageInfo[i].compressexp,rootinfo).app;
        for(var j = 0 ; j <basePath.length ; j ++){
            if(basePath[j] == "./js/base/ody-message/controller.js"){
                basePath.splice(j,1);
            }
        }

        console.log("开始打包文件")
        console.log(basePath);
        var packageExp = {
            context: rootinfo,//上下文
            entry:basePath,//入口文件
            output: {//输出文件
                path: "",
                filename: rootinfo + packageInfo[i].outpath
            },
            module: {
                loaders: [//加载器
                    {test: /\.html$/, loader: 'raw'},
                    {test: /\.css$/, loader: 'style!css'},
                    {test: /\.scss$/, loader: 'style!css!sass'},
                    {test: /\.(png|jpg|ttf)$/, loader: 'url?limit=8192'}
                ]
            },
           /* plugins:[
                new webpack.optimize.UglifyJsPlugin(
                    {
                        compress:{
                            warnings: false
                        }
                    }
                )
            ]*/
        };
        var currentIndex = i;
        webpack(packageExp,function(){
            console.log("打包文件成功！！")
            packCount = packCount + 1
            packageComplete()
        });
    }
}

exports.compressPack = compressPack;