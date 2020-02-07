var socket = require('socket.io-client')('http://localhost:3000');
socket.on('connect', function(){});
socket.emit('login',{username:'gy',password:'12345',nickname:'潜伏'});
// socket.emit('sendMsg',{to:1,msg:'hello'});
// socket.emit('getUnreadMsg');
socket.on('event', function(data){});
socket.on('disconnect', function(){});

socket.on('loginResult',function (data) {
    console.log(data)
});

socket.on('online',function (data) {
    console.log("用户上线",data);
    socket.emit('getUnreadMsg');
});

socket.on('getMsgResult',function (data) {
    console.log("未读信息",data)
});
