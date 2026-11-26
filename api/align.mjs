// "Fit with AI": forwards the audio and lyrics to ElevenLabs forced alignment.
// Behind the password gate in middleware.js. Set ELEVENLABS_API_KEY in Vercel.
const fail = (status, error) => Response.json({ error }, { status });

export default {
  async fetch(request) {
    if (request.method !== 'POST') return fail(405, 'Use POST');
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) return fail(500, 'ELEVENLABS_API_KEY is not set in Vercel');
    let form;
    try { form = await request.formData(); } catch { return fail(400, 'Could not read the upload'); }
    const file = form.get('file'), text = form.get('text');
    if (!file || typeof file === 'string' || !text) return fail(400, 'Audio file and text are required');

    const body = new FormData();
    body.append('file', file, file.name || 'audio.mp3');
    body.append('text', text);
    const res = await fetch('https://api.elevenlabs.io/v1/forced-alignment', {
      method: 'POST', headers: { 'xi-api-key': key }, body,
    });
    if (!res.ok) return fail(502, `ElevenLabs error ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const { words } = await res.json();
    return Response.json({ words: words.map(({ text, start, end }) => ({ text, start, end })) });
  },
};
