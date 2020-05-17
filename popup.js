import { getStorage, getSyncStorage, setStorage } from './storage.js';

const css = document.querySelector('.css');
const js = document.querySelector('.js');
const backupBtn = document.querySelector('.backup');
const syncBtn = document.querySelector('.sync');
const dashboardBtn = document.querySelector('.dashboard');

let storage;

function render() {
  storage.data.css.forEach((style) => {
    const li = document.createElement('li');

    const title = document.createElement('span');
    title.innerHTML = style.title;

    const enable = document.createElement('input');
    enable.setAttribute('type', 'checkbox');
    if (style.enable) {
      enable.checked = true;
    } else {
      enable.checked = false;
    }

    enable.onchange = () => {
      if (enable.checked) {
        style.enable = true;
      } else {
        style.enable = false;
      }
      setStorage(storage);
    };

    li.append(enable, title);
    css.append(li);
  });

  storage.data.js.forEach((script) => {
    const li = document.createElement('li');

    const title = document.createElement('span');
    title.innerHTML = script.title;

    const enable = document.createElement('input');
    enable.setAttribute('type', 'checkbox');
    if (script.enable) {
      enable.checked = true;
    } else {
      enable.checked = false;
    }

    enable.onchange = () => {
      if (enable.checked) {
        script.enable = true;
      } else {
        script.enable = false;
      }
      setStorage(storage);
    };

    li.append(enable, title);
    js.append(li);
  });
}

function openOAuthTab() {
  chrome.tabs.create({ url: 'https://style-script.herokuapp.com/oauth' });
}

async function getGists() {
  const { access_token, token_type, scope } = await getSyncStorage();

  // handle invalid token
  if (!access_token) throw new Error('unauthorized');
  if (!/gist/.test(scope)) throw new Error('unauthorized');

  const response = await fetch('https://api.github.com/gists', {
    headers: {
      Authorization: `${token_type} ${access_token}`,
    },
  });

  // handle invalid token
  if (response.status !== 200) {
    throw new Error('unauthorized');
  }

  return response.json();
}

backupBtn.addEventListener('click', async () => {
  const { access_token, token_type, scope } = await getSyncStorage();

  let gists;
  try {
    gists = await getGists();
  } catch (err) {
    return openOAuthTab();
  }

  const syncGist = gists.find(
    (gist) => gist.description === 'Style Script Sync Gist',
  );

  if (syncGist) {
    if (!confirm('old backup will be replaced, are you sure to backup!!!!')) {
      return;
    }

    // update exist gist
    const option = {
      method: 'PATCH',
      headers: {
        Authorization: `${token_type} ${access_token}`,
      },
      body: JSON.stringify({
        description: 'Style Script Sync Gist',
        files: {
          'storage.json': {
            content: JSON.stringify(await getStorage()),
          },
        },
      }),
    };

    const response = await fetch(
      `https://api.github.com/gists/${syncGist.id}`,
      option,
    );
    const json = await response.json();
    console.log(json);
    console.log(await getStorage());

    if (response.status === 200) {
      alert('backup success');
    } else {
      alert('backup fail');
      console.log(json);
    }
  } else {
    // create 'Style Script Sync Gist' gist
    const option = {
      method: 'POST',
      headers: {
        Authorization: `${token_type} ${access_token}`,
      },
      body: JSON.stringify({
        description: 'Style Script Sync Gist',
        files: {
          'storage.json': {
            content: JSON.stringify(await getStorage()),
          },
        },
      }),
    };
    const response = await fetch('https://api.github.com/gists', option);
    const json = await response.json();

    if (response.status === 201) {
      alert('backup success');
    } else {
      alert('backup fail');
      console.log(json);
    }
  }
});

syncBtn.addEventListener('click', async () => {
  let gists;
  try {
    gists = await getGists();
  } catch (err) {
    return openOAuthTab();
  }

  const syncGist = gists.find(
    (gist) => gist.description === 'Style Script Sync Gist',
  );

  console.log(syncGist);
  if (!syncGist) {
    return alert('not have any backup');
  }

  if (
    !confirm(
      'all current style and script will be deleted, are you sure to retrieve backup!!!!',
    )
  ) {
    return;
  }

  // backup from gist
  const response = await fetch(syncGist.files['storage.json'].raw_url);
  const json = await response.json();

  console.log(json);

  if (response.status !== 200) {
    return alert('sync fail');
  }
  if (json.error) {
    return alert('sync fail');
  }

  await setStorage(json);
  alert('sync success');
});

dashboardBtn.addEventListener('click', () => {
  const url = chrome.runtime.getURL('dashboard.html');
  window.open(url, '_blank');
});

(async () => {
  storage = await getStorage();
  render();
})();
