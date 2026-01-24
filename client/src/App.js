import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import VerifyEmail from './pages/VerifyEmail';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import MatchesPage from './pages/MatchesPage';
import Feedback from './pages/Feedback';
import AdminDashboard from './pages/AdminDashboard'; // ✅ ADDED

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/feedback" element={<Feedback />} />
            {/* ✅ ADDED: Admin route */}
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;