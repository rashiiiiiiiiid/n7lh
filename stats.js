export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  const out = { kick: null, twitch: null, x: null, live: false };
  try {
    const r = await fetch('https://kick.com/api/v2/channels/n7lh', {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' }
    });
    if (r.ok) {
      const j = await r.json();
      out.kick = j.followers_count ?? null;
      out.live = !!j.livestream;
    }
  } catch (e) {}
  try {
    const r = await fetch('https://decapi.me/twitch/followcount/n7ih');
    const t = (await r.text()).trim();
    if (/^\d+$/.test(t)) out.twitch = Number(t);
  } catch (e) {}
  res.status(200).json(out);
}
