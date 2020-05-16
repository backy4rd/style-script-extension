chrome.runtime.onInstalled.addListener(function (details) {
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

chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.type !== "token") return;
    if (request.data.error) return;

    chrome.storage.sync.set(request.data);
});