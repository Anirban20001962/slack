const username = prompt('What is your username?')
const socket = io({query: {
    username
}});
let nsSocket="";    
socket.on('nsList',(nsData) => {
    let namespacesDiv = document.querySelector('.namespaces')
    namespacesDiv.innerHTML = '';
    nsData.forEach(ns => {
        namespacesDiv.innerHTML += `<div class="namespace" ns=${ns.endpoint} ><img src=${ns.img} /></div>`
    });
    Array.from(document.getElementsByClassName('namespace')).forEach(el => {
        el.addEventListener('click',(e) => {
            const endPoint = el.getAttribute("ns");
            console.log(endPoint);
            joinNs(endPoint);
        }) 
    })
})
joinNs('/wiki')



