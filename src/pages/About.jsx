import AboutSections from '../components/AboutSections';

const About = () => {
  return (
    <div className="min-h-screen bg-nema-black text-nema-white pt-20 relative">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url('/bg-texture.png')", backgroundSize: '100% 100%', backgroundAttachment: 'fixed', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', pointerEvents: 'none' }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="nema-display nema-display-1 mb-6 text-nema-cyan font-intranet">
            ABOUT NEMA
          </h1>
          <p className="text-xl text-nema-gray max-w-4xl mx-auto font-anonymous">
            The revolutionary digital biology project that introduces genuine learning
            and evolution to blockchain-based organisms.
          </p>
        </div>

        {/* Dynamic Sections */}
        <AboutSections />
      </div>
    </div>
  );
};

export default About;