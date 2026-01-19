import { useState, useEffect, useRef, FormEvent } from 'react';
import { toast } from 'sonner';
import { useEmailCapture } from '@/hooks/useEmailCapture';

/**
 * EmailCapturePopup - GameBoy-styled email capture popup
 *
 * Design: IDENTICAL to GameBoyDialog - same shell, LCD screen, typewriter text,
 * scanlines, purple accent stripes, Press Start 2P font.
 *
 * Position: Bottom-RIGHT (cookie consent is bottom-left)
 * Trigger: 15 seconds after cookie dialog dismissed, first-time visitors only
 */

interface EmailCapturePopupProps {
  visible: boolean;
  onClose: () => void;
}

type Phase = 'greeting' | 'form' | 'success';

// Authentic Game Boy DMG-01 colors (same as GameBoyDialog)
const gbColors = {
  shellLight: '#C4C4BC',
  shellMid: '#A8A8A0',
  shellDark: '#8C8C84',
  shellShadow: '#6E6E68',
  purple1: '#6B4C7A',
  purple2: '#8B5A9B',
  purple3: '#5C3D6E',
  screenLight: '#9BBC0F',
  screenMid: '#8BAC0F',
  screenDark: '#306230',
  screenFrame: '#4A4A42',
  textEmbossed: '#7A7A72',
};

