import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NemaProvider } from './contexts/NemaContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import About from './pages/About';
import Docs from './pages/Docs';
import Airdrop from './pages/Airdrop';
import Worminal from './pages/Worminal';
import Profile from './pages/Profile';
import OnboardingScreen from './pages/OnboardingScreen';
import Roadmap from './pages/Roadmap';
import Gallery from './pages/Gallery';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NemaProvider>
          <WebSocketProvider>
            <div className="min-h-screen bg-nema-black text-nema-white font-anonymous relative">
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url('/bg-texture.png')", backgroundSize: '100% 100%', backgroundAttachment: 'fixed', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', pointerEvents: 'none' }}></div>
              <div className="relative z-10">
              <Navigation />
              <Routes>
                <Route path="/" element={<Worminal />} />
                <Route path="/about" element={<About />} />
                <Route path="/roadmap" element={<Roadmap />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/airdrop" element={<Airdrop />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/onboarding" element={<OnboardingScreen />} />
                <Route path="/profile" element={
                  <ProtectedRoute requireAuth={true} redirectNewUsers={true}>
                    <Profile />
                  </ProtectedRoute>
                } />
              </Routes>
              <Footer />
              </div>
            </div>
          </WebSocketProvider>
        </NemaProvider>
      </AuthProvider>
    </Router>
  );
}

export default App
