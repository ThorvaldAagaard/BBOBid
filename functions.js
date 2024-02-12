
var version = 'Suggest Bid: ' + chrome.runtime.getManifest().version;
var logText = version + '\n' + navigator.userAgent + '\n';

function getNavDiv() {
	return document.getElementById('navDiv');
}

function whoAmI() {
	var nb = document.querySelector('.navBarClass');
	if (nb == null) {
		addLog('whoAmI .navBarClass not found');
		return '';
	}
	var nt = document.querySelector('.nameTagClass');
	if (nt == null) {
		addLog('whoAmI .nameTagClass not found');
		return '';
	}
	return (nt.textContent.trim().toLowerCase());
}

function addLog(txt) {
	console.log(txt);
	logText = logText + getNowAutoBid(true) + ',' + txt + '\n';
}

var triggerDragAndDrop = function (selectorDrag, selectorDrop, dist) {

	// function for triggering mouse events
	var fireMouseEvent = function (type, elem, centerX, centerY) {
		var evt = document.createEvent('MouseEvents');
		evt.initMouseEvent(type, true, true, window, 1, 1, 1, centerX, centerY, false, false, false, false, 0, elem);
		elem.dispatchEvent(evt);
	};

	// fetch target elements
	var elemDrag = document.querySelector(selectorDrag);
	var elemDrop = document.querySelector(selectorDrop);
	if (!elemDrag || !elemDrop) return false;

	// calculate positions
	var pos = elemDrag.getBoundingClientRect();
	var center1X = Math.floor((pos.left + pos.right) / 2);
	var center1Y = Math.floor((pos.top + pos.bottom) / 2);
	pos = elemDrop.getBoundingClientRect();
	var center2X = Math.floor((pos.left + pos.right) / 2) + dist;
	var center2Y = Math.floor((pos.top + pos.bottom) / 2);

	// mouse over dragged element and mousedown
	fireMouseEvent('mousemove', elemDrag, center1X, center1Y);
	fireMouseEvent('mouseenter', elemDrag, center1X, center1Y);
	fireMouseEvent('mouseover', elemDrag, center1X, center1Y);
	fireMouseEvent('mousedown', elemDrag, center1X, center1Y);

	// start dragging process over to drop target
	fireMouseEvent('dragstart', elemDrag, center1X, center1Y);
	fireMouseEvent('drag', elemDrag, center1X, center1Y);
	fireMouseEvent('mousemove', elemDrag, center1X, center1Y);
	fireMouseEvent('drag', elemDrag, center2X, center2Y);
	fireMouseEvent('mousemove', elemDrop, center2X, center2Y);

	// trigger dragging process on top of drop target
	fireMouseEvent('mouseenter', elemDrop, center2X, center2Y);
	fireMouseEvent('dragenter', elemDrop, center2X, center2Y);
	fireMouseEvent('mouseover', elemDrop, center2X, center2Y);
	fireMouseEvent('dragover', elemDrop, center2X, center2Y);

	// release dragged element on top of drop target
	fireMouseEvent('drop', elemDrop, center2X, center2Y);
	fireMouseEvent('dragend', elemDrag, center2X, center2Y);
	fireMouseEvent('mouseup', elemDrag, center2X, center2Y);

	return true;
};

function mySeat() {
	var nd
	if ((nd = getNavDiv()) == null) return '';
	var cells = nd.querySelectorAll('.auctionBoxHeaderCellClass');
	if (cells == null) return '';
	if (cells.length != 4) return '';
	return cells[3].innerText.slice(0, 1);
}

function ourVulnerabilityAutoBid() {
	var vultab = ["", "NS", "EW", "NSEW", "NS", "EW", "NSEW", "", "EW", "NSEW", "", "NS", "NSEW", "", "NS", "EW"];
	var sd = getDealNumberAutoBid();
	if (sd == '') return '';
	var nd = parseInt(sd);
	if (isNaN(nd)) return '';
	if (nd < 1) return '';
	nd = (nd - 1) % 16;
	if (vultab[nd].includes(mySeat())) return '@v';
	return '@n';
}

function openTabAutoBid() {
	var vc = document.querySelectorAll('.verticalClass');
	for (var j = 0; j < vc.length; j++) {
		if (vc[j].innerText == "Suggest Bid") {
			if (vc[j].style.display != 'block') {
				vc[j].style.display = 'block';
				console.log("Show BBOAutoBid")
				vc[j].click();
			}
		}
	}
	return true;
}

function closeTabAutoBid() {
	var vc = document.querySelectorAll('.verticalClass');
	for (var j = 0; j < vc.length; j++) {
		if (vc[j].innerText == "Suggest Bid") {
			console.log("Hide BBOAutoBid")
			vc[j].style.display = 'none';
		}
	}
	var bidpanel0 = document.getElementById("bidpanel0");
	if (bidpanel0 == null) return;
	console.log("Closing BBOAutoBid")
	bidpanel0.style.display = 'none';
	return true;
}

