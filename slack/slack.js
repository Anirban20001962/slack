const express = require('express');
const app = express();
const socketio = require('socket.io')
app.use(express.static(__dirname + '/public'));
const expressServer = app.listen(9000);
const io = socketio(expressServer);
let namespaces = require('./data/namespaces');

io.on('connection',(socket) => {
    let nsData = namespaces.map(ns => {
        return {
            img: ns.img,
            endpoint: ns.endpoint
        }
    })
    socket.emit('nsList',nsData);
})

namespaces.forEach(namespace => {
    io.of(namespace.endpoint).on('connection',(nsSocket) => {
        console.log(`some has joined the namespace`); 
        const username = nsSocket.handshake.query.username;
        nsSocket.emit('nsRoomLoad',namespace.rooms)
        nsSocket.on('joinRoom',(roomToJoin,numberOfUsersCallback) => {
            const roomToLeave = Array.from(nsSocket.rooms)[1];
            nsSocket.leave(roomToLeave);
            updateUsersInRoom(namespace,roomToJoin)
            nsSocket.join(roomToJoin);
            const nsroom = namespace.rooms.find(room => room.roomTitle===roomToJoin);
            nsSocket.emit('historyCatchUp', nsroom.history)
            updateUsersInRoom(namespace,roomToJoin)
            
        })
        nsSocket.on('newMessageToServer',(msg) => {
            const fullMsg = {
                text: msg.text,
                date: Date.now(),
                username: username,
                avatar: 'https://via.placeholder.com/30'
            }
            const roomTitle = Array.from(nsSocket.rooms)[1];
            const nsroom = namespace.rooms.find(room => room.roomTitle===roomTitle);
            nsroom.addMessage(fullMsg);
            io.of(namespace.endpoint).in(roomTitle).emit('messageToClients',fullMsg);
        })
    })
})
function updateUsersInRoom(namespace,roomToJoin) {
    io.of(namespace.endpoint).in(roomToJoin).allSockets()
    .then(data => {
        io.of(namespace.endpoint).in(roomToJoin).emit('updatedmembers',Array.from(data).length)
    })
    .catch(err => {
        console.log(err);
    })
}