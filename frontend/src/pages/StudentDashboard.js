import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import API from '../config';
import './StudentDashboard.css';

const TIERS = ['Bronze', 'Silver', 'Gold', 'Verified Pro'];

const TIER_STYLES = {
  Bronze: { color: '#CD7F32', glow: 'rgba(205, 127, 50, 0.5)' },
  Silver: { color: '#C0C0C0', glow: 'rgba(192, 192, 192, 0.5)' },
  Gold: { color: '#FFD700', glow: 'rgba(255, 215, 0, 0.5)' },
  'Verified Pro': { color: '#FF6B00', glow: 'rgba(255, 107, 0, 0.55)' },
};

const TIER_REQUIREMENTS = {
  Bronze: { next: 'Silver', req: 'Complete 1 task • Reach 25 trust points' },
  Silver: { next: 'Gold', req: '5 tasks completed • 60+ trust points' },
  Gold: { next: 'Verified Pro', req: '15 tasks • 85+ trust points • Portfolio verified' },
  'Verified Pro': { next: null, req: 'You are at the top tier! Keep delivering excellence.' },
};

const TIER_THRESHOLDS = { Bronze: 0, Silver: 25, Gold: 60, 'Verified Pro': 100 };

const SKILL_DEMAND = [
  { skill: 'Video Editing', percent: 87 },
  { skill: 'Social Media', percent: 76 },
  { skill: 'Canva Design', percent: 65 },
  { skill: 'Automation', percent: 54 },
  { skill: 'Copywriting', percent: 43 },
  { skill: 'SEO', percent: 32 },
];

const CATEGORY_LABELS = {
  'Social Media': 'Social Media',
  Branding: 'Branding',
  'Video Editing': 'Video/Editing',
  'Growth Outreach': 'Growth/Outreach',
  'Automation Tech': 'Automation/Tech',
  'Research Ops': 'Research/Ops',
};

