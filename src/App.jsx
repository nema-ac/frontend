import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import AnimatedBackground from './components/AnimatedBackground';
import Home from './pages/Home';
import About from './pages/About';
import Docs from './pages/Docs';
import Airdrop from './pages/Airdrop';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white relative">
        <AnimatedBackground />
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/airdrop" element={<Airdrop />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App
