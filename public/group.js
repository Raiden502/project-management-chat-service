const setData = document.getElementById("set");
const sendData = document.getElementById("send");
const display = document.getElementById("display");
let userId  = Math.floor(10000 + Math.random() * 90000);
let groupID;
let message;
let temp=[]
let socket = io("http://localhost:3000", {
    auth: { clientID: userId},
});

document.getElementById("myid").innerText = userId;

setData.addEventListener("click", () => {
    groupID = document.getElementById("groupid").value;
    socket.emit("join", { groupID, userId });
});

socket.on("group message", (message) => {
    temp.push(message)
	display.innerHTML = temp.map(item => `<p>${item.userId}: ${item.message}</p>`).join('');
});

// Function to send a private message to another client
function sendPrivateMessage() {
	message = document.getElementById("msg").value;
	socket.emit("group message", { groupID, userId,  message });
}


sendData.addEventListener('click', ()=>{
    sendPrivateMessage()
})