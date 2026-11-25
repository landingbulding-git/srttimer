// Password gate. Set APP_PASSWORD in Vercel (Project → Settings → Environment Variables).
const enc = new TextEncoder();
const hash = async (s) =>
  [...new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode('srt-timer:' + s)))]
    .map((b) => b.toString(16).padStart(2, '0')).join('');

const page = (msg = '') => new Response(
  `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>Sign in</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0c0e;color:#e8e8e8;font:15px Inter,system-ui,sans-serif}
form{display:grid;gap:12px;width:260px}input,button{padding:10px 12px;border-radius:8px;border:1px solid #333;background:#16181c;color:inherit;font:inherit}
button{background:#2dd4bf;color:#04201c;border:0;font-weight:600;cursor:pointer}p{margin:0;color:#f87171;min-height:1em}</style>
<form method=post><input type=password name=password placeholder=Password autofocus required><button>Enter</button><p>${msg}</p></form>`,
  { status: msg ? 401 : 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });

export default async function middleware(request) {
  const pw = process.env.APP_PASSWORD;
  if (!pw) return new Response('APP_PASSWORD is not set', { status: 500 });
  const token = await hash(pw);
  const cookie = request.headers.get('cookie') || '';
  if (cookie.split(/;\s*/).includes('auth=' + token)) return; // allowed → continue

  if (request.method === 'POST') {
    const given = (await request.formData()).get('password') || '';
    if ((await hash(String(given))) === token) {
      return new Response(null, { status: 303, headers: {
        location: '/', 'set-cookie': `auth=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000` } });
    }
    return page('Wrong password');
  }
  return page();
}

export const config = { matcher: '/((?!_vercel).*)' };
