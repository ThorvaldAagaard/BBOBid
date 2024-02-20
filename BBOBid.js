var lastDealNumber = '';
var table = "no";
var SystemID = null;
var bidCtx = "-1";
var haveCards = false;
var direction;

var lastHandDisplayed = "";
var currentHand = "";


function isSuggestBidLoaded() {
	return (document.getElementById("bbobid-tab") != null);
}

// Find the bidding box element and check if new data present 
function setBiddingBoxAutoBid() {
	//console.log("setBiddingBoxAutoBid- Start " + getNowAutoBid(true))
	table = tableType();
	//console.log("Table type: " + table);
	if (table == "practice" || table == "game") {
		if (!isSuggestBidLoaded()) {
			setPanelAutoBid();
			setControlButtonsAutoBid();
			// complete initial setup
			SystemID = localStorage.getItem('SuggestBid');
			//console.log(SystemID);
			if (SystemID != null) {
				autoBidLog(version + "<br>ID= " + SystemID);

			} else {
				autoBidLog(version);
			}
			showSystems();
			setTabEvents();
			//			if (isBBOready()) {
			//				setControlButtonsAutoBid();
			//			}
			console.log("Who Am I: " + whoAmI());
			lastHandDisplayed = "";
			currentHand = "";
		}
		var ad = document.getElementById("bbo_ad1");
		if (ad != null) ad.remove();
		ad = document.getElementById("bbo_ad2");
		if (ad != null) ad.remove();
		openTabAutoBid();
		var elBiddingBox = document.querySelector(".biddingBoxClass");
		//console.log("BiddingBox=" + (elBiddingBox != null))
		if (elBiddingBox != null) {
			var elBiddingButtons = elBiddingBox.querySelectorAll(".biddingBoxButtonClass");
			if (elBiddingButtons != null) {
				haveCards = DisplayHand();
//				debugger;
				if (haveCards && elBiddingBox.style.display != "none" && IsMyTurn()) {
					var elAlertExplain = getExplainInput();
					if (elAlertExplain != null) {
						elAlertExplain.maxLength = 59;
					};
					getPossibleBids();
					//console.log(elAlertExplain)
				}
			}
		}
	} else {
		closeTabAutoBid();
	}
	//console.log("setBiddingBoxAutoBid - Exit")
}
function IsMyTurn() {
	var currentContext = getContext();
	var myTurn = findMyTurn();
	//console.log("My turn: " + myTurn + " My Direction: " + myDirection() + " Context: " + currentContext + " Length: " + currentContext.length);
	return 1 + (currentContext.length/2) % 4 == myTurn;
}

function setSelectedIndex(s, valsearch) {
	for (var i = 0; i < s.options.length; i++) {
		if (s.options[i].value == valsearch) {
			s.options[i].selected = true;
			break;
		}
	}
	return;
}

var createCORSRequest = function (method, url) {
	var xhr2 = new XMLHttpRequest();
	if ("withCredentials" in xhr2) {
		// Most browsers.
		xhr2.open(method, url, true);
	} else if (typeof XDomainRequest != "undefined") {
		// IE8 & IE9
		xhr2 = new XDomainRequest();
		xhr2.open(method, url);
	} else {
		// CORS not supported.
		xhr2 = null;
	}
	return xhr2;
};

function getBiddingsystemsAsync() {

	return new Promise(function (resolve, reject) {
		var url = 'https://bidding.snippen.dk/PossibleSystems.asp';
		var method = 'GET';
		var xhr = createCORSRequest(method, url);

		xhr.onload = function () {
			if (this.status >= 200 && this.status < 300) {
				resolve(xhr.responseText);
			} else {
				reject({
					status: this.status,
					statusText: xhr.statusText
				});
			}
		};
		xhr.onerror = function () {
			reject({
				status: this.status,
				statusText: xhr.statusText
			});
		};

		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		xhr.send();
	});
}


