const MODS = ['vpuka', 'lzyad', 'inight', 'ghaada', 'botrix', 'kldai', 'ib3b3', 'ahadi'];
const H = { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' };

async function kick(path) {
  try {
    const r = await fetch('https://kick.com/api/v2/' + path, { headers: H });
    return r.ok ? await r.json() : null;
  } catch (e) { return null; }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
  const out = { kick: null, twitch: null, x: null, live: false, mods: [], vod: null };

  const [main, vids, ...mods] = await Promise.all([
    kick('channels/n7lh'),
    kick('channels/n7lh/videos'),
    ...MODS.map((s) => kick('channels/' + s))
  ]);

  if (main) {
    out.kick = main.followers_count ?? null;
    out.live = !!main.livestream;
  }
  mods.forEach((j, i) => {
    if (!j) return;
    out.mods.push({
      s: MODS[i],
      f: j.followers_count ?? null,
      pic: (j.user && j.user.profile_pic) || null,
      ban: (j.banner_image && j.banner_image.url) || null
    });
  });
  try {
    const v = Array.isArray(vids) ? vids[0] : null;
    if (v) {
      const l = v.livestream || {};
      out.vod = {
        title: l.session_title || v.title || null,
        views: v.views ?? (v.video && v.video.views) ?? null,
        dur: l.duration || null,
        thumb: (l.thumbnail && (l.thumbnail.src || l.thumbnail)) || null
      };
    }
  } catch (e) {}

  try {
    const r = await fetch('https://decapi.me/twitch/followcount/n7ih');
    const t = (await r.text()).trim();
    if (/^\d+$/.test(t)) out.twitch = Number(t);
  } catch (e) {}

  res.status(200).json(out);
}
