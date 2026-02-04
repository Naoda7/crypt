import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="glitch-page">
      <div className="noise-overlay"></div>
      <div className="scanlines"></div>
      <div className="tv-vignette"></div>

      <div className="glitch-wrapper">
        <h1 className="glitch-text" data-text="404">404</h1>
      </div>

      <p className="glitch-subtext">
        [ERROR]: PAGE_NOT_FOUND
      </p>
      
      <p className="description">
        The requested URL was not found on this server. 
        Please check your connection or return to the home page.
      </p>

      <Link to="/" className="btn-reboot">
        RETURN HOME
      </Link>

      <style>{`
        .glitch-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          width: 100%;
          position: fixed;
          top: 0;
          left: 0;
          overflow: hidden;
          background: #0a0a0a;
          text-align: center;
          animation: screen-flicker 0.3s infinite;
        }

        .noise-overlay {
          position: fixed;
          top: -50%; left: -50%; width: 200%; height: 200%;
          background-image: url('https://grainy-gradients.vercel.app/noise.svg');
          opacity: 0.1;
          z-index: 1;
          pointer-events: none;
          animation: noise-shift 0.4s steps(4) infinite;
        }

        .scanlines {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(to bottom, rgba(18,16,16,0) 50%, rgba(0,0,0,0.3) 50%);
          background-size: 100% 4px;
          z-index: 5;
          pointer-events: none;
        }

        .tv-vignette {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: radial-gradient(circle, transparent 50%, rgba(0,0,0,0.8) 100%);
          z-index: 6;
          pointer-events: none;
        }

        .glitch-wrapper {
          position: relative;
          z-index: 10;
        }

        .glitch-text {
          position: relative;
          font-size: 6rem;
          font-weight: 900;
          color: #fff;
          margin: 0;
          letter-spacing: -0.02em;
          animation: 
            text-flicker 3s linear infinite, 
            tv-shake 1.5s infinite alternate-reverse,
            glitch-main 4s infinite;
        }

        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          opacity: 0.7;
        }

        .glitch-text::before {
          left: 3px;
          color: #ff00c1;
          z-index: -1;
          animation: glitch-tv-1 0.8s infinite;
        }

        .glitch-text::after {
          left: -3px;
          color: #00fff9;
          z-index: -2;
          animation: glitch-tv-2 1s infinite;
        }

        .glitch-subtext {
          font-family: 'Courier New', monospace;
          color: #00fff9;
          font-size: 1rem;
          margin: 1rem 0;
          z-index: 10;
          position: relative;
          animation: flicker 0.3s infinite;
        }

        .description {
          color: #888;
          max-width: 400px;
          font-size: 0.9rem;
          z-index: 10;
          position: relative;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .btn-reboot {
          z-index: 10;
          position: relative;
          padding: 10px 25px;
          border: 1px solid #fff;
          color: #fff;
          text-decoration: none;
          font-size: 0.8rem;
          letter-spacing: 2px;
          transition: 0.3s;
        }

        .btn-reboot:hover {
          background: #fff;
          color: #000;
        }

        @keyframes glitch-main {
          0%, 100% { transform: none; clip-path: none; }
          7% { transform: skew(-2deg); clip-path: inset(10% 0 30% 0); }
          8% { transform: skew(2deg); clip-path: inset(60% 0 10% 0); }
          9% { transform: none; clip-path: none; }
        }

        @keyframes text-flicker {
          0%, 94%, 100% { opacity: 1; }
          95% { opacity: 0; }
          97% { opacity: 1; }
          98% { opacity: 0; }
          99% { opacity: 1; }
        }

        @keyframes tv-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-1px); }
          40% { transform: translateX(1px); }
        }

        @keyframes glitch-tv-1 {
          0%, 100% { clip-path: inset(20% 0 70% 0); }
          50% { clip-path: inset(40% 0 40% 0); }
        }

        @keyframes glitch-tv-2 {
          0%, 100% { clip-path: inset(70% 0 10% 0); }
          50% { clip-path: inset(30% 0 50% 0); }
        }

        @keyframes noise-shift {
          0% { transform: translate(0,0); }
          100% { transform: translate(1%, 1%); }
        }

        @keyframes screen-flicker {
          0% { opacity: 1; }
          50% { opacity: 0.98; }
        }

        @keyframes flicker {
          0% { opacity: 0.8; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default NotFound;