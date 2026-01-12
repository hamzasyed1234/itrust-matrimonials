import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import VerifyEmail from './pages/VerifyEmail';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import MatchesPage from './pages/MatchesPage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/matches" element={<MatchesPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
