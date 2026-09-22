import { useEffect, useRef, useState, type ReactNode } from "react";

export function TemplateThumbnail({ children }: { children: ReactNode }) {
  const container = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, scale: 0 });

  useEffect(() => {
    const element = container.current;
    if (!element) return;

    const measure = () => {
      const width = document.documentElement.clientWidth;
      setSize({ width, scale: width > 0 ? element.clientWidth / width : 0 });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    observer.observe(document.documentElement);
    measure();
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={container}
      aria-hidden="true"
      inert
      className="pointer-events-none relative aspect-video overflow-hidden bg-background"
      data-thumbnail-ready={size.scale > 0}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: size.width, transform: `scale(${size.scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
