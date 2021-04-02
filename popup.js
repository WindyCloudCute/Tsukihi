// Use of this source code is governed by a license that can be
// found in the LICENSE file.

'use strict';

// Ask background.js about the state of this tab, and update popup accordingly.
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  chrome.runtime.sendMessage({ type: "getTabInfo", tab: tabs[0] }, (response) => updatePopup(response));
});

// Add a listener to receive dynamic updates from background.js
chrome.runtime.onMessage.addListener((request, s, c) => {

  if (request.type == "updateFromBackground") {
    updatePopup(request.data);
  }
});

// Hook up buttons
document.getElementById('downloadUrl').onclick = () =>
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.runtime.sendMessage({ type: "downloadUrl", tab: tabs[0] });
  });

document.getElementById('downloadLeft').onclick = () =>
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    chrome.runtime.sendMessage({ type: "batchDownload", tabs: getLeftSideTags(tabs) });
  });

document.getElementById('downloadRight').onclick = () =>
  chrome.tabs.query({ currentWindow: true }, function (tabs) {
    chrome.runtime.sendMessage({ type: "batchDownload", tabs: getRightSideTags(tabs) });
  });

document.getElementById('openSettings').onclick = () => chrome.runtime.openOptionsPage();

document.getElementById('recheckTab').onclick = () =>
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.runtime.sendMessage({ type: "recheckTab", tab: tabs[0] });
  });

// Wow actual logic
function updatePopup(dataFromBackground) {

  console.log("Received data from background.js: " + JSON.stringify(dataFromBackground));
  document.getElementById('statusMsg').style = "color:black"
  document.getElementById('downloadUrl').disabled = false;

  try {
    switch (dataFromBackground.status) {
      case "downloaded":
        document.getElementById('statusIcon').textContent = "✅";
        document.getElementById('statusMsg').textContent = " saved to your LRR server!";
        document.getElementById('statusMsg').style = "color:green"
        document.getElementById('downloadUrl').disabled = true;
        document.getElementById('statusDetail').textContent = `(id: ${dataFromBackground.arcId})`;
        break;
      case "downloading":
        document.getElementById('statusIcon').textContent = "🔜";
        document.getElementById('statusMsg').textContent = " being downloaded...";
        document.getElementById('statusMsg').style = "color:blue"
        document.getElementById('statusDetail').textContent = `(job: #${dataFromBackground.jobId})`;
        break;
      case "checking":
        document.getElementById('statusIcon').textContent = "⌛";
        document.getElementById('statusMsg').textContent = " being checked...";
        document.getElementById('statusMsg').style = "color:orange"
        document.getElementById('statusDetail').textContent = `(Please wait warmly.)`;
        break;
      case "other":
        document.getElementById('statusIcon').textContent = "⁉";
        document.getElementById('statusMsg').textContent = "... just a tab.";
        document.getElementById('statusDetail').textContent = `(${dataFromBackground.message})`;
        break;
      case "error":
        document.getElementById('statusIcon').textContent = "❌";
        document.getElementById('statusMsg').textContent = " not okay.";
        document.getElementById('statusMsg').style = "color:red"
        document.getElementById('statusDetail').textContent = `(Error: ${dataFromBackground.message})`;
        break;
      default:
        document.getElementById('statusIcon').textContent = "👻";
        document.getElementById('statusMsg').textContent = " a mystery.";
        document.getElementById('statusDetail').textContent = `(Unknown status message ${dataFromBackground.status})`;
    }
  } catch (e) {
    console.log(e);
    document.getElementById('statusIcon').textContent = "👻";
    document.getElementById('statusMsg').textContent = " a mystery.";
    document.getElementById('statusDetail').textContent = `(${e})`;
  }
}

function getLeftSideTags(tabs) {
  var filtered_tabs = [];
  var activeIndex = -1;

  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].active) {
      activeIndex = tabs[i].index;
      break;
    }
  }

  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].index < activeIndex) {
      filtered_tabs.push(tabs[i]);
    }
  }

  return filtered_tabs;
}

function getRightSideTags(tabs) {
  var filtered_tabs = [];
  var activeIndex = -1;

  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].active) {
      activeIndex = tabs[i].index;
      break;
    }
  }

  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].index > activeIndex) {
      filtered_tabs.push(tabs[i]);
    }
  }

  return filtered_tabs;
}