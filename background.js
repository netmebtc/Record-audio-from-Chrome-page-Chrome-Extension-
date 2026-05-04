
async function ensureOffscreen() {
  if (await chrome.offscreen.hasDocument?.()) return;
  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["USER_MEDIA"],
    justification: "Recording audio from browser tab"
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "START_RECORDING") {
    ensureOffscreen().then(() => {
      chrome.runtime.sendMessage({ type: "OFFSCREEN_START" });

       const      startTime = Date.now();
      //写入启动录制状态
      chrome.storage.local.set({ isRecording: true, startTime: startTime });
    });
  }

  if (msg.type === "STOP_RECORDING") {
    
    //写入停止录制状态
    chrome.storage.local.set({ isRecording: false, startTime: 0 });

    chrome.runtime.sendMessage({ type: "OFFSCREEN_STOP" });
  }

  // 为 Popup 提供当前状态
  if (msg.type === "GET_STATUS") {
    sendResponse({ isRecording, startTime });
  }

  if (msg.type === "DOWNLOAD") {
    chrome.downloads.download({
      url: msg.url,
      filename: msg.filename
    });
  }
  return true; 
});