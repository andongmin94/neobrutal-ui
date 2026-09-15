import Marquee from "@/components/ui/marquee";

const features = [
  "Source you own",
  "Tailwind CSS v4",
  "Base UI primitives",
  "Light and dark themes",
  "Keyboard tested",
  "Next.js and Vite",
];

export default function MarqueeDemo() {
  return <Marquee items={features} />;
}
