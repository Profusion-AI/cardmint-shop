import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useEmailCapture } from '@/hooks/useEmailCapture';

/**
 * EmailCaptureInline - Compact horizontal email capture form
 *
 * Variants:
 * - vault: For Vault page - "Be the first to know when new cards hit the Vault."
 * - footer: For footer section - "Join the Vault Newsletter"
 */

interface EmailCaptureInlineProps {
  variant?: 'vault' | 'footer';
}

const VARIANT_CONFIG = {
  vault: {
    heading: 'Be the first to know when new cards hit the Vault.',
    placeholder: 'your@email.com',
    buttonText: 'Notify Me',
    source: 'vault_inline',
  },
  footer: {
    heading: 'Join the Vault Newsletter',
    placeholder: 'your@email.com',
    buttonText: 'Subscribe',
    source: 'footer_inline',
  },
};

export const EmailCaptureInline = ({ variant = 'vault' }: EmailCaptureInlineProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { isSubscribed, markSubscribed } = useEmailCapture();
  const config = VARIANT_CONFIG[variant];

  // If already subscribed, show thank you message
  if (isSubscribed || submitted) {
    return (
      <div className="flex items-center justify-center gap-2 py-4 text-mint">
        <CheckCircle className="w-5 h-5" />
        <span className="text-sm font-medium">You're in! Check your email for updates.</span>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: config.source }),
      });

      if (response.ok) {
        markSubscribed();
        setSubmitted(true);
        setEmail('');
        toast.success('You\'re on the list! Check your email for your 10% code.');
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

  return (
    <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-mint" />
          <p className="text-paper/80 text-sm font-medium">{config.heading}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <Input
            type="email"
            placeholder={config.placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            className="flex-1 h-11 bg-white/5 border-white/20 focus:border-mint text-paper placeholder:text-paper/40"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 px-6 bg-mint hover:bg-mint/90 text-midnight font-medium"
          >
            {isSubmitting ? 'Sending...' : config.buttonText}
          </Button>
        </form>

        <p className="text-xs text-paper/40 text-center mt-3">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
};

export default EmailCaptureInline;
