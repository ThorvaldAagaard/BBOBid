function initBBOalertIframe(onLoad) {
  if (document.getElementById("MV2scripts") != null) return;
  var MV2scripts = document.createElement("div");
  MV2scripts.id = 'MV2scripts';
  MV2scripts.style.display = 'none';
  document.body.appendChild(MV2scripts);
  $('#MV2scripts-iframe').remove();
  ifrm = document.createElement("iframe");
  ifrm.allow = "clipboard-read; clipboard-write";
  ifrm.sandbox = 'allow-scripts allow-same-origin allow-modals';
  ifrm.id = 'MV2scripts-iframe';
  ifrm.onload = onLoad;;
  var version = chrome.runtime.getManifest().name + ' ' + chrome.runtime.getManifest().version;
  ifrm.srcdoc = `<html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <meta http-equiv="Content-Security-Policy" content="img-src * data: ; media-src * data: ;
        default-src *; font-src * data: 'self' 'unsafe-inline' 'unsafe-eval';
        style-src * 'self' 'unsafe-inline' 'unsafe-eval'; 
        script-src * 'self' 'unsafe-inline' 'unsafe-eval';
        connect-src * ws: wss: ;">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
      <title>` + version + `</title>
  </head>
  
  <body>
      <script>
          window.addEventListener('message', event => {
              const mainWindow = event.source;
              var data = event.data;
              var msg = data.msg;
              var script = data.script;
              console.log("data.id     = " + data.id);
              console.log("data.script = " + data.script);
              var R;
              try {
                  R = "";
                  eval(script);
              } catch (err) {
                  R = "Error" + err;
              }
              data.result = R;
              console.log("result = " + R);
              mainWindow.postMessage(data, event.origin);
          });  
      </script>
  </body>
  
  </html>`;
  MV2scripts.appendChild(ifrm);
  messageQueue = new Map();
  waitForEvent = (element, type) => new Promise(r => element.addEventListener(type, r));
  window.addEventListener('message', process_message);
}

function addIframeScript(script) {
  url = chrome.runtime.getURL(script);
  $.get(url, function (data) {
    console.log("adding script : " + script);
    execIframeMessage("$('body').append($('<script id=\"" + script + "\">').html(msg));", data, null);
  });
}

function process_message(event) {
  var fn = messageQueue.get(event.data.id);
  if ((typeof fn) == "function") fn(event.data);
  messageQueue.delete(event.data.id);
}

function execIframeMessage(script, msg, clback) {
  var ifrm = document.getElementById("MV2scripts-iframe");
  if (ifrm == null) return;
  data = {};
  data.id = generateId();
  data.script = script;
  data.msg = msg;
  messageQueue.set(data.id, clback);
  ifrm.contentWindow.postMessage(data, "*");
}

async function execIframeMessageAndWait(script, msg, clback) {
  var ifrm = document.getElementById("MV2scripts-iframe");
  if (ifrm == null) return;
  data = {};
  data.id = generateId();
  data.script = script;
  data.msg = msg;
  messageQueue.set(data.id, clback);
  ifrm.contentWindow.postMessage(data, "*");
  e = await waitForEvent(window, "message");
  console.log("Done " + e.data);
}

function getEvalResult(data) {
  console.log("Final Result  = " + data.result);
  return data.result;
}

function dec2hex(dec) {
  return dec.toString(16).padStart(2, "0");
}

function generateId(len) {
  var arr = new Uint8Array((len || 40) / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, dec2hex).join('');
}

