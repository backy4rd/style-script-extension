export function getStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(null, data => {
      resolve(data);
    });
  });
}

export function setStorage(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, resolve);
  });
}

export function getSyncStorage(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(null, data => {
      resolve(data);
    });
  });
}

