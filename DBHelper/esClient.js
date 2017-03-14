var elasticsearch = require('elasticsearch');

// 使用默认配置连接到 localhost:9200
var client = new elasticsearch.Client();


var heimdall_online =  [
    '10.10.13.178:9200'
]

// 连接两个节点，负载均衡使用round-robin算法
var client = elasticsearch.Client({
    hosts: heimdall_online
});

var check = function(success,error){
    client.cluster.health(function (err, resp) {
        if (err) {
            error(err);
        } else {
            success(resp)
        }
    });
}

var search = function(index,type,query,success,err){
    client.search({
        index: index,
        type: type,
        body: query,
    }).then(function (resp) {
        success(resp);
    }, function (info) {
        err(info);
    });
}



exports.check =check
exports.search =search