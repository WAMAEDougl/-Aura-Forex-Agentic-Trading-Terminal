import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
 
/* ─────────────────────────────────────────────
   GLOBAL STYLES (injected once)
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');
 
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
 
  :root {
    --bg:        #0A0D16;
    --surface:   #141824;
    --border:    rgba(139,92,246,0.18);
    --border-hi: rgba(139,92,246,0.32);
    --text:      #F5F6FA;
    --muted:     #9CA3AF;
    --accent:    #A78BFA;
    --accent2:   #F472B6;
    --green:     #34D399;
    --blue:      #60A5FA;
    --orange:    #FBBF24;
    --mono:      'JetBrains Mono', monospace;
    --sans:      'Syne', sans-serif;
    --radius:    14px;
    --glow:      0 0 24px rgba(167,139,250,0.3);
  }
 
  body { background: var(--bg); color: var(--text); font-family: var(--mono); }
 
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border-hi); border-radius: 2px; }
 
  input, button, textarea { font-family: inherit; outline: none; }
 
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes ripple {
    from { transform: scale(0.8); opacity: 0.6; }
    to   { transform: scale(1.6); opacity: 0; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
 
  .msg-appear { animation: fadeUp 0.22s ease both; }
  .user-appear { animation: slideIn 0.2s ease both; }
 
  .room-btn {
    all: unset;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 13px;
    color: var(--text);
    transition: background 0.15s, color 0.15s;
    font-family: var(--mono);
    opacity: 0.7;
  }
  .room-btn:hover { background: rgba(255,255,255,0.06); opacity: 1; }
  .room-btn.active { background: rgba(167,139,250,0.2); color: var(--accent); border: 1px solid rgba(167,139,250,0.4); opacity: 1; }
 
  .icon-btn {
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px; height: 34px;
    border-radius: 8px;
    cursor: pointer;
    color: var(--muted);
    transition: background 0.15s, color 0.15s;
  }
  .icon-btn:hover { background: rgba(139,92,246,0.12); color: var(--text); }
  .icon-btn:active { background: rgba(139,92,246,0.2); }
 
  .send-btn {
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 20px;
    height: 44px;
    border-radius: 11px;
    background: var(--accent);
    color: #fff;
    font-family: var(--sans);
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
    gap: 6px;
    flex-shrink: 0;
  }
  .send-btn:hover { opacity: 0.88; }
  .send-btn:active { transform: scale(0.97); }
  .send-btn:disabled { background: rgba(255,255,255,0.06); color: var(--muted); cursor: not-allowed; transform: none; }
 
  .msg-bubble {
    display: inline-block;
    padding: 10px 15px;
    border-radius: 4px 14px 14px 14px;
    font-size: 13.5px;
    line-height: 1.65;
    color: var(--text);
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    max-width: 100%;
    word-break: break-word;
    white-space: pre-wrap;
  }
  .msg-bubble.own {
    border-radius: 14px 4px 14px 14px;
    background: linear-gradient(135deg, rgba(167,139,250,0.25), rgba(244,114,182,0.18));
    border-color: rgba(167,139,250,0.45);
  }
 
  .typing-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--muted);
    animation: pulse 1.2s ease infinite;
  }
 
  .reaction-btn {
    all: unset;
    font-size: 15px;
    cursor: pointer;
    padding: 2px 5px;
    border-radius: 6px;
    transition: background 0.12s, transform 0.1s;
  }
  .reaction-btn:hover { background: rgba(139,92,246,0.15); transform: scale(1.2); }
 
  .login-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 16px;
    color: var(--text);
    font-size: 14px;
    font-family: var(--mono);
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .login-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }
  .login-input::placeholder { color: var(--muted); }
 
  .chat-input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text);
    font-size: 13.5px;
    font-family: var(--mono);
    resize: none;
    padding: 12px 0;
    line-height: 1.5;
    min-height: 44px;
    max-height: 120px;
  }
  .chat-input::placeholder { color: var(--muted); }
 
  .tooltip {
    position: relative;
  }
  .tooltip::after {
    content: attr(data-tip);
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    background: #1E1F2E;
    border: 1px solid var(--border-hi);
    color: var(--text);
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 6px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s;
  }
  .tooltip:hover::after { opacity: 1; }
 
  .unread-badge {
    font-size: 10px;
    padding: 1px 5px;
    border-radius: 20px;
    background: var(--accent2);
    color: #fff;
    font-family: var(--sans);
    font-weight: 700;
    line-height: 1.4;
  }
`;
 
/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
const ROOMS = [
  { id: 'general', icon: '💬', label: 'general' },
  { id: 'tech', icon: '⚙️', label: 'tech' },
  { id: 'random', icon: '🎲', label: 'random' },
  { id: 'design', icon: '🎨', label: 'design' },
  { id: 'gaming', icon: '🎮', label: 'gaming' },
];
 
const REACTIONS = ['👍', '❤️', '😂', '🔥', '🎉', '👀'];
 
const COLORS = [
  '#A78BFA', '#F472B6', '#34D399', '#FBBF24',
  '#60A5FA', '#FB923C', '#C084FC', '#2DD4BF',
];
 
interface Message {
  id: string;
  user: string;
  message: string;
  timestamp: number;
  room: string;
  reactions?: Record<string, string[]>; // emoji -> usernames
  replyTo?: { id: string; user: string; text: string };
  edited?: boolean;
}
 
interface User {
  id: string;
  username: string;
  room: string;
  color: string;
}
 
/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function pickColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}
 
function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
 
function fmtDate(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
 
function Avatar({ name, size = 34 }: { name: string; size?: number }) {
  const color = pickColor(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color + '28',
      border: `1.5px solid ${color}60`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color,
      flexShrink: 0, fontFamily: 'var(--sans)',
    }}>
      {name[0]?.toUpperCase()}
    </div>
  );
}
 
/* ─────────────────────────────────────────────
   LOGIN SCREEN
───────────────────────────────────────────── */
function LoginScreen({ onConnect }: { onConnect: (u: string, r: string) => void }) {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('general');
 
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 24,
      background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(167,139,250,0.18) 0%, transparent 60%), var(--bg)',
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(17,18,24,0.9)',
        border: '1px solid var(--border-hi)',
        borderRadius: 20,
        padding: '44px 40px',
        backdropFilter: 'blur(20px)',
        animation: 'fadeUp 0.4s ease',
      }}>
        {/* Logo mark */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, marginBottom: 20,
          }}>💬</div>
          <h1 style={{
            fontFamily: 'var(--sans)', fontWeight: 800,
            fontSize: 28, color: 'var(--text)', letterSpacing: -0.5,
          }}>Join the chat</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, fontFamily: 'var(--mono)' }}>
            real-time · encrypted · ephemeral
          </p>
        </div>
 
        <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
          Display name
        </label>
        <input
          className="login-input"
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && username.trim() && onConnect(username.trim(), room)}
          placeholder="what should we call you?"
          style={{ marginBottom: 24 }}
          autoFocus
        />
 
        <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
          Pick a room
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
          {ROOMS.map(r => (
            <button
              key={r.id}
              onClick={() => setRoom(r.id)}
              style={{
                all: 'unset', cursor: 'pointer',
                padding: '8px 14px', borderRadius: 10,
                fontSize: 13, fontFamily: 'var(--mono)',
                background: room === r.id ? 'rgba(167,139,250,0.22)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${room === r.id ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: room === r.id ? 'var(--accent)' : 'var(--text)',
                transition: 'all 0.15s',
                display: 'flex', gap: 6, alignItems: 'center',
              }}
            >
              {r.icon} #{r.label}
            </button>
          ))}
        </div>
 
        <button
          className="send-btn"
          onClick={() => username.trim() && onConnect(username.trim(), room)}
          disabled={!username.trim()}
          style={{ width: '100%', height: 48, fontSize: 14 }}
        >
          Enter room →
        </button>
      </div>
    </div>
  );
}
 
