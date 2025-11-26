document.getElementById("scan").onclick = () => {
  chrome.runtime.sendMessage({ action: "scan" });
};
