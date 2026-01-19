import { useState, useEffect, useRef } from 'react';

/**
 * GameBoyDialog - A nostalgic welcome + cookie consent component
 * Styled after the authentic Nintendo Game Boy DMG-01
 *
 * Props:
 * - visible: boolean - Controls whether the dialog is shown
 * - onClose: () => void - Called when dialog should close
 * - onCookieChoice: (choice: 'all' | 'necessary' | 'none') => void - Called with user's cookie preference
 */

export type CookieChoice = 'all' | 'necessary' | 'none';

interface GameBoyDialogProps {
  visible: boolean;
  onClose: () => void;
  onCookieChoice?: (choice: CookieChoice) => void;
  onOpenPreferences?: () => void;
  gpcPreset?: boolean; // True if browser's Global Privacy Control signal was detected
}

type Phase = 'welcome' | 'cookies' | 'buttons' | 'accepted' | 'farewell';

const colors = {
  midnightBlue: '#0A203F',
  cardmintGreen: '#4ADC61',
  aquamarine: '#96E3AF',
  gold: '#D4AF37',
  black: '#1C1C1E',
  sage: '#98B2A6',
  white: '#FFFFFF',
};

// Authentic Game Boy DMG-01 colors
const gbColors = {
  // The plastic shell
  shellLight: '#C4C4BC',
  shellMid: '#A8A8A0',
  shellDark: '#8C8C84',
  shellShadow: '#6E6E68',
  // Purple accent stripes
  purple1: '#6B4C7A',
  purple2: '#8B5A9B',
  purple3: '#5C3D6E',
  // The LCD screen
  screenLight: '#9BBC0F',
  screenMid: '#8BAC0F',
  screenDark: '#306230',
  screenFrame: '#4A4A42',
  // Text colors
  textEmbossed: '#7A7A72',
  textDark: '#1a3a1a',
};

// Animated trainer sprite that follows mouse cursor
const TrainerSprite = ({ size = 32 }: { size?: number }) => {
  const [direction, setDirection] = useState<'down' | 'up' | 'left' | 'right'>('down');
  const [frame, setFrame] = useState(0);
  const spriteRef = useRef<HTMLDivElement>(null);

  // Frame animation: toggle every 500ms (walking effect)
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f === 0 ? 1 : 0));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Mouse tracking: only when a real pointer is available (hybrid device fix)
  useEffect(() => {
    const canTrackMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canTrackMouse) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!spriteRef.current) return;
      const rect = spriteRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;

      // Determine dominant axis
      if (Math.abs(dx) > Math.abs(dy)) {
        setDirection(dx > 0 ? 'right' : 'left');
      } else {
        setDirection(dy > 0 ? 'down' : 'up');
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  // Sprite positions: col 0-1 = down, 2-3 = up (row 0); 0-1 = left, 2-3 = right (row 1)
  const frameMap = {
    down:  { row: 0, cols: [0, 1] },
    up:    { row: 0, cols: [2, 3] },
    left:  { row: 1, cols: [0, 1] },
    right: { row: 1, cols: [2, 3] },
  };

  // Actual sprite frame dimensions (2816×1504 / 4×2 grid)
  const FRAME_WIDTH = 704;
  const FRAME_HEIGHT = 752;

  const { row, cols } = frameMap[direction];
  const col = cols[frame];

  // Scale factor to render at desired size
  const scaleX = size / FRAME_WIDTH;
  const scaleY = size / FRAME_HEIGHT;

  return (
    <div
      ref={spriteRef}
      style={{
        width: size,
        height: size,
        backgroundImage: 'url(/cardmint-sprite.png)',
        backgroundSize: `${FRAME_WIDTH * 4 * scaleX}px ${FRAME_HEIGHT * 2 * scaleY}px`,
        backgroundPosition: `-${col * FRAME_WIDTH * scaleX}px -${row * FRAME_HEIGHT * scaleY}px`,
        imageRendering: 'pixelated',
        flexShrink: 0,
        mixBlendMode: 'multiply',
      }}
    />
  );
};

