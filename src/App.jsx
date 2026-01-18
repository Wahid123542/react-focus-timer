// src/App.jsx
import { useState, useEffect, useRef } from 'react';

function App() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // start with classic 25 min pomodoro
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const audioRef = useRef(null); // ref for the bell sound so it doesn't reload every render

  // simple helper to make time look nice (always 2 digits)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // calculate progress percentage for the circle animation
  const totalTime = isBreak ? 5 * 60 : 25 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } 
    // when timer hits 0, switch phases and play sound
    else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (audioRef.current) audioRef.current.play(); // small bell to feel satisfying
      alert(isBreak ? "Break over! Let's keep coding!" : "Great session! Time for a quick break");

      if (!isBreak) {
        setTimeLeft(5 * 60); // short break, standard pomodoro
        setIsBreak(true);
      } else {
        setTimeLeft(25 * 60);
        setIsBreak(false);
      }
    }
    return () => clearInterval(interval); // cleanup so we don't leak timers
  }, [isRunning, timeLeft, isBreak]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(25 * 60); // always reset back to focus time
  };

  // only show "Focus Mode On" when we're actually counting down in focus
  // looks cleaner during breaks or when paused
  const showFocusStatus = isRunning && !isBreak;

  return (
    <>
      <style>{`
        body {
          margin: 0;
          min-height: 100vh;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #ff8c00 0%, #ff4500 100%); // strong orange vibe to stay energized
          color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .container {
          background: rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(12px); // glass effect looks cool and modern
          padding: 3.5rem 3rem;
          border-radius: 40px;
          box-shadow: 0 20px 70px rgba(0,0,0,0.35);
          text-align: center;
          max-width: 540px;
          width: 92%;
          overflow: hidden;
        }

        .header {
          margin-bottom: 2.2rem;
        }

        h1 {
          font-size: 3.8rem;
          margin: 0;
          color: #fff;
          text-shadow: 3px 3px 10px rgba(0,0,0,0.5);
        }

        .subtitle {
          font-size: 1.4rem;
          margin-top: 0.6rem;
          opacity: 0.9;
          font-weight: 500;
        }

        .timer-wrapper {
          position: relative;
          width: 340px;
          height: 340px;
          margin: 2rem auto;
        }

        .timer {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 6.5rem;
          font-weight: 800;
          letter-spacing: -2px;
          color: #000;
          background: white;
          border-radius: 50%;
          border: 10px solid transparent;
          // gradient border trick — white inside + orange outside
          background-image: 
            linear-gradient(white, white),
            linear-gradient(to right, #ffd700, #ff8c00);
          background-origin: border-box;
          background-clip: padding-box, border-box;
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
          box-sizing: border-box;
          padding: 0 12px; // small padding so :25 doesn't touch the edge
          font-variant-numeric: tabular-nums;
          line-height: 1.05;
          min-width: 280px;
        }

        svg {
          position: absolute;
          inset: 0;
          transform: rotate(-90deg);
        }

        circle {
          transition: stroke-dashoffset 0.8s ease-out;
        }

        .progress-bg { stroke: rgba(255,255,255,0.35); }
        .progress { 
          stroke: #ffd700; 
          stroke-linecap: round; 
        }

        .buttons {
          display: flex;
          gap: 2.8rem;
          justify-content: center;
          margin: 2.8rem 0;
        }

        button {
          padding: 1.4rem 3.8rem;
          font-size: 1.45rem;
          font-weight: bold;
          border: none;
          border-radius: 22px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        button:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.35);
        }

        .start { background: #ffd700; color: #d2691e; }
        .start:hover { background: #ffcc00; }
        .reset { background: #ff8c00; color: white; }
        .reset:hover { background: #e07a00; }

        .status {
          font-size: 1.7rem;
          font-weight: 600;
          text-shadow: 1px 1px 6px rgba(0,0,0,0.7);
          min-height: 2.2rem; // keeps layout from jumping when status hides
          opacity: ${showFocusStatus ? '1' : '0'};
          transition: opacity 0.3s ease;
        }
      `}</style>

      <div className="container">
        <div className="header">
          <h1>Code Time</h1>
          <div className="subtitle">Level up your skills one focused session at a time 🚀</div>
        </div>

        <div className="timer-wrapper">
          <div className="timer">{formatTime(timeLeft)}</div>
          <svg width="340" height="340">
            <circle className="progress-bg" cx="170" cy="170" r="160" strokeWidth="22" fill="none" />
            <circle 
              className="progress" 
              cx="170" cy="170" r="160" 
              strokeWidth="22" fill="none"
              strokeDasharray={2 * Math.PI * 160}
              strokeDashoffset={2 * Math.PI * 160 * (1 - progress / 100)}
            />
          </svg>
        </div>

        <div className="buttons">
          <button className="start" onClick={toggleTimer}>
            {isRunning ? "PAUSE" : isBreak ? "START BREAK" : "START FOCUS"}
          </button>
          <button className="reset" onClick={resetTimer}>RESET</button>
        </div>

        <div className="status">
          {showFocusStatus && "Focus Mode On"}
        </div>
      </div>

      <audio ref={audioRef} src="https://assets.mixkit.co/sfx/preview/mixkit-bell-notification-1007.mp3" preload="auto" />
    </>
  );
}

export default App;