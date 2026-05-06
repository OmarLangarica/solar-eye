import fetch from 'node-fetch';

const url = 'http://localhost:3001/api/ia/analizar-recibo';
const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEA9Sm4qAAAAABJRU5ErkJggg==';

(async () => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imagen: base64 })
    });
    console.log('status', res.status);
    const text = await res.text();
    console.log(text);
  } catch (err) {
    console.error(err);
  }
})();