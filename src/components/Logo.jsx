const Logo = ({ size = 40, className = "" }) => {
  return (
    <>
      {/* Mobile logo - optimized for small sizes */}
      <img
        src="/mobile-nema-logo.png"
        alt="NEMA LAB Logo"
        className={`object-contain block md:hidden ${className}`}
        style={{
          height: size,
          width: 'auto'
        }}
      />
      
      {/* Desktop logo */}
      <img
        src="/nema-lab-logo.png"
        alt="NEMA LAB Logo"
        className={`object-contain hidden md:block ${className}`}
        style={{
          height: size,
          width: 'auto'
        }}
      />
    </>
  );
};

export default Logo;
