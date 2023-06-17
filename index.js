require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const say = require("say");
const path = require("path");
const generateZoomSignature = require("./utils/createSignature");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/zoom.html", function (req, res) {
  res.sendFile(__dirname + "/zoom.html");
});

app.get("/signature", function (req, res) {
  console.log("entered signature controller");
  const { meetingNumber } = req.query;
  console.log(`MEEINTG NUMBER :${meetingNumber}`);
  const signature = generateZoomSignature(
    process.env.API_KEY,
    process.env.API_SECRET,
    meetingNumber,
    0
  );
  return res.json({
    signature: signature,
  });
  
});

app.get("/credentials", async function (req, res) {
  console.log("entered fetch credentials api");
  const { meetLink } = req.query;
  const leaveUrl = process.env.LEAVE_URL;
  const userName = process.env.USER_NAME;
  const sdkKey = process.env.API_KEY;
  const regexPattern =
    "zoom\\.us/(?:j/|my/)?(\\d+)(?:\\?pwd=([a-zA-Z0-9_-]+))?";
  const regex = new RegExp(regexPattern);
  const match = meetLink.match(regex);
  const meetingNumber = match[1];
  const passWord = match[2];
  res.status(200).json({
    leaveUrl: leaveUrl,
    userName: userName,
    sdkKey: sdkKey,
    meetingNumber: meetingNumber,
    passWord: passWord,
  });
});

app.get("/completions2", async function (req, res) {
  //for a dummy response
  res.status(200).json({
    message:
      "responseChat is being generated by dummy api okay long text format is provided!",
  });
});

app.get("/completions", async function (req, res) {
  //for gpt response
  console.log("ENTERED COMPLETIONS ENDPOINT");
  const { message } = req.query;
  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: message }],
    max_tokens: 25,
  });
  const responseChat = chatCompletion.data.choices[0].message.content;
  console.log(`RESPONSE CHAT :${responseChat}`);
  res.status(200).json({
    message: responseChat,
  });
});

app.post("/textToSpeech", async function (req, res) {
  console.log("Entered text to speech api");
  let { payload } = req.query;
  say.speak(payload, null, 1.0, (err) => {
    if (err) {
      return console.error(err);
    }
    console.log("Text has been spoken.");
    res.status(200).json({});
  });
});

app.listen(4000, function () {
  console.log("Server started on port 4000");
});
