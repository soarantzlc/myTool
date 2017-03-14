var spawn = require('child_process').spawn,
    server = null;


function startServer(){
    console.log('start server');
    server = spawn('node',['D:/kpiContrl/bin/www']);
    console.log('node js pid is '+server.pid);
    server.on('close',function(code,signal){
        console.log(code);
        server.kill(signal);
        server = startServer();
    });
    server.on('error',function(code,signal){
        console.log(signal)
        server.kill(signal);
        server = startServer();
    });
    return server;
};

startServer();