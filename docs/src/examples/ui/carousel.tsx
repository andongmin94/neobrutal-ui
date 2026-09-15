import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const slides = [
  {
    eyebrow: "Template",
    title: "Portfolio",
    detail: "A project-focused landing page with clear case-study navigation.",
    className: "bg-main text-main-foreground",
  },
  {
    eyebrow: "Component",
    title: "Command menu",
    detail: "Searchable actions with keyboard navigation and honest local feedback.",
    className: "bg-secondary-background text-foreground",
  },
  {
    eyebrow: "Theme",
    title: "Yellow preset",
    detail: "Hard shadows, strong borders, and a complete light and dark token pair.",
    className: "bg-main text-main-foreground",
  },
];

export default function CarouselDemo() {
  return (
    <div className="w-full max-w-md px-12">
      <Carousel className="w-full" aria-label="Featured registry examples">
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.title}>
              <div className="p-1">
                <Card className={`h-full overflow-hidden p-0 shadow-none ${slide.className}`}>
                  <CardContent className="flex aspect-[4/3] flex-col items-start justify-between gap-6 p-5">
                    <span className="rounded-base border-2 border-current px-2 py-1 text-xs font-heading uppercase tracking-wide">
                      {slide.eyebrow}
                    </span>
                    <div>
                      <h3 className="text-2xl font-heading">{slide.title}</h3>
                      <p className="mt-2 text-sm leading-6">{slide.detail}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
