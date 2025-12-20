import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setSent(true);
    toast.success('Password reset link sent!');
  };

  const handleResend = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    toast.success('Reset link resent!');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4">
            {sent ? <CheckCircle size={32} /> : <Mail size={32} />}
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {sent ? 'Check Your Email' : 'Forgot Password?'}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
            {sent
              ? `We've sent a password reset link to ${email}`
              : "No worries! Enter your email and we'll send you a reset link."}
          </p>
        </motion.div>

        {!sent ? (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
            <button type="submit" disabled={loading} className="btn-primary mt-6">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="bg-muted/50 rounded-2xl p-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <button
                onClick={handleResend}
                disabled={loading}
                className="text-primary font-medium"
              >
                {loading ? 'Resending...' : 'Resend Email'}
              </button>
            </div>
            <button onClick={() => navigate('/')} className="btn-primary">
              Back to Login
            </button>
          </motion.div>
        )}

        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 mt-8 text-muted-foreground"
        >
          <ArrowLeft size={18} />
          Back to Login
        </button>
      </div>
    </div>
  );
}