function setOptionsOff() {
	setOptions(false);
}

function setTabEvents() {
	console.log("SetTabEvents");
	//debugger;
	var rd = document.getElementById('rightDiv');
	if (rd == null) return;
	var vt = rd.querySelector('.verticalTabBarClass');
	if (vt == null) return;
	var tabs = vt.children;
	if (tabs == null) return;
	if (tabs.length == 0) return;
	for (var i = 0; i < tabs.length; i++) {
		if (tabs[i].textContent.search('Suggest Bid') == -1) {
			if (tabs[i].onmousedown == null) tabs[i].onmousedown = setOptionsOff;
		}
	}
}

function setOptions(on) {
	console.log("setOptions: ", on)
	var bidpanel0 = document.getElementById("bidpanel0");
	if (bidpanel0 == null) return;
	if (on) {
		console.log("Showing bidpanel")
		bidpanel0.style.display = 'block';
		console.log(bidpanel0.style.display);
		if (bidpanel0.getBoundingClientRect().width < 250) {
			console.log("BidPanel width: ", bidpanel0.getBoundingClientRect().width)
			//triggerDragAndDrop('.hDividerClass', '.hDividerClass', (bidpanel0.getBoundingClientRect().width) - 300);
		}
	} else {
		console.log("Hiding bidpanel")
		bidpanel0.style.display = 'none';
	}
	var b = document.getElementById('bbobid-tab');
	if (b == null) return;
	var t = b.querySelector('.verticalClass');
	if (t == null) return;
	if (on) {
		t.style.backgroundColor = "green";
		t.style.color = 'white';
	} else {
		t.style.backgroundColor = "rgb(209, 214, 221)";
		t.style.color = 'black';
	}
}

function toggleOptions() {
	var bidpanel0 = document.getElementById("bidpanel0");
	if (bidpanel0 == null) return;
	if (bidpanel0.style.display == 'none') {
		setOptions(true);
	} else {
		setOptions(false);
	}
}

function addAutoBidTab() {
	console.log("addAutoBidTab")
	//debugger;
	if (document.getElementById('bbobid-tab') != null) return;
	var rd = document.getElementById('rightDiv');
	if (rd == null) return;
	var vt = rd.querySelector('.verticalTabBarClass');
	if (vt == null) return;
	//vt = vt[1];
	let tabs = vt.children;
	if (tabs == null) return;
	if (tabs.length < 2) return;
	let t = tabs[1].cloneNode(true);
	t.querySelector('.verticalClass').textContent = 'Suggest Bid';
	t.id = 'bbobid-tab';
	t.onclick = toggleOptions;
	t.style.color = 'white';
	t.backgroundColor = 'red';
	vt.appendChild(t);
	t = document.getElementById('bbobid-tab');
	t.onclick = toggleOptions;
}

// Check if element is visible
function isVisible(e) {
	if (e == null) return false;
	return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
}

// Get formatted actual date and time
function getNowAutoBid(secs) {
	var now = new Date();
	var yyyy = now.getFullYear().toString();
	var m = now.getMonth() + 1;
	var mm = m.toString();
	if (mm.length == 1) mm = '0' + mm;
	var dd = now.getDate().toString();
	if (dd.length == 1) dd = '0' + dd;
	var hh = now.getHours().toString();
	if (hh.length == 1) hh = '0' + hh;
	var mn = now.getMinutes().toString();
	if (mn.length == 1) mn = '0' + mn;
	if (!secs) return yyyy + mm + dd + "_" + hh + ":" + mn;
	var ss = now.getSeconds().toString();
	if (ss.length == 1) ss = '0' + ss;
	return yyyy + mm + dd + "_" + hh + ":" + mn + ":" + ss;
}

// Strip context from leading passes
function stripContext(ctx) {
	if (ctx.startsWith('------')) return ctx.substr(6);
	if (ctx.startsWith('----')) return ctx.substr(4);
	if (ctx.startsWith('--')) return ctx.substr(2);
	return ctx;
}

