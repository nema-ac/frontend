import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NemaProvider } from './contexts/NemaContext';
import Navigation from './components/Navigation';
import AnimatedBackground from './components/AnimatedBackground';
import Footer from './components/Footer';
import About from './pages/About';
import Docs from './pages/Docs';
import Airdrop from './pages/Airdrop';
import Worminal from './pages/Worminal';
import Profile from './pages/Profile';
import Roadmap from './pages/Roadmap';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NemaProvider>
          <div className="min-h-screen bg-black text-white relative">
            <AnimatedBackground />
            <Navigation />
            <Routes>
              <Route path="/" element={<Worminal />} />
              <Route path="/about" element={<About />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/airdrop" element={<Airdrop />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
            <Footer />
          </div>
        </NemaProvider>
      </AuthProvider>
    </Router>
  );
}

export default App
