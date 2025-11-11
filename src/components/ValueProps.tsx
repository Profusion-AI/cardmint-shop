import { Card, CardContent } from "@/components/ui/card";
import { Camera, ShieldCheck, DollarSign } from "lucide-react";

const values = [
  {
    icon: Camera,
    title: "Scanned—not stock",
    description: "Every card photographed in detail. What you see is exactly what you get.",
  },
  {
    icon: ShieldCheck,
    title: "Collector-verified",
    description: "Graded by enthusiasts who know the difference between LP and NM.",
  },
  {
    icon: DollarSign,
    title: "Fair pricing",
    description: "Market-informed prices without the markup. Honest value for honest collectors.",
  },
];

export const ValueProps = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-oxford-blue to-indigo-ink">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <Card 
              key={index} 
              className="border-border/50 backdrop-blur-sm hover:shadow-[0_8px_24px_hsla(var(--mint-spark),0.15)] transition-all duration-300"
            >
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-mint-spark/10 flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-mint-spark" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
