import { useState, useRef, useEffect } from "react";

// ─── 系统提示词 ───────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `你是一位专业的香云纱女装私域运营顾问，服务于一家经营正宗桑蚕丝底古法香云纱女装的品牌，单件定价500-600元。

【品牌背景】
- 面料：桑蚕丝底，天然薯莨植物染色，古法工艺
- 特质：天然染色初期易轻微磨损褪色，长期穿着可养成自然包浆光泽
- 售后：衣物破损可返修，疑难情况直接免费换新
- 客源：100%来自抖音、视频号直播间，包裹引流卡扫码加微信
- 赠品：专用衣架（成本4元）、防尘收纳袋（成本6元）、香云纱专用洗衣液（成本约10元）
- 私域阵地：微信朋友圈+私聊+社群

【满赠规则】
- 单件（500-998元）：赠防尘收纳袋×1
- 999-1397元：赠衣架+收纳袋
- 1398-1999元：衣架+收纳袋+手写养护卡
- ≥2000元：以上全套+香云纱专用洗衣液×1

【客户分层】
- 新客层：首次购买，需消除面料焦虑，建立信任
- 复购层：累计2次或≥1000元，需强化情感连接
- 高客单层：累计≥2000元，VIP化维护，激活转介绍

【能力】
1. 朋友圈文案：养护知识型、情感共鸣型、工艺溯源型、买家秀型、搭配灵感型、售后安心型、节日节气型
2. 客户话术：新客欢迎、面料焦虑安抚、返修锁客、沉默唤醒、老客裂变
3. 客户分层建议：根据消费情况给出分层和跟进建议
4. 面料科普：打消顾虑的专业干货内容
5. 买家秀文案：给老客参考的穿搭朋友圈文字模板
6. 一周内容日历：7天朋友圈内容规划，注明类型和发布建议

【特别指令】
- 如果用户说"微调：更简短"，将上一条内容压缩30%，保留核心
- 如果用户说"微调：更正式"，提升语气专业度，减少口语
- 如果用户说"微调：换个开头"，保持正文，重写开头两句
- 如果用户说"微调：更口语"，让内容更自然随性，像朋友说话
- 如用户提供了客户档案信息（姓名/消费金额/标签），在生成话术时带入个性化内容

【回复规范】
- 语气：温暖、专业、有质感，符合500-600元中高端定位
- 朋友圈文案：200字以内，有情感有干货，结尾留互动钩子
- 话术：分步骤，有共情开场，有专业内容，有行动引导
- 不使用"限时""抢购"等低端促销词
- 格式清晰，直接可复制使用

