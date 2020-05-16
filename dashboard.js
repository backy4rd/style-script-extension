import { getStorage, setStorage } from './storage.js'

const css = document.querySelector('.css');
const js = document.querySelector('.js');
const match = document.querySelector('.match');
const title = document.querySelector('.title');
const code = document.querySelector('.code');

const current = { type: null, title: null };
let storage;


function renderFileTree() {
  [...document.querySelectorAll('.css li')].forEach((ele) => ele.remove());
  [...document.querySelectorAll('.js li')].forEach((ele) => ele.remove());

  storage.data.css.forEach((style) => {
    const ele = document.createElement('li');
    ele.innerHTML = style.title;
    ele.classList.add('list-group-item', 'list-group-item-action');
    css.append(ele);

    ele.onclick = () => {
      current.type = 'css';
      current.title = style.title;

      title.value = style.title;
      code.value = style.content;
      match.value = style.match;

      if (document.querySelector('ul li.active')) {
        document.querySelector('ul li.active').classList.remove('active');
      }
      ele.classList.add('active');
    };
  });

  storage.data.js.forEach((script) => {
    const ele = document.createElement('li');
    ele.innerHTML = script.title;
    ele.classList.add('list-group-item', 'list-group-item-action');
    js.append(ele);

    ele.onclick = () => {
      current.type = 'js';
      current.title = script.title;

      title.value = script.title;
      code.value = script.content;
      match.value = script.match;

      if (document.querySelector('ul li.active')) {
        document.querySelector('ul li.active').classList.remove('active');
      }
      ele.classList.add('active');
    };
  });
}

async function save(type, desTitle) {
  if (type !== 'css' && type !== 'js') {
    throw 'unknown type';
  }
  const isConflict = storage.data[type].find((item) => item.title === title.value);
  if (isConflict && desTitle !== title.value) {
    return alert('conflict title');
  }
  const ele = storage.data[type].find((item) => item.title === desTitle);

  ele.title = title.value;
  ele.match = match.value;
  ele.content = code.value;

  current.type = type;
  current.title = title.value;
  await setStorage(storage);
  renderFileTree();
}

function del(type, title) {
  const target = storage.data[type].find((ele) => ele.title === title);

  if (target) {
    storage.data[type].splice(storage.data[type].indexOf(target), 1);
  }
}

document.querySelector('.save').addEventListener('click', () => {
  save(current.type, current.title);
});

document.querySelector('.delete').addEventListener('click', async () => {
  if (!confirm('are you sure to delete this file!!!')) return;

  del(current.type, current.title);
  await setStorage(storage)
  renderFileTree();
});

document.querySelector('.add-css').addEventListener('click', () => {
  storage.data.css.push({
    title: Math.random(),
    match: '',
    content: '',
    enable: true,
  });
  renderFileTree();
});

document.querySelector('.add-js').addEventListener('click', () => {
  storage.data.js.push({
    title: Math.random(),
    match: '',
    content: '',
    enable: true,
  });
  renderFileTree();
});

[...document.getElementsByTagName('textarea')].forEach((textarea) => {
  textarea.addEventListener('keydown', function (event) {
    if (event.keyCode == 9 || event.which == 9) {
      event.preventDefault();
      var start = this.selectionStart;
      this.value =
        this.value.substring(0, this.selectionStart) +
        '    ' +
        this.value.substring(this.selectionEnd);
      this.selectionEnd = start + 4;
    }
  });
});

(async () => {
  storage = await getStorage();

  renderFileTree();
})();
