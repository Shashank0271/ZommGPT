export function speechToText() {
  let isTextToSpeechPlaying = false;
  if (
    "SpeechRecognition" in window ||
    "webkitSpeechRecognition" in window
  ) {
    console.log("SPEECH RECOGNITION IS SUPPORTED");
    window.SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new window.SpeechRecognition();
    recognition.lang = "en-US"; // Set the language for speech recognition
    recognition.continuous = true; // Enable continuous speech recognition

    recognition.onstart = function () {
      console.log("Speech recognition started");
    };

    recognition.onresult = async function (event) {
      //stop listening
      if (isTextToSpeechPlaying) {
        console.log("RETURN AS TTS IS PLAYING RN! ");
        return;
      }

      const numberOfResults = event.results.length;
      /*
        note : event.results gives us a list of SpeechRecognitionResult objects
        that means that events.results[0] is an obj
        and events.results[0][0] indicates the first hypothesis of this object
        to access the last result we use numberOfResults-1
      */
      const transcript = event.results[numberOfResults - 1][0].transcript;

      console.log(`TRANSCRIPT : ${transcript}`);

      const apiResponse = await fetch(`completions?message=${transcript}`);
      const responseObject = await apiResponse.json();
      const gptResponse = responseObject.message;

      console.log(`GPT RESPONSE : ${gptResponse}`);

      isTextToSpeechPlaying = true;

      const msg = new SpeechSynthesisUtterance();
      msg.text = gptResponse;
      msg.onend = function () {
        //we have to add a delay because the onresult function captures the spken words again
        //it immediately fires after we return from the api call and captures the last spoken
        //input again , and the bot gets stuck in an infinite loop replying to its own messages
        //(as console.log("RETURN AS TTS IS PLAYING RN! "); is being executed after every api response)
        //so after one input ouput cycle there has to be a gap of 4 seconds before the next one
        setTimeout(() => {
          isTextToSpeechPlaying = false;
        }, 4000);
      };
      speechSynthesis.speak(msg);
    };

    recognition.onend = function () {
      console.log("ended speech recognition");
      if (!isTextToSpeechPlaying) {
        setTimeout(() => {
          recognition.start();
        }, 1000);
      } else {
        //we cannot control when this function is being fired , the browser by default closes
        //speech recognition so we need to programatically start it again
        //in cases where text to speech is going on and the onend event is called
        //if we start the recognition again it will listen to its own output : hence 4sec delay
        //and if its not going on and we start it immediately it is still capturing the last input :hence 1 sec delay
        console.log("ENDED BEFORE THE TEXT TO SPEECH ENDS!");
        setTimeout(() => {
          recognition.start();
        }, 4000); // Adjust the delay as needed
      }
    };

    recognition.start();
  } else {
    console.log("SPEECH RECOGNITION IS NOT SUPPORTED");
  }
}
