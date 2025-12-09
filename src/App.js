import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';

// افترضنا ان عندك صفحة اسمها Home، لو مش عندك هنعمل واحدة بسيطة مؤقتاً
const Home = () => (
  <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
    <h1 className="text-3xl">مرحباً بك في الصفحة الرئيسية 👋</h1>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
