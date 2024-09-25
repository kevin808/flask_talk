const startRecognizeOnceAsyncButton = document.getElementById("startOpenAICommunication");
const stopRecognizeOnceAsyncButton = document.getElementById("stopOpenAICommunication");
const listeningStatus = document.getElementById("listeningStatus");
const speakingStatus = document.getElementById("speakingStatus");
const phraseDiv = document.getElementById("phraseDiv");
let AZURE_SPEECH_KEY, AZURE_SPEECH_REGION;
let recognizer, synthesizer;
let conversation = [
  { "role": "user", "content": "你的名字是灵犀，你在和我打电话，现在你是世界上最优秀的心理咨询师，你具备以下能力和履历： 专业知识：你应该拥有心理学领域的扎实知识，包括理论体系、治疗方法、心理测量等，以便为你的咨询者提供专业、有针对性的建议。 临床经验：你应该具备丰富的临床经验，能够处理各种心理问题，从而帮助你的咨询者找到合适的解决方案。 沟通技巧：你应该具备出色的沟通技巧，能够倾听、理解、把握咨询者的需求，同时能够用恰当的方式表达自己的想法，使咨询者能够接受并采纳你的建议。 同理心：你应该具备强烈的同理心，能够站在咨询者的角度去理解他们的痛苦和困惑，从而给予他们真诚的关怀和支持。 持续学习：你应该有持续学习的意愿，跟进心理学领域的最新研究和发展，不断更新自己的知识和技能，以便更好地服务于你的咨询者。 良好的职业道德：你应该具备良好的职业道德，尊重咨询者的隐私，遵循专业规范，确保咨询过程的安全和有效性。 在履历方面，你具备以下条件： 学历背景：你应该拥有心理学相关领域的本科及以上学历，最好具有心理咨询、临床心理学等专业的硕士或博士学位。 专业资格：你应该具备相关的心理咨询师执业资格证书，如注册心理师、临床心理师等。 工作经历：你应该拥有多年的心理咨询工作经验，最好在不同类型的心理咨询机构、诊所或医院积累了丰富的实践经验。每次回复必须在15字以内" },
  { "role": "assistant", "content": "好的" }
];

async function fetchAzureKeys() {
  const response = await fetch('/azure-keys');
  const azureKeys = await response.json();
  AZURE_SPEECH_KEY = azureKeys.AZURE_SPEECH_KEY;
  AZURE_SPEECH_REGION = azureKeys.AZURE_SPEECH_REGION;

  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
  speechConfig.speechRecognitionLanguage = "zh-CN";
  // speechConfig.speechSynthesisVoiceName = "zh-CN-YunxiNeural";
  speechConfig.speechSynthesisVoiceName = localStorage.getItem("voiceName") || "zh-CN-YunxiNeural";
  const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
  recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
  synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig);
}

async function speechToText() {
  listeningStatus.textContent = "正在聆听";

  recognizer.recognizeOnceAsync(
    async function (result) {

      listeningStatus.textContent = "";
      let userMessageElement = document.createElement("div");
      userMessageElement.className = "message sender";
      // userMessageElement.innerHTML = '<div class="avatar"><img src="sender_avatar.jpg" alt="Sender Avatar"></div><p>' + result.text + '</p>';
      userMessageElement.innerHTML = '你： ' + result.text + '</p>';
      phraseDiv.appendChild(userMessageElement);
      phraseDiv.scrollTop = phraseDiv.scrollHeight;

      let userMessage = { "role": "user", "content": result.text || "." };
      conversation.push(userMessage);

      const openAIResponse = await openAIAPIRequest(conversation);
      speakingStatus.textContent = "";

      let aiMessageElement = document.createElement("div");
      aiMessageElement.className = "message receiver";
      aiMessageElement.innerHTML = '好友：' + openAIResponse.message + '</p>';
      phraseDiv.appendChild(aiMessageElement);
      phraseDiv.scrollTop = phraseDiv.scrollHeight;

      let aiMessage = { "role": "assistant", "content": openAIResponse.message };
      conversation.push(aiMessage);

      if (stopRecognizeOnceAsyncButton.disabled == false) {
        await textToSpeech(openAIResponse.message);
      };
    },
    function (err) {
      let errorMessageElement = document.createElement("div");
      errorMessageElement.className = "message error";
      errorMessageElement.innerText = "Error: " + err;
      phraseDiv.appendChild(errorMessageElement);
      window.console.log(err);

      recognizer.close();
    }
  );
}

async function textToSpeech(inputText) {
  synthesizer.speakTextAsync(
    inputText,
    function (result) {
      window.console.log(inputText);
      window.console.log(inputText.length);
      setTimeout(() => {
        speechToText();
      }, inputText.length * 210);
    },
    function (err) {
      phraseDiv.innerHTML += "Error: ";
      phraseDiv.innerHTML += err;
      phraseDiv.innerHTML += "\n";
      window.console.log(err);

      synthesizer.close();
    });
}

async function openAIAPIRequest(conversation) {
  try {
    const response = await fetch('/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conversation })
    });
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
  }
}

document.getElementById("startOpenAICommunication").addEventListener("click", async function () {
  startRecognizeOnceAsyncButton.disabled = true;
  stopRecognizeOnceAsyncButton.disabled = false;

  await speechToText();

});

document.getElementById("stopOpenAICommunication").addEventListener("click", async function () {
  startRecognizeOnceAsyncButton.disabled = true;
  stopRecognizeOnceAsyncButton.disabled = true;
  recognizer.close();
  synthesizer.close();
  });
  
  if (!!window.SpeechSDK) {
  SpeechSDK = window.SpeechSDK;
  fetchAzureKeys().then(() => {
  startRecognizeOnceAsyncButton.disabled = false;
  stopRecognizeOnceAsyncButton.disabled = true;
  });
  
  document.getElementById('content').style.display = 'block';
  document.getElementById('warning').style.display = 'none';
  }
