import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { products, CATEGORIES } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Index() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCat = category === "all" || p.category === category;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [category, search]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="hero-bg relative overflow-hidden px-4 py-20 text-primary-foreground md:py-28">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="inline-block rounded-full border border-primary-foreground/20 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary-foreground/80">
              Premium Construction Materials
            </span>
            <h1 className="mt-6 font-heading text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Build with <span className="text-primary">Quality</span>,{" "}
              Build with <span className="text-primary">Confidence</span>
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/70">
              Premium timber, professional-grade paints, and expert architectural designs. Everything you need for your construction project.
            </p>
            <div className="mt-8 flex gap-3">
              <a href="#products" className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                Browse Products
              </a>
              <Link to="/login" className="rounded-md border border-primary-foreground/20 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10">
                Get Started
              </Link>
            </div>
          </motion.div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Products */}
      <section id="products" className="container py-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold">Our Products</h2>
            <p className="text-sm text-muted-foreground">Browse our collection of construction materials</p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-full rounded-md border bg-card pl-10 pr-4 text-sm outline-none ring-ring focus:ring-2 md:w-72"
            />
          </div>
        </div>

        {/* Category filters */}
        <div className="mt-6 flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                category === cat.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No products found matching your criteria.</p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
