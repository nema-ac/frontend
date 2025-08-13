const Logo = ({ size = 40, className = "" }) => {
  return (
    <img
      src="/nema-lab-logo.png"
      alt="NEMA LAB Logo"
      className={`object-contain ${className}`}
      style={{
        height: size,
        width: 'auto'
      }}
    />
  );
};

export default Logo;
