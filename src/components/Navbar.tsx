import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Products" },
    { to: "/orders", label: "My Orders" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
            <span className="font-heading text-lg font-bold text-primary-foreground">B</span>
          </div>
          <span className="font-heading text-xl font-bold tracking-tight">BuildMart</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(link.to) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary ${
                isActive("/admin") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-secondary"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
              >
                {itemCount}
              </motion.span>
            )}
          </Link>

          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                <User className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="text-sm font-medium">{user.name}</span>
              <button
                onClick={logout}
                className="ml-1 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-secondary"
              >
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 md:block"
            >
              Login
            </Link>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-md md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t md:hidden"
          >
            <div className="container flex flex-col gap-3 py-4">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-medium ${isActive(link.to) ? "text-primary" : "text-muted-foreground"}`}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground">
                  Admin Dashboard
                </Link>
              )}
              {user ? (
                <button onClick={() => { logout(); setMobileOpen(false); }} className="text-left text-sm font-medium text-muted-foreground">
                  Logout ({user.name})
                </button>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-primary">
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
