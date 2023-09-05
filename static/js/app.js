const startRecognizeOnceAsyncButton = document.getElementById("startOpenAICommunication");
const stopRecognizeOnceAsyncButton = document.getElementById("stopOpenAICommunication");
const listeningStatus = document.getElementById("listeningStatus");
const speakingStatus = document.getElementById("speakingStatus");
const phraseDiv = document.getElementById("phraseDiv");
let AZURE_SPEECH_KEY, AZURE_SPEECH_REGION;
let recognizer, synthesizer;
let conversation = [
  { "role": "system", "content": "你的名字是灵犀，你在打电话，你的目标是让我开心起来" },
  { "role": "user", "content": "你在和我打电话,要求回复在15字以内" },
  { "role": "assistant", "content": "好的" }
];

async function fetchAzureKeys() {
  const response = await fetch('/azure-keys');
  const azureKeys = await response.json();
  AZURE_SPEECH_KEY = azureKeys.AZURE_SPEECH_KEY;
  AZURE_SPEECH_REGION = azureKeys.AZURE_SPEECH_REGION;

  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
  speechConfig.speechRecognitionLanguage = "zh-CN";
  speechConfig.speechSynthesisVoiceName = "zh-CN-YunxiNeural";

  const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
  recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
  synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig);
}

async function speechToText() {
  listeningStatus.textContent = "聆听中...";
  // phraseDiv.innerHTML += "Listening..." + "\n";

  recognizer.recognizeOnceAsync(
    async function (result) {
      listeningStatus.textContent = "";
      phraseDiv.innerHTML += "User: " + result.text + "\n";

      let userMessage = { "role": "user", "content": result.text || '' };
      conversation.push(userMessage);

      // phraseDiv.innerHTML += "Speaking..." + "\n";
      speakingStatus.textContent = "讲话中...";

      const openAIResponse = await openAIAPIRequest(conversation);
      speakingStatus.textContent = "";

      phraseDiv.innerHTML += "AI: " + openAIResponse.message + "\n";
      let aiMessage = { "role": "assistant", "content": openAIResponse.message };
      conversation.push(aiMessage);

      if (stopRecognizeOnceAsyncButton.disabled == false) {
        await textToSpeech(openAIResponse.message);
      };
    },
    function (err) {
      phraseDiv.innerHTML += "Error: " + err + "\n";
      window.console.log(err);

      recognizer.close();
    }
  );
}

async function textToSpeech(inputText) {
  synthesizer.speakTextAsync(
    inputText,
    function (result) {
    },
    function (err) {
      phraseDiv.innerHTML += "Error: ";
      phraseDiv.innerHTML += err;
      phraseDiv.innerHTML += "\n";
      window.console.log(err);

      synthesizer.close();
    });
  await speechToText();
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
