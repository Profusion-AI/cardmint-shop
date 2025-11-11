import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-cards.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Vintage Pokémon cards collection" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-oxford-blue/80 via-oxford-blue/90 to-oxford-blue" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <span className="text-3xl md:text-4xl font-bold">
            <span className="text-mint-spark">Card</span>
            <span className="text-cardmint-red">Mint</span>
          </span>
          <Sparkles className="w-8 h-8 text-mint-spark" />
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
          Exact scans. Honest grading.{" "}
          <span className="text-mint-spark">Vintage Pokémon</span>, curated.
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          1999–2001 WotC era cards, authenticated by collectors who care as much as you do.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="xl">
            Shop WotC Era
          </Button>
          <Button variant="mint" size="xl">
            Browse Collections
          </Button>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-oxford-blue to-transparent z-10" />
    </section>
  );
};
