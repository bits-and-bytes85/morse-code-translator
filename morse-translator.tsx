import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const MORSE_CODE = {
  '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
  '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
  '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
  '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
  '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
  '--..': 'Z', '.----': '1', '..---': '2', '...--': '3', '....-': '4',
  '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9',
  '-----': '0'
};

export default function MorseTranslator() {
  const [currentMorse, setCurrentMorse] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isPressed, setIsPressed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const pressStartTime = useRef(0);
  const lastReleaseTime = useRef(0);
  const letterTimeout = useRef(null);
  const wordTimeout = useRef(null);
  const audioContext = useRef(null);
  const oscillator = useRef(null);

  useEffect(() => {
    if (soundEnabled && !audioContext.current) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, [soundEnabled]);

  const playTone = () => {
    if (!soundEnabled || !audioContext.current) return;
    
    oscillator.current = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();
    
    oscillator.current.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    
    oscillator.current.frequency.value = 600;
    gainNode.gain.value = 0.3;
    
    oscillator.current.start();
  };

  const stopTone = () => {
    if (oscillator.current) {
      oscillator.current.stop();
      oscillator.current = null;
    }
  };

  const handleMouseDown = () => {
    if (isPressed) return;
    
    setIsPressed(true);
    pressStartTime.current = Date.now();
    playTone();
    
    clearTimeout(letterTimeout.current);
    clearTimeout(wordTimeout.current);
  };

  const handleMouseUp = () => {
    if (!isPressed) return;
    
    setIsPressed(false);
    stopTone();
    
    const pressDuration = Date.now() - pressStartTime.current;
    const signal = pressDuration > 150 ? '-' : '.';
    
    setCurrentMorse(prev => prev + signal);
    lastReleaseTime.current = Date.now();
    
    letterTimeout.current = setTimeout(() => {
      processLetter();
    }, 800);
    
    wordTimeout.current = setTimeout(() => {
      addSpace();
    }, 1500);
  };

  const processLetter = () => {
    setCurrentMorse(prev => {
      if (prev.length === 0) return prev;
      
      const letter = MORSE_CODE[prev] || '?';
      setTranslatedText(text => text + letter);
      return '';
    });
  };

  const addSpace = () => {
    setTranslatedText(text => {
      if (text.length > 0 && text[text.length - 1] !== ' ') {
        return text + ' ';
      }
      return text;
    });
  };

  const clearAll = () => {
    setCurrentMorse('');
    setTranslatedText('');
    clearTimeout(letterTimeout.current);
    clearTimeout(wordTimeout.current);
  };

  return (
    <div className="min-h-screen bg-black p-8 relative overflow-hidden">
      {/* Retro grid background */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `
          linear-gradient(rgba(255, 0, 255, 0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 0, 255, 0.3) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        perspective: '500px',
        transform: 'rotateX(60deg) translateY(-50%)',
        transformOrigin: 'center top'
      }}></div>

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5" style={{
        background: 'repeating-linear-gradient(0deg, rgba(0, 255, 255, 0.1) 0px, transparent 2px, transparent 4px)',
        animation: 'scanline 8s linear infinite'
      }}></div>

      <style>{`
        @keyframes scanline {
          0% { transform: translateY(0); }
          100% { transform: translateY(100px); }
        }
        @keyframes glow-pulse {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 8px currentColor); }
          50% { filter: brightness(1.5) drop-shadow(0 0 20px currentColor); }
        }
        @keyframes neon-flicker {
          0%, 100% { opacity: 1; }
          41%, 43% { opacity: 0.8; }
          45% { opacity: 1; }
        }
        .neon-text {
          text-shadow: 
            0 0 5px currentColor,
            0 0 10px currentColor,
            0 0 20px currentColor;
          animation: neon-flicker 3s infinite;
        }
        .neon-border {
          box-shadow: 
            0 0 3px currentColor,
            0 0 6px currentColor,
            inset 0 0 3px currentColor;
        }
        .neon-glow {
          animation: glow-pulse 2s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4 neon-text" style={{ color: '#ff00ff', fontFamily: 'Courier New, monospace', letterSpacing: '0.2em' }}>
            MORSE
          </h1>
        </div>

        <div className="mb-6 p-6 neon-border" style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.8)', 
          borderColor: '#00ffff',
          border: '2px solid',
          fontFamily: 'Courier New, monospace'
        }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold" style={{ color: '#ff00ff' }}>:: INSTRUCTIONS ::</h2>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 neon-border transition-all"
              style={{ 
                backgroundColor: 'rgba(255, 0, 255, 0.2)',
                borderColor: soundEnabled ? '#ff00ff' : '#666',
                border: '2px solid',
                color: soundEnabled ? '#ff00ff' : '#666'
              }}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
          <ul className="space-y-2" style={{ color: '#00ffff' }}>
            <li>&gt; SHORT CLICK = DOT (.)</li>
            <li>&gt; LONG CLICK = DASH (-)</li>
            <li>&gt; SHORT PAUSE = NEW LETTER</li>
            <li>&gt; LONG PAUSE = NEW WORD</li>
          </ul>
        </div>

        <div
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => isPressed && handleMouseUp()}
          className={`
            h-64 flex items-center justify-center cursor-pointer
            transition-all duration-150 select-none mb-6 neon-border
            ${isPressed ? 'neon-glow' : ''}
          `}
          style={{
            backgroundColor: isPressed ? 'rgba(255, 0, 255, 0.3)' : 'rgba(0, 0, 0, 0.8)',
            borderColor: isPressed ? '#ff00ff' : '#00ffff',
            border: '3px solid',
            fontFamily: 'Courier New, monospace'
          }}
        >
          <div className="text-center">
            <div className="text-8xl mb-4" style={{ 
              color: isPressed ? '#ff00ff' : '#00ffff',
              filter: isPressed ? 'drop-shadow(0 0 30px #ff00ff)' : 'none'
            }}>
              {isPressed ? '●' : '○'}
            </div>
            <p className="text-2xl font-bold tracking-widest" style={{ color: isPressed ? '#ff00ff' : '#00ffff' }}>
              {isPressed ? '[TRANSMITTING]' : '[CLICK TO START]'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-6 neon-border" style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
            borderColor: '#ff00ff',
            border: '2px solid',
            fontFamily: 'Courier New, monospace'
          }}>
            <h3 className="text-sm font-bold mb-2" style={{ color: '#ff00ff' }}>&gt; CURRENT MORSE_</h3>
            <div className="text-4xl font-mono h-12 flex items-center" style={{ color: '#00ffff' }}>
              {currentMorse || <span style={{ opacity: 0.3 }}>...</span>}
            </div>
          </div>

          <div className="p-6 neon-border" style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
            borderColor: '#00ffff',
            border: '2px solid',
            fontFamily: 'Courier New, monospace'
          }}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold" style={{ color: '#00ffff' }}>&gt; DECODED_MESSAGE_</h3>
              <button
                onClick={clearAll}
                className="text-sm px-4 py-1 font-bold neon-border transition-all"
                style={{ 
                  backgroundColor: 'rgba(255, 0, 0, 0.3)',
                  borderColor: '#ff0000',
                  border: '2px solid',
                  color: '#ff0000'
                }}
              >
                [CLEAR]
              </button>
            </div>
            <div className="text-2xl min-h-12 flex items-center break-words" style={{ color: '#ff00ff' }}>
              {translatedText || <span style={{ opacity: 0.3 }}>AWAITING INPUT...</span>}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 neon-border" style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.8)', 
          borderColor: '#00ffff',
          border: '2px solid',
          fontFamily: 'Courier New, monospace'
        }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: '#00ffff' }}>&gt; REFERENCE_TABLE_</h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 text-xs">
            {Object.entries(MORSE_CODE).slice(0, 26).map(([morse, letter]) => (
              <div key={letter} className="text-center">
                <div className="font-bold text-lg" style={{ color: '#ff00ff' }}>{letter}</div>
                <div className="font-mono" style={{ color: '#00ffff' }}>{morse}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}