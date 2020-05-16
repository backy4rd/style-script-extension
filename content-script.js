function getStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(null, (data) => {
      resolve(data);
    });
  });
}

(async () => {
  const storage = await getStorage();
  const url = location.href;

  const onDocumentStart = [];
  const onDocumentReady = [];

  storage.data.js.forEach((script) => {
    const regex = /\/\/\s+@run-at\s+document-start\b/;

    if (regex.test(script.content)) {
      onDocumentStart.push(script);
    } else {
      onDocumentReady.push(script);
    }
  });

  window.onload = function () {
    onDocumentReady.forEach((script) => {
      if (!script.match) return;
      const regex = new RegExp(script.match);
      if (regex.test(url) && script.enable) {
        const scriptTag = document.createElement('script');
        scriptTag.innerHTML = script.content;
        document.body.append(scriptTag);
      }
    });
  };

  onDocumentStart.forEach((script) => {
    if (!script.match) return;
    const regex = new RegExp(script.match);
    if (regex.test(url) && script.enable) {
      const scriptTag = document.createElement('script');
      scriptTag.innerHTML = script.content;
      document.querySelector('html').append(scriptTag);
      console.log(script)
    }
  });

  storage.data.css.forEach((style) => {
    if (!style.match) return;
    const regex = new RegExp(style.match);
    if (regex.test(url) && style.enable) {
      const styleTag = document.createElement('style');
      styleTag.innerHTML = style.content;
      document.querySelector('html').append(styleTag);
    }
  });
})();
