import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import PostJob from './pages/PostJob';
import JobListings from './pages/JobListings';
import PitchForm from './pages/PitchForm';
import StudentDashboard from './pages/StudentDashboard';
import BusinessDashboard from './pages/BusinessDashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Pricing from './pages/Pricing';
import BrowseTalent from './pages/BrowseTalent';
import GetVerified from './pages/GetVerified';
import TrustTiers from './pages/TrustTiers';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/jobs" element={<JobListings />} />
            <Route path="/pitch/:jobId" element={<PitchForm />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/business-dashboard" element={<BusinessDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/browse-talent" element={<BrowseTalent />} />
            <Route path="/get-verified" element={<GetVerified />} />
            <Route path="/trust-tiers" element={<TrustTiers />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
