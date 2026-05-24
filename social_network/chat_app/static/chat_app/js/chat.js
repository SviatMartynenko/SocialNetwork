const CHAT_URL = `ws://${window.location.host}/chat/`;

const chatSocket = new WebSocket(CHAT_URL);

chatSocket.onmessage = function (event) {
    let data = JSON.parse(event.data);
    console.log(data);
};