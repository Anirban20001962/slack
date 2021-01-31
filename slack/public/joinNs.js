function joinNs(endpoint) {
    if(nsSocket) {
        console.log('runned')
        nsSocket.close();
        document.querySelector('.message-form').removeEventListener('submit',formSubmission)
    }
    nsSocket = io(endpoint);
    nsSocket.on('nsRoomLoad',nsRooms => {
    let roomList = document.querySelector('.room-list')
    roomList.innerHTML = '';
    nsRooms.forEach(room => {
        let glyph;
        if(room.privateRoom) {
            glyph = 'lock';
        }
        else {
            glyph = 'globe'
        }
        roomList.innerHTML += `<li class="room"><span class="glyphicon glyphicon-${glyph}">${room.roomTitle}</span></li>`
        })
        let rooomNodes = document.getElementsByClassName('room')
        Array.from(rooomNodes).forEach(elem => {
            elem.addEventListener('click',(e) => {
                joinRoom(e.target.innerText);
            })
        });
    })
    nsSocket.on('messageToClients',(msg) => {
        console.log(msg);
        document.querySelector('#messages').innerHTML += buildHtml(msg);
    })
    document.querySelector('.message-form').addEventListener('submit',formSubmission)
}
function formSubmission(e) {
    e.preventDefault();
    const newMessage = document.querySelector('#user-message').value;
    nsSocket.emit('newMessageToServer',{text: newMessage})
}
function buildHtml(msg) {
    const convertedDate = new Date(msg.date).toLocaleString();
    const newHtml = `<li>
    <div class="user-image">
        <img src=${msg.avatar} />
    </div>
    <div class="user-message">
        <div class="user-name-time">${msg.username} <span>${convertedDate}</span></div>
        <div class="message-text">${msg.text}</div>
    </div>
</li>`
    return newHtml;
}
