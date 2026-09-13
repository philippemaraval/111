type ProductImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function ProductImage({ src, alt, className, sizes = "100vw", priority = false }: ProductImageProps) {
  const [path, query] = src.split("?");
  const isOptimizedLocal = path.startsWith("/illustrations/") && path.endsWith(".webp");
  const srcSet = isOptimizedLocal
    ? [320, 640, 768, 960].map((width) => `${path.replace(/\.webp$/, `-${width}.webp`)}${query ? `?${query}` : ""} ${width}w`).join(", ")
    : undefined;

  // Variantes statiques pour Cloudflare, sans dépendre du service Images payant.
  // eslint-disable-next-line @next/next/no-img-element
  return <img
    src={src}
    srcSet={srcSet}
    sizes={srcSet ? sizes : undefined}
    width={1088}
    height={1450}
    alt={alt}
    className={className}
    loading={priority ? "eager" : "lazy"}
    fetchPriority={priority ? "high" : "auto"}
    decoding="async"
  />;
}
