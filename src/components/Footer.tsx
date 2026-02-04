import * as React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">

      <div className="footer-bottom">
        <p className="text-secondary text-xs">
          © {currentYear} CRYPTZ
        </p>
      </div>
    </footer>
  );
};

export default Footer;