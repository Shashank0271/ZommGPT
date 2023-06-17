import { speechToText } from "./speechToText.js";

document.addEventListener("DOMContentLoaded", async function () {
  const baseUrl = "zomm-gpt.vercel.app/";
  const meetLink = localStorage.getItem("meetingLink");
  ZoomMtg.setZoomJSLib("https://source.zoom.us/2.13.0/lib", "/av");
  // loads WebAssembly assets
  ZoomMtg.preLoadWasm();
  ZoomMtg.prepareWebSDK();
  // loads language files, also passes any error messages to the ui
  ZoomMtg.i18n.load("en-US");
  ZoomMtg.i18n.reload("en-US");


  //console.log("added above creds");
  const apiResponse = await fetch(
    `zomm-gpt.vercel.app/credentials?meetLink=${meetLink}`,
    {
      method: "GET",
    }
  );
  const jsonCredentials = await apiResponse.json();
  const { meetingNumber, passWord, leaveUrl, sdkKey, userName } =
    jsonCredentials;

  //meeting number and passWord are generated on creating
  //a new meeting
  //meeting number is required for getting the signature
  //passWord is required for joining the meeting

  const response = await fetch(
    `zomm-gpt.vercel.app/signature?meetingNumber=${meetingNumber}`,
    {
      method: "get",
    }
  );
  const jsonResponse = await response.json();
  const { signature } = jsonResponse;

  ZoomMtg.init({
    leaveUrl: leaveUrl,
    disablePreview: true, // Disable the video preview screen
    success: async (success) => {
      ZoomMtg.join({
        sdkKey: sdkKey,
        signature: signature, // role in SDK signature needs to be 0
        meetingNumber: meetingNumber,
        passWord: passWord,
        userName: userName,
        success: (success) => {
          speechToText();
          console.log(success);
        },
        error: (error) => {
          console.log(error);
        },
      });
    },
    error: (error) => {
      console.log(error);
    },
  });
});
