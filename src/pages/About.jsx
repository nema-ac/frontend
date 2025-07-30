import AboutSections from '../components/AboutSections';

const About = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">
            <span className="text-cyan-400">ABOUT NEMΔ</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-4xl mx-auto">
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