function getBidsAsync(biddingCtx) {
	SystemID = localStorage.getItem('SuggestBid');
	if (SystemID == null) {
		return "System not selected";
	}
	return new Promise(function (resolve, reject) {
		var url =
			"https://bidding.snippen.dk/PossibleBids.asp" +
			//"https://remote.aalborgdata.dk/hint" +
			"?ctx=" + biddingCtx +
			"&ID=" + SystemID +
			"&vul=" + ourVulnerabilityAutoBid() + areTheyVulnerableAutoBid() +
			"&hand=" + currentHand;
		console.log("Requesting " + url + " for context=", biddingCtx)
	
 		var method = 'GET';
		var xhr = createCORSRequest(method, url);

		xhr.onload = function () {
			if (this.status >= 200 && this.status < 300) {
				console.log(xhr.responseText);
				resolve(xhr.responseText);
			} else {
				const errorDetails = {
					status: this.status,
					statusText: xhr.statusText,
					response: xhr.responseText, // Include the response for better debugging
					url: xhr.responseURL, // Include the URL that caused the error
				};
		
				console.error('Request failed:', errorDetails);
				reject(errorDetails);
			}
		};
		
		xhr.onerror = function () {
			const errorDetails = {
				status: this.status,
				statusText: xhr.statusText,
				response: xhr.responseText, // Include the response for better debugging
				url: xhr.responseURL, // Include the URL that caused the error
			};
		
			console.error('Network error:', errorDetails);
			reject(errorDetails);
		};
		
		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		xhr.send();
	});
}

function tableType() {
	var nd = getNavDiv();
	if (nd == null) {
		return 'no';
	}
	var bs = nd.querySelectorAll('bridge-screen');
	if (bs == null || bs.length == 0) {
		return 'no';
	}
	// get score panel
	var sp = document.querySelector('.scorePanelClass');
	// if no score panel element -> no table
	//if (sp == null) return 'no';
	// if score panel not displayed -> practice table
	if ((sp == null) || (sp.style.display == 'none')) return 'practice';
	// if score panel displayed -> game table
	return 'game';
}

// Display available bids
function showBids(biddingCtx) {
	//return;
	console.log("showBids");
	getBidsAsync(biddingCtx).then((resp) => {
		//addLog("Context: " + biddingCtx)
		//addLog("Response: " + resp)
		autoBidLog("Context: " + biddingCtx)
		var s1 = document.getElementById('bbobid-p1');
		if (s1 == null) return;
		s1.innerHTML += resp + "<br>";

        //const jsonResponse = JSON.parse(resp);
		//autoBidLog(jsonResponse.bid);
		//var bid = jsonResponse.bid.replace('PASS','P');
		//console.log("Making bid: " + bid)
		// makeBid = "Makebid('"+bid+"',0,'')"
		// var newScript = document.createElement("script");
		// var inlineScript = document.createTextNode(resp);
		// newScript.appendChild(inlineScript);
		// document.body.appendChild(newScript);
	}
	)
}

