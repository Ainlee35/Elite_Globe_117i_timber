import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Hammer } from "lucide-react";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isRegister) {
      if (!form.name || !form.email || !form.password) {
        toast.error("Please fill in all fields");
        setSubmitting(false);
        return;
      }
      const { error } = await register(form.name, form.email, form.password);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Account created! Check your email to confirm, or log in.");
        setIsRegister(false);
      }
    } else {
      const { error } = await login(form.email, form.password);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Welcome back!");
        navigate("/");
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden w-1/2 hero-bg lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center text-primary-foreground">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary">
            <Hammer className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="font-heading text-3xl font-bold">Apex Globe</h2>
          <p className="mt-3 text-primary-foreground/70">Your trusted partner for premium construction materials</p>
        </motion.div>
      </div>

      {/* Right form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
                <Hammer className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-bold">Apex Globe</span>
            </div>
          </div>

          <h1 className="font-heading text-2xl font-bold">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isRegister ? "Sign up to start ordering" : "Sign in to your account"}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {isRegister && (
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="mt-1 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring focus:ring-2"
                  placeholder="John Mwangi"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="mt-1 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring focus:ring-2"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="mt-1 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none ring-ring focus:ring-2"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => setIsRegister(!isRegister)} className="font-semibold text-primary hover:underline">
              {isRegister ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
