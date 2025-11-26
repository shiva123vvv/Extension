console.log("Content script loaded on Cliq");

// Example: read messages from chat
setInterval(() => {
  let msgs = document.querySelectorAll(".message_text");
  msgs.forEach(m => console.log("Found message:", m.innerText));
}, 2000);
