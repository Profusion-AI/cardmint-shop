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
            <div
              key={index}
              className="cardmint-tile cardmint-tile--action text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-mint-spark/10 flex items-center justify-center">
                <value.icon className="cardmint-tile__icon h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {value.title}
              </h3>
              <p className="leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
