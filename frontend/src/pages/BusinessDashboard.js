import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRupeeSign,
  FaExternalLinkAlt,
  FaUser,
  FaGraduationCap,
  FaComment,
  FaStar,
  FaClock,
  FaLink,
  FaTimes,
  FaEye,
} from 'react-icons/fa';
import API from '../config';
import './BusinessDashboard.css';

const CATEGORY_LABELS = {
  'Social Media': 'Social Media',
  Branding: 'Branding',
  'Video Editing': 'Video/Editing',
  'Growth Outreach': 'Growth/Outreach',
  'Automation Tech': 'Automation/Tech',
  'Research Ops': 'Research/Ops',
};

function BusinessDashboard() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [pitches, setPitches] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingPitches, setLoadingPitches] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchJobs = useCallback(async () => {
    try {
      setLoadingJobs(true);
      setError('');
      const { data } = await axios.get(`${API}/api/jobs`);
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load jobs. Please try again.'
      );
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  const fetchPitches = useCallback(async (job) => {
    try {
      setLoadingPitches(true);
      setError('');
      const { data } = await axios.get(`${API}/api/pitches/job/${job._id}`);
      setPitches(Array.isArray(data) ? data : []);
      setSelectedJob(job);
      setSuccessMsg('');
    } catch (err) {
      setPitches([]);
      setError(
        err.response?.data?.message || 'Failed to load pitches for this job.'
      );
    } finally {
      setLoadingPitches(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const closePitches = () => {
    setSelectedJob(null);
    setPitches([]);
    setSuccessMsg('');
  };

  const handleAccept = async (pitchId) => {
    try {
      setActionLoading(pitchId);
      setSuccessMsg('');
      const { data } = await axios.patch(`${API}/api/pitches/${pitchId}/accept`);
      setPitches(data.pitches || []);
      setJobs((prev) =>
        prev.map((j) =>
          j._id === selectedJob._id ? { ...j, status: 'In Progress' } : j
        )
      );
      setSelectedJob((prev) => (prev ? { ...prev, status: 'In Progress' } : prev));
      setSuccessMsg('✅ Pitch Accepted! Job is now In Progress');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept pitch.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (pitchId) => {
    try {
      setActionLoading(pitchId);
      const { data } = await axios.patch(`${API}/api/pitches/${pitchId}`, {
        status: 'Rejected',
      });
      setPitches((prev) => prev.map((p) => (p._id === pitchId ? data : p)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject pitch.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatMoney = (n) => Number(n).toLocaleString('en-IN');

  const getStatusClass = (status) => {
    const s = status?.replace(/\s/g, '-');
    if (s === 'Open') return 'status-open';
    if (s === 'In-Progress') return 'status-progress';
    if (s === 'Completed') return 'status-completed';
    return 'status-default';
  };

  return (
    <div className="business-dashboard">
      <motion.header
        className="biz-hero"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1>Business Dashboard 🏢</h1>
        <p>Review pitches and manage your jobs</p>
      </motion.header>

      {error && (
        <motion.div
          className="biz-alert biz-alert-error"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
          <button type="button" onClick={() => setError('')} aria-label="Dismiss">
            <FaTimes />
          </button>
        </motion.div>
      )}

      <section className="biz-jobs-section">
        <h2 className="section-heading">Your Jobs</h2>

        {loadingJobs ? (
          <div className="biz-loading">
            <span className="biz-spinner" />
            <p>Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <motion.div
            className="biz-empty"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p>No jobs posted yet. Post your first job!</p>
            <Link to="/post-job" className="btn-orange">
              Post a Job →
            </Link>
          </motion.div>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job, i) => {
              const catLabel = CATEGORY_LABELS[job.category] || job.category;
              return (
                <motion.article
                  key={job._id}
                  className="job-card"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.45 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="job-card-header">
                    <span className="category-badge">{catLabel}</span>
                    <span className={`status-badge ${getStatusClass(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                  <h3 className="job-title">{job.title}</h3>
                  <p className="job-budget">
                    <FaRupeeSign /> ₹{formatMoney(job.budget)}
                  </p>
                  <button
                    type="button"
                    className="btn-view-pitches"
                    onClick={() => fetchPitches(job)}
                  >
                    <FaEye /> View Pitches 👁️
                  </button>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      <AnimatePresence>
        {selectedJob && (
          <>
            <motion.div
              className="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePitches}
            />
            <div className="modal-wrapper">
            <motion.div
              className="pitches-modal"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            >
              <div className="modal-header">
                <div>
                  <h2>Pitches for</h2>
                  <p className="modal-job-title">{selectedJob.title}</p>
                </div>
                <button
                  type="button"
                  className="modal-close"
                  onClick={closePitches}
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              <AnimatePresence>
                {successMsg && (
                  <motion.div
                    className="biz-success-banner"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {successMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              {loadingPitches ? (
                <div className="biz-loading modal-loading">
                  <span className="biz-spinner" />
                  <p>Loading pitches...</p>
                </div>
              ) : pitches.length === 0 ? (
                <div className="biz-empty modal-empty">
                  <p>No pitches yet</p>
                </div>
              ) : (
                <div className="pitches-scroll">
                  {pitches.map((pitch, i) => (
                    <motion.div
                      key={pitch._id}
                      className={`pitch-card pitch-${pitch.status?.toLowerCase()}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.35 }}
                    >
                      <div className="pitch-row">
                        <FaUser className="pitch-icon" />
                        <div>
                          <span className="pitch-label">Student</span>
                          <strong>{pitch.studentName}</strong>
                        </div>
                        <span className={`pitch-tag tag-${pitch.status?.toLowerCase()}`}>
                          {pitch.status}
                        </span>
                      </div>

                      <div className="pitch-row">
                        <FaGraduationCap className="pitch-icon" />
                        <div>
                          <span className="pitch-label">College</span>
                          <p>{pitch.college}</p>
                        </div>
                      </div>

                      <div className="pitch-row block">
                        <FaComment className="pitch-icon" />
                        <div>
                          <span className="pitch-label">Intro</span>
                          <p>{pitch.intro}</p>
                        </div>
                      </div>

                      <div className="pitch-row block">
                        <FaStar className="pitch-icon" />
                        <div>
                          <span className="pitch-label">Why Me</span>
                          <p>{pitch.whyMe}</p>
                        </div>
                      </div>

                      <div className="pitch-meta-grid">
                        <div className="pitch-meta">
                          <span className="pitch-label">💰 Their Price</span>
                          <strong className="price-text">
                            ₹{formatMoney(pitch.cost)}
                          </strong>
                        </div>
                        <div className="pitch-meta">
                          <span className="pitch-label">
                            <FaClock /> Timeline
                          </span>
                          <strong>{pitch.timeline} days</strong>
                        </div>
                      </div>

                      {pitch.portfolioLink && (
                        <a
                          href={pitch.portfolioLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="portfolio-link"
                        >
                          <FaLink /> Portfolio link <FaExternalLinkAlt />
                        </a>
                      )}

                      {pitch.status === 'Pending' && (
                        <div className="pitch-actions">
                          <button
                            type="button"
                            className="btn-accept"
                            disabled={!!actionLoading}
                            onClick={() => handleAccept(pitch._id)}
                          >
                            {actionLoading === pitch._id ? 'Accepting...' : '✅ Accept'}
                          </button>
                          <button
                            type="button"
                            className="btn-reject"
                            disabled={!!actionLoading}
                            onClick={() => handleReject(pitch._id)}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BusinessDashboard;