function translateCallAutoBid(call) {
	if (call == 'D') return 'Db';
	if (call == 'Dbl') return 'Db';
	if (call == 'Ktr.') return 'Db';
	if (call == 'Ktr') return 'Db';
	if (call == 'ктр') return 'Db';
	if (call == 'X') return 'Db';
	if (call == 'Rktr') return 'Rd';
	if (call == 'рктр') return 'Rd';
	if (call == 'Rdbl') return 'Rd';
	if (call == 'RD') return 'Rd';
	if (call == 'XX') return 'Rd';
	if (call == 'p') return '--';
	if (call == 'P') return '--';
	if (call == 'Pass') return '--';
	if (call == 'Pas') return '--';
	if (call == 'Paso') return '--';
	if (call == 'пас') return '--';
	var el = call;
	if (el.length > 1) {
		el = el.substr(0, 2);
		if (el.charCodeAt(1) == 9827) {
			return el[0] + 'C';
		}
		if (el.charCodeAt(1) == 9830) {
			return el[0] + 'D';
		}
		if (el.charCodeAt(1) == 9829) {
			return el[0] + 'H';
		}
		if (el.charCodeAt(1) == 9824) {
			return el[0] + 'S';
		}
		return el[0] + 'N';
	}
	return el;
}

function getOpeningSeatNr() {
	var c = getContext();
	if (c.startsWith('------')) return '4';
	if (c.startsWith('----')) return '3';
	if (c.startsWith('--')) return '2';
	return '1';
}

// Get actual bidding context
function getContext() {
    let nd;
	if ((nd = getNavDiv()) == null) return '??';
	let ctx = '';
	let bs = nd.querySelector('bridge-screen');
	if (bs == null) {
		return "??";
	}
	let auctionBox = nd.querySelector('auction-box');
	if (auctionBox == null) {
		return "??";
	}	
	let auction = auctionBox.querySelectorAll('.auction-cell');
	if (auction.length == 0) {
		return "";
	}
	for (const element of auction) {
		let el = translateCallAutoBid(element.textContent);
		ctx = ctx + el;
	}
	return ctx;
}

function DisplayHand() {
	var dealNo = getDealNumberAutoBid();
	if (dealNo == null) {
		currentHand = "";
		return false;
	}
	if (dealNo != lastHandDisplayed) {
		var direction = myDirection();
		currentHand = "";
		var nd = document.getElementById('navDiv')
		if (nd == null) return false;
		clearAutoBidLog();
		lastHandDisplayed = getDealNumberAutoBid();
		var bs = nd.querySelectorAll('bridge-screen');
		if (bs == null) return false;
		var hands = bs[0].querySelectorAll('.handDiagramPanelClass');
		if (hands == null) return false;
		for (var k = 0; k < 4; k++) {
			var suit = "";
			for (var i = 7; i > 3; i--) {
				for (var j = 0; j < hands[k].children[i].children.length; j++) {
					suit += hands[k].children[i].children[j].innerText[1];
				}
				suit += "_";
			}
			//autoBidLog(suit);
			//console.log(suit);
			if (k == 0 && direction == "S") {
				currentHand = suit;
			}
			if (k == 1 && direction == "W") {
				currentHand = suit;
			}
			if (k == 2 && direction == "N") {
				currentHand = suit;
			}
			if (k == 3 && direction == "E") {
				currentHand = suit;
			}
		}
	}
	return true;
}

function areTheyVulnerableAutoBid() {
	var nd
	if ((nd = getNavDiv()) == null) return '';
	var cells = nd.querySelectorAll('.auctionBoxHeaderCellClass');
	if (cells == null) return '';
	if (cells.length != 4) return '';
	if (cells[2].style.backgroundColor == "rgb(255, 255, 255)") return '@N';
	return '@V';
}

function getDealNumberAutoBid() {
	var nd
	if ((nd = getNavDiv()) == null) return null;
	var vpi = nd.querySelector('.vulPanelInnerPanelClass');
	if (vpi == null) return null;
	if (!isVisible(vpi)) return null;
	return vpi.textContent.trim();
}

function findMyTurn() {
	var nd, myTurn
	if ((nd = getNavDiv()) == null) return null;
	var vpi = nd.querySelector('.vulPanelDealerClass');
	if (vpi == null) return null;
	//console.log("Width: " + parseInt(vpi.style.width) + " Height: " + vpi.style.height + " Left: " + vpi.style.left + " Top: " + vpi.style.top);
	//console.log("areWeOpening: " & parseInt(vpi.style.width) > parseInt(vpi.style.height));
	if (!isVisible(vpi)) return null;
	if (parseInt(vpi.style.width) > parseInt(vpi.style.height)) { 
		if (parseInt(vpi.style.top) == 0) {
			myTurn = 3;
		} else {
			myTurn = 1;
		}
	} 
	else {
		if (parseInt(vpi.style.left) == 0) {
			myTurn = 4;
		} else {
			myTurn = 2;
		}
	}
	//console.log("MyTurn = " + myTurn);
	return myTurn;
}

function getBiddingBoxAutoBid() {
	var nd
	if ((nd = getNavDiv()) == null) return null;
	return nd.querySelector(".biddingBoxClass");
}

function isSplitScreen() {
	var nb = document.querySelector('.navBarClass');
	return isVisible(nb);
}

function isBBOready() {
	return (isVisible(document.querySelector('.infoStat')));
}

