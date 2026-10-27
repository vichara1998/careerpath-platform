export default function AdminStatArt({ type }) {
  const id = `admin-art-${type}`;
  const fill = name => `url(#${id}-${name})`;
  return <svg className="management-stat-art" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={type === "rejected" ? "#fff0ee" : "#fffdf5"}/><stop offset="1" stopColor={type === "rejected" ? "#e7b7ba" : "#dbd4c4"}/></linearGradient>
      <linearGradient id={`${id}-front`} x1="0" y1="0" x2=".8" y2="1"><stop stopColor={type === "published" ? "#b8eeff" : "#324c50"}/><stop offset="1" stopColor={type === "published" ? "#4b9bea" : "#101e27"}/></linearGradient>
      <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffdc87"/><stop offset="1" stopColor="#ee9a30"/></linearGradient>
      <linearGradient id={`${id}-red`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ff967e"/><stop offset="1" stopColor="#f03e36"/></linearGradient>
      <linearGradient id={`${id}-blue`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#82d5ff"/><stop offset="1" stopColor="#3279c8"/></linearGradient>
      <filter id={`${id}-shadow`} x="-40%" y="-40%" width="190%" height="190%"><feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#001c1a" floodOpacity=".23"/></filter>
    </defs>
    <g filter={fill("shadow")}>
      {type === "all" && <>
        <path d="m22 88 43-10 35 13-45 15-33-10z" fill="#cfa04a"/><path d="m26 88 38-8 30 11-39 11-29-8z" fill="#fff6dc"/><path d="m22 85 43-10 35 13-45 15-33-10z" fill="#248776"/><path d="m22 85 33 9v9l-33-10z" fill="#196e61"/>
        <path d="m28 74 42-9 31 12-43 13-30-9z" fill="#d99a34"/><path d="m31 74 38-7 27 10-38 10-27-7z" fill="#fff4df"/><path d="m28 70 42-9 31 12-43 13-30-9z" fill="#e1a644"/><path d="m28 70 30 7v9l-30-9z" fill="#bc7e23"/>
        <path d="m23 62 40-8 31 11-41 12-30-8z" fill="#438a99"/><path d="m27 62 35-6 28 9-37 9-26-6z" fill="#fffdf0"/><path d="m23 58 40-8 31 11-41 12-30-8z" fill="#277387"/><path d="m23 58 30 7v8l-30-8z" fill="#205c70"/>
        <path d="m38 40 27-9 23 9v19c-13 9-35 7-47-1z" fill={fill("front")}/><path d="m13 31 48-15 49 16-48 17z" fill={fill("front")} stroke="#547675" strokeWidth=".8"/><path d="m61 19 42 13-41 13" fill="none" stroke="#829c8c" strokeOpacity=".3"/>
        <path d="m63 33 25 8v23" fill="none" stroke="#e2bd59" strokeWidth="1.8"/><circle cx="88" cy="65" r="3" fill="#e8bb50"/><path d="m86 67-2 10h8l-2-10" fill={fill("gold")}/>
      </>}
      {type === "pending" && <>
        <rect x="28" y="23" width="60" height="78" rx="8" fill="#ae8b58"/><rect x="32" y="27" width="52" height="70" rx="5" fill={fill("paper")}/>
        <path d="M48 23v-5c0-5 17-5 17 0v5" fill={fill("gold")}/><rect x="43" y="20" width="29" height="11" rx="3" fill={fill("gold")}/>
        {[43, 59, 75].map(y => <g key={y}><rect x="41" y={y} width="7" height="7" rx="2" fill="#c1b6a3"/><rect x="53" y={y+1} width="21" height="4" rx="2" fill="#ddd3c0"/></g>)}
        <circle cx="87" cy="88" r="21" fill="#d58f24"/><circle cx="85" cy="85" r="20" fill={fill("gold")}/><path d="M85 73v13h10" stroke="#fff8e9" strokeWidth="2.7" strokeLinecap="round" fill="none"/>
      </>}
      {type === "published" && <>
        <path d="M64 69c-38-8-48 20-29 26 15 5 25-15 13-18-12-3-27 13-31 21" fill="none" stroke="#b1dced" strokeWidth="1.2" strokeDasharray="4 5" opacity=".8"/>
        <path d="m28 42 80-23-25 61-21-25z" fill={fill("front")}/><path d="m28 42 27 12 53-35z" fill="#b4e5fa"/><path d="m55 54 7 24 7-18 39-41z" fill="#4085bd"/><path d="m62 55 21 25 25-61z" fill={fill("blue")}/><path d="m55 54 53-35-46 36" fill="none" stroke="#e0f6ff" strokeWidth="1.2"/>
      </>}
      {type === "rejected" && <>
        <path d="M35 19h31l20 20v56c0 4-3 7-7 7H35c-4 0-7-3-7-7V26c0-4 3-7 7-7z" fill={fill("paper")}/><path d="M66 19v15c0 4 2 6 6 6h14" fill="#c9989d"/>
        <rect x="39" y="35" width="18" height="6" rx="2" fill="#ae747a"/><rect x="39" y="51" width="32" height="5" rx="2" fill="#d8a8ac"/><rect x="39" y="63" width="25" height="5" rx="2" fill="#d8a8ac"/><rect x="39" y="75" width="18" height="5" rx="2" fill="#d8a8ac"/>
        <circle cx="88" cy="86" r="23" fill="#c63c35"/><circle cx="85" cy="82" r="22" fill={fill("red")}/><path d="m77 74 16 16m0-16L77 90" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round"/>
      </>}
    </g>
  </svg>;
}
