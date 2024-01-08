const setData = document.getElementById("set");
const sendData = document.getElementById("send");
const display = document.getElementById("display");
let userId  = Math.floor(10000 + Math.random() * 90000);
let recipientID;
let message;
let socket = io("http://localhost:3000", {
    auth: { clientID: userId},
});

document.getElementById("myid").innerText = userId;

setData.addEventListener("click", () => {
    
    recipientID = document.getElementById("clientid").value;
});

socket.on("private message", (message) => {
	console.log("Received private message:", message);
	display.innerText = message;
});

// Function to send a private message to another client
function sendPrivateMessage() {
	message = document.getElementById("msg").value;
	socket.emit("private message", { recipientID, message });
}


sendData.addEventListener('click', ()=>{
    sendPrivateMessage()
})