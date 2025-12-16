import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { GranularConsent } from "@/hooks/useCookieConsent";

interface CookiePreferenceCenterProps {
  visible: boolean;
  currentConsent: GranularConsent | null;
  onSave: (consent: GranularConsent) => void;
  onCancel: () => void;
}

const COOKIE_CATEGORIES = [
  {
    id: 'essential' as const,
    name: 'Essential',
    description: 'Cart, sessions, payments',
    disabled: true,
  },
  {
    id: 'performance' as const,
    name: 'Performance',
    description: 'Analytics & usage data',
    disabled: false,
  },
  {
    id: 'preference' as const,
    name: 'Preference',
    description: 'Theme & language',
    disabled: false,
  },
  {
    id: 'marketing' as const,
    name: 'Marketing',
    description: 'CardMint promos only',
    disabled: false,
  },
] as const;

// Game Boy LCD screen colors (matching GameBoyDialog)
const gbColors = {
  screenLight: '#9BBC0F',
  screenMid: '#8BAC0F',
  screenDark: '#306230',
  shellLight: '#C4C4BC',
  shellMid: '#A8A8A0',
  shellDark: '#8C8C84',
};

export function CookiePreferenceCenter({
  visible,
  currentConsent,
  onSave,
  onCancel,
}: CookiePreferenceCenterProps) {
  const [localConsent, setLocalConsent] = useState<GranularConsent>({
    essential: true,
    performance: false,
    preference: false,
    marketing: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(1); // Start on Performance (first toggleable)
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentConsent) {
      setLocalConsent(currentConsent);
    }
  }, [currentConsent, visible]);

  // Focus trap and keyboard navigation
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onCancel();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev <= 1 ? 3 : prev - 2));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev >= 2 ? prev - 2 : prev + 2));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setSelectedIndex((prev) => (prev % 2 === 0 ? prev + 1 : prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setSelectedIndex((prev) => (prev % 2 === 1 ? prev - 1 : prev + 1));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          const cat = COOKIE_CATEGORIES[selectedIndex];
          if (!cat.disabled) {
            handleToggle(cat.id);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    dialogRef.current?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible, selectedIndex, onCancel]);

  if (!visible) return null;

  const handleToggle = (category: keyof GranularConsent) => {
    if (category === 'essential') return;
    setLocalConsent((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-pref-title"
        tabIndex={-1}
        className="relative max-w-md w-full mx-4 rounded-xl overflow-hidden outline-none"
        style={{
          background: `linear-gradient(180deg, ${gbColors.shellLight} 0%, ${gbColors.shellMid} 100%)`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        {/* Top decorative line */}
        <div
          className="h-2"
          style={{
            background: 'linear-gradient(90deg, #6B4C7A 0%, #8B5A9B 50%, #6B4C7A 100%)',
          }}
        />

        {/* Screen bezel */}
        <div
          className="m-3 rounded-lg p-1"
          style={{
            background: `linear-gradient(180deg, #4A4A42 0%, #3A3A32 100%)`,
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          {/* LCD Screen */}
          <div
            className="rounded p-4 relative"
            style={{
              background: `linear-gradient(180deg, ${gbColors.screenLight} 0%, ${gbColors.screenMid} 100%)`,
              boxShadow: 'inset 0 0 20px rgba(48, 98, 48, 0.3)',
            }}
          >
            {/* Scanline overlay */}
            <div
              className="absolute inset-0 pointer-events-none rounded"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
              }}
            />

            {/* Header */}
            <h2
              id="cookie-pref-title"
              className="text-center mb-4 relative"
              style={{
                fontFamily: '"Press Start 2P", "Courier New", monospace',
                fontSize: '11px',
                color: gbColors.screenDark,
                textShadow: '1px 1px 0 rgba(155, 188, 15, 0.5)',
              }}
            >
              🍪 Cookie Settings
            </h2>

            {/* 2x2 Grid - Pokemon attack selection style */}
            <div className="grid grid-cols-2 gap-2 mb-4 relative">
              {COOKIE_CATEGORIES.map((cat, index) => {
                const isSelected = selectedIndex === index;
                const isEnabled = localConsent[cat.id];

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedIndex(index);
                      if (!cat.disabled) handleToggle(cat.id);
                    }}
                    disabled={cat.disabled}
                    className={`
                      relative p-3 rounded-lg text-left transition-all
                      ${cat.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                      focus:outline-none
                    `}
                    style={{
                      background: isEnabled
                        ? 'rgba(48, 98, 48, 0.7)'
                        : 'rgba(48, 98, 48, 0.15)',
                      border: isSelected
                        ? `3px solid ${gbColors.screenDark}`
                        : '3px solid transparent',
                      opacity: cat.disabled ? 0.6 : 1,
                    }}
                    aria-pressed={isEnabled}
                    aria-describedby={`${cat.id}-desc`}
                  >
                    {/* Selection cursor */}
                    {isSelected && (
                      <span
                        className="absolute -left-1 top-1/2 -translate-y-1/2"
                        style={{
                          fontFamily: '"Press Start 2P", monospace',
                          fontSize: '10px',
                          color: gbColors.screenDark,
                        }}
                        aria-hidden="true"
                      >
                        ▶
                      </span>
                    )}

                    {/* Category name */}
                    <span
                      className="block mb-1"
                      style={{
                        fontFamily: '"Press Start 2P", "Courier New", monospace',
                        fontSize: '9px',
                        color: isEnabled ? gbColors.screenLight : gbColors.screenDark,
                        textShadow: isEnabled ? '1px 1px 0 rgba(0,0,0,0.3)' : 'none',
                      }}
                    >
                      {cat.name}
                    </span>

                    {/* Description */}
                    <span
                      id={`${cat.id}-desc`}
                      className="block"
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '8px',
                        color: gbColors.screenDark,
                        opacity: 0.8,
                      }}
                    >
                      {cat.description}
                    </span>

                    {/* Status indicator */}
                    <span
                      className="absolute top-2 right-2"
                      style={{
                        fontFamily: '"Press Start 2P", monospace',
                        fontSize: '7px',
                        color: gbColors.screenDark,
                        opacity: 0.6,
                      }}
                    >
                      {cat.disabled ? 'REQ' : isEnabled ? 'ON' : 'OFF'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Policy link */}
            <p
              className="text-center mb-3 relative"
              style={{
                fontSize: '8px',
                fontFamily: 'monospace',
                color: gbColors.screenDark,
              }}
            >
              <Link
                to="/legal/cookies"
                className="underline hover:no-underline"
                onClick={onCancel}
              >
                Read full cookie policy
              </Link>
            </p>

            {/* Action buttons */}
            <div className="flex gap-2 relative">
              <button
                onClick={onCancel}
                className="flex-1 py-2 px-3 rounded-lg transition-all active:translate-y-px"
                style={{
                  fontFamily: '"Press Start 2P", "Courier New", monospace',
                  fontSize: '9px',
                  background: 'transparent',
                  border: `2px solid ${gbColors.screenDark}`,
                  color: gbColors.screenDark,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => onSave(localConsent)}
                className="flex-1 py-2 px-3 rounded-lg transition-all active:translate-y-px"
                style={{
                  fontFamily: '"Press Start 2P", "Courier New", monospace',
                  fontSize: '9px',
                  background: gbColors.screenDark,
                  border: `2px solid ${gbColors.screenDark}`,
                  color: gbColors.screenLight,
                  boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Bottom section with power indicator */}
        <div className="flex justify-between items-center px-4 py-2">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: '#C41E3A',
                boxShadow: '0 0 8px rgba(196, 30, 58, 0.9)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                color: gbColors.shellDark,
                fontFamily: 'Arial, sans-serif',
              }}
            >
              PREFERENCES
            </span>
          </div>
          <span
            style={{
              fontSize: '8px',
              color: gbColors.shellDark,
              fontFamily: 'monospace',
            }}
          >
            Use arrows + Enter
          </span>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
