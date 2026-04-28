import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import loginHero from '@/assets/login-hero.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
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
            <circle cx="450" cy="450" r="260" fill="none" stroke="hsl(var(--primary) / 0.16)" strokeWidth="1.5" />
            <circle cx="450" cy="450" r="325" fill="none" stroke="hsl(var(--primary) / 0.12)" strokeWidth="1.2" />
            <circle cx="450" cy="450" r="390" fill="none" stroke="hsl(var(--primary) / 0.08)" strokeWidth="1" />
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

          {/* Title */}
          <h1 className="mb-2 font-display text-3xl font-bold text-primary">Welcome</h1>
          <p className="mb-10 text-muted-foreground">Enter your credentials to access your dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                Remember me
              </label>
              <a href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-3.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
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

export default Login;