function setControlButtonsAutoBid() {
	console.log("setControlButtonsAutoBid")
	//var bar = document.querySelector('.moreMenuDivClass');
	var adPanel = document.getElementById("bidpanel");
	//if (bar == null) return false;
	//if (!isVisible(bar)) return false;
	addAutoBidTab();
	if (adPanel.querySelector('#bbobid-s1') == null) {
		var s1 = document.createElement("p");
		s1.textContent = "";
		s1.style.fontSize = "16px";
		s1.id = 'bbobid-s1';
		adPanel.appendChild(s1);
	}
	if (adPanel.querySelector('#bbobid-b1') == null) {
		var b3 = document.createElement("button");
		b3.textContent = "Suggest a bid";
		b3.id = 'bbobid-b1';
		b3.style.fontSize = "22px";
		b3.style.width = '100%';
		adPanel.appendChild(b3);
	}
	if (adPanel.querySelector('#bbobid-h1') == null) {
		var b4 = document.createElement("button");
		b4.textContent = "Get systems";
		b4.id = 'bbobid-h1';
		b4.style.fontSize = "22px";
		b4.style.width = '100%';
		adPanel.appendChild(b4);
	}
	if (adPanel.querySelector('#bbobid-p1') == null) {
		var p1 = document.createElement("p");
		p1.textContent = "";
		p1.id = 'bbobid-p1';
		adPanel.appendChild(p1);
	}
	setControlButtonEventsAutoBid();
}

function autoBidLog(txt) {
	//console.log(txt);
	var p1 = document.getElementById('bbobid-p1');
	if (p1 == null) return;
	p1.innerHTML += txt + "<br>";
}

function clearAutoBidLog() {
	//console.log(txt);
	var p1 = document.getElementById('bbobid-p1');
	if (p1 == null) return;
	p1.innerHTML = "";
}

function setPanelAutoBid() {
	if (document.getElementById("bidpanel") != null) return;
	var appPanel = document.getElementById("rightDiv");
	if (appPanel == null) return;
	var bidpanel0 = document.createElement("div");
	bidpanel0.id = 'bidpanel0';
	bidpanel0.style.position = 'absolute';
	bidpanel0.style.top = '0px';
	bidpanel0.style.left = '0px';
	bidpanel0.style.backgroundColor = 'grey';
	bidpanel0.style.zIndex = "5000";
	bidpanel0.style.display = 'none';
	bidpanel0.style.height = '100%';
	bidpanel0.style.right = '35px';
	appPanel.appendChild(bidpanel0);

	var adPanel1 = document.createElement("div");
	adPanel1.setAttribute('class', 'center');
	adPanel1.style.position = 'absolute';
	adPanel1.id = "bidpanel";
	adPanel1.style.overflow = "hidden auto";

	bidpanel0.appendChild(adPanel1);
}


// For each group of options, select only the first one
function initOptionDefaultsAutoBid() {
	console.log("initOptionDefaults")
	var adPanel = document.getElementById("bidpanel");
	if (adPanel == null) return;
	var oldPrefix = "";
	var btns = adPanel.querySelectorAll('button');
	if (btns == null) return;
	for (var i = 0; i < btns.length; i++) {
		if (btns[i].style.display == 'none') continue;
		btns[i].optionSelected = true;
		btns[i].optionValid = true;
		var txt = btns[i].textContent;
		var txt1 = txt.split(" ");
		if (txt1[0] == oldPrefix) btns[i].optionSelected = false;
		oldPrefix = txt1[0];
	}
}

function myDirection() {
	if ((nd = getNavDiv()) == null) return '';
	var cs = nd.querySelector('.coverClass');
	if (cs == null) return '';
	var nd = cs.querySelectorAll('.nameDisplayClass');
	if (nd == null) return '';
	if (nd.length != 4) return '';
	var dc = cs.querySelectorAll('.directionClass');
	if (dc == null) return '';
	if (dc.length != 4) return '';
	var me = whoAmI();
	//debugger;
	if (me == '') return '';
	for (var i = 0; i < 4; i++) {
		//console.log(nd[i].textContent.trim().toLowerCase());
		if (nd[i].textContent.trim().toLowerCase() == me) {
			return dc[i].textContent.trim();
		}
	} {
		addLog(me + ' seat not found');
		return '';
	}
}

function getExplainInput() {
	var bbox = getBiddingBoxAutoBid();
	if (bbox == null) return null;
	if (!isVisible(bbox)) return null;
	return bbox.querySelector(".mat-form-field-infix").querySelector('input');
}

function setExplainText(txt) {
	var elAlertExplain = getExplainInput();
	if (elAlertExplain == null) return;
	elAlertExplain.value = txt;
	var eventInput = new Event('input');
	elAlertExplain.dispatchEvent(eventInput);
};