export const GameBoyDialog = ({ visible, onClose, onCookieChoice, onOpenPreferences, gpcPreset }: GameBoyDialogProps) => {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [displayText, setDisplayText] = useState('');
  const [cookieText, setCookieText] = useState('');
  const [farewellText, setFarewellText] = useState('');
  const [cookieChoice, setCookieChoice] = useState<CookieChoice | null>(null);

  // Customize messages when browser's GPC (Global Privacy Control) is detected
  const welcomeMessage = gpcPreset
    ? "Welcome, Trainer! We noticed your privacy shield is up..."
    : "Welcome, Trainer! Ready to explore the CardMint vault?";
  const cookieMessage = gpcPreset
    ? "Your browser sent a Do Not Track signal. We respect that! You can still customize below."
    : "By continuing, we may gather necessary cookies to improve your experience.";
  const farewellMessage = "No worries! You can browse freely. Some features may be limited.";

  // Reset state when visibility changes
  useEffect(() => {
    if (!visible) {
      setPhase('welcome');
      setDisplayText('');
      setCookieText('');
      setFarewellText('');
      setCookieChoice(null);
      return;
    }

    let i = 0;
    setDisplayText('');
    setPhase('welcome');

    const interval = setInterval(() => {
      if (i <= welcomeMessage.length) {
        setDisplayText(welcomeMessage.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setPhase('cookies'), 400);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [visible]);

  // Cookie text typewriter
  useEffect(() => {
    if (phase !== 'cookies') return;

    let i = 0;
    setCookieText('');

    const interval = setInterval(() => {
      if (i <= cookieMessage.length) {
        setCookieText(cookieMessage.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setPhase('buttons'), 300);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [phase]);

  // Farewell typewriter
  useEffect(() => {
    if (phase !== 'farewell') return;

    let i = 0;
    setFarewellText('');

    const interval = setInterval(() => {
      if (i <= farewellMessage.length) {
        setFarewellText(farewellMessage.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onCookieChoice?.('none');
          onClose();
        }, 1500);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [phase, onClose, onCookieChoice]);

  const handleCookieChoice = (choice: CookieChoice) => {
    setCookieChoice(choice);
    if (choice === 'none') {
      setPhase('farewell');
    } else {
      onCookieChoice?.(choice);
      setPhase('accepted');
    }
  };

  const handleViewProducts = () => {
    onClose();
    const productsSection = document.querySelector('#products, [data-section="products"], #vault-carousel');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!visible) return null;

  const showCookieText = phase === 'cookies' || phase === 'buttons' || phase === 'accepted';
  const showButtons = phase === 'buttons' || phase === 'accepted';
  const showViewProducts = phase === 'accepted';
  const showFarewell = phase === 'farewell';

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      zIndex: 50,
      fontFamily: 'monospace',
      animation: 'gbSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      maxWidth: 'calc(100vw - 48px)',
    }}>
      {/* ===== GAME BOY SHELL ===== */}
      <div style={{
        position: 'relative',
        background: `linear-gradient(180deg,
          ${gbColors.shellLight} 0%,
          ${gbColors.shellMid} 20%,
          ${gbColors.shellMid} 80%,
          ${gbColors.shellDark} 100%
        )`,
        borderRadius: '8px 8px 12px 12px',
        padding: '12px 12px 20px 12px',
        boxShadow: `
          0 8px 24px rgba(0,0,0,0.4),
          0 2px 0 ${gbColors.shellShadow},
          inset 0 1px 0 rgba(255,255,255,0.4),
          inset 0 -1px 0 rgba(0,0,0,0.1)
        `,
        minWidth: '340px',
        maxWidth: '400px',
      }}>

        {/* ===== TOP ACCENT LINES (Purple stripes) ===== */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '12px',
          right: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}>
          <div style={{
            height: '3px',
            background: `linear-gradient(90deg, ${gbColors.purple1} 0%, ${gbColors.purple2} 50%, ${gbColors.purple1} 100%)`,
            borderRadius: '1px',
          }} />
          <div style={{
            height: '2px',
            background: `linear-gradient(90deg, ${gbColors.purple3} 0%, ${gbColors.purple1} 50%, ${gbColors.purple3} 100%)`,
            borderRadius: '1px',
          }} />
        </div>

        {/* ===== "DOT MATRIX" TEXT ===== */}
        <div style={{
          textAlign: 'center',
          marginTop: '16px',
          marginBottom: '8px',
        }}>
          <span style={{
            fontSize: '7px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: gbColors.textEmbossed,
            textShadow: '0 1px 0 rgba(255,255,255,0.5)',
            fontFamily: 'Arial, sans-serif',
            textTransform: 'uppercase',
          }}>
            Dot Matrix with CardMint
          </span>
        </div>

        {/* ===== SCREEN BEZEL (dark inset frame) ===== */}
        <div style={{
          background: `linear-gradient(180deg,
            ${gbColors.screenFrame} 0%,
            #3A3A32 50%,
            #2A2A24 100%
          )`,
          borderRadius: '4px',
          padding: '6px',
          boxShadow: `
            inset 0 2px 4px rgba(0,0,0,0.5),
            inset 0 -1px 0 rgba(255,255,255,0.1)
          `,
        }}>

          {/* ===== LCD SCREEN (green area) ===== */}
          <div style={{
            background: `linear-gradient(180deg,
              ${gbColors.screenLight} 0%,
              ${gbColors.screenMid} 40%,
              #7A9C0A 100%
            )`,
            padding: '14px 16px',
            borderRadius: '2px',
            position: 'relative',
            boxShadow: `
              inset 0 0 20px rgba(48, 98, 48, 0.3),
              inset 0 1px 0 rgba(255,255,255,0.1)
            `,
            minHeight: '120px',
          }}>

            {/* Scanline effect overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
              pointerEvents: 'none',
              borderRadius: '2px',
            }} />

            {/* Welcome message */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', position: 'relative' }}>
              <TrainerSprite size={32} />
              <p style={{
                color: gbColors.screenDark,
                fontSize: '11px',
                lineHeight: 1.6,
                margin: 0,
                minHeight: '36px',
                fontFamily: '"Press Start 2P", "Courier New", monospace',
                fontWeight: 400,
                textShadow: '1px 1px 0 rgba(155, 188, 15, 0.5)',
              }}>
                {displayText}
                {phase === 'welcome' && <span style={{ animation: 'gbBlink 0.8s step-end infinite' }}>▌</span>}
              </p>
            </div>

            {/* Cookie consent text */}
            {showCookieText && !showFarewell && (
              <div style={{
                marginTop: '10px',
                paddingTop: '10px',
                borderTop: `1px dashed ${gbColors.screenDark}50`,
                animation: 'gbFadeIn 0.3s ease-out',
              }}>
                <p style={{
                  color: gbColors.screenDark,
                  fontSize: '10px',
                  lineHeight: 1.5,
                  margin: 0,
                  fontFamily: '"Press Start 2P", "Courier New", monospace',
                  textShadow: '1px 1px 0 rgba(155, 188, 15, 0.5)',
                }}>
                  🍪 {cookieText}
                  {phase === 'cookies' && <span style={{ animation: 'gbBlink 0.8s step-end infinite' }}>▌</span>}
                </p>
              </div>
            )}

            {/* Farewell message */}
            {showFarewell && (
              <div style={{
                marginTop: '10px',
                paddingTop: '10px',
                borderTop: `1px dashed ${gbColors.screenDark}50`,
                animation: 'gbFadeIn 0.3s ease-out',
              }}>
                <p style={{
                  color: gbColors.screenDark,
                  fontSize: '10px',
                  lineHeight: 1.5,
                  margin: 0,
                  fontFamily: '"Press Start 2P", "Courier New", monospace',
                  textShadow: '1px 1px 0 rgba(155, 188, 15, 0.5)',
                }}>
                  👋 {farewellText}
                  <span style={{ animation: 'gbBlink 0.8s step-end infinite' }}>▌</span>
                </p>
              </div>
            )}

            {/* Cookie choice buttons */}
            {showButtons && !showFarewell && (
              <div style={{
                marginTop: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                animation: 'gbSlideUp 0.4s ease-out',
              }}>
                {/* Accept All */}
                <button
                  onClick={() => handleCookieChoice('all')}
                  disabled={cookieChoice !== null}
                  className="gb-cookie-btn"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    fontWeight: 600,
                    fontFamily: '"Press Start 2P", "Courier New", monospace',
                    cursor: cookieChoice ? 'default' : 'pointer',
                    border: `2px solid ${gbColors.screenDark}`,
                    background: cookieChoice === 'all'
                      ? gbColors.screenDark
                      : cookieChoice
                        ? 'rgba(48, 98, 48, 0.2)'
                        : 'rgba(155, 188, 15, 0.8)',
                    color: cookieChoice === 'all'
                      ? gbColors.screenLight
                      : cookieChoice
                        ? 'rgba(48, 98, 48, 0.4)'
                        : gbColors.screenDark,
                    boxShadow: cookieChoice && cookieChoice !== 'all'
                      ? 'none'
                      : '2px 2px 0 rgba(48, 98, 48, 0.3)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cookieChoice === 'all' ? '> ' : ''}Accept All Cookies
                </button>

                {/* Manage Preferences */}
                <button
                  onClick={() => onOpenPreferences?.()}
                  disabled={cookieChoice !== null}
                  className="gb-cookie-btn"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    fontWeight: 600,
                    fontFamily: '"Press Start 2P", "Courier New", monospace',
                    cursor: cookieChoice ? 'default' : 'pointer',
                    border: `2px solid ${cookieChoice ? 'rgba(48, 98, 48, 0.3)' : gbColors.screenDark}`,
                    background: 'transparent',
                    color: cookieChoice ? 'rgba(48, 98, 48, 0.4)' : gbColors.screenDark,
                    boxShadow: cookieChoice ? 'none' : '2px 2px 0 rgba(48, 98, 48, 0.2)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Manage Preferences
                </button>

                {/* Opt Out - highlighted when GPC is detected */}
                <button
                  onClick={() => handleCookieChoice('none')}
                  disabled={cookieChoice !== null}
                  className="gb-cookie-btn"
                  style={{
                    padding: gpcPreset ? '8px 12px' : '6px 12px',
                    borderRadius: '4px',
                    fontSize: gpcPreset ? '9px' : '8px',
                    fontWeight: gpcPreset ? 600 : 500,
                    fontFamily: '"Press Start 2P", "Courier New", monospace',
                    cursor: cookieChoice ? 'default' : 'pointer',
                    border: gpcPreset ? `2px solid ${gbColors.screenDark}` : 'none',
                    background: gpcPreset ? 'rgba(155, 188, 15, 0.5)' : 'transparent',
                    color: cookieChoice ? 'rgba(48, 98, 48, 0.3)' : (gpcPreset ? gbColors.screenDark : 'rgba(48, 98, 48, 0.7)'),
                    textDecoration: gpcPreset ? 'none' : 'underline',
                    textUnderlineOffset: '2px',
                    boxShadow: gpcPreset ? '2px 2px 0 rgba(48, 98, 48, 0.3)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {gpcPreset ? '🛡️ Opt Out (Recommended)' : 'Opt Out'}
                </button>
              </div>
            )}

            {/* View Products button */}
            {showViewProducts && (
              <div style={{
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: `1px dashed ${gbColors.screenDark}50`,
                animation: 'gbSlideUp 0.4s ease-out',
              }}>
                <button
                  onClick={handleViewProducts}
                  className="gb-view-btn"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                    fontFamily: '"Press Start 2P", "Courier New", monospace',
                    cursor: 'pointer',
                    border: `2px solid ${gbColors.screenDark}`,
                    background: gbColors.screenDark,
                    color: gbColors.screenLight,
                    boxShadow: '3px 3px 0 rgba(48, 98, 48, 0.4)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <span>View Products</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ===== BOTTOM SECTION (Battery + Power LED) ===== */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '10px',
          padding: '0 8px',
        }}>
          {/* Power indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#C41E3A',
              boxShadow: '0 0 8px rgba(196, 30, 58, 0.9), inset 0 1px 2px rgba(255,255,255,0.3)',
              animation: 'gbPulse 2s ease-in-out infinite',
            }} />
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              color: gbColors.shellDark,
              textShadow: '0 1px 0 rgba(255,255,255,0.6)',
              fontFamily: 'Arial, sans-serif',
              letterSpacing: '0.08em',
            }}>
              POWER
            </span>
          </div>

          {/* Close button styled as power indicator */}
          <button
            onClick={() => { onCookieChoice?.(cookieChoice || 'none'); onClose(); }}
            aria-label="Close dialog"
            className="gb-close-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '6px',
              border: `1px solid ${gbColors.shellDark}`,
              background: 'rgba(0,0,0,0.08)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              color: gbColors.shellDark,
              textShadow: '0 1px 0 rgba(255,255,255,0.6)',
              fontFamily: 'Arial, sans-serif',
              letterSpacing: '0.08em',
            }}>
              CLOSE
            </span>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: colors.cardmintGreen,
              boxShadow: `0 0 8px ${colors.cardmintGreen}99, inset 0 1px 2px rgba(255,255,255,0.4)`,
            }} />
          </button>
        </div>

        {/* ===== EMBOSSED EDGE DETAIL (left/right) ===== */}
        <div style={{
          position: 'absolute',
          left: '0',
          top: '30%',
          bottom: '30%',
          width: '3px',
          background: `linear-gradient(90deg, ${gbColors.shellDark} 0%, transparent 100%)`,
          borderRadius: '0 2px 2px 0',
        }} />
        <div style={{
          position: 'absolute',
          right: '0',
          top: '30%',
          bottom: '30%',
          width: '3px',
          background: `linear-gradient(270deg, ${gbColors.shellDark} 0%, transparent 100%)`,
          borderRadius: '2px 0 0 2px',
        }} />
      </div>

      {/* ===== SPEECH BUBBLE TRIANGLE ===== */}
      <div style={{
        position: 'absolute',
        bottom: '-8px',
        left: '32px',
        width: '16px',
        height: '16px',
        background: gbColors.shellMid,
        transform: 'rotate(45deg)',
        boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
        zIndex: -1,
      }} />

      {/* ===== ANIMATIONS ===== */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        @keyframes gbSlideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gbFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes gbBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes gbPulse {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 6px rgba(196, 30, 58, 0.8), inset 0 1px 2px rgba(255,255,255,0.3);
          }
          50% {
            opacity: 0.7;
            box-shadow: 0 0 10px rgba(196, 30, 58, 1), inset 0 1px 2px rgba(255,255,255,0.3);
          }
        }

        /* Hover effects for all clickable buttons */
        .gb-close-btn:hover {
          background: rgba(0,0,0,0.15) !important;
          border-color: #6E6E68 !important;
          transform: scale(1.02);
        }

        .gb-close-btn:hover span {
          color: #5C3D6E !important;
        }

        .gb-cookie-btn {
          transition: all 0.2s ease !important;
        }

        .gb-cookie-btn:not(:disabled):hover {
          transform: translateY(-1px) scale(1.01);
          filter: brightness(1.1);
        }

        .gb-cookie-btn:not(:disabled):active {
          transform: translateY(0) scale(0.99);
        }

        .gb-view-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 4px 5px 0 rgba(48, 98, 48, 0.5) !important;
          filter: brightness(1.1);
        }

        .gb-view-btn:active {
          transform: translateY(0) !important;
          box-shadow: 2px 2px 0 rgba(48, 98, 48, 0.4) !important;
        }
      `}</style>
    </div>
  );
};

export default GameBoyDialog;
