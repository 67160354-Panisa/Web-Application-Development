import { useState, useEffect } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleUserRound,
  Heart,
  Home,
  LogOut,
  Menu,
  Plus,
  Search,
  Shirt,
  Sparkles,
  ShoppingBag,
  Trash2,
  UserRound,
  X,
  RefreshCw,
  LockKeyhole,
  PackageCheck,
  SlidersHorizontal,
  Eye,
  EyeOff
} from "lucide-react";

import { api } from "./api";

const categories = [
  { key: "top", label: "Tops", icon: "👕" },
  { key: "bottom", label: "Bottoms", icon: "👖" },
  { key: "dress", label: "Dresses", icon: "👗" },
  { key: "shoes", label: "Shoes", icon: "👟" },
  { key: "bag", label: "Bags", icon: "👜" },
  { key: "accessory", label: "Accessories", icon: "🕶️" },
];

const demoProducts = [
  { id: "demo-1", title: "Vintage Racing Tee", price: 490, listing_type: "sale", status: "available", description: "Graphic tee for everyday Y2K looks.", image_url: "", seller_id: 0 },
  { id: "demo-2", title: "Soft Tailored Trousers", price: 790, listing_type: "sale", status: "available", description: "Clean silhouette, easy to style.", image_url: "", seller_id: 0 },
  { id: "demo-3", title: "Cherry Mini Bag", price: 650, listing_type: "sale", status: "available", description: "A tiny statement bag for your next cafe hop.", image_url: "", seller_id: 0 },
];

function money(n) { return new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(n) + " ฿"; }

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home");
  const [auth, setAuth] = useState("login");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  
  const [resetToken, setResetToken] = useState(() => new URLSearchParams(window.location.search).get("reset_token"));

  useEffect(() => {
    if (!localStorage.getItem("closetloop_token")) { setLoading(false); return; }
    api.me().then(setUser).catch(() => localStorage.removeItem("closetloop_token")).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const loginSuccess = (data) => {
    localStorage.setItem("closetloop_token", data.access_token);
    setUser(data.user);
    setPage("dashboard");
    setToast(`ยินดีต้อนรับกลับ ${data.user.display_name || data.user.username} ✨`);
  };

  const logout = async () => {
    try { await api.logout(); } catch {}
    localStorage.removeItem("closetloop_token");
    setUser(null);
    setPage("home");
    setToast("ออกจากระบบแล้ว");
  };

  if (loading) return <div className="splash"><div className="logo-mark">CL</div><p>LOADING YOUR LOOP...</p></div>;
  
  if (resetToken) return <ResetPasswordScreen token={resetToken} />;
  
  if (!user) return <AuthScreen mode={auth} setMode={setAuth} onSuccess={loginSuccess} toast={toast} />;

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} user={user} logout={logout} />
      <main className="main">
        <Topbar page={page} user={user} setPage={setPage} />
        {page === "home" && <HomePage setPage={setPage} user={user} />}
        {page === "dashboard" && <Dashboard setPage={setPage} user={user} />}
        {page === "closet" && <ClosetPage setToast={setToast} />}
        {page === "ai" && <AIPage setToast={setToast} />}
        {page === "market" && <MarketPage user={user} setToast={setToast} />}
        {page === "orders" && <OrdersPage />}
        {page === "profile" && <ProfilePage user={user} setUser={setUser} setToast={setToast} logout={logout} />}
      </main>
      {toast && <div className="toast"><Check size={18}/>{toast}</div>}
    </div>
  );
}