const colors = {
  cardmintGreen: '#4ADC61',
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

export const EmailCapturePopup = ({ visible, onClose }: EmailCapturePopupProps) => {
  const [phase, setPhase] = useState<Phase>('greeting');
  const [displayText, setDisplayText] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { markSubscribed, markDismissed } = useEmailCapture();

  const greetingMessage = "Hey, Trainer!";
  const bodyMessage = "💌 Join the Vault — 10% off your entire first order.";
  const successMessage = "You're in! Check your email for your code.";

  // Reset state when visibility changes
  useEffect(() => {
    if (!visible) {
      setPhase('greeting');
      setDisplayText('');
      setBodyText('');
      setEmail('');
      setIsSubmitting(false);
      return;
    }

    // Start typewriter effect for greeting
    let i = 0;
    setDisplayText('');
    setPhase('greeting');

    const interval = setInterval(() => {
      if (i <= greetingMessage.length) {
        setDisplayText(greetingMessage.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setPhase('form'), 300);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [visible]);

  // Body text typewriter
  useEffect(() => {
    if (phase !== 'form') return;

    let i = 0;
    setBodyText('');

    const interval = setInterval(() => {
      if (i <= bodyMessage.length) {
        setBodyText(bodyMessage.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [phase]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'popup' }),
      });

      if (response.ok) {
        markSubscribed();
        setPhase('success');
        toast.success('Check your email for your 10% code!');
        // Auto-close after showing success
        setTimeout(() => onClose(), 2500);
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      toast.error('Network error. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    markDismissed();
    onClose();
  };

  if (!visible) return null;

  const showForm = phase === 'form' || phase === 'success';
  const showSuccess = phase === 'success';

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
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
        width: 'clamp(300px, 90vw, 400px)',
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

            {/* Greeting message */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', position: 'relative' }}>
              {showSuccess ? (
                <span style={{
                  fontSize: '20px',
                  flexShrink: 0,
                  filter: 'drop-shadow(1px 1px 0 rgba(48,98,48,0.3))',
                }}>🎉</span>
              ) : (
                <TrainerSprite size={32} />
              )}
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
                {showSuccess ? successMessage : displayText}
                {phase === 'greeting' && <span style={{ animation: 'gbBlink 0.8s step-end infinite' }}>▌</span>}
              </p>
            </div>

            {/* Body text + form */}
            {showForm && !showSuccess && (
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
                  marginBottom: '8px',
                  fontFamily: '"Press Start 2P", "Courier New", monospace',
                  textShadow: '1px 1px 0 rgba(155, 188, 15, 0.5)',
                }}>
                  {bodyText}
                </p>

                <p style={{
                  color: `${gbColors.screenDark}99`,
                  fontSize: '8px',
                  lineHeight: 1.4,
                  margin: 0,
                  marginBottom: '12px',
                  fontFamily: '"Press Start 2P", "Courier New", monospace',
                }}>
                  First access to rare drops. No spam.
                </p>

                {/* Email form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={isSubmitting}
                    className="gb-email-input"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontFamily: '"Press Start 2P", "Courier New", monospace',
                      border: `2px solid ${gbColors.screenDark}`,
                      background: 'rgba(155, 188, 15, 0.3)',
                      color: gbColors.screenDark,
                      outline: 'none',
                      boxShadow: 'inset 2px 2px 0 rgba(48, 98, 48, 0.2)',
                    }}
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="gb-submit-btn"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 700,
                      fontFamily: '"Press Start 2P", "Courier New", monospace',
                      cursor: isSubmitting ? 'wait' : 'pointer',
                      border: `2px solid ${gbColors.screenDark}`,
                      background: gbColors.screenDark,
                      color: gbColors.screenLight,
                      boxShadow: '3px 3px 0 rgba(48, 98, 48, 0.4)',
                      transition: 'all 0.2s ease',
                      opacity: isSubmitting ? 0.7 : 1,
                    }}
                  >
                    {isSubmitting ? 'Sending...' : 'Get My Code'}
                  </button>

                  <button
                    type="button"
                    onClick={handleDismiss}
                    disabled={isSubmitting}
                    className="gb-dismiss-btn"
                    style={{
                      width: '100%',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '8px',
                      fontFamily: '"Press Start 2P", "Courier New", monospace',
                      cursor: 'pointer',
                      border: 'none',
                      background: 'transparent',
                      color: `${gbColors.screenDark}99`,
                      textDecoration: 'underline',
                      textUnderlineOffset: '2px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Maybe later
                  </button>
                </form>
              </div>
            )}

            {/* Success message auto-closes */}
            {showSuccess && (
              <div style={{
                marginTop: '10px',
                paddingTop: '10px',
                borderTop: `1px dashed ${gbColors.screenDark}50`,
                animation: 'gbFadeIn 0.3s ease-out',
              }}>
                <p style={{
                  color: gbColors.screenDark,
                  fontSize: '9px',
                  lineHeight: 1.5,
                  margin: 0,
                  fontFamily: '"Press Start 2P", "Courier New", monospace',
                  textShadow: '1px 1px 0 rgba(155, 188, 15, 0.5)',
                }}>
                  Closing in a moment...
                </p>
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

          {/* Close button */}
          <button
            onClick={handleDismiss}
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

      {/* ===== SPEECH BUBBLE TRIANGLE (points right) ===== */}
      <div style={{
        position: 'absolute',
        bottom: '-8px',
        right: '32px',
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

        .gb-close-btn:hover {
          background: rgba(0,0,0,0.15) !important;
          border-color: #6E6E68 !important;
          transform: scale(1.02);
        }

        .gb-close-btn:hover span {
          color: #5C3D6E !important;
        }

        .gb-submit-btn:not(:disabled):hover {
          transform: translateY(-2px) !important;
          box-shadow: 4px 5px 0 rgba(48, 98, 48, 0.5) !important;
          filter: brightness(1.1);
        }

        .gb-submit-btn:not(:disabled):active {
          transform: translateY(0) !important;
          box-shadow: 2px 2px 0 rgba(48, 98, 48, 0.4) !important;
        }

        .gb-dismiss-btn:hover {
          color: #306230 !important;
        }

        .gb-email-input:focus {
          border-color: #306230 !important;
          background: rgba(155, 188, 15, 0.5) !important;
          box-shadow: inset 2px 2px 0 rgba(48, 98, 48, 0.3), 0 0 0 2px rgba(48, 98, 48, 0.2) !important;
        }

        .gb-email-input::placeholder {
          color: rgba(48, 98, 48, 0.5);
        }
      `}</style>
    </div>
  );
};

export default EmailCapturePopup;
