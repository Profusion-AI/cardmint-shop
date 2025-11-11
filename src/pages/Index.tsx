import { Hero } from "@/components/Hero";
import { ValueProps } from "@/components/ValueProps";
import { VaultCarousel } from "@/components/VaultCarousel";
import { EmailCapture } from "@/components/EmailCapture";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-oxford-blue">
      <Hero />
      <ValueProps />
      <VaultCarousel />
      <EmailCapture />
      <Footer />
    </div>
  );
};

export default Index;
