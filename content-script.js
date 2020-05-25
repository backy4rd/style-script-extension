let scriptInfo = {
  titles: [],
  count: 0,
};

function getStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(null, data => {
      resolve(data);
    });
  });
}

// trigger when switch tab, open popup
// send scriptCount to background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'give me script count') {
    chrome.runtime.sendMessage({ type: 'script-count', data: scriptInfo });
  }

  // sendResponse('ok')
});

(async () => {
  const storage = await getStorage();
  const url = location.href;

  const onDocumentStart = [];
  const onDocumentReady = [];

  // specify execute timẹ
  storage.data.js.forEach(script => {
    const regex = /\/\/\s+@run-at\s+document-start\b/;

    if (regex.test(script.content)) {
      onDocumentStart.push(script);
    } else {
      onDocumentReady.push(script);
    }
  });

  onDocumentStart.forEach(script => {
    if (!script.match) return;
    const regex = new RegExp(script.match);
    if (regex.test(url) && script.enable) {
      const scriptTag = document.createElement('script');
      scriptTag.innerHTML = script.content;
      document.querySelector('html').append(scriptTag);
      scriptInfo.count++;
      scriptInfo.titles.push(script.title);
    }
  });

  window.onload = function () {
    onDocumentReady.forEach(script => {
      if (!script.match) return;
      const regex = new RegExp(script.match);
      if (regex.test(url) && script.enable) {
        const scriptTag = document.createElement('script');
        scriptTag.innerHTML = script.content;
        document.body.append(scriptTag);
        scriptInfo.count++;
        scriptInfo.titles.push(script.title);
      }
    });

    // send message to background.js to change badge
    chrome.runtime.sendMessage({ type: 'script-count', data: scriptInfo });
  };

  storage.data.css.forEach(style => {
    if (!style.match) return;
    const regex = new RegExp(style.match);
    if (regex.test(url) && style.enable) {
      const styleTag = document.createElement('style');
      styleTag.innerHTML = style.content;
      document.querySelector('html').append(styleTag);
    }
  });
})();
