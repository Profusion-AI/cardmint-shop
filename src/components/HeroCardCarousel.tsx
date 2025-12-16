import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface HeroCardCarouselProps {
  cards: { src: string }[];
}

type CardPosition = "active" | "left" | "right";

/**
 * Calculate the position of a card relative to the active index.
 * For a 3-card carousel:
 * - normalizedDiff 0 = active (front)
 * - normalizedDiff 1 = right (behind, peeking right)
 * - normalizedDiff 2 = left (behind, peeking left)
 */
const getCardPosition = (cardIndex: number, activeIndex: number, totalCards: number): CardPosition => {
  const diff = cardIndex - activeIndex;
  const normalizedDiff = ((diff % totalCards) + totalCards) % totalCards;

  if (normalizedDiff === 0) return "active";
  if (normalizedDiff === 1) return "right";
  return "left";
};

export const HeroCardCarousel = ({ cards }: HeroCardCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // SSR guard
    if (typeof window === "undefined") return;

    // Respect reduced motion preference - skip animation entirely
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [cards.length]);

  if (cards.length === 0) return null;

  return (
    <>
      {/* Mobile: stacked vertical layout */}
      <div className="flex flex-col gap-4 lg:hidden">
        {cards.map((card, i) => (
          <img
            key={i}
            src={card.src}
            alt=""
            aria-hidden="true"
            className="rounded-xl w-full max-w-[280px] mx-auto shadow-lg"
          />
        ))}
      </div>

      {/* Desktop: 3D carousel */}
      <div className="hidden lg:block hero-carousel">
        {cards.map((card, index) => {
          const position = getCardPosition(index, activeIndex, cards.length);

          return (
            <div
              key={index}
              className={cn(
                "hero-carousel__card rounded-xl overflow-hidden shadow-2xl",
                position === "active" && "hero-carousel__card--active",
                position === "left" && "hero-carousel__card--left",
                position === "right" && "hero-carousel__card--right"
              )}
            >
              <img
                src={card.src}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          );
        })}
      </div>
    </>
  );
};
