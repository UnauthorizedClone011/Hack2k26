import { useState } from 'react';
import axios from 'axios';
import API from '../config';

export default function AdminPanel() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = () => {
    if (password === 'icockroach_admin_2026') {
      setAuthenticated(true);
      fetchJobs();
    } else {
      setError('Wrong admin password!');
    }
  };

  const fetchJobs = async () => {
    try {
      const { data } = await axios.get(`${API}/api/jobs`);
      setJobs(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleCancelJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to CANCEL this job?')) return;
    try {
      await axios.patch(`${API}/api/jobs/${jobId}/status`, { status: 'Closed' });
      setJobs(prev => prev.map(j => j._id === jobId ? { ...j, status: 'Closed' } : j));
      alert('✅ Job cancelled successfully!');
    } catch (err) {
      alert('Failed to cancel job.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('PERMANENTLY DELETE this job? Cannot be undone!')) return;
    try {
      await axios.delete(`${API}/api/jobs/${jobId}`);
      setJobs(prev => prev.filter(j => j._id !== jobId));
      alert('✅ Job deleted!');
    } catch (err) {
      alert('Failed to delete job.');
    }
  };

  if (!authenticated) {
    return (
      <div style={{background:'#0A0A0A',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{background:'#111',padding:'40px',borderRadius:'16px',border:'1px solid #FF6B00',width:'350px'}}>
          <h2 style={{color:'#FF6B00',marginBottom:'20px',textAlign:'center'}}>🔐 Admin Access</h2>
          <p style={{color:'#888',marginBottom:'20px',textAlign:'center',fontSize:'14px'}}>Only for website administrators</p>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
            style={{width:'100%',background:'#1a1a1a',border:'1px solid #333',borderRadius:'8px',padding:'12px',color:'white',marginBottom:'15px',boxSizing:'border-box'}}
          />
          {error && <p style={{color:'red',marginBottom:'10px',fontSize:'14px'}}>{error}</p>}
          <button
            onClick={handleAdminLogin}
            style={{width:'100%',background:'#FF6B00',color:'white',border:'none',padding:'12px',borderRadius:'8px',fontWeight:'bold',cursor:'pointer'}}
          >
            Login as Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{background:'#0A0A0A',minHeight:'100vh',padding:'40px 20px',color:'white'}}>
      <div style={{maxWidth:'1200px',margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'30px'}}>
          <div>
            <h1 style={{color:'#FF6B00',fontSize:'2rem'}}>🛡️ Admin Panel</h1>
            <p style={{color:'#888'}}>Manage all jobs on I-COCKROACH</p>
          </div>
          <div style={{background:'#111',padding:'15px 20px',borderRadius:'12px',border:'1px solid #222',textAlign:'center'}}>
            <div style={{color:'#FF6B00',fontSize:'1.5rem',fontWeight:'bold'}}>{jobs.length}</div>
            <div style={{color:'#888',fontSize:'12px'}}>Total Jobs</div>
          </div>
        </div>

        {loading ? (
          <p style={{color:'#888',textAlign:'center'}}>Loading jobs...</p>
        ) : (
          <div style={{display:'grid',gap:'15px'}}>
            {jobs.map(job => (
              <div key={job._id} style={{
                background:'#111',
                borderRadius:'12px',
                padding:'20px',
                border:`1px solid ${job.status === 'Closed' ? '#ff4444' : '#222'}`,
                display:'flex',
                justifyContent:'space-between',
                alignItems:'center',
                flexWrap:'wrap',
                gap:'15px'
              }}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
                    <h3 style={{color:'white',margin:0}}>{job.title}</h3>
                    <span style={{
                      background: job.status === 'Open' ? '#1a2a1a' :
                                  job.status === 'Closed' ? '#2a1a1a' : '#1a1a2a',
                      color: job.status === 'Open' ? '#4CAF50' :
                             job.status === 'Closed' ? '#ff4444' : '#FF6B00',
                      padding:'3px 10px',
                      borderRadius:'20px',
                      fontSize:'12px',
                      fontWeight:'bold'
                    }}>{job.status}</span>
                  </div>
                  <p style={{color:'#888',margin:'0 0 5px 0',fontSize:'14px'}}>
                    🏢 {job.postedBy} | 💰 ₹{job.budget} | 📅 {new Date(job.deadline).toLocaleDateString()}
                  </p>
                  <p style={{color:'#666',margin:0,fontSize:'13px'}}>
                    🆔 {job._id}
                  </p>
                </div>
                <div style={{display:'flex',gap:'10px'}}>
                  {job.status !== 'Closed' && (
                    <button
                      onClick={() => handleCancelJob(job._id)}
                      style={{
                        background:'#2a1500',
                        color:'#FF6B00',
                        border:'1px solid #FF6B00',
                        padding:'8px 16px',
                        borderRadius:'8px',
                        cursor:'pointer',
                        fontWeight:'bold',
                        fontSize:'13px'
                      }}
                    >
                      ⛔ Cancel Job
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteJob(job._id)}
                    style={{
                      background:'#2a0000',
                      color:'#ff4444',
                      border:'1px solid #ff4444',
                      padding:'8px 16px',
                      borderRadius:'8px',
                      cursor:'pointer',
                      fontWeight:'bold',
                      fontSize:'13px'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}