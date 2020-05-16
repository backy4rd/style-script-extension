const pre = document.querySelector('pre');

const data = JSON.parse(pre.innerHTML);

if (!data.error) {
  chrome.runtime.sendMessage({ type: 'token', data: data });

  document.body.innerHTML = `
              <h1>Success! You may now close this tab.</h1>
              <style>
                html, body {
                  background-color: #1a1a1a;
                  color: #c3c3c3;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100%;
                  width: 100%;
                  margin: 0;
                }
              </style>
        `;
}
