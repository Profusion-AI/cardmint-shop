import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { toast } from "sonner";

export const EmailCapture = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Welcome! Check your email for your 10% code.");
      setEmail("");
    }
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-indigo-ink to-oxford-blue">
      <div className="max-w-3xl mx-auto text-center">
        <div className="bg-gradient-to-br from-collectors-pink/10 to-cardmint-red/5 rounded-2xl p-12 border border-collectors-pink/20 backdrop-blur-sm">
          <Mail className="w-12 h-12 text-mint-spark mx-auto mb-6" />
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get rare drops—10% welcome code
          </h2>
          
          <p className="text-muted-foreground text-lg mb-8">
            First access to new arrivals, curated finds, and collector insights.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 h-12 bg-oxford-blue border-mint-spark/30 focus:border-mint-spark text-foreground placeholder:text-muted-foreground"
            />
            <Button type="submit" variant="hero" size="lg" className="sm:w-auto w-full">
              Get Code
            </Button>
          </form>

          <p className="text-sm text-muted-foreground mt-6">
            No spam. Unsubscribe anytime. We respect collectors.
          </p>
        </div>
      </div>
    </section>
  );
};
