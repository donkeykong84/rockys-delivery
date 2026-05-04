// rk-chat.jsx — Supabase-backed staff chat. Real-time across all devices.

const STAFF_CHAT = {
  _SEED: [
    { id: 1, from: 'stock', name: 'Mara (Stock)', text: 'Morning all. Lurpak landed, two cases.', t: '08:14' },
    { id: 2, from: 'picker', name: 'Theo (Picker)', text: 'Got it. Shelf 3 is half-empty though.', t: '08:16' },
    { id: 3, from: 'stock', name: 'Mara (Stock)', text: 'Refilling now.', t: '08:17' },
    { id: 4, from: 'driver', name: 'Sam (Driver)', text: 'Heading in for 9. Two drops queued from yesterday.', t: '08:21' },
    { id: 5, from: 'picker', name: 'Theo (Picker)', text: 'Anyone seen the digestives delivery? Shelf is bare.', t: '08:42' },
    { id: 6, from: 'stock', name: 'Mara (Stock)', text: 'Coming on the 11am van.', t: '08:43' },
  ],
  _msgs: null,
  _subs: new Set(),
  _channel: null,
  _seeded: false,

  async _init() {
    if (this._seeded) return;
    this._seeded = true;
    const { data } = await _SB.from('chat_messages').select('*').order('id', { ascending: true }).limit(200);
    if (data && data.length > 0) {
      this._msgs = data.map(r => ({ id: r.id, from: r.from_role, name: r.from_name, text: r.text, t: r.t }));
    } else {
      // Seed initial messages
      const rows = this._SEED.map(m => ({ from_role: m.from, from_name: m.name, text: m.text, t: m.t }));
      const { data: inserted } = await _SB.from('chat_messages').insert(rows).select();
      this._msgs = (inserted || this._SEED).map(r => ({ id: r.id, from: r.from_role || r.from, name: r.from_name || r.name, text: r.text, t: r.t }));
    }
    this._notify();
    this._startRealtime();
  },

  _startRealtime() {
    if (this._channel) return;
    this._channel = _SB.channel('chat-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        const r = payload.new;
        const msg = { id: r.id, from: r.from_role, name: r.from_name, text: r.text, t: r.t };
        if (!this._msgs) this._msgs = [];
        if (!this._msgs.find(m => m.id === msg.id)) {
          this._msgs.push(msg);
          if (this._msgs.length > 200) this._msgs = this._msgs.slice(-200);
          this._notify();
        }
      })
      .subscribe();
  },

  _notify() { this._subs.forEach(fn => fn(this._msgs || [])); },

  get messages() { return this._msgs || this._SEED.slice(); },

  async send(from, name, text) {
    const t = new Date().toTimeString().slice(0, 5);
    await _SB.from('chat_messages').insert({ from_role: from, from_name: name, text, t });
  },

  subscribe(fn) {
    this._subs.add(fn);
    this._init();
    fn(this.messages);
    return () => this._subs.delete(fn);
  },
};
window.STAFF_CHAT = STAFF_CHAT;

function ChatBubble({ role }) {
  const [open, setOpen] = React.useState(false);
  const [msgs, setMsgs] = React.useState(() => STAFF_CHAT.messages);
  const [draft, setDraft] = React.useState('');
  const [seen, setSeen] = React.useState(msgs.length);
  const scrollRef = React.useRef(null);

  React.useEffect(() => STAFF_CHAT.subscribe(setMsgs), []);
  React.useEffect(() => {
    if (open && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    if (open) setSeen(msgs.length);
  }, [open, msgs.length]);

  const me = { stock: 'Mara (Stock)', picker: 'Theo (Picker)', driver: 'Sam (Driver)' }[role] || role;
  const send = () => { if (draft.trim()) { STAFF_CHAT.send(role, me, draft.trim()); setDraft(''); } };
  const unread = msgs.length - seen;

  return (
    <div style={{ position: 'absolute', right: 14, bottom: 14, zIndex: 1000 }}>
      {!open && (
        <button onClick={() => setOpen(true)}
          style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--ink)', color: 'var(--paper)', border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', fontFamily: 'DM Serif Display', fontSize: 22 }}>
          ✉
          {unread > 0 && <span style={{ position: 'absolute', top: -2, right: -2, background: 'var(--persimmon)', color: '#fff', borderRadius: '50%', width: 22, height: 22, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Geist', fontWeight: 600 }}>{unread}</span>}
        </button>
      )}
      {open && (
        <div style={{ width: 280, height: 380, background: 'var(--paper)', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--paper-3)' }}>
          <div style={{ padding: '10px 12px', background: 'var(--ink)', color: 'var(--paper)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'DM Serif Display', fontSize: 14 }}>Staff chat</div>
              <div style={{ fontSize: 9, opacity: 0.6, letterSpacing: '0.1em' }}>STOCK · PICKER · DRIVER</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'transparent', color: 'var(--paper)', border: 'none', fontSize: 18, cursor: 'pointer' }}>×</button>
          </div>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', fontSize: 12 }}>
            {msgs.map(m => {
              const mine = m.from === role;
              const color = { stock: '#4a5436', picker: '#c4541d', driver: '#5b2a3a' }[m.from] || '#1d1a14';
              return (
                <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                  <div style={{ maxWidth: '78%', background: mine ? 'var(--ink)' : 'var(--paper-2)', color: mine ? 'var(--paper)' : 'var(--ink)', padding: '6px 10px', borderRadius: 10, fontFamily: 'Geist' }}>
                    {!mine && <div style={{ fontSize: 9, color, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 2 }}>{m.name}</div>}
                    <div>{m.text}</div>
                    <div style={{ fontSize: 9, opacity: 0.5, marginTop: 2, textAlign: 'right' }}>{m.t}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ padding: 8, borderTop: '1px solid var(--paper-3)', display: 'flex', gap: 6 }}>
            <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Message staff…"
              style={{ flex: 1, padding: '8px 10px', border: '1px solid var(--paper-3)', borderRadius: 6, fontFamily: 'Geist', fontSize: 12, background: 'var(--paper)' }}/>
            <button onClick={send} style={{ padding: '0 14px', background: 'var(--persimmon)', color: '#fff8ec', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
window.ChatBubble = ChatBubble;
