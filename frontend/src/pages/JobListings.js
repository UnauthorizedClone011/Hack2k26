import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaSearch, FaRupeeSign, FaCalendarAlt, FaBuilding } from 'react-icons/fa';
import API from '../config';
import './JobListings.css';

const FILTER_PILLS = [
  { label: 'All', value: 'All' },
  { label: 'Social Media', value: 'Social Media' },
  { label: 'Branding', value: 'Branding' },
  { label: 'Video/Editing', value: 'Video Editing' },
  { label: 'Growth/Outreach', value: 'Growth Outreach' },
  { label: 'Automation/Tech', value: 'Automation Tech' },
  { label: 'Research/Ops', value: 'Research Ops' },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Budget: High to Low', value: 'budget' },
  { label: 'Deadline: Soonest', value: 'deadline' },
];

const CATEGORY_STYLES = {
  'Social Media': { color: '#E1306C', bg: 'rgba(225, 48, 108, 0.18)' },
  Branding: { color: '#A855F7', bg: 'rgba(168, 85, 247, 0.18)' },
  'Video Editing': { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.18)' },
  'Growth Outreach': { color: '#22C55E', bg: 'rgba(34, 197, 94, 0.18)' },
  'Automation Tech': { color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.18)' },
  'Research Ops': { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.18)' },
};

const CATEGORY_LABELS = {
  'Social Media': 'Social Media',
  Branding: 'Branding',
  'Video Editing': 'Video/Editing',
  'Growth Outreach': 'Growth/Outreach',
  'Automation Tech': 'Automation/Tech',
  'Research Ops': 'Research/Ops',
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

function getBusinessName(postedBy) {
  if (!postedBy) return 'Local Business';
  const parts = postedBy.split('—');
  return parts[0]?.trim() || postedBy;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatBudget(amount) {
  return Number(amount).toLocaleString('en-IN');
}

function JobListings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API}/api/jobs`);
        setJobs(Array.isArray(data) ? data : []);
        setError('');
      } catch (err) {
        setError(
          err.response?.data?.message || 'Could not load jobs. Is the server running?'
        );
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (activeCategory !== 'All') {
      result = result.filter((job) => job.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (job) =>
          job.title?.toLowerCase().includes(q) ||
          job.description?.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'budget':
        result.sort((a, b) => (b.budget || 0) - (a.budget || 0));
        break;
      case 'deadline':
        result.sort(
          (a, b) => new Date(a.deadline) - new Date(b.deadline)
        );
        break;
      case 'newest':
      default:
        result.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
    }

    return result;
  }, [jobs, activeCategory, search, sortBy]);

  return (
    <div className="job-listings-page">
      <header className="listings-header">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Find Work 🎯</h1>
          <p>Browse tasks from real businesses near you</p>
        </motion.div>

        <motion.div
          className="search-bar"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>

        <motion.div
          className="filter-pills"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {FILTER_PILLS.map((pill) => (
            <button
              key={pill.value}
              type="button"
              className={`filter-pill ${
                activeCategory === pill.value ? 'filter-pill-active' : ''
              }`}
              onClick={() => setActiveCategory(pill.value)}
            >
              {pill.label}
            </button>
          ))}
        </motion.div>
      </header>

      <div className="stats-bar">
        <span className="stats-count">
          Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
        </span>
        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="listings-loading">
          <span className="loading-spinner" />
          <p>Loading jobs...</p>
        </div>
      )}

      {error && !loading && (
        <p className="listings-error">{error}</p>
      )}

      {!loading && !error && filteredJobs.length === 0 && (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="empty-illustration">🔍</span>
          <h3>No jobs found</h3>
          <p>Try a different filter.</p>
        </motion.div>
      )}

      {!loading && !error && filteredJobs.length > 0 && (
        <div className="jobs-grid">
          {filteredJobs.map((job, index) => {
            const catStyle =
              CATEGORY_STYLES[job.category] || {
                color: '#FF6B00',
                bg: 'rgba(255, 107, 0, 0.18)',
              };
            const catLabel =
              CATEGORY_LABELS[job.category] || job.category;
            const isOpen =
              !job.status || job.status.toLowerCase() === 'open';

            return (
              <motion.article
                key={job._id}
                className="job-card"
                custom={index}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                whileHover={{ y: -8 }}
              >
                <div className="job-card-top">
                  <span
                    className="category-badge"
                    style={{
                      color: catStyle.color,
                      background: catStyle.bg,
                      borderColor: catStyle.color,
                    }}
                  >
                    {catLabel}
                  </span>
                  {isOpen && (
                    <span className="status-badge">OPEN</span>
                  )}
                  {!isOpen && (
                    <span className="status-badge status-badge-muted">
                      {job.status}
                    </span>
                  )}
                </div>

                <h2 className="job-card-title">{job.title}</h2>
                <p className="job-card-desc">{job.description}</p>

                <div className="job-card-meta">
                  <span className="meta-budget">
                    <FaRupeeSign /> {formatBudget(job.budget)}
                  </span>
                  <span className="meta-deadline">
                    <FaCalendarAlt /> {formatDate(job.deadline)}
                  </span>
                  <span className="meta-business">
                    <FaBuilding /> {getBusinessName(job.postedBy)}
                  </span>
                </div>

                <Link
                  to={`/pitch/${job._id}`}
                  className="btn-pitch"
                >
                  Pitch Now →
                </Link>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default JobListings;