收到请求后直接输出内容，无需过多确认。`;

// ─── 节日/节气日历 ───────────────────────────────────────────────────────────
const FESTIVALS = [
  { month: 1, day: 1, name: "元旦", prompt: "生成一条元旦节日朋友圈文案，结合香云纱新年穿搭主题" },
  { month: 2, day: 14, name: "情人节", prompt: "生成一条情人节朋友圈文案，以香云纱作为送礼/自我表达的主题" },
  { month: 3, day: 8, name: "妇女节", prompt: "生成一条三八妇女节朋友圈文案，主题是穿香云纱的独立女性" },
  { month: 3, day: 20, name: "春分", prompt: "生成一条春分节气朋友圈文案，结合香云纱春季上新和换季收纳提醒" },
  { month: 5, day: 11, name: "母亲节", prompt: "生成一条母亲节朋友圈文案，以香云纱作为送妈妈礼物的主题" },
  { month: 6, day: 21, name: "夏至", prompt: "生成一条夏至节气朋友圈文案，主题是香云纱透气凉爽的夏日穿着体验" },
  { month: 7, day: 7, name: "七夕", prompt: "生成一条七夕节朋友圈文案，以香云纱作为送礼主题" },
  { month: 9, day: 23, name: "秋分", prompt: "生成一条秋分节气朋友圈文案，结合香云纱秋季新色和换季养护提醒" },
  { month: 10, day: 1, name: "国庆", prompt: "生成一条国庆节朋友圈文案，主题是节日出行穿香云纱的美好场景" },
  { month: 12, day: 22, name: "冬至", prompt: "生成一条冬至节气朋友圈文案，主题是香云纱冬季收纳和包浆成果展示" },
  { month: 12, day: 25, name: "圣诞", prompt: "生成一条圣诞节朋友圈文案，结合年末礼品和香云纱主题" },
];

// ─── 快捷操作 ─────────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { id: "moments", label: "朋友圈文案", icon: "✍️", desc: "生成今日推文", prompt: "帮我生成一条今天发朋友圈的文案，随机选择合适的类型" },
  { id: "weekly", label: "一周内容日历", icon: "📅", desc: "7天内容一次规划好", prompt: "帮我生成本周（周一到周日）的朋友圈内容日历，7条，每条标注类型、适合发布时间和简短内容，排列整齐方便查看" },
  { id: "welcome", label: "新客欢迎话术", icon: "👋", desc: "扫码加微后首条消息", prompt: "帮我生成新客户扫码加微信后的欢迎话术和引导领取赠品的内容" },
  { id: "complaint", label: "掉色投诉安抚", icon: "🛡️", desc: "面料磨损顾客的转化", prompt: "顾客说衣服摩擦后掉色，觉得质量差不敢再买了，帮我生成安抚和转化话术" },
  { id: "repair", label: "返修锁客话术", icon: "🔧", desc: "返修节点引导复购", prompt: "顾客要寄回来返修，帮我生成这个节点的锁客话术和复购引导内容" },
  { id: "awaken", label: "沉默客户唤醒", icon: "💌", desc: "60天未互动老客", prompt: "有位老客户超过60天没有互动了，帮我生成一条唤醒私聊话术" },
  { id: "science", label: "面料科普文案", icon: "🌿", desc: "香云纱知识干货", prompt: "帮我生成一篇香云纱面料科普内容，用于朋友圈或私聊" },
  { id: "buyershow", label: "买家秀文案", icon: "📸", desc: "给老客的穿搭文案模板", prompt: "帮我生成3条买家秀朋友圈文案模板，客户口吻，可以直接发给老客参考发布，风格自然真实" },
  { id: "fission", label: "老带新裂变话术", icon: "🔗", desc: "邀请老客转介绍", prompt: "帮我生成邀请老客户参与转介绍活动的话术，要自然不生硬" },
  { id: "layer", label: "客户分层建议", icon: "📊", desc: "输入客户情况获取建议", prompt: "我有一位客户，" },
];

const ADJUST_CHIPS = ["微调：更简短", "微调：更正式", "微调：换个开头", "微调：更口语", "换一条重新生成"];

const SUGGESTED_REPLIES = {
  moments: ["换个风格再来一条", "微调：更简短", "生成情感共鸣类文案", "生成工艺溯源类文案"],
  weekly: ["下周日历", "把周三那条改得更有温度", "微调：更简短"],
  welcome: ["生成收货后3天跟进话术", "如何引导客户晒穿搭", "微调：更口语"],
  complaint: ["生成返修引导话术", "面料科普内容", "微调：更正式"],
  repair: ["生成换新节点话术", "返修后复购引导", "老客感谢话术"],
  awaken: ["微调：更简短", "换一条重新生成", "老带新裂变话术"],
  science: ["换一个科普角度", "微调：更简短", "适合朋友圈的版本"],
  buyershow: ["再生成3条不同风格的", "更简短的版本", "针对年轻客户的语气"],
  fission: ["微调：更口语", "换一条重新生成", "配套的朋友圈转发文案"],
  layer: ["制定这位客户的跟进计划", "生成专属话术", "高客单VIP维护方案"],
  default: ["朋友圈文案", "客户话术", "面料科普", "一周内容日历"],
};

// ─── 工具函数 ─────────────────────────────────────────────────────────────────
function getUpcomingFestivals() {
  const now = new Date();
  return FESTIVALS.filter(f => {
    const fd = new Date(now.getFullYear(), f.month - 1, f.day);
    const diff = (fd - now) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 10;
  });
}

// ─── 子组件 ───────────────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, padding:"12px 16px", background:"rgba(139,109,82,0.06)", borderRadius:16, borderBottomLeftRadius:4, width:"fit-content" }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"#8B6D52", animation:"bounce 1.2s infinite", animationDelay:`${i*0.2}s`, opacity:0.7 }} />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display:"flex", justifyContent:isUser?"flex-end":"flex-start", marginBottom:16, alignItems:"flex-end", gap:8 }}>
      {!isUser && (
        <div style={{ width:36, height:36, borderRadius:"50%", flexShrink:0, background:"linear-gradient(135deg,#8B6D52,#C4A882)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, boxShadow:"0 2px 8px rgba(139,109,82,0.3)" }}>🌿</div>
      )}
      <div style={{ maxWidth:"75%", background:isUser?"linear-gradient(135deg,#8B6D52,#A0795A)":"rgba(255,255,255,0.95)", color:isUser?"#fff":"#3a2e25", borderRadius:isUser?"20px 20px 4px 20px":"20px 20px 20px 4px", padding:"12px 16px", fontSize:14, lineHeight:1.75, boxShadow:isUser?"0 4px 16px rgba(139,109,82,0.35)":"0 2px 12px rgba(0,0,0,0.08)", whiteSpace:"pre-wrap", wordBreak:"break-word", border:isUser?"none":"1px solid rgba(196,168,130,0.2)" }}>
        {msg.content}
      </div>
      {isUser && (
        <div style={{ width:36, height:36, borderRadius:"50%", flexShrink:0, background:"linear-gradient(135deg,#D4B896,#C4A882)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>👤</div>
      )}
    </div>
  );
}

function Chip({ label, onClick, variant="default" }) {
  const [hov, setHov] = useState(false);
  const isAdjust = variant === "adjust";
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding:"5px 11px", borderRadius:20, border:`1px solid ${isAdjust?"rgba(160,121,90,0.5)":"rgba(139,109,82,0.35)"}`, background: hov ? (isAdjust?"rgba(160,121,90,0.15)":"rgba(139,109,82,0.15)") : (isAdjust?"rgba(160,121,90,0.08)":"rgba(196,168,130,0.1)"), color:isAdjust?"#A0795A":"#8B6D52", fontSize:12, cursor:"pointer", transition:"all 0.2s", fontFamily:"inherit" }}>
      {label}
    </button>
  );
}

// ─── 客户档案面板 ─────────────────────────────────────────────────────────────
function CustomerPanel({ customers, onAdd, onRemove, onSelect, selectedId }) {
  const [form, setForm] = useState({ name:"", amount:"", tag:"新客" });
  const [open, setOpen] = useState(false);
  const tags = ["新客","复购","高客单VIP","沉默客户","投诉处理中"];
  return (
    <div style={{ borderBottom:"1px solid rgba(196,168,130,0.2)", background:"rgba(255,255,255,0.7)", backdropFilter:"blur(10px)" }}>
      <button onClick={() => setOpen(!open)} style={{ width:"100%", padding:"10px 16px", background:"transparent", border:"none", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", fontFamily:"inherit", color:"#6a5444", fontSize:13 }}>
        <span>👥 客户档案 {customers.length > 0 && <span style={{ background:"rgba(139,109,82,0.15)", borderRadius:10, padding:"1px 7px", fontSize:11, marginLeft:4 }}>{customers.length}</span>}</span>
        <span style={{ fontSize:10, color:"#9B8470", transform:open?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▼</span>
      </button>
      {open && (
        <div style={{ padding:"0 16px 12px" }}>
          {customers.length > 0 && (
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
              {customers.map(c => (
                <div key={c.id} onClick={() => onSelect(c.id === selectedId ? null : c.id)}
                  style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:12, border:`1.5px solid ${c.id===selectedId?"#8B6D52":"rgba(196,168,130,0.3)"}`, background:c.id===selectedId?"rgba(139,109,82,0.1)":"rgba(255,255,255,0.8)", cursor:"pointer", fontSize:12, color:"#3a2e25" }}>
                  <span>{c.name}</span>
                  <span style={{ fontSize:10, color:"#9B8470" }}>¥{c.amount}</span>
                  <span style={{ fontSize:10, padding:"1px 5px", borderRadius:8, background:"rgba(196,168,130,0.2)", color:"#8B6D52" }}>{c.tag}</span>
                  <span onClick={e=>{e.stopPropagation();onRemove(c.id)}} style={{ marginLeft:2, color:"#c0a898", cursor:"pointer", fontSize:13, lineHeight:1 }}>×</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            <input placeholder="姓名/昵称" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
              style={{ flex:"1 1 80px", minWidth:60, padding:"6px 10px", borderRadius:8, border:"1px solid rgba(196,168,130,0.4)", background:"rgba(255,255,255,0.9)", fontSize:12, fontFamily:"inherit", outline:"none", color:"#3a2e25" }} />
            <input placeholder="消费金额" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}
              style={{ flex:"1 1 70px", minWidth:60, padding:"6px 10px", borderRadius:8, border:"1px solid rgba(196,168,130,0.4)", background:"rgba(255,255,255,0.9)", fontSize:12, fontFamily:"inherit", outline:"none", color:"#3a2e25" }} />
            <select value={form.tag} onChange={e=>setForm({...form,tag:e.target.value})}
              style={{ flex:"1 1 80px", padding:"6px 10px", borderRadius:8, border:"1px solid rgba(196,168,130,0.4)", background:"rgba(255,255,255,0.9)", fontSize:12, fontFamily:"inherit", outline:"none", color:"#3a2e25" }}>
              {tags.map(t=><option key={t}>{t}</option>)}
            </select>
            <button onClick={() => { if(!form.name) return; onAdd({...form, id:Date.now()}); setForm({name:"",amount:"",tag:"新客"}); }}
              style={{ padding:"6px 14px", borderRadius:8, background:"linear-gradient(135deg,#8B6D52,#A0795A)", color:"#fff", border:"none", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>+ 添加</button>
          </div>
          {selectedId && <div style={{ marginTop:8, fontSize:11, color:"#8B6D52" }}>✓ 已选中客户，下次生成话术将自动带入其信息</div>}
        </div>
      )}
    </div>
  );
}

// ─── 收藏夹面板 ───────────────────────────────────────────────────────────────
function FavoritesPanel({ favorites, onRemove, onCopy, copySuccess }) {
  const [open, setOpen] = useState(false);
  if (favorites.length === 0) return null;
  return (
    <div style={{ borderBottom:"1px solid rgba(196,168,130,0.2)", background:"rgba(255,252,248,0.7)", backdropFilter:"blur(10px)" }}>
      <button onClick={() => setOpen(!open)} style={{ width:"100%", padding:"10px 16px", background:"transparent", border:"none", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", fontFamily:"inherit", color:"#6a5444", fontSize:13 }}>
        <span>⭐ 收藏夹 <span style={{ background:"rgba(196,168,130,0.2)", borderRadius:10, padding:"1px 7px", fontSize:11, marginLeft:4 }}>{favorites.length}</span></span>
        <span style={{ fontSize:10, color:"#9B8470", transform:open?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▼</span>
      </button>
      {open && (
        <div style={{ padding:"0 16px 12px", display:"flex", flexDirection:"column", gap:8, maxHeight:260, overflowY:"auto" }}>
          {favorites.map((f,i) => (
            <div key={f.id} style={{ background:"rgba(255,255,255,0.9)", borderRadius:12, padding:"10px 12px", border:"1px solid rgba(196,168,130,0.2)", fontSize:12, color:"#3a2e25", lineHeight:1.6 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, alignItems:"center" }}>
                <span style={{ fontSize:10, color:"#9B8470" }}>{f.label} · {f.time}</span>
                <div style={{ display:"flex", gap:6 }}>
                  <button onClick={() => onCopy(f.content, `fav_${f.id}`)} style={{ padding:"2px 8px", borderRadius:8, border:"1px solid rgba(139,109,82,0.25)", background:copySuccess===`fav_${f.id}`?"rgba(76,175,80,0.1)":"transparent", color:copySuccess===`fav_${f.id}`?"#4CAF50":"#9B8470", fontSize:10, cursor:"pointer", fontFamily:"inherit" }}>
                    {copySuccess===`fav_${f.id}`?"✓ 已复制":"📋 复制"}
                  </button>
                  <button onClick={() => onRemove(f.id)} style={{ padding:"2px 6px", borderRadius:8, border:"none", background:"transparent", color:"#c0a898", fontSize:13, cursor:"pointer" }}>×</button>
                </div>
              </div>
              <div style={{ whiteSpace:"pre-wrap", wordBreak:"break-word", maxHeight:80, overflowY:"auto" }}>{f.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("chat"); // chat | staff
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [copySuccess, setCopySuccess] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const upcomingFestivals = getUpcomingFestivals();
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    let finalText = text;
    if (selectedCustomer) {
      finalText = `[客户信息：姓名"${selectedCustomer.name}"，消费金额¥${selectedCustomer.amount}，标签"${selectedCustomer.tag}"]\n\n${text}`;
    }
    const userMsg = { role:"user", content:text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setShowQuickActions(false);

    const apiMessages = [...messages, { role:"user", content:finalText }];

    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:SYSTEM_PROMPT, messages:apiMessages }),
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text||"").join("") || "抱歉，请稍后再试。";
      setMessages(prev => [...prev, { role:"assistant", content:reply }]);
    } catch {
      setMessages(prev => [...prev, { role:"assistant", content:"网络出错了，请稍后重试 🙏" }]);
    }
    setLoading(false);
  };

  const handleQuickAction = (action) => {
    setLastAction(action.id);
    if (action.id === "layer") {
      setInput("我有一位客户，");
      inputRef.current?.focus();
    } else {
      sendMessage(action.prompt);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(key);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const handleFavorite = (content) => {
    const now = new Date();
    const time = `${now.getMonth()+1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`;
    const label = lastAction ? (QUICK_ACTIONS.find(a=>a.id===lastAction)?.label || "内容") : "内容";
    setFavorites(prev => [{ id:Date.now(), content, label, time }, ...prev]);
  };

  const lastAssistantIdx = [...messages].reverse().findIndex(m => m.role==="assistant");
  const lastAssistantAbsIdx = lastAssistantIdx >= 0 ? messages.length-1-lastAssistantIdx : -1;
  const currentSuggestions = SUGGESTED_REPLIES[lastAction] || SUGGESTED_REPLIES.default;

  // ── 员工简化模式 ──
  const STAFF_ACTIONS = [
    { label:"新客欢迎", icon:"👋", prompt:"帮我生成新客户扫码加微信后的欢迎话术" },
    { label:"掉色安抚", icon:"🛡️", prompt:"顾客反映衣服摩擦掉色，帮我生成安抚话术" },
    { label:"返修话术", icon:"🔧", prompt:"顾客要返修，帮我生成锁客和复购引导话术" },
    { label:"唤醒老客", icon:"💌", prompt:"老客60天未互动，帮我生成唤醒话术" },
    { label:"换新话术", icon:"🔄", prompt:"顾客申请免费换新，帮我生成服务话术" },
    { label:"催复购", icon:"💬", prompt:"帮我生成一条自然的复购提醒私聊话术" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#FAF6F0 0%,#F0E8DC 40%,#EDE0D0 100%)", display:"flex", flexDirection:"column", fontFamily:"'Noto Serif SC',Georgia,serif", position:"relative", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600&display=swap');
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        textarea::-webkit-scrollbar{width:4px} textarea::-webkit-scrollbar-thumb{background:rgba(139,109,82,0.3);border-radius:2px}
        .msg-enter{animation:fadeIn 0.3s ease forwards}
        .qa-card:hover{transform:translateY(-2px)!important;box-shadow:0 8px 24px rgba(139,109,82,0.2)!important}
        .tab-btn{transition:all 0.2s}
        *{box-sizing:border-box}
      `}</style>

      {/* 背景装饰 */}
      <div style={{ position:"fixed", top:-80, right:-80, width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(196,168,130,0.15) 0%,transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:-60, left:-60, width:240, height:240, borderRadius:"50%", background:"radial-gradient(circle,rgba(139,109,82,0.1) 0%,transparent 70%)", pointerEvents:"none" }} />

      {/* Header */}
      <div style={{ background:"rgba(255,255,255,0.88)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(196,168,130,0.25)", padding:"12px 16px", display:"flex", alignItems:"center", gap:10, position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 20px rgba(139,109,82,0.08)" }}>
        <div style={{ width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#8B6D52,#C4A882)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, boxShadow:"0 4px 12px rgba(139,109,82,0.35)", flexShrink:0 }}>🌿</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:15, fontWeight:600, color:"#3a2e25", letterSpacing:0.5 }}>香云纱私域运营助手</div>
          <div style={{ fontSize:11, color:"#9B8470", marginTop:1 }}>文案 · 话术 · 分层 · 科普</div>
        </div>
        {/* 模式切换 */}
        <div style={{ display:"flex", background:"rgba(196,168,130,0.15)", borderRadius:10, padding:3, gap:2 }}>
          {[{key:"chat",label:"完整版"},{key:"staff",label:"员工版"}].map(t => (
            <button key={t.key} className="tab-btn" onClick={() => setTab(t.key)} style={{ padding:"5px 10px", borderRadius:8, border:"none", background:tab===t.key?"rgba(139,109,82,0.9)":"transparent", color:tab===t.key?"#fff":"#8B6D52", fontSize:11, cursor:"pointer", fontFamily:"inherit", fontWeight:tab===t.key?600:400 }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* 节日提醒横幅 */}
      {upcomingFestivals.length > 0 && (
        <div style={{ background:"linear-gradient(90deg,rgba(196,168,130,0.2),rgba(139,109,82,0.12))", borderBottom:"1px solid rgba(196,168,130,0.25)", padding:"8px 16px", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <span style={{ fontSize:13 }}>🎉</span>
          {upcomingFestivals.map(f => (
            <button key={f.name} onClick={() => { setLastAction("moments"); sendMessage(f.prompt); }} style={{ fontSize:12, color:"#8B6D52", background:"rgba(255,255,255,0.7)", border:"1px solid rgba(139,109,82,0.3)", borderRadius:12, padding:"3px 10px", cursor:"pointer", fontFamily:"inherit" }}>
              {f.name}文案 →
            </button>
          ))}
          <span style={{ fontSize:11, color:"#9B8470" }}>近期节点，点击快速生成</span>
        </div>
      )}

      {/* 员工模式 */}
      {tab === "staff" && (
        <div style={{ flex:1, overflowY:"auto", padding:"16px", maxWidth:720, width:"100%", margin:"0 auto" }}>
          <div style={{ background:"rgba(255,255,255,0.9)", borderRadius:16, padding:"14px 16px", marginBottom:16, border:"1px solid rgba(196,168,130,0.2)" }}>
            <div style={{ fontSize:13, color:"#3a2e25", fontWeight:600, marginBottom:4 }}>👩‍💼 员工快捷话术</div>
            <div style={{ fontSize:12, color:"#9B8470" }}>选择场景，一键生成可直接发送的话术</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
            {STAFF_ACTIONS.map((a,i) => (
              <button key={i} className="qa-card" onClick={() => { setTab("chat"); setLastAction("welcome"); sendMessage(a.prompt); }} style={{ background:"rgba(255,255,255,0.9)", border:"1px solid rgba(196,168,130,0.25)", borderRadius:14, padding:"14px", textAlign:"left", cursor:"pointer", transition:"all 0.25s", boxShadow:"0 2px 10px rgba(139,109,82,0.08)", fontFamily:"inherit" }}>
                <div style={{ fontSize:24, marginBottom:6 }}>{a.icon}</div>
                <div style={{ fontSize:13, fontWeight:600, color:"#3a2e25" }}>{a.label}</div>
                <div style={{ fontSize:11, color:"#9B8470", marginTop:3 }}>点击生成话术</div>
              </button>
            ))}
          </div>
          <div style={{ background:"rgba(255,255,255,0.7)", borderRadius:12, padding:"12px 14px", border:"1px solid rgba(196,168,130,0.15)", fontSize:12, color:"#7a6a5a", lineHeight:1.8 }}>
            💡 <strong>使用说明：</strong>点击任一按钮将自动切换到完整版并生成话术。生成后点「📋 复制」直接粘贴到微信发送。如需根据具体客户调整，告诉助手客户的情况即可。
          </div>
        </div>
      )}

      {/* 完整版聊天 */}
      {tab === "chat" && (
        <>
          {/* 客户档案 + 收藏夹 */}
          <CustomerPanel customers={customers} onAdd={c => setCustomers(prev=>[...prev,c])} onRemove={id => { setCustomers(prev=>prev.filter(c=>c.id!==id)); if(selectedCustomerId===id) setSelectedCustomerId(null); }} onSelect={setSelectedCustomerId} selectedId={selectedCustomerId} />
          <FavoritesPanel favorites={favorites} onRemove={id=>setFavorites(prev=>prev.filter(f=>f.id!==id))} onCopy={handleCopy} copySuccess={copySuccess} />

          {/* 聊天区 */}
          <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 8px", maxWidth:720, width:"100%", margin:"0 auto" }}>

            {/* 欢迎 */}
            {messages.length === 0 && (
              <div style={{ animation:"slideUp 0.5s ease forwards", marginBottom:20 }}>
                <div style={{ background:"rgba(255,255,255,0.9)", borderRadius:20, padding:"18px 18px 14px", border:"1px solid rgba(196,168,130,0.2)", boxShadow:"0 4px 20px rgba(139,109,82,0.1)", marginBottom:16 }}>
                  <div style={{ fontSize:20, marginBottom:8 }}>👋</div>
                  <div style={{ fontSize:14, color:"#3a2e25", lineHeight:1.8 }}>你好！我是你的<strong style={{color:"#8B6D52"}}>香云纱私域运营助手</strong>，已了解你的品牌、面料和客户痛点。</div>
                  <div style={{ fontSize:12, color:"#7a6a5a", marginTop:8, lineHeight:1.7 }}>可以帮你生成朋友圈文案、客户话术、一周内容日历、面料科普，还能根据客户档案个性化定制内容。</div>
                  {selectedCustomer && <div style={{ marginTop:10, padding:"6px 10px", background:"rgba(139,109,82,0.08)", borderRadius:10, fontSize:12, color:"#8B6D52" }}>📌 当前选中客户：{selectedCustomer.name}（{selectedCustomer.tag}）</div>}
                </div>
                {showQuickActions && (
                  <div>
                    <div style={{ fontSize:11, color:"#9B8470", marginBottom:10, paddingLeft:2, letterSpacing:1 }}>— 快速开始 —</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      {QUICK_ACTIONS.map(action => (
                        <button key={action.id} className="qa-card" onClick={() => handleQuickAction(action)} style={{ background:"rgba(255,255,255,0.9)", border:"1px solid rgba(196,168,130,0.25)", borderRadius:14, padding:"12px", textAlign:"left", cursor:"pointer", transition:"all 0.25s", boxShadow:"0 2px 10px rgba(139,109,82,0.08)", fontFamily:"inherit" }}>
                          <div style={{ fontSize:20, marginBottom:5 }}>{action.icon}</div>
                          <div style={{ fontSize:12, fontWeight:600, color:"#3a2e25", marginBottom:2 }}>{action.label}</div>
                          <div style={{ fontSize:10, color:"#9B8470", lineHeight:1.5 }}>{action.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 消息列表 */}
            {messages.map((msg, i) => (
              <div key={i} className="msg-enter">
                <Message msg={msg} />
                {msg.role === "assistant" && (
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6, marginLeft:44, flexWrap:"wrap" }}>
                    <button onClick={() => handleCopy(msg.content, i)} style={{ padding:"4px 10px", borderRadius:12, border:"1px solid rgba(139,109,82,0.25)", background:copySuccess===i?"rgba(76,175,80,0.1)":"rgba(255,255,255,0.8)", color:copySuccess===i?"#4CAF50":"#9B8470", fontSize:11, cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", gap:3, fontFamily:"inherit" }}>
                      {copySuccess===i?"✓ 已复制":"📋 复制"}
                    </button>
                    <button onClick={() => handleFavorite(msg.content)} style={{ padding:"4px 10px", borderRadius:12, border:"1px solid rgba(196,168,130,0.3)", background:"rgba(255,255,255,0.8)", color:"#B8956A", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
                      ⭐ 收藏
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* 快捷微调 & 建议 */}
            {!loading && messages.length > 0 && lastAssistantAbsIdx === messages.length-1 && (
              <div style={{ marginLeft:44, marginBottom:8 }}>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:6 }}>
                  {ADJUST_CHIPS.map(c => <Chip key={c} label={c} onClick={() => sendMessage(c)} variant="adjust" />)}
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {currentSuggestions.map(s => <Chip key={s} label={s} onClick={() => { setLastAction(null); sendMessage(s); }} />)}
                </div>
              </div>
            )}

            {loading && (
              <div className="msg-enter" style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#8B6D52,#C4A882)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🌿</div>
                <TypingIndicator />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* 输入区 */}
          <div style={{ background:"rgba(255,255,255,0.9)", backdropFilter:"blur(20px)", borderTop:"1px solid rgba(196,168,130,0.2)", padding:"10px 16px 14px", maxWidth:720, width:"100%", margin:"0 auto" }}>
            {messages.length > 0 && (
              <button onClick={() => { setMessages([]); setLastAction(null); setShowQuickActions(true); }} style={{ marginBottom:8, padding:"3px 10px", borderRadius:10, border:"1px solid rgba(196,168,130,0.3)", background:"transparent", color:"#9B8470", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>↩ 重新开始</button>
            )}
            <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
              <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage(input);} }}
                placeholder="描述你的需求，例如：帮我写一条今天的朋友圈文案…"
                rows={1}
                style={{ flex:1, borderRadius:14, border:"1.5px solid rgba(196,168,130,0.4)", padding:"10px 14px", fontSize:14, resize:"none", outline:"none", background:"rgba(255,255,255,0.9)", color:"#3a2e25", fontFamily:"inherit", lineHeight:1.6, transition:"border-color 0.2s", maxHeight:120, overflowY:"auto" }}
                onFocus={e=>e.target.style.borderColor="#8B6D52"} onBlur={e=>e.target.style.borderColor="rgba(196,168,130,0.4)"} />
              <button onClick={()=>sendMessage(input)} disabled={loading||!input.trim()}
                style={{ width:42, height:42, borderRadius:12, flexShrink:0, background:loading||!input.trim()?"rgba(196,168,130,0.3)":"linear-gradient(135deg,#8B6D52,#A0795A)", border:"none", cursor:loading||!input.trim()?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, transition:"all 0.2s", boxShadow:loading||!input.trim()?"none":"0 4px 14px rgba(139,109,82,0.4)", color:"#fff" }}>
                {loading?"⏳":"↑"}
              </button>
            </div>
            <div style={{ textAlign:"center", marginTop:6, fontSize:10, color:"rgba(155,132,112,0.5)" }}>Enter 发送 · Shift+Enter 换行</div>
          </div>
        </>
      )}
    </div>
  );
}