function AnimatedCounter({ target, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [text, setText] = useState(`${prefix}0${suffix}`);

  useEffect(() => {
    if (!isInView) return undefined;
    const controls = animate(count, target, { duration: 1.8, ease: 'easeOut' });
    return () => controls.stop();
  }, [isInView, count, target]);

  useEffect(() => {
    const unsub = rounded.on('change', (v) => setText(`${prefix}${v}${suffix}`));
    return () => unsub();
  }, [prefix, suffix, rounded]);

  return <span ref={ref}>{text}</span>;
}

function getWorkStatus(pitch, job) {
  if (pitch.status === 'Pending') return 'Pending';
  if (pitch.status === 'Accepted') {
    if (job?.status === 'Completed' || job?.status === 'Closed') return 'Paid';
    if (job?.status === 'In Progress') return 'In Progress';
    return 'In Progress';
  }
  return 'Pending';
}

function getAction(status) {
  switch (status) {
    case 'Pending':
      return { label: 'View Pitch', to: '/jobs' };
    case 'In Progress':
      return { label: 'Submit Work', to: '/jobs' };
    case 'Revision':
      return { label: 'Resubmit', to: '/jobs' };
    case 'Completed':
      return { label: 'View Details', to: '/jobs' };
    case 'Paid':
      return { label: 'View Receipt', to: '/jobs' };
    default:
      return { label: 'View', to: '/jobs' };
  }
}

function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentName =
    localStorage.getItem('icockroach_student_name') || 'Student';

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [jobsRes, pitchesRes, studentsRes] = await Promise.all([
          axios.get(`${API}/api/jobs`),
          axios.get(`${API}/api/pitches`, {
            params: { studentName },
          }),
          axios.get(`${API}/api/students`),
        ]);

        setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
        setPitches(Array.isArray(pitchesRes.data) ? pitchesRes.data : []);

        const students = Array.isArray(studentsRes.data) ? studentsRes.data : [];
        const matched = students.find(
          (s) => s.name?.toLowerCase() === studentName.toLowerCase()
        );

        if (matched) {
          setStudent(matched);
        } else {
          const accepted = (pitchesRes.data || []).filter(
            (p) => p.status === 'Accepted'
          );
          const earnings = accepted.reduce((sum, p) => sum + (p.cost || 0), 0);
          setStudent({
            name: studentName,
            trustTier: 'Bronze',
            trustScore: Math.min(20 + accepted.length * 8, 99),
            totalEarnings: earnings,
          });
        }
      } catch {
        setStudent({
          name: studentName,
          trustTier: 'Bronze',
          trustScore: 15,
          totalEarnings: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [studentName]);

  const jobMap = useMemo(
    () => Object.fromEntries(jobs.map((j) => [j._id, j])),
    [jobs]
  );

  const stats = useMemo(() => {
    const availableJobs = jobs.filter((j) => j.status === 'Open').length;
    const pitchesSent = pitches.length;
    const jobsWon = pitches.filter((p) => p.status === 'Accepted').length;
    const totalEarned =
      student?.totalEarnings ??
      pitches
        .filter((p) => p.status === 'Accepted')
        .reduce((sum, p) => sum + (p.cost || 0), 0);

    return { availableJobs, pitchesSent, jobsWon, totalEarned };
  }, [jobs, pitches, student]);

  const activeWork = useMemo(() => {
    return pitches
      .filter((p) => p.status !== 'Rejected')
      .map((pitch) => {
        const job = jobMap[pitch.jobId];
        const status = getWorkStatus(pitch, job);
        return {
          id: pitch._id,
          title: job?.title || 'Unknown Job',
          category: CATEGORY_LABELS[job?.category] || job?.category || '—',
          budget: job?.budget ?? pitch.cost,
          status,
          action: getAction(status),
          jobId: pitch.jobId,
        };
      });
  }, [pitches, jobMap]);

  const recentEarnings = useMemo(() => {
    return pitches
      .filter((p) => p.status === 'Accepted')
      .map((p) => ({
        id: p._id,
        jobName: jobMap[p.jobId]?.title || 'Completed Job',
        amount: p.cost,
        date: p.createdAt,
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [pitches, jobMap]);

  const tier = student?.trustTier || 'Bronze';
  const tierStyle = TIER_STYLES[tier] || TIER_STYLES.Bronze;
  const trustScore = student?.trustScore ?? 0;
  const currentThreshold = TIER_THRESHOLDS[tier] ?? 0;
  const nextTier = TIER_REQUIREMENTS[tier]?.next;
  const nextThreshold = nextTier ? TIER_THRESHOLDS[nextTier] : 100;
  const progress =
    nextTier
      ? Math.min(
          100,
          ((trustScore - currentThreshold) /
            (nextThreshold - currentThreshold)) *
            100
        )
      : 100;

  const statCards = [
    { icon: '💼', label: 'Available Jobs', value: stats.availableJobs },
    { icon: '📨', label: 'Pitches Sent', value: stats.pitchesSent },
    { icon: '🏆', label: 'Jobs Won', value: stats.jobsWon },
    {
      icon: '💰',
      label: 'Total Earned',
      value: stats.totalEarned,
      prefix: '₹',
    },
  ];

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="dashboard-loading">
          <span className="dash-spinner" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <motion.header
        className="dash-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="dash-header-left">
          <h1>
            Welcome back! 👋 <span>{student?.name || studentName}</span>
          </h1>
          <p className="dash-sub">Track your pitches, jobs, and earnings</p>
        </div>
        <div className="dash-header-right">
          <span
            className="tier-badge"
            style={{
              color: tierStyle.color,
              boxShadow: `0 0 24px ${tierStyle.glow}`,
              borderColor: tierStyle.color,
            }}
          >
            {tier}
          </span>
          <div className="trust-progress-wrap">
            <div className="trust-progress-labels">
              <span>Trust Score: {trustScore}</span>
              {nextTier && <span>Next: {nextTier}</span>}
            </div>
            <div className="trust-progress-bar">
              <motion.div
                className="trust-progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background: `linear-gradient(90deg, ${tierStyle.color}, #ff6b00)`,
                }}
              />
            </div>
            <p className="trust-req-text">{TIER_REQUIREMENTS[tier]?.req}</p>
          </div>
        </div>
      </motion.header>

      <div className="stats-row">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            className="stat-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            whileHover={{ y: -4 }}
          >
            <span className="stat-card-icon">{card.icon}</span>
            <span className="stat-card-number">
              <AnimatedCounter
                target={card.value}
                prefix={card.prefix || ''}
              />
            </span>
            <span className="stat-card-label">{card.label}</span>
          </motion.div>
        ))}
      </div>

      <motion.section
        className="trust-ladder-section"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2>Your Trust Ladder</h2>
        <div className="ladder-track">
          {TIERS.map((t, i) => {
            const style = TIER_STYLES[t];
            const isActive = t === tier;
            const isPast = TIERS.indexOf(t) < TIERS.indexOf(tier);
            return (
              <motion.div
                key={t}
                className={`ladder-step ${isActive ? 'ladder-step-active' : ''} ${isPast ? 'ladder-step-past' : ''}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div
                  className="ladder-dot"
                  style={{
                    background: style.color,
                    boxShadow: isActive ? `0 0 20px ${style.glow}` : 'none',
                  }}
                />
                <span style={{ color: isActive ? style.color : undefined }}>
                  {t}
                </span>
              </motion.div>
            );
          })}
          <motion.div
            className="ladder-line-fill"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: TIERS.indexOf(tier) / (TIERS.length - 1) }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </motion.section>

      <div className="dash-grid">
        <motion.section
          className="active-jobs-section"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2>Your Active Work</h2>
          {activeWork.length === 0 ? (
            <div className="table-empty">
              <p>No active work yet.</p>
              <Link to="/jobs" className="link-find-work">
                Find work →
              </Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="active-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Category</th>
                    <th>Budget</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeWork.map((row, i) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <td className="td-title">{row.title}</td>
                      <td>{row.category}</td>
                      <td className="td-budget">
                        ₹{Number(row.budget).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`status-pill status-${row.status.replace(/\s/g, '-')}`}>
                          {row.status}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={row.jobId ? `/pitch/${row.jobId}` : row.action.to}
                          className="action-btn"
                        >
                          {row.action.label}
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.section>

        <div className="dash-sidebar-col">
          <motion.section
            className="skills-section"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2>🔥 Hot Skills Right Now</h2>
            <div className="skill-bars">
              {SKILL_DEMAND.map((item, i) => (
                <div key={item.skill} className="skill-row">
                  <div className="skill-label-row">
                    <span>{item.skill}</span>
                    <span>{item.percent}%</span>
                  </div>
                  <div className="skill-bar-track">
                    <motion.div
                      className="skill-bar-fill"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.percent}%` }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.2 + i * 0.08,
                        duration: 0.9,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            className="earnings-section"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h2>Recent Earnings</h2>
            {recentEarnings.length === 0 ? (
              <p className="earnings-empty">No earnings yet. Win a pitch to get paid!</p>
            ) : (
              <ul className="earnings-list">
                {recentEarnings.map((item, i) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <span className="earning-name">{item.jobName}</span>
                    <span className="earning-amount">
                      +₹{Number(item.amount).toLocaleString('en-IN')}
                    </span>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
