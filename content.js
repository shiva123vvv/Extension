console.log("Cognitive Load Monitor content script loaded");

// Example: read messages on Cliq page
let messages = document.querySelectorAll(".message_text");
messages.forEach(m => console.log(m.innerText));
