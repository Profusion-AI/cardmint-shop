import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const sets = [
  { name: "Base Set", year: "1999", count: "102 cards" },
  { name: "Jungle", year: "1999", count: "64 cards" },
  { name: "Fossil", year: "1999", count: "62 cards" },
  { name: "Team Rocket", year: "2000", count: "82 cards" },
  { name: "Neo Genesis", year: "2000", count: "111 cards" },
];

export const VaultCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % sets.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + sets.length) % sets.length);
  };

  return (
    <section className="py-20 px-6 bg-indigo-ink">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            From the <span className="text-mint-spark">Vault</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Curated collections from the WotC era
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {sets.map((set, index) => (
                <div 
                  key={index} 
                  className="min-w-full px-4"
                >
                  <div className="bg-gradient-to-br from-graded-blush/20 to-collectors-pink/10 rounded-lg p-12 border border-border/30 text-center backdrop-blur-sm">
                    <h3 className="text-3xl font-bold mb-2 text-foreground">
                      {set.name}
                    </h3>
                    <p className="text-mint-spark text-lg font-medium mb-1">
                      {set.year}
                    </p>
                    <p className="text-muted-foreground">
                      {set.count}
                    </p>
                    <Button variant="hero" size="lg" className="mt-8">
                      Explore Collection
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={prev}
              className="border-mint-spark/50 hover:bg-mint-spark/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            {/* Dots */}
            <div className="flex items-center gap-2">
              {sets.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex 
                      ? "bg-mint-spark w-8" 
                      : "bg-muted-foreground/30"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <Button 
              variant="outline" 
              size="icon" 
              onClick={next}
              className="border-mint-spark/50 hover:bg-mint-spark/10"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