function loadScript() {
	var newScript = document.createElement("script");
	//var inlineScript = document.createTextNode("function systemChange(selectObj) {	var idx = selectObj.selectedIndex;	SystemID = selectObj.options[idx].value; localStorage.setItem('SuggestBid', SystemID); alert('1');}");
	newScript.text = "function systemChange(selectObj) { var idx = selectObj.selectedIndex; SystemID = selectObj.options[idx].value; localStorage.setItem('SuggestBid', SystemID);  };\n"
	//newScript.text += "function Makebid(bid) { alert(bid) };\n" 
	newScript.text += "function triggerMouseEvent(node, eventType) {\n"
	newScript.text += "		var clickEvent = document.createEvent('MouseEvents');\n"
	newScript.text += "		clickEvent.initEvent(eventType, true, true);\n"
	newScript.text += "		node.dispatchEvent(clickEvent);\n"
	newScript.text += "}\n"
	newScript.text += "function Makebid(bid, artificial, explain) {\n"
	newScript.text += "var elBiddingBox = document.querySelector('.biddingBoxClass');"
	newScript.text += "if (elBiddingBox != null) {"
	newScript.text += "var elBiddingButtons = elBiddingBox.querySelectorAll('.biddingBoxButtonClass');\n"
	newScript.text += "var alertField = elBiddingBox.querySelector('.mat-form-field-infix').querySelector('input');\n"
	newScript.text += "alertField.value = unescape(explain);\n"
	newScript.text += "var eventInput = new Event('input');\n"
	newScript.text += "alertField.dispatchEvent(eventInput);\n"
	newScript.text += "if (elBiddingButtons != null) {\n"
	newScript.text += "if ( elBiddingBox.style.display != 'none') {\n"
	newScript.text += "if (artificial == 1) elBiddingButtons[15].click();\n"
	newScript.text += "if (bid == 'P') triggerMouseEvent (elBiddingButtons[12], 'mousedown');\n"
	newScript.text += "if (bid == 'P') elBiddingButtons[12].click();\n"
	newScript.text += "if (bid == 'X') triggerMouseEvent (elBiddingButtons[13], 'mousedown');\n"
	newScript.text += "if (bid == 'X') elBiddingButtons[13].click();\n"
	newScript.text += "if (bid == 'XX') triggerMouseEvent (elBiddingButtons[14], 'mousedown');\n"
	newScript.text += "if (bid == 'XX') elBiddingButtons[14].click();\n"
	newScript.text += "if (bid[0] == '1') elBiddingButtons[0].click();\n"
	newScript.text += "if (bid[0] == '2') elBiddingButtons[1].click();\n"
	newScript.text += "if (bid[0] == '3') elBiddingButtons[2].click();\n"
	newScript.text += "if (bid[0] == '4') elBiddingButtons[3].click();\n"
	newScript.text += "if (bid[0] == '5') elBiddingButtons[4].click();\n"
	newScript.text += "if (bid[0] == '6') elBiddingButtons[5].click();\n"
	newScript.text += "if (bid[0] == '7') elBiddingButtons[6].click();\n"
	newScript.text += "if (bid[1] == 'C') triggerMouseEvent (elBiddingButtons[7], 'mousedown');\n"
	newScript.text += "if (bid[1] == 'C') elBiddingButtons[7].click();\n"
	newScript.text += "if (bid[1] == 'D') triggerMouseEvent (elBiddingButtons[8], 'mousedown');\n"
	newScript.text += "if (bid[1] == 'D') elBiddingButtons[8].click();\n"
	newScript.text += "if (bid[1] == 'H') triggerMouseEvent (elBiddingButtons[9], 'mousedown');\n"
	newScript.text += "if (bid[1] == 'H') elBiddingButtons[9].click();\n"
	newScript.text += "if (bid[1] == 'S') triggerMouseEvent (elBiddingButtons[10], 'mousedown');\n"
	newScript.text += "if (bid[1] == 'S') elBiddingButtons[10].click();\n"
	newScript.text += "if (bid[1] == 'N') triggerMouseEvent (elBiddingButtons[11], 'mousedown');\n"
	newScript.text += "if (bid[1] == 'N') elBiddingButtons[11].click();\n"
	newScript.text += "}\n"
	newScript.text += "}\n"
	newScript.text += "}};\n"
	//console.log(newScript.text)
	document.getElementsByTagName('head')[0].appendChild(newScript);
}

loadScript();

// Display available bids
function showSystems() {
	console.log("showSystems");
	getBiddingsystemsAsync().then((resp) => {
		addLog("Response: " + resp)
		var s1 = document.getElementById('bbobid-s1');
		if (s1 == null) return;
		s1.innerHTML += resp + "<br>";
		if ((document.getElementById("systems") != null) && (SystemID != null)) {
			setSelectedIndex(document.getElementById("systems"), SystemID);
		}
	})

}

function getPossibleBids() {
	DisplayHand();
	var thisCtx = getContext();
	if (bidCtx != thisCtx) {
		bidCtx = thisCtx;
		clearAutoBidLog();
		autoBidLog("Your turn:" + thisCtx);
		showBids(thisCtx);
	}
}

function suggestBid() {
	bidCtx = "";
	lastHandDisplayed = "";
	lastDealNumber = '';
	currentHand = "";
	DisplayHand();
	var thisCtx = getContext();
	bidCtx = thisCtx;
	clearAutoBidLog();
	autoBidLog("Your turn:" + thisCtx);
	showBids(thisCtx);
}

function suggestSystem() {
	bidCtx = "";
	lastHandDisplayed = "";
	lastDealNumber = '';
	currentHand = "";
	showSystems();
}

function setControlButtonEventsAutoBid() {
	var b = document.querySelector('#bbobid-b1');
	if (b != null)
		if (b.onmousedown == null) b.onmousedown = suggestBid;
	var b = document.querySelector('#bbobid-h1');
	if (b != null)
		if (b.onmousedown == null) b.onmousedown = suggestSystem;
}

var count = 0;
var timerId = setInterval(() => {
	//console.log("execution: ", count++, ' Location : ', location.href);
	setBiddingBoxAutoBid()
}, 2000);
