import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { motion } from "framer-motion";

interface Props {
  product: Product;
  index?: number;
}

const categoryLabels: Record<string, string> = {
  wood: "Wood",
  paints: "Paints",
  designs: "Designs",
};

export default function ProductCard({ product, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to={`/product/${product.id}`}
        className="group block overflow-hidden rounded-lg border bg-card transition-all duration-300 hover:shadow-[var(--card-shadow-hover)]"
        style={{ boxShadow: "var(--card-shadow)" }}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <span className="absolute left-3 top-3 rounded-md bg-accent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent-foreground">
            {categoryLabels[product.category]}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-heading text-base font-semibold leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-heading text-lg font-bold text-primary">
              TZS {product.price.toLocaleString()}
            </span>
            {product.types && (
              <span className="text-xs text-muted-foreground">
                {product.types.length} options
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
