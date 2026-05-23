import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function GetVerified() {
  const navigate = useNavigate();
  return (
    <div style={{background:'#0A0A0A',minHeight:'100vh',padding:'60px 20px',color:'white',maxWidth:'900px',margin:'0 auto'}}>
      <h1 style={{color:'#FF6B00',fontSize:'2.5rem',marginBottom:'10px'}}>Get Verified ✅</h1>
      <p style={{color:'#888',marginBottom:'40px'}}>Build trust and unlock better opportunities</p>
      {[
        {tier:'🥉 Bronze',range:'0-25 points',req:['Complete your profile','Add portfolio link','Submit first pitch'],color:'#cd7f32'},
        {tier:'🥈 Silver',range:'26-50 points',req:['Complete 5 jobs','Maintain 4+ star rating','Response time under 2hrs'],color:'#C0C0C0'},
        {tier:'🥇 Gold',range:'51-75 points',req:['Complete 25 jobs','Zero cancellations','5 star reviews'],color:'#FFD700'},
        {tier:'💎 Verified Pro',range:'76-100 points',req:['Complete 50+ jobs','Background verified','Top 10% performer'],color:'#FF6B00'},
      ].map(t=>(
        <div key={t.tier} style={{background:'#111',borderRadius:'12px',padding:'25px',marginBottom:'20px',border:`1px solid ${t.color}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'15px'}}>
            <h2 style={{color:t.color,fontSize:'1.5rem'}}>{t.tier}</h2>
            <span style={{background:'#1a1a1a',color:t.color,padding:'4px 12px',borderRadius:'20px',fontSize:'14px'}}>{t.range}</span>
          </div>
          {t.req.map(r=>(
            <div key={r} style={{color:'#ccc',marginBottom:'8px',display:'flex',gap:'8px'}}>
              <span style={{color:t.color}}>✓</span>{r}
            </div>
          ))}
        </div>
      ))}
      <button onClick={()=>navigate('/signup')} style={{width:'100%',background:'#FF6B00',color:'white',border:'none',padding:'14px',borderRadius:'8px',fontSize:'1rem',fontWeight:'bold',cursor:'pointer',marginTop:'20px'}}>Start Your Journey 🚀</button>
    </div>
  );
}