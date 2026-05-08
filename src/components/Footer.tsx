import { Hammer, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t bg-accent text-accent-foreground">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <Hammer className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-heading text-lg font-bold">Apex Globe</span>
            </div>
            <p className="mt-3 text-sm text-accent-foreground/70">
              Your trusted partner for premium construction materials. Quality timber, paints, and architectural designs.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider">Quick Links</h4>
            <div className="mt-3 flex flex-col gap-2">
              <Link to="/" className="text-sm text-accent-foreground/70 hover:text-primary transition-colors">Products</Link>
              <Link to="/orders" className="text-sm text-accent-foreground/70 hover:text-primary transition-colors">My Orders</Link>
              <Link to="/login" className="text-sm text-accent-foreground/70 hover:text-primary transition-colors">Login</Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider">Contact</h4>
            <div className="mt-3 flex flex-col gap-2 text-sm text-accent-foreground/70">
              <span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> +255 700 000 000</span>
              <span className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> info@apexglobe.co.tz</span>
              <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> Dar es Salaam, Tanzania</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-accent-foreground/10 pt-6 text-center text-xs text-accent-foreground/50">
          © 2026 Apex Globe. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
