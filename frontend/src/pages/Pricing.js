import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Pricing() {
  const navigate = useNavigate();
  return (
    <div style={{background:'#0A0A0A',minHeight:'100vh',padding:'60px 20px',color:'white',maxWidth:'1000px',margin:'0 auto'}}>
      <h1 style={{color:'#FF6B00',fontSize:'2.5rem',marginBottom:'10px',textAlign:'center'}}>Simple Pricing 💰</h1>
      <p style={{color:'#888',marginBottom:'40px',textAlign:'center'}}>No hidden fees. Pay only for what you need.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px'}}>
        {[
          {title:'Student',price:'FREE',color:'#888',features:['Create profile','Browse all jobs','Submit unlimited pitches','Build portfolio','Earn money'],btn:'Join as Student',path:'/signup'},
          {title:'Business Basic',price:'₹0',color:'#FF6B00',features:['Post up to 5 jobs/month','Review all pitches','Direct student contact','Escrow payment','Track work live'],btn:'Post a Job',path:'/post-job',highlight:true},
          {title:'Business Pro',price:'₹999/mo',color:'#gold',features:['Unlimited job posts','Priority student matching','AI pitch assistant','Dedicated support','Analytics dashboard'],btn:'Coming Soon',path:'/signup'}
        ].map(plan=>(
          <div key={plan.title} style={{background: plan.highlight ? '#1a0f00' : '#111',borderRadius:'16px',padding:'30px',border:`2px solid ${plan.highlight ? '#FF6B00' : '#222'}`,position:'relative'}}>
            {plan.highlight && <div style={{position:'absolute',top:'-12px',left:'50%',transform:'translateX(-50%)',background:'#FF6B00',padding:'4px 16px',borderRadius:'20px',fontSize:'12px',fontWeight:'bold'}}>MOST POPULAR</div>}
            <h3 style={{color:'white',marginBottom:'8px'}}>{plan.title}</h3>
            <div style={{color:'#FF6B00',fontSize:'2rem',fontWeight:'bold',marginBottom:'20px'}}>{plan.price}</div>
            {plan.features.map(f=>(
              <div key={f} style={{color:'#ccc',marginBottom:'10px',display:'flex',alignItems:'center',gap:'8px'}}>
                <span style={{color:'#FF6B00'}}>✓</span>{f}
              </div>
            ))}
            <button onClick={()=>navigate(plan.path)} style={{width:'100%',marginTop:'20px',background: plan.highlight ? '#FF6B00' : '#1a1a1a',color:'white',border: plan.highlight ? 'none' : '1px solid #333',padding:'12px',borderRadius:'8px',fontWeight:'bold',cursor:'pointer'}}>{plan.btn}</button>
          </div>
        ))}
      </div>
    </div>
  );
}