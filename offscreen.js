let recorder;
let chunks = [];
let stream;
//let startTime = 0;

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === "OFFSCREEN_START") {
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: true, // 捕获标签页音频通常需要开启 video，但在下一步中只提取 audio
        audio: true
      });

      const audioStream = new MediaStream(stream.getAudioTracks());
      recorder = new MediaRecorder(audioStream, { mimeType: 'audio/webm' });
      chunks = [];

//      startTime = Date.now();

      //写入启动录制状态
      //chrome.storage.local.set({ isRecording: true, startTime: startTime });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);

        chrome.runtime.sendMessage({
          type: "DOWNLOAD",
          url: url,
          filename: `recording_${new Date().toISOString().replace(/[:.]/g, '-')}.webm`
        });

        chunks = [];
        // 关闭所有轨道以停止浏览器顶部的“正在共享”提示
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  }

  if (msg.type === "OFFSCREEN_STOP") {
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }
});