chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason == 'install') {
    const meta = {
      data: {
        css: [],
        js: [],
      },
    };

    chrome.storage.local.set(meta);
  } else if (details.reason == 'update') {
    //call a function to handle an update
  }
});

// set notification color
chrome.browserAction.setBadgeBackgroundColor({ color: [90, 90, 90, 255] });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type == 'token' && !request.data.error) {
    chrome.storage.sync.set(request.data);
    return;
  }

  if (request.type == 'script-count' && !request.data.error) {
    chrome.browserAction.setBadgeText({ text: request.data.count.toString() });

    return;
  }

  sendResponse('ok');
});

// send request to active tab to receive scriptCount
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.sendMessage(activeInfo.tabId, {
    type: 'give me script count',
    data: null,
  });
});
