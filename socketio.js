var socketio = {};
var socket_io = require('socket.io');
const Sequelize = require('sequelize');
const encrypt = require('./utils/encrypt');

const Model = Sequelize.Model;

const Message = require('./model/Message');
const User = require('./model/User');

const sequelize = new Sequelize('chat_db', 'root', 'FgyFgy666', {
    host: 'localhost',
    dialect: 'mysql'
});

class user extends Model{}
user.init(User,{
    sequelize,
    modelName:'user',
    timestamps:false,
    freezeTableName:true
});

class message extends Model{}
message.init(Message,{
    sequelize,
    modelName:'message',
    timestamps:false,
    freezeTableName:true
});

// sequelize
//     .authenticate()
//     .then(() => {
//         console.log('Connection has been established successfully.');
//     })
//     .catch(err => {
//         console.error('Unable to connect to the database:', err);
//     });

var users = {};//存储在线用户列表

//获取io
socketio.getSocketio = function(server){
    var io = socket_io.listen(server);

    io.sockets.on('connection',async function (socket) {
        console.log("连接成功");
        socket.on('login',function (data) {//登陆
            let username = data.username;
            let password = data.password;
            user.findOne({
                where:{
                    username:username
                }
            }).then((aUser)=>{
                if (aUser&&aUser.password===encrypt(password)){
                    socket.name = aUser.id;
                    if (!users[aUser.id]){
                        users[aUser.id] = aUser;
                    }
                    socket.emit('loginResult',{result: true,user:aUser});
                    io.emit('online',{user:{id:aUser.id,username:aUser.username,nickname:aUser.nickname}});//通知所有在线用户有用户上线
                }else {
                    socket.emit('loginResult',{result:false,msg:'密码错误或账户不存在'});
                }
            })
        });

        socket.on('signUp',async function (data) {//注册
            let username = data.username;
            let password = data.password;
            let nickname = data.nickname;
            let newuser = {};
            newuser.username = username;
            newuser.password = encrypt(password);
            newuser.nickname = nickname;

            user.create(newuser).then((aUser,error)=>{
                if (aUser&&!error){
                    socket.name = aUser.id;
                    if (!users[aUser.id]){
                        users[aUser.id] = aUser;
                    }
                    socket.emit('loginResult',{result:true,user:aUser})
                }else {
                    socket.emit('loginResult',{result:false,msg:'注册失败，用户名已被占用'});
                }
            });

        });

        //查看未读信息
        socket.on('getUnreadMsg',function () {
            let id = socket.name;
            if (id&&users[id]){//用户已经上线才能拿到信息
                message.findAll({
                    where:{
                        to:id,
                        isread:0
                    }
                }).then((msgs)=>{
                    socket.emit('getMsgResult',{result:true,msgs:msgs});
                    //发送完毕后把信息改为已读
                    message.update({isread:1},{
                        where:{
                            to:id,
                            isread:0
                        }
                    });
                });
            }else {
                socket.emit('getMsgResult',{result:false});
            }
        });
        //查看在线用户
        socket.on('getOnlineUser',function () {
            let id = socket.name;
            if (id&&users[id]){
                let onlineUsers;
                onlineUsers =  users.filter((item)=>{
                    if (item&&item.id!==id) return item;
                }).map((item)=>{
                    return {
                        id:item.id,
                        username:item.username,
                        nickname:item.nickname
                    }
                });
                socket.emit('getOnlineUserResult',{onlineUsers:onlineUsers});
            }else {
                socket.emit('getOnlineUserResult',{onlineUsers:[]});
            }
        });

        //下线
        socket.on('disconnect',function () {
            let id = socket.name;
            console.log('设备断开连接');
            if (id&&users[id]){
                console.log('用户：'+id+'断开连接');
                delete users[id];
                io.emit('offline',{id:id})
            }
        });
        //断开连接


        //发送信息给朋友
        socket.on('sendMsg',function (data) {
            let msg = {};
            msg.from = socket.name;
            msg.to = data.to;
            msg.msg = data.msg;
            let key = data.key;
            msg.time = new Date();
            if (!users[data.from]){
                socket.emit('sendFeedback',{result:false,key:key,msg:'非法请求'});
                return;
            }
            if (users[data.to]){//如果用户在线
                msg.isread = 1;
                message.create(msg).then((msg)=>{
                    let clients = io.sockets.clients();
                    clients.forEach(function (client) {
                        if (client.name === msg.to){
                            client.emit('receiveMsg',{msg:msg});
                            socket.emit('sendFeedback',{result:true,key:key,id:msg.id});
                        }
                    });
                })
            }else {
                msg.isread = 0;
                message.create(msg);
                socket.emit('sendFeedback',{result:true,key:key,id:msg.id});
            }
        })

        //通知所有用户有用户上线
        //通知所有用户有用户下线
    })
};

module.exports = socketio;
