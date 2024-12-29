chrome.runtime.onInstalled.addListener(() => {
  console.log("Konomi Music Player extension is installed.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "playMusic") {
    chrome.windows.create({
      url: chrome.runtime.getURL("musicPlayer.html?videoUrl=" + encodeURIComponent(message.videoUrl)),
      type: "popup",
      width: 400,
      height: 300
    }, (newWindow) => {
      sendResponse({ success: true });
    });
    
    return true;
  }
});