/* ───────── اتاق صوتی کلاس گروهی از راه دور (تا ۵ نفر) ─────────
   هر نفر از گوشی خودش وارد می‌شود؛ همه صدای هم را مستقیم می‌شنوند (WebRTC، اتصال مستقیم گوشی‌ها).
   میزبان معلم زنده را روشن می‌کند: صدای همهٔ بچه‌ها به معلم می‌رسد و صدای معلم برای همه پخش می‌شود.
   سیگنال‌دهی از کانال Realtime سوپابیس است؛ صدا مستقیم بین گوشی‌هاست و از سرور رد نمی‌شود. */
const VR_MAX = 5;
const VR_ICE = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] },
  { urls: ['turn:openrelay.metered.ca:80', 'turn:openrelay.metered.ca:443', 'turns:openrelay.metered.ca:443?transport=tcp'], username: 'openrelayproject', credential: 'openrelayproject' }];
const VR = window.VR = { on: false, host: false, code: '', id: '', name: '', ch: null, mic: null, peers: {}, members: {}, tTrack: null, ctx0: null, listeners: [], muted: false };
const vrId = () => Math.random().toString(36).slice(2, 10);
const vrCode = () => Array.from({ length: 5 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 31)]).join('');
function vrEmit(ev) { VR.listeners.forEach(f => { try { f(ev); } catch (e) { console.warn(e); } }); }
function vrSend(msg) { try { VR.ch?.send({ type: 'broadcast', event: 'm', payload: { ...msg, from: VR.id } }); } catch { } }
/* ترک صدای معلم (فقط میزبان): اول یک ترک ساکت، وقتی کلاس شروع شد با صدای واقعی معلم جایگزین می‌شود */
function vrSilentTrack() { if (!VR.ctx0) { const C = window.AudioContext || window.webkitAudioContext; VR.ctx0 = new C(); } const d = VR.ctx0.createMediaStreamDestination(); return d.stream.getAudioTracks()[0]; }
function vrSetTeacherTrack(track) { VR.tTrack = track || vrSilentTrack(); Object.values(VR.peers).forEach(p => { try { p.tSender?.replaceTrack(VR.tTrack); } catch { } }); }
function vrRemoteStreams() { return Object.values(VR.peers).map(p => p.stream).filter(Boolean); }
function vrPeer(pid, initiator) {
  if (VR.peers[pid]) return VR.peers[pid];
  const pc = new RTCPeerConnection({ iceServers: VR_ICE }); const P = VR.peers[pid] = { pc, stream: null, el: null, pend: [], t0: Date.now() };
  VR.mic.getAudioTracks().forEach(t => pc.addTrack(t, VR.mic));
  if (VR.host) { const ts = new MediaStream([VR.tTrack || (VR.tTrack = vrSilentTrack())]); P.tSender = pc.addTrack(VR.tTrack, ts); }
  pc.onicecandidate = e => { if (e.candidate) vrSend({ k: 'ice', to: pid, c: e.candidate.toJSON() }); };
  pc.ontrack = e => { const s = e.streams[0] || new MediaStream([e.track]);
    if (e.track.kind !== 'audio') return; let a = document.createElement('audio'); a.autoplay = true; a.playsInline = true; a.srcObject = s; a.dataset.pid = pid; document.body.appendChild(a); a.play().catch(() => { });
    (P.els = P.els || []).push(a);
    // برای میزبان: صدای میکروفون هر دانش‌آموز (اولین جریانش) به معلم داده می‌شود
    if (!P.stream) P.stream = s;
    vrEmit({ t: 'remote', pid, stream: s }); };
  pc.onconnectionstatechange = () => { vrEmit({ t: 'state', pid, s: pc.connectionState }); if (['failed', 'closed'].includes(pc.connectionState)) vrDrop(pid); };
  if (initiator) (async () => { try { const o = await pc.createOffer(); await pc.setLocalDescription(o); vrSend({ k: 'sdp', to: pid, d: pc.localDescription.toJSON() }); } catch (e) { console.warn(e); } })();
  return P;
}
function vrDrop(pid) { const P = VR.peers[pid]; if (!P) return; try { P.pc.close(); } catch { } (P.els || []).forEach(a => a.remove()); delete VR.peers[pid]; vrEmit({ t: 'left', pid }); }
async function vrOnSignal(m) {
  if (m.to && m.to !== VR.id) return;
  if (m.k === 'hello') { if (VR.id < m.from) { if (VR.peers[m.from]) vrDrop(m.from); vrPeer(m.from, true); } return; }
  if (m.k === 'sdp') { if (m.d.type === 'offer' && VR.peers[m.from]?.pc.remoteDescription) vrDrop(m.from); const P = vrPeer(m.from, false); const pc = P.pc;
    try { await pc.setRemoteDescription(m.d); for (const c of P.pend) await pc.addIceCandidate(c).catch(() => { }); P.pend = [];
      if (m.d.type === 'offer') { const a = await pc.createAnswer(); await pc.setLocalDescription(a); vrSend({ k: 'sdp', to: m.from, d: pc.localDescription.toJSON() }); } } catch (e) { console.warn('sdp', e); } return; }
  if (m.k === 'ice') { const P = VR.peers[m.from]; if (!P) return; if (P.pc.remoteDescription) P.pc.addIceCandidate(m.c).catch(() => { }); else P.pend.push(m.c); return; }
  vrEmit({ t: 'msg', m });
}
/* هر چند ثانیه: اتصال‌های قطع/گیرکرده را دوباره می‌سازد (کسی که شناسهٔ کوچک‌تر دارد پیشنهاد می‌دهد) */
function vrSync() { if (!VR.on) return; const now = Date.now(); const M = VR.members;
  Object.keys(M).filter(k => k !== VR.id).forEach(k => { const P = VR.peers[k]; const st = P?.pc.connectionState; const stuck = P && st !== 'connected' && now - P.t0 > 9000;
    if (VR.id < k) { if (!P || st === 'failed' || st === 'closed' || stuck) { if (P) vrDrop(k); vrPeer(k, true); } }
    else if ((!P || stuck) && now - (VR.helloAt?.[k] || 0) > 8000) { (VR.helloAt = VR.helloAt || {})[k] = now; if (P && stuck) vrDrop(k); vrSend({ k: 'hello', to: k }); } });
  Object.keys(VR.peers).forEach(k => { const P = VR.peers[k]; if (!M[k]) { P.goneAt = P.goneAt || now; if (now - P.goneAt > 6000) vrDrop(k); } else P.goneAt = 0; }); }
