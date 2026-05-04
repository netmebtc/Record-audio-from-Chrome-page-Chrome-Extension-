let timerInterval;

function formatTime(ms) {
  const diff = Math.floor(ms / 1000);
  const hrs = String(Math.floor(diff / 3600)).padStart(2, '0');
  const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
  const secs = String(diff % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

function updateUI(isRecording, startTime) {
  const startBtn = document.getElementById("start");
  const stateText = document.getElementById("state-text");
  
  if (isRecording) {
    startBtn.disabled = true;
    stateText.innerText = "Recording...";
    stateText.style.color = "#dc3545";
    
    // 启动或恢复计时器
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      document.getElementById("timer").innerText = formatTime(Date.now() - startTime);
    }, 1000);
  } else {
    startBtn.disabled = false;
    stateText.innerText = "Idle";
    stateText.style.color = "#28a745";
    document.getElementById("timer").innerText = "00:00:00";
    if (timerInterval) clearInterval(timerInterval);
  }
}

//每次打开的时候初始化读取录音状态参数
async function init() {
  // 定义默认值
  const defaultData = {
    isRecording: false,
    startTime: 0
  };
  
  // 读取现有数据
  const result = await chrome.storage.local.get(['isRecording', 'startTime']);
  
  // 如果没有数据，设置默认值
  if (result.isRecording === undefined) {
    await chrome.storage.local.set(defaultData);
//    console.log('初始化完成，已设置默认值');
  } else {
//    console.log('已有数据，跳过初始化');
      updateUI(result.isRecording, result.startTime);    
  }
}

init();

// 1. 每次打开 Popup 时，询问 Background 当前的录音状态
//chrome.runtime.sendMessage({ type: "GET_STATUS" }, (response) => {
//  if (response) {
//    updateUI(response.isRecording, response.startTime);
//  }
//});



// 2. Start 按钮点击
document.getElementById("start").onclick = () => {
  chrome.runtime.sendMessage({ type: "START_RECORDING" });
  updateUI(true, Date.now()); // 立即更新 UI 增强反馈
};

// 3. Stop 按钮点击
document.getElementById("stop").onclick = () => {
  chrome.runtime.sendMessage({ type: "STOP_RECORDING" });
  updateUI(false);
};