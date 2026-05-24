import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://i-cockroach.onrender.com';

export default function BrowseTalent() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/students`)
      .then(res => { setStudents(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{color:'white',padding:'50px',textAlign:'center'}}>Loading talent...</div>;

  return (
    <div style={{background:'#0A0A0A',minHeight:'100vh',padding:'60px 20px',color:'white',maxWidth:'1100px',margin:'0 auto'}}>
      <h1 style={{color:'#FF6B00',fontSize:'2.5rem',marginBottom:'10px'}}>Browse Talent 🎓</h1>
      <p style={{color:'#888',marginBottom:'40px'}}>Verified student talent ready to work</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px'}}>
        {students.map(s=>(
          <div key={s._id} style={{background:'#111',borderRadius:'12px',padding:'20px',border:'1px solid #222'}}>
            <div style={{width:'50px',height:'50px',borderRadius:'50%',background:'#FF6B00',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',marginBottom:'15px'}}>👤</div>
            <h3 style={{color:'white',marginBottom:'5px'}}>{s.name}</h3>
            <p style={{color:'#888',marginBottom:'10px'}}>🎓 {s.college}</p>
            <span style={{background:'#1a0f00',color:'#FF6B00',padding:'4px 12px',borderRadius:'20px',fontSize:'12px',fontWeight:'bold'}}>{s.trustTier}</span>
            <div style={{marginTop:'15px',display:'flex',flexWrap:'wrap',gap:'6px'}}>
              {s.skills?.slice(0,3).map(skill=>(
                <span key={skill} style={{background:'#1a1a1a',color:'#ccc',padding:'3px 8px',borderRadius:'6px',fontSize:'12px'}}>{skill}</span>
              ))}
            </div>
            <p style={{color:'#FF6B00',fontWeight:'bold',marginTop:'10px'}}>₹{s.totalEarnings?.toLocaleString()} earned</p>
          </div>
        ))}
      </div>
    </div>
  );
}