/* ─────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────── */
export default function App() {
  // Inject global CSS
  useEffect(() => {
    const el = document.createElement('style');
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
 
  const [screen, setScreen] = useState<'login' | 'chat'>('login');
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('general');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [typing, setTyping] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showUsers, setShowUsers] = useState(true);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
 
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAtBottom = useRef(true);
 
  // Auto-scroll
  useEffect(() => {
    if (isAtBottom.current) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
 
  function connect(u: string, r: string) {
    setUsername(u); setRoom(r);
    const socket = io('http://localhost:3000');
    socketRef.current = socket;
    setStatus('connecting');
 
    socket.on('connect', () => {
      setStatus('connected');
      socket.emit('join_room', { username: u, room: r });
    });
 
    socket.on('new_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      if (msg.user !== u) {
        setUnread(prev => ({ ...prev, [msg.room]: (prev[msg.room] || 0) + 1 }));
      }
    });
 
    socket.on('message_edited', ({ id, message }: { id: string; message: string }) => {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, message, edited: true } : m));
    });
 
    socket.on('message_deleted', ({ id }: { id: string }) => {
      setMessages(prev => prev.filter(m => m.id !== id));
    });
 
    socket.on('reaction_update', ({ id, reactions }: { id: string; reactions: Record<string, string[]> }) => {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, reactions } : m));
    });
 
    socket.on('room_users', (users: User[]) => setOnlineUsers(users));
 
    socket.on('typing', ({ username: tu, isTyping }: { username: string; isTyping: boolean }) => {
      setTyping(prev => isTyping ? [...prev.filter(x => x !== tu), tu] : prev.filter(x => x !== tu));
    });
 
    socket.on('disconnect', () => setStatus('disconnected'));
 
    setScreen('chat');
  }
 
  function sendMessage() {
    if (!input.trim() || !socketRef.current) return;
    const text = input.trim();
    setInput('');
    setReplyTo(null);
    socketRef.current.emit('send_message', {
      room, message: text, user: username,
      replyTo: replyTo ? { id: replyTo.id, user: replyTo.user, text: replyTo.message.slice(0, 80) } : undefined,
    });
    stopTyping();
  }
 
  function stopTyping() {
    socketRef.current?.emit('typing', { room, username, isTyping: false });
  }
 
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    socketRef.current?.emit('typing', { room, username, isTyping: true });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(stopTyping, 2000);
  }
 
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    if (e.key === 'Escape') { setReplyTo(null); setShowSearch(false); }
  }
 
  function toggleReaction(msgId: string, emoji: string) {
    socketRef.current?.emit('toggle_reaction', { msgId, emoji, username, room });
  }
 
  function switchRoom(r: string) {
    setRoom(r);
    setUnread(prev => ({ ...prev, [r]: 0 }));
    socketRef.current?.emit('switch_room', { username, oldRoom: room, newRoom: r });
    setMessages([]);
    setReplyTo(null);
  }
 
  function deleteMessage(id: string) {
    socketRef.current?.emit('delete_message', { id, room });
  }
 
  function submitEdit(id: string) {
    socketRef.current?.emit('edit_message', { id, message: editText.trim(), room });
    setEditingId(null); setEditText('');
  }
 
  function copyMessage(text: string) {
    navigator.clipboard.writeText(text);
  }
 
  const filtered = search
    ? messages.filter(m => m.message.toLowerCase().includes(search.toLowerCase()) || m.user.toLowerCase().includes(search.toLowerCase()))
    : messages;
 
  // Group messages by date
  const grouped: Array<{ date: string; msgs: Message[] }> = [];
  for (const msg of filtered) {
    const d = fmtDate(msg.timestamp);
    if (!grouped.length || grouped[grouped.length - 1].date !== d) grouped.push({ date: d, msgs: [msg] });
    else grouped[grouped.length - 1].msgs.push(msg);
  }
 
  if (screen === 'login') return <LoginScreen onConnect={connect} />;
 
  return (
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden', fontFamily: 'var(--mono)' }}>
 
      {/* ── Sidebar ── */}
      <div style={{
        width: 220, flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '0',
      }}>
        {/* Workspace header */}
        <div style={{
          padding: '18px 16px 14px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ fontFamily: 'var(--sans)', fontWeight: 800, fontSize: 15, color: 'var(--text)', letterSpacing: -0.3 }}>
            ChatHQ
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: status === 'connected' ? 'var(--green)' : status === 'connecting' ? 'var(--accent)' : '#FF6B6B',
              animation: status === 'connecting' ? 'pulse 1s infinite' : 'none',
            }}/>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{status}</span>
          </div>
        </div>
 
        {/* Rooms */}
        <div style={{ padding: '14px 8px 8px' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 1.5, textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 }}>
            Rooms
          </div>
          {ROOMS.map(r => {
            const u = unread[r.id] || 0;
            return (
              <button key={r.id} className={`room-btn ${room === r.id ? 'active' : ''}`}
                onClick={() => switchRoom(r.id)}
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 14 }}>{r.icon}</span>
                  <span>#{r.label}</span>
                </span>
                {u > 0 && room !== r.id && <span className="unread-badge">{u}</span>}
              </button>
            );
          })}
        </div>
 
        <div style={{ flex: 1 }} />
 
        {/* Current user */}
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Avatar name={username} size={30} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{username}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>#{room}</div>
          </div>
          <button className="icon-btn" title="Leave"
            onClick={() => { socketRef.current?.disconnect(); setScreen('login'); setMessages([]); }}
            style={{ marginLeft: 'auto', fontSize: 14 }}>
            ⇦
          </button>
        </div>
      </div>
 
      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
 
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '0 20px',
          height: 54,
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          flexShrink: 0,
        }}>
          <div style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
            <span style={{ color: 'var(--accent)' }}># </span>
            {room}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 12 }}>·</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {onlineUsers.filter(u => u.room === room).length} online
          </div>
 
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            <button className="icon-btn tooltip" data-tip="Search" onClick={() => setShowSearch(s => !s)}>
              🔍
            </button>
            <button className="icon-btn tooltip" data-tip="Members" onClick={() => setShowUsers(s => !s)}>
              👥
            </button>
          </div>
        </div>
 
        {/* Search bar */}
        {showSearch && (
          <div style={{
            padding: '10px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.02)',
            animation: 'fadeUp 0.15s ease',
          }}>
            <input
              className="login-input"
              placeholder="Search messages..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              style={{ maxWidth: 380 }}
            />
            {search && <span style={{ marginLeft: 12, fontSize: 11, color: 'var(--muted)' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>}
          </div>
        )}
 
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
 
          {/* Messages */}
          <div
            style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px' }}
            onScroll={e => {
              const el = e.currentTarget;
              isAtBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
            }}
          >
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', marginTop: 80, color: 'var(--muted)', fontSize: 13 }}>
                {search ? 'No messages match your search.' : 'Nothing here yet — say something! 👋'}
              </div>
            )}
 
            {grouped.map(({ date, msgs }) => (
              <div key={date}>
                {/* Date divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 16px' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  <span style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 0.5 }}>{date}</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>
 
                {msgs.map((msg, i) => {
                  if (msg.user === 'System') {
                    return (
                      <div key={msg.id} style={{ textAlign: 'center', margin: '8px 0' }}>
                        <span style={{
                          fontSize: 11, color: 'var(--muted)',
                          background: 'rgba(255,255,255,0.04)',
                          padding: '3px 12px', borderRadius: 20,
                        }}>{msg.message}</span>
                      </div>
                    );
                  }
 
                  const isOwn = msg.user === username;
                  const prevMsg = msgs[i - 1];
                  const compact = prevMsg && prevMsg.user === msg.user
                    && msg.timestamp - prevMsg.timestamp < 5 * 60 * 1000
                    && prevMsg.user !== 'System';
 
                  return (
                    <div
                      key={msg.id}
                      className="msg-appear"
                      onMouseEnter={() => setHoveredMsg(msg.id)}
                      onMouseLeave={() => setHoveredMsg(null)}
                      style={{
                        display: 'flex',
                        gap: 10,
                        marginBottom: compact ? 4 : 14,
                        flexDirection: isOwn ? 'row-reverse' : 'row',
                        position: 'relative',
                        alignItems: 'flex-start',
                      }}
                    >
                      {/* Avatar */}
                      {!compact ? <Avatar name={msg.user} size={34} /> : <div style={{ width: 34 }} />}
 
                      <div style={{
                        maxWidth: '66%', display: 'flex',
                        flexDirection: 'column',
                        alignItems: isOwn ? 'flex-end' : 'flex-start',
                      }}>
                        {/* Name + time */}
                        {!compact && (
                          <div style={{
                            display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 5,
                            flexDirection: isOwn ? 'row-reverse' : 'row',
                          }}>
                            <span style={{
                              fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--sans)',
                              color: pickColor(msg.user),
                            }}>{msg.user}</span>
                            <span style={{ fontSize: 10, color: 'var(--muted)' }}>{fmtTime(msg.timestamp)}</span>
                          </div>
                        )}
 
                        {/* Reply preview */}
                        {msg.replyTo && (
                          <div style={{
                            fontSize: 11.5, color: 'var(--muted)',
                            borderLeft: '2px solid var(--accent)',
                            paddingLeft: 8, marginBottom: 5,
                            maxWidth: 280,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            <span style={{ color: pickColor(msg.replyTo.user) }}>@{msg.replyTo.user} </span>
                            {msg.replyTo.text}
                          </div>
                        )}
 
                        {/* Bubble */}
                        {editingId === msg.id ? (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input
                              className="login-input"
                              value={editText}
                              onChange={e => setEditText(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') submitEdit(msg.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              autoFocus
                              style={{ fontSize: 13 }}
                            />
                            <button className="send-btn" style={{ padding: '0 12px', height: 36, fontSize: 12 }}
                              onClick={() => submitEdit(msg.id)}>Save</button>
                          </div>
                        ) : (
                          <div className={`msg-bubble ${isOwn ? 'own' : ''}`}>
                            {msg.message}
                            {msg.edited && <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 6 }}>(edited)</span>}
                          </div>
                        )}
 
                        {/* Reactions */}
                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                          <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
                            {Object.entries(msg.reactions).map(([emoji, users]) =>
                              users.length > 0 && (
                                <button key={emoji}
                                  onClick={() => toggleReaction(msg.id, emoji)}
                                  style={{
                                    all: 'unset', cursor: 'pointer',
                                    background: users.includes(username) ? 'rgba(167,139,250,0.28)' : 'rgba(255,255,255,0.08)',
                                    border: `1px solid ${users.includes(username) ? 'rgba(167,139,250,0.55)' : 'rgba(255,255,255,0.15)'}`,
                                    borderRadius: 20, padding: '2px 8px',
                                    fontSize: 12, display: 'flex', gap: 5, alignItems: 'center',
                                    transition: 'all 0.12s',
                                  }}>
                                  {emoji}
                                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{users.length}</span>
                                </button>
                              )
                            )}
                          </div>
                        )}
                      </div>
 
                      {/* Hover toolbar */}
                      {hoveredMsg === msg.id && (
                        <div style={{
                          position: 'absolute',
                          [isOwn ? 'left' : 'right']: 0,
                          top: -2,
                          display: 'flex', gap: 2,
                          background: 'var(--surface)',
                          border: '1px solid var(--border-hi)',
                          borderRadius: 10, padding: '3px 6px',
                          animation: 'fadeUp 0.12s ease',
                          zIndex: 10,
                        }}>
                          {REACTIONS.map(e => (
                            <button key={e} className="reaction-btn" onClick={() => toggleReaction(msg.id, e)}>{e}</button>
                          ))}
                          <div style={{ width: 1, background: 'var(--border)', margin: '2px 4px' }} />
                          <button className="icon-btn" style={{ width: 26, height: 26, fontSize: 13 }}
                            title="Reply" onClick={() => { setReplyTo(msg); inputRef.current?.focus(); }}>↩</button>
                          <button className="icon-btn" style={{ width: 26, height: 26, fontSize: 13 }}
                            title="Copy" onClick={() => copyMessage(msg.message)}>⎘</button>
                          {isOwn && <>
                            <button className="icon-btn" style={{ width: 26, height: 26, fontSize: 13 }}
                              title="Edit" onClick={() => { setEditingId(msg.id); setEditText(msg.message); }}>✏</button>
                            <button className="icon-btn" style={{ width: 26, height: 26, fontSize: 13, color: '#FF6B6B' }}
                              title="Delete" onClick={() => deleteMessage(msg.id)}>✕</button>
                          </>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
 
            {/* Typing indicator */}
            {typing.filter(t => t !== username).length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 4 }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {typing.filter(t => t !== username).join(', ')} {typing.length === 1 ? 'is' : 'are'} typing…
                </span>
              </div>
            )}
 
            <div ref={bottomRef} />
          </div>
 
          {/* Online Users Panel */}
          {showUsers && (
            <div style={{
              width: 200, flexShrink: 0,
              borderLeft: '1px solid var(--border)',
              background: 'var(--surface)',
              overflowY: 'auto',
              padding: '14px 12px',
            }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
                Online — {onlineUsers.filter(u => u.room === room).length}
              </div>
              {onlineUsers.filter(u => u.room === room).map(u => (
                <div key={u.id} className="user-appear"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px', borderRadius: 8 }}>
                  <div style={{ position: 'relative' }}>
                    <Avatar name={u.username} size={26} />
                    <div style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 7, height: 7, borderRadius: '50%',
                      background: 'var(--green)',
                      border: '1.5px solid var(--surface)',
                    }} />
                  </div>
                  <span style={{ fontSize: 12, color: u.username === username ? 'var(--text)' : 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.username} {u.username === username && <span style={{ color: 'var(--muted)', fontSize: 10 }}>(you)</span>}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
 
        {/* Input area */}
        <div style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
          padding: '12px 20px 14px',
          flexShrink: 0,
        }}>
          {/* Reply preview */}
          {replyTo && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
              padding: '7px 12px',
              background: 'rgba(167,139,250,0.18)',
              border: '1px solid rgba(167,139,250,0.35)',
              borderRadius: 10,
              animation: 'fadeUp 0.15s ease',
            }}>
              <span style={{ color: 'var(--accent)', fontSize: 14 }}>↩</span>
              <span style={{ fontSize: 11, color: 'var(--muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <span style={{ color: pickColor(replyTo.user) }}>@{replyTo.user} </span>
                {replyTo.message}
              </span>
              <button className="icon-btn" style={{ width: 22, height: 22, fontSize: 12 }}
                onClick={() => setReplyTo(null)}>✕</button>
            </div>
          )}
 
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-hi)',
            borderRadius: 14, padding: '4px 12px 4px 16px',
          }}>
            <textarea
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message #${room}… (Enter to send, Shift+Enter for newline)`}
              rows={1}
              onInput={e => {
                const t = e.currentTarget;
                t.style.height = 'auto';
                t.style.height = Math.min(t.scrollHeight, 120) + 'px';
              }}
            />
            <button className="send-btn" onClick={sendMessage} disabled={!input.trim()}>
              Send ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}