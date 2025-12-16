import { Button } from "@/components/ui/button";
import { HeroCardCarousel } from "@/components/HeroCardCarousel";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-cards.jpg";

const HERO_CARDS = [
  { src: "https://ik.imagekit.io/p9d2ahrjq/cardmint/tr:e-contrast,e-sharpen/c094bfd5-4a73-4e58-91ff-2cd0d4e10528.jpg" },
  { src: "https://ik.imagekit.io/p9d2ahrjq/cardmint/tr:e-contrast,e-sharpen/00dd2bd6-495b-4b57-94c3-92ef24a5bc3a.jpg" },
  { src: "https://ik.imagekit.io/p9d2ahrjq/cardmint/tr:e-contrast,e-sharpen/6f846169-97e1-45fc-af86-564a7e2b3f3a.jpg" },
];

export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Vintage Pokémon cards collection"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-oxford-blue/80 via-oxford-blue/90 to-oxford-blue" />
      </div>

      {/* Two-Panel Layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Left Panel - Text Content */}
          <div className="text-center lg:text-left">
            {/* Logo */}
            <div className="mb-8 flex items-center justify-center lg:justify-start gap-2">
              <span className="text-3xl md:text-4xl font-bold">
                <span className="text-mint-spark">Card</span>
                <span className="text-cardmint-red">Mint</span>
              </span>
              <Sparkles className="w-8 h-8 text-mint-spark" />
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight">
              Exact scans. Honest conditions.{" "}
              <span className="text-mint-spark">Vintage Pokémon</span>, curated.
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0">
              1999–2001 WotC era cards, authenticated by collectors who care as much as you do.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="xl" asChild>
                <Link to="/vault">Shop WotC Era</Link>
              </Button>
              <Button variant="mint" size="xl" asChild>
                <Link to="/vault">Browse Collections</Link>
              </Button>
            </div>
          </div>

          {/* Right Panel - Hero Card Carousel */}
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-lg">
              <HeroCardCarousel cards={HERO_CARDS} />
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-oxford-blue to-transparent z-10" />
    </section>
  );
};
