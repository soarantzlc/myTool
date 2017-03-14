var mysql  = require('mysql');
var moment = require('moment');

function queryOrderCount(date,type,fun){

    var connection = mysql.createConnection({
        host: '127.0.0.1',       //主机
        user: 'kaifa',               //MySQL认证用户名
        password:'kaifa',        //MySQL认证用户密码
        port: '2001',                 //端口号.
        database:"order"
    });

    var ordertype = ""
    if(type == 2){
        ordertype = 5;
    }
    if(type == 4){
        ordertype = 4;
    }
    if(type == 8){
        ordertype = 2;
    }
    var startdate =new moment(date).format("YYYY-MM-DD");
    var enddate =new moment(date).add(1,"day").format("YYYY-MM-DD");
    var sql="select count(*) as count from so";
    sql = sql +" where parent_order_code = 0";
    sql = sql + " and order_channel =" + ordertype;
    sql = sql + "  and  create_time >= '" + startdate + "  00:00:00' and create_time <= '" + enddate + " 00:00:00';";
    console.log(sql)
    connection.query(sql,function(err, rows, fields) {
        if (err) throw err;
        var string=JSON.stringify(rows);
        var json=JSON.parse(string);
        fun(json[0].count)
        connection.end();
    });
}

exports.queryOrderCount =queryOrderCount