async function vrJoin(code, host) {
  if (VR.on) await vrLeave();
  const c = typeof sb === 'function' ? sb() : null; if (!c) { toast('برای کلاس از راه دور اینترنت (و در ایران فیلترشکن) لازم است.'); return false; }
  try { VR.mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); }
  catch { toast('اجازهٔ میکروفون داده نشده.'); return false; }
  Object.assign(VR, { on: true, host: !!host, code: code.toUpperCase(), id: vrId(), name: (typeof callMe === 'function' ? callMe() : '') || me().name, peers: {}, members: {}, muted: false });
  const ch = VR.ch = c.channel('vroom:' + VR.code, { config: { broadcast: { self: false }, presence: { key: VR.id } } });
  ch.on('broadcast', { event: 'm' }, ({ payload }) => vrOnSignal(payload));
  ch.on('presence', { event: 'sync' }, () => { const st = ch.presenceState(); const M = {}; Object.entries(st).forEach(([k, v]) => { M[k] = v[0]; }); VR.members = M;
    const ids = Object.keys(M).sort();
    if (ids.length > VR_MAX && ids.indexOf(VR.id) >= VR_MAX) { toast(`کلاس پر است (حداکثر ${faNum(VR_MAX)} نفر).`); vrLeave(); return; }
    vrSync(); vrEmit({ t: 'members', M }); });
  return await new Promise(res => { let done = false; const tm = setTimeout(() => { if (!done) { done = true; toast('به اتاق وصل نشد؛ اینترنت/فیلترشکن را بررسی کن.'); vrLeave(); res(false); } }, 12000);
    ch.subscribe(async st => { if (st === 'SUBSCRIBED' && !done) { done = true; clearTimeout(tm); await ch.track({ name: VR.name, host: VR.host, at: Date.now() }); clearInterval(VR.syncT); VR.syncT = setInterval(vrSync, 4000); res(true); } }); });
}
async function vrLeave() { if (!VR.on) return; VR.on = false; clearInterval(VR.syncT); Object.keys(VR.peers).forEach(vrDrop); try { VR.mic?.getTracks().forEach(t => t.stop()); } catch { } try { await VR.ch?.untrack(); VR.ch?.unsubscribe(); } catch { } VR.ch = null; VR.members = {}; vrEmit({ t: 'members', M: {} }); }
function vrMute(on) { VR.muted = on; VR.mic?.getAudioTracks().forEach(t => t.enabled = !on); }
addEventListener('beforeunload', () => { if (VR.on) vrLeave(); });
