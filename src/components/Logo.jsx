const Logo = ({ size = 40, className = "" }) => {
  return (
    <img 
      src="/nema-logo.svg" 
      alt="NEMA Logo" 
      className={`rounded-full object-cover ${className}`}
      style={{ 
        width: size, 
        height: size,
        filter: 'drop-shadow(0 0 4px rgba(0, 255, 255, 0.3))'
      }}
    />
  );
};

export default Logo;