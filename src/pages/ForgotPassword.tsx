import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import loginHero from "@/assets/login-hero.jpg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="relative flex w-full flex-col justify-center px-8 py-12 lg:w-1/2 lg:px-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <svg
            aria-hidden="true"
            className="absolute -right-[20rem] -top-[18rem] h-[680px] w-[680px] sm:-right-[21rem] sm:-top-[20rem] sm:h-[760px] sm:w-[760px] lg:-right-[22rem] lg:-top-[24rem] lg:h-[860px] lg:w-[860px]"
            viewBox="0 0 900 900"
          >
            <circle
              cx="450"
              cy="450"
              r="260"
              fill="none"
              stroke="hsl(var(--primary) / 0.16)"
              strokeWidth="1.5"
            />
            <circle
              cx="450"
              cy="450"
              r="325"
              fill="none"
              stroke="hsl(var(--primary) / 0.12)"
              strokeWidth="1.2"
            />
            <circle
              cx="450"
              cy="450"
              r="390"
              fill="none"
              stroke="hsl(var(--primary) / 0.08)"
              strokeWidth="1"
            />
          </svg>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <span className="font-display text-2xl font-bold">
              <span className="text-primary">Diet</span>
              <span className="text-accent">Padi</span>
            </span>
          </div>

          {!sent ? (
            <>
              {/* Back button */}
              <button
                onClick={() => navigate("/login")}
                className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={16} />
                Back to login
              </button>

              {/* Title */}
              <h1 className="mb-2 font-display text-3xl font-bold text-primary">
                Forgot Password
              </h1>
              <p className="mb-10 text-muted-foreground">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-primary py-3.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <svg
                    className="h-8 w-8 text-success"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <h1 className="mb-2 font-display text-3xl font-bold text-primary">
                  Check your email
                </h1>
                <p className="mb-2 text-muted-foreground">
                  We sent a password reset link to
                </p>
                <p className="mb-8 font-medium text-foreground">{email}</p>
                <p className="mb-10 text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => setSent(false)}
                    className="font-medium text-primary hover:underline"
                  >
                    try again
                  </button>
                </p>

                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to login
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right side - Hero image */}
      <div className="relative hidden w-1/2 lg:block overflow-hidden">
        <img
          src={loginHero}
          alt="Healthy food"
          className="h-full w-full object-cover"
          width={960}
          height={1080}
        />
        <div className="login-hero-gradient absolute inset-0" />
      </div>
    </div>
  );
};

export default ForgotPassword;