function ResetPasswordScreen({ token }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg("");
    try {
      const res = await fetch("http://localhost:8000/reset-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ new_password: password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "เกิดข้อผิดพลาด");
      
      setSuccess(true);
      setMsg("✅ เปลี่ยนรหัสผ่านสำเร็จแล้ว!");
    } catch (err) {
      setMsg("❌ " + err.message);
    } finally {
      setBusy(false);
    }
  };

  if (success) {
    return (
      <div className="auth-layout" style={{ justifyContent: 'center' }}>
        <div className="auth-panel" style={{ textAlign: 'center', padding: '40px' }}>
          <h2 style={{ color: 'var(--ink)' }}>{msg}</h2>
          <br/>
          <button className="btn btn-dark" onClick={() => window.location.href = "/"}>กลับไปหน้าเข้าสู่ระบบ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-layout" style={{ justifyContent: 'center' }}>
      <div className="auth-panel">
        <div className="auth-panel-inner">
          <div className="auth-heading">
            <span className="eyebrow">SECURE YOUR ACCOUNT</span>
            <h2>ตั้งรหัสผ่านใหม่</h2>
            <p>กรุณากรอกรหัสผ่านใหม่ของคุณ</p>
          </div>
          {msg && <div className="error-box" style={{ background: msg.includes("❌") ? '#FEE2E2' : '#DCFCE7', color: 'var(--ink)' }}>{msg}</div>}
          <form onSubmit={submit} className="form">
            <Field label="New Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
            <button className="btn btn-dark full" disabled={busy}>{busy ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"} <Check size={18}/></button>
          </form>
        </div>
      </div>
    </div>
  );
}

function AuthScreen({ mode, setMode, onSuccess }) {
  const [form, setForm] = useState({ username:"", display_name:"", email:"", password:"" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try {
      if (mode === "forgot-password") {
        const res = await fetch("http://localhost:8000/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "เกิดข้อผิดพลาด");
        alert(data.message);
        setMode("login");
      } else if (mode === "login") {
        const data = await api.login({ email: form.email, password: form.password });
        onSuccess(data);
      } else {
        const data = await api.register(form);
        onSuccess(data);
      }
    } catch (err) { 
      let msg = err.message;
      if (msg === "[object Object]") msg = "ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้องค่ะ";
      setError(msg); 
    } finally { setBusy(false); }
  };

  return (
    <div className="auth-layout">
      <div className="auth-visual">
        <div className="auth-brand">ClosetLoop<span>®</span></div>
        <div className="auth-copy">
          <span className="eyebrow">YOUR WARDROBE, REIMAGINED</span>
          <h1>Wear it.<br/><i>Loop it.</i></h1>
          <p>ตู้เสื้อผ้าดิจิทัลที่ช่วยจัดลุคให้คุณ และเปลี่ยนเสื้อผ้าที่ไม่ได้ใส่ให้กลับมามีคุณค่าอีกครั้ง</p>
        </div>
        <div className="floating-card card-a"><span>✦</span><b>AI MATCH</b><small>your style, your way</small></div>
        <div className="floating-card card-b"><span>↻</span><b>RE-LOOP</b><small>sell • exchange • discover</small></div>
      </div>
      <div className="auth-panel">
        <div className="auth-panel-inner">
          <div className="mobile-logo">ClosetLoop<span>®</span></div>
          <div className="auth-heading">
            <span className="eyebrow">{mode === "login" ? "WELCOME BACK" : mode === "register" ? "JOIN THE LOOP" : "RESET PASSWORD"}</span>
            <h2>{mode === "login" ? "เข้าสู่ ClosetLoop" : mode === "register" ? "สร้างบัญชีใหม่" : "ลืมรหัสผ่าน"}</h2>
            <p>{mode === "login" ? "กลับมาสนุกกับตู้เสื้อผ้าของคุณต่อ" : mode === "register" ? "เริ่มต้น wardrobe journey ของคุณวันนี้" : "กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน"}</p>
          </div>
          {error && <div className="error-box">{error}</div>}
          <form onSubmit={submit} className="form">
            
            {mode === "forgot-password" && (
              <Field label="Email" type="email" value={form.email} onChange={v=>setForm({...form,email:v})} placeholder="you@example.com" required />
            )}

            {mode !== "forgot-password" && (
              <>
                {mode === "register" && <>
                  <Field label="Username" value={form.username} onChange={v=>setForm({...form,username:v})} placeholder="yourname" required />
                  <Field label="Display name" value={form.display_name} onChange={v=>setForm({...form,display_name:v})} placeholder="August" />
                </>}
                <Field 
                  label={mode === "login" ? "Email or Username" : "Email"} 
                  type={mode === "login" ? "text" : "email"} 
                  value={form.email} 
                  onChange={v=>setForm({...form,email:v})} 
                  placeholder={mode === "login" ? "you@example.com หรือชื่อผู้ใช้" : "you@example.com"} 
                  required 
                />
                <Field 
                  label="Password" 
                  type="password" 
                  value={form.password} 
                  onChange={v=>setForm({...form,password:v})} 
                  placeholder="••••••••" 
                  required 
                  labelRight={
                    mode === "login" ? (
                      <a href="#" onClick={(e) => { e.preventDefault(); setMode("forgot-password"); }} style={{ fontSize: '0.8rem', color: 'var(--ink)' }}>ลืมรหัสผ่าน?</a>
                    ) : null
                  }
                />
              </>
            )}

            <button className="btn btn-dark full" disabled={busy}>
              {busy ? "กำลังดำเนินการ..." : mode === "login" ? "เข้าสู่ระบบ" : mode === "register" ? "สมัครสมาชิก" : "ส่งลิงก์รีเซ็ตรหัสผ่าน"} 
              <ArrowRight size={18}/>
            </button>
          </form>
          
          <div className="auth-switch">
            {mode === "forgot-password" ? (
              <>จำรหัสผ่านได้แล้ว? <button onClick={() => setMode("login")}>กลับไปเข้าสู่ระบบ</button></>
            ) : (
              <>
                {mode === "login" ? "ยังไม่มีบัญชี?" : "มีบัญชีอยู่แล้ว?"}
                <button onClick={()=>{setMode(mode==="login"?"register":"login")}}> {mode === "login" ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}</button>
              </>
            )}
          </div>
          <div className="auth-note"><LockKeyhole size={14}/> ข้อมูลของคุณจะถูกจัดการผ่าน REST API และ PostgreSQL</div>
        </div>
      </div>
    </div>
  );
}

function Field({label, value, onChange, type="text", placeholder, required, labelRight}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <label className="field">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span>{label}</span>
        {labelRight && labelRight}
      </div>
      <div style={{ position: 'relative' }}>
        <input 
          type={inputType} 
          value={value} 
          onChange={e=>onChange(e.target.value)} 
          placeholder={placeholder} 
          required={required} 
          style={{ width: '100%', boxSizing: 'border-box', paddingRight: isPassword ? '40px' : '12px' }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center', padding: 0 }}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </label>
  );
}

function Sidebar({ page, setPage, user, logout }) {
  const nav = [
    ["dashboard","Overview",Home], ["closet","My Closet",Shirt], ["ai","AI Outfit",Sparkles],
    ["market","Marketplace",ShoppingBag], ["orders","Orders",PackageCheck], ["profile","Profile",CircleUserRound]
  ];
  return <aside className="sidebar">
    <div className="brand" onClick={()=>setPage("dashboard")}>ClosetLoop<span>®</span></div>
    <div className="sidebar-user">
      <div className="avatar">{(user.display_name || user.username).slice(0,1).toUpperCase()}</div>
      <div><b>{user.display_name || user.username}</b><small>@{user.username}</small></div>
    </div>
    <div className="nav-label">MENU</div>
    <nav>{nav.map(([key,label,Icon])=><button key={key} className={page===key?"active":""} onClick={()=>setPage(key)}><Icon size={18}/>{label}</button>)}</nav>
    <div className="sidebar-bottom">
      <button onClick={()=>setPage("home")}><ArrowRight size={17}/> View landing</button>
      <button onClick={logout} className="logout"><LogOut size={17}/> Log out</button>
    </div>
  </aside>
}

function Topbar({page,user,setPage}) {
  const titles={home:"Home",dashboard:"Overview",closet:"My Closet",ai:"AI Outfit",market:"Marketplace",orders:"Orders",profile:"Profile"};
  return <header className="topbar">
    <div className="mobile-brand">ClosetLoop<span>®</span></div>
    <div className="breadcrumb">CLOSETLOOP <ChevronRight size={13}/> {titles[page]}</div>
    <div className="top-actions">
      <button className="icon-btn" onClick={()=>setPage("market")}><Search size={18}/></button>
      <button className="user-chip" onClick={()=>setPage("profile")}><div className="mini-avatar">{(user.display_name||user.username).slice(0,1).toUpperCase()}</div><span>{user.display_name||user.username}</span></button>
    </div>
  </header>
}

function HomePage({setPage,user}) {
  return <section className="landing">
    <div className="landing-hero">
      <div className="hero-copy">
        <span className="eyebrow">THE SMARTER WAY TO DRESS</span>
        <h1>Your closet.<br/><em>On repeat.</em></h1>
        <p>จัดตู้เสื้อผ้าในชีวิตจริงให้เป็นดิจิทัล ให้ AI ช่วยแมตช์ลุค และส่งต่อชิ้นที่ไม่ใช่ให้คนที่ใช่</p>
        <div className="hero-actions"><button className="btn btn-dark" onClick={()=>setPage("closet")}>Build my closet <ArrowRight size={18}/></button><button className="btn btn-ghost" onClick={()=>setPage("ai")}>Try AI Outfit <Sparkles size={17}/></button></div>
      </div>
      <div className="hero-art">
        <div className="art-ring ring-1"></div><div className="art-ring ring-2"></div>
        <div className="look-card"><div className="look-tag">TODAY'S LOOK</div><div className="fashion-shape">🧥</div><b>Clean Y2K</b><small>4 pieces • 96% match</small></div>
        <div className="tiny-stat"><b>128</b><span>community pieces</span></div>
      </div>
    </div>
    <div className="landing-strip"><span>VIRTUAL CLOSET</span><span>✦</span><span>AI OUTFIT MATCHING</span><span>✦</span><span>SELL & EXCHANGE</span><span>✦</span><span>SHOP PRE-LOVED</span></div>
    <div className="section-head"><div><span className="eyebrow">ONE LOOP, MANY WAYS</span><h2>Everything your wardrobe needs.</h2></div><button className="text-btn" onClick={()=>setPage("dashboard")}>Explore dashboard <ArrowRight size={16}/></button></div>
    <div className="feature-grid">
      <Feature num="01" icon="◒" title="Virtual Closet" text="เก็บทุกไอเท็มไว้ที่เดียว ค้นง่าย และรู้ว่าคุณมีอะไรอยู่แล้ว"/>
      <Feature num="02" icon="✦" title="AI Outfit" text="เลือกโอกาสและสไตล์ แล้วให้ ClosetLoop ช่วยจับคู่ลุค"/>
      <Feature num="03" icon="↻" title="Re-loop" text="ขาย แลก และค้นพบแฟชั่นมือสองที่เหมาะกับคุณ"/>
    </div>
  </section>
}

function Feature({num,icon,title,text}) { return <div className="feature-card"><div className="feature-top"><span>{num}</span><strong>{icon}</strong></div><h3>{title}</h3><p>{text}</p><ArrowRight size={18}/></div> }

function Dashboard({setPage,user}) {
  const [closet,setCloset]=useState([]);
  const [products,setProducts]=useState([]);
  useEffect(()=>{
    api.closet().then(d => setCloset(Array.isArray(d) ? d : [])).catch(()=>{});
    api.products().then(d => setProducts(Array.isArray(d) ? d : [])).catch(()=>{});
  },[]);
  
  return <section className="page">
    <div className="page-hero"><div><span className="eyebrow">GOOD TO SEE YOU</span><h1>Hi, {user.display_name || user.username}.</h1><p>พร้อมแต่งตัวให้สนุกกว่าเดิมหรือยัง?</p></div><button className="btn btn-dark" onClick={()=>setPage("ai")}><Sparkles size={17}/> Generate a look</button></div>
    <div className="stat-grid"><Stat label="Pieces in closet" value={closet.length} icon="◒"/><Stat label="AI looks" value="∞" icon="✦"/><Stat label="Live listings" value={products.length} icon="↗"/><Stat label="Orders" value="—" icon="✓"/></div>
    <div className="split-grid">
      <div className="panel">
        <div className="panel-head"><div><span className="eyebrow">YOUR CLOSET</span><h3>Recent pieces</h3></div><button className="text-btn" onClick={()=>setPage("closet")}>View all <ArrowRight size={15}/></button></div>
        {closet.length ? <div className="mini-items">{closet.slice(0,4).map(x=><MiniItem key={x.id} item={x}/>)}</div> : <EmptyState text="ยังไม่มีเสื้อผ้าในตู้" action="Add your first piece" onClick={()=>setPage("closet")}/>}
      </div>
      <div className="panel dark-panel"><div className="eyebrow light">STYLE TIP</div><h3>Build a closet<br/>that works for you.</h3><p>เริ่มจาก 5–10 ชิ้นที่ใส่บ่อย แล้วให้ AI เรียนรู้สไตล์ของคุณ</p><button className="btn btn-light" onClick={()=>setPage("closet")}>Start building <ArrowRight size={16}/></button></div>
    </div>
    <div className="section-head compact"><div><span className="eyebrow">MARKETPLACE</span><h2>Fresh from the loop.</h2></div><button className="text-btn" onClick={()=>setPage("market")}>Shop all <ArrowRight size={16}/></button></div>
    <div className="product-grid">{(products.length ? products : demoProducts).slice(0,3).map(p=><ProductCard key={p.id} product={p} demo={!products.length} />)}</div>
  </section>
}

function Stat({label,value,icon}) { return <div className="stat-card"><span>{icon}</span><div><b>{value}</b><small>{label}</small></div></div> }
function MiniItem({item}) { return <div className="mini-item"><div className="item-thumb">{item.image_url ? <img src={item.image_url}/> : categories.find(c=>c.key===item.category)?.icon || "◒"}</div><div><b>{item.name}</b><small>{item.color} · {item.style}</small></div><ChevronRight size={16}/></div> }
function EmptyState({text,action,onClick}) { return <div className="empty"><div className="empty-icon">◒</div><p>{text}</p>{action&&<button className="btn btn-outline" onClick={onClick}><Plus size={16}/>{action}</button>}</div> }

function ClosetPage({setToast}) {
  const [items,setItems]=useState([]);
  const [show,setShow]=useState(false);
  
  const load=()=>api.closet().then(d=>{
    if(!Array.isArray(d)) { 
      console.error("Closet API Error:", d); 
      setItems([]); 
    } else { 
      setItems(d); 
    }
  }).catch(e=>setToast(e.message));
  
  useEffect(() => { load(); }, []);
  
  const del=async(id)=>{if(!confirm("ลบไอเท็มนี้หรือไม่?"))return;try{await api.deleteCloset(id);setToast("ลบไอเท็มแล้ว");load()}catch(e){setToast(e.message)}};
  
  return <section className="page">
    <div className="page-hero"><div><span className="eyebrow">BUILD YOUR WORLD</span><h1>My Closet</h1><p>{items.length} pieces in your digital wardrobe.</p></div><button className="btn btn-dark" onClick={()=>setShow(true)}><Plus size={18}/> Add piece</button></div>
    <div className="category-row">{categories.map(c=><div className="category-pill" key={c.key}><span>{c.icon}</span>{c.label}<b>{items.filter(x=>x.category===c.key).length}</b></div>)}</div>
    {items.length ? <div className="closet-grid">{items.map(item=><ClosetCard key={item.id} item={item} onDelete={del}/>)}</div> : <div className="large-empty"><div>👚</div><h3>Your closet is waiting.</h3><p>เพิ่มเสื้อผ้าชิ้นแรกของคุณ แล้วเริ่มสร้างลุคกันเลย</p><button className="btn btn-dark" onClick={()=>setShow(true)}><Plus size={17}/> Add first piece</button></div>}
    {show && <ClosetModal close={()=>setShow(false)} save={async(data)=>{try{await api.createCloset(data);setShow(false);setToast("เพิ่มเสื้อผ้าเข้าตู้แล้ว ✨");load()}catch(e){setToast(e.message)}}}/>}
  </section>
}

function ClosetCard({item,onDelete}) {
  const cat=categories.find(c=>c.key===item.category);
  return <article className="closet-card"><div className="clothing-art">{item.image_url?<img src={item.image_url}/>:cat?.icon||"◒"}<button className="round-delete" onClick={()=>onDelete(item.id)}><Trash2 size={14}/></button></div><div className="card-info"><div><b>{item.name}</b><small>{cat?.label} · {item.style}</small></div><span className="dot-tag">{item.color}</span></div></article>
}

function ClosetModal({close,save}) {
  const [form,setForm]=useState({name:"",category:"top",color:"black",size:"M",style:"casual",condition:"good",image_url:""});
  return <Modal title="Add to your closet" close={close}><form className="form" onSubmit={e=>{e.preventDefault();save(form)}}><Field label="Item name" value={form.name} onChange={v=>setForm({...form,name:v})} placeholder="e.g. Baby tee" required/><div className="two-col"><Select label="Category" value={form.category} onChange={v=>setForm({...form,category:v})} options={categories.map(x=>[x.key,x.label])}/><Select label="Color" value={form.color} onChange={v=>setForm({...form,color:v})} options={["black","white","cream","pink","blue","brown","grey","green"].map(x=>[x,x])}/></div><div className="two-col"><Select label="Style" value={form.style} onChange={v=>setForm({...form,style:v})} options={["casual","korean","y2k","minimal","street","preppy"].map(x=>[x,x])}/><Select label="Size" value={form.size} onChange={v=>setForm({...form,size:v})} options={["XS","S","M","L","XL"].map(x=>[x,x])}/></div><Field label="Image URL (optional)" value={form.image_url} onChange={v=>setForm({...form,image_url:v})} placeholder="https://..."/><button className="btn btn-dark full">Save piece <Check size={17}/></button></form></Modal>
}

function AIPage({setToast}) {
  const [closet,setCloset]=useState([]);
  const [form,setForm]=useState({occasion:"cafe",style:"korean",weather:"hot"});
  const [result,setResult]=useState(null);
  const [busy,setBusy]=useState(false);
  
  useEffect(()=>{
    api.closet().then(d=>setCloset(Array.isArray(d)?d:[])).catch(()=>{});
  },[]);
  
  const generate=async()=>{
    if(!closet.length){setToast("เพิ่มเสื้อผ้าใน My Closet ก่อนนะ");return}
    setBusy(true);
    try{
      const res = await api.generateOutfit(form);
      if (res && Array.isArray(res.items)) {
        setResult(res);
      } else {
        console.error("AI Error:", res);
        setToast("เกิดข้อผิดพลาดในการจัดลุค");
      }
    }catch(e){setToast(e.message)}finally{setBusy(false)}
  };
  
  return <section className="page">
    <div className="page-hero"><div><span className="eyebrow">STYLE, POWERED BY YOUR CLOSET</span><h1>AI Outfit</h1><p>เลือก mood แล้วให้ ClosetLoop จัดลุคจากเสื้อผ้าที่คุณมี</p></div><div className="ai-badge"><Sparkles size={16}/> Rule-based AI Demo</div></div>
    <div className="ai-layout">
      <div className="panel ai-controls"><span className="eyebrow">01 / SET YOUR MOOD</span><h3>What are we dressing for?</h3><div className="choice-group"><label>Occasion</label><div className="choice-grid">{[["cafe","☕ Cafe"],["date","♡ Date"],["uni","✎ University"],["party","✦ Party"]].map(([v,l])=><button className={form.occasion===v?"selected":""} onClick={()=>setForm({...form,occasion:v})} key={v}>{l}</button>)}</div></div><div className="choice-group"><label>Style</label><div className="choice-grid">{["korean","y2k","minimal","street"].map(v=><button className={form.style===v?"selected":""} onClick={()=>setForm({...form,style:v})} key={v}>{v}</button>)}</div></div><div className="choice-group"><label>Weather</label><div className="choice-grid">{[["hot","☀ Hot"],["cool","☁ Cool"],["rain","☂ Rain"]].map(([v,l])=><button className={form.weather===v?"selected":""} onClick={()=>setForm({...form,weather:v})} key={v}>{l}</button>)}</div></div><button className="btn btn-dark full" onClick={generate} disabled={busy}><Sparkles size={17}/>{busy?"Finding your match...":"Generate my outfit"}</button></div>
      <div className="outfit-result"><div className="result-top"><span className="eyebrow">02 / YOUR LOOK</span>{result&&<span className="match-score">96% MATCH</span>}</div>{result ? <><div className="look-result-grid">{result.items.map((x,i)=><div className="result-piece" key={x.id}><div>{x.image_url?<img src={x.image_url}/>:categories.find(c=>c.key===x.category)?.icon||"◒"}</div><small>0{i+1}</small><b>{x.name}</b><span>{x.color}</span></div>)}</div><div className="tip"><Sparkles size={17}/><div><b>ClosetLoop says</b><p>{result.tip}</p></div></div></> : <div className="result-placeholder"><div className="big-sparkle">✦</div><h3>Your next look starts here.</h3><p>มี {closet.length} ชิ้นในตู้พร้อมให้ AI แมตช์</p></div>}</div>
    </div>
  </section>
}

function MarketPage({user,setToast}) {
  const [products,setProducts]=useState([]);
  const [closet,setCloset]=useState([]);
  const [q,setQ]=useState("");
  const [type,setType]=useState("");
  const [showSell,setShowSell]=useState(false);
  
  const load=()=>api.products(`?q=${encodeURIComponent(q)}${type?`&listing_type=${type}`:""}`).then(d=>{
    if(!Array.isArray(d)){ console.error("Products API Error:", d); setProducts([]); }
    else { setProducts(d); }
  }).catch(e=>setToast(e.message));
  
  useEffect(()=>{
    load();
    api.closet().then(d=>setCloset(Array.isArray(d)?d:[])).catch(()=>{});
  },[q,type]);
  
  const buy=async(p)=>{if(String(p.id).startsWith("demo")){setToast("สินค้านี้เป็นตัวอย่าง — ลองลงขายจาก My Closet เพื่อทดสอบการซื้อจริง");return}try{await api.createOrder({product_id:p.id,quantity:1});setToast("สั่งซื้อสำเร็จ 🎉");load()}catch(e){setToast(e.message)}};
  return <section className="page">
    <div className="page-hero"><div><span className="eyebrow">PRE-LOVED, RE-IMAGINED</span><h1>Marketplace</h1><p>ซื้อ ขาย และส่งต่อชิ้นโปรดให้คนใหม่</p></div><button className="btn btn-dark" onClick={()=>setShowSell(true)}><Plus size={18}/> Sell a piece</button></div>
    <div className="market-toolbar"><div className="search-box"><Search size={17}/><input placeholder="Search the loop..." value={q} onChange={e=>setQ(e.target.value)}/></div><div className="filter-group"><SlidersHorizontal size={16}/><button className={!type?"on":""} onClick={()=>setType("")}>All</button><button className={type==="sale"?"on":""} onClick={()=>setType("sale")}>For sale</button><button className={type==="exchange"?"on":""} onClick={()=>setType("exchange")}>Exchange</button></div></div>
    <div className="product-grid market-products">{products.length?products.map(p=><ProductCard key={p.id} product={p} onBuy={()=>buy(p)} currentUser={user}/>):demoProducts.map(p=><ProductCard key={p.id} product={p} demo onBuy={()=>buy(p)}/>)}</div>
    {showSell&&<SellModal close={()=>setShowSell(false)} closet={closet} save={async(data)=>{try{await api.createProduct(data);setShowSell(false);setToast("ลงขายสำเร็จ ✦");load()}catch(e){setToast(e.message)}}}/>}
  </section>
}

function ProductCard({product,onBuy,demo,currentUser}) {
  const emoji=product.title.toLowerCase().includes("bag")?"👜":product.title.toLowerCase().includes("trouser")?"👖":"👕";
  return <article className="product-card"><div className="product-art">{product.image_url?<img src={product.image_url}/>:emoji}<span className="product-label">{product.listing_type==="exchange"?"EXCHANGE":"FOR SALE"}</span><button className="heart"><Heart size={16}/></button></div><div className="product-info"><div><b>{product.title}</b><small>{product.description||"Pre-loved piece from the community"}</small></div><strong>{money(product.price)}</strong></div>{onBuy&&<button className="buy-btn" onClick={onBuy}>{currentUser&&product.seller_id===currentUser.id?"Your listing":"Buy now"} <ArrowRight size={15}/></button>}</article>
}

function SellModal({close,closet,save}) {
  const [form,setForm]=useState({closet_item_id:closet[0]?.id||"",title:closet[0]?.name||"",description:"",price:"",listing_type:"sale",image_url:""});
  useEffect(()=>{const x=closet.find(i=>String(i.id)===String(form.closet_item_id));if(x)setForm(f=>({...f,title:x.name,image_url:x.image_url||""}))},[form.closet_item_id]);
  return <Modal title="Put a piece back in the loop" close={close}><form className="form" onSubmit={e=>{e.preventDefault();save({...form,closet_item_id:form.closet_item_id?Number(form.closet_item_id):null,price:Number(form.price)})}}>{closet.length?<Select label="Choose closet piece" value={form.closet_item_id} onChange={v=>setForm({...form,closet_item_id:v})} options={closet.map(x=>[x.id,x.name])}/>:<div className="error-box">ยังไม่มีเสื้อผ้าใน Closet ให้เพิ่มก่อน</div>}<Field label="Listing title" value={form.title} onChange={v=>setForm({...form,title:v})} placeholder="Title" required/><Field label="Price (฿)" type="number" value={form.price} onChange={v=>setForm({...form,price:v})} placeholder="350" required/><Select label="Type" value={form.listing_type} onChange={v=>setForm({...form,listing_type:v})} options={[["sale","For sale"],["exchange","Exchange"]]}/><Field label="Description" value={form.description} onChange={v=>setForm({...form,description:v})} placeholder="Tell people about this piece"/><button className="btn btn-dark full" disabled={!closet.length}>List it <ArrowRight size={17}/></button></form></Modal>
}

function OrdersPage() {
  const [orders,setOrders]=useState([]);
  useEffect(()=>{
    api.orders().then(d=>setOrders(Array.isArray(d)?d:[])).catch(()=>{});
  },[]);
  return <section className="page"><div className="page-hero"><div><span className="eyebrow">YOUR LOOP</span><h1>Orders</h1><p>ติดตามรายการซื้อของคุณ</p></div></div>{orders.length?<div className="orders-list">{orders.map(o=><div className="order-card" key={o.id}><div className="order-icon">📦</div><div><b>Order #{o.id}</b><small>Product #{o.product_id} · {o.quantity} item</small></div><span className="order-status">{o.status}</span><strong>{money(o.total_price)}</strong></div>)}</div>:<div className="large-empty"><div>🛍️</div><h3>No orders yet.</h3><p>ของที่คุณซื้อจาก Marketplace จะปรากฏที่นี่</p></div>}</section>
}

function ProfilePage({user,setUser,setToast,logout}) {
  const [form,setForm]=useState({username:user.username,email:user.email,display_name:user.display_name,avatar_url:user.avatar_url||""});
  const [pw,setPw]=useState({current_password:"",new_password:""});
  const save=async()=>{try{const u=await api.updateUser(user.id,form);setUser(u);setToast("อัปเดตโปรไฟล์แล้ว ✨")}catch(e){setToast(e.message)}};
  const change=async()=>{try{await api.changePassword(pw);setPw({current_password:"",new_password:""});setToast("เปลี่ยนรหัสผ่านแล้ว")}catch(e){setToast(e.message)}};
  return <section className="page profile-page"><div className="page-hero"><div><span className="eyebrow">YOUR ACCOUNT</span><h1>Profile</h1><p>จัดการข้อมูลและความปลอดภัยของบัญชี</p></div></div><div className="profile-grid"><div className="panel"><div className="profile-heading"><div className="profile-avatar">{(user.display_name||user.username).slice(0,1).toUpperCase()}</div><div><h3>{user.display_name||user.username}</h3><p>@{user.username}</p></div></div><div className="form"><Field label="Username" value={form.username} onChange={v=>setForm({...form,username:v})}/><Field label="Display name" value={form.display_name} onChange={v=>setForm({...form,display_name:v})}/><Field label="Email" type="email" value={form.email} onChange={v=>setForm({...form,email:v})}/><button className="btn btn-dark" onClick={save}>Save profile <Check size={17}/></button></div></div><div className="panel"><span className="eyebrow">SECURITY</span><h3>Change password</h3><p className="muted">ใช้รหัสผ่านใหม่อย่างน้อย 8 ตัวอักษรเพื่อความปลอดภัย</p><div className="form"><Field label="Current password" type="password" value={pw.current_password} onChange={v=>setPw({...pw,current_password:v})}/><Field label="New password" type="password" value={pw.new_password} onChange={v=>setPw({...pw,new_password:v})}/><button className="btn btn-outline" onClick={change}>Update password <LockKeyhole size={16}/></button></div><hr/><button className="danger-btn" onClick={logout}><LogOut size={16}/> Log out</button></div></div></section>
}

function Select({label,value,onChange,options}) { return <label className="field"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}>{options.map(([v,l])=><option value={v} key={v}>{l}</option>)}</select></label> }
function Modal({title,close,children}) { return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><h3>{title}</h3><button onClick={close}><X size={19}/></button></div>{children}</div></div> }

export default App;