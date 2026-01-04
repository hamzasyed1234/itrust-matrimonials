import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import VerifyEmail from './pages/VerifyEmail';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;