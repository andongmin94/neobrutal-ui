import { useId } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function CarouselWithInputs() {
  const titleId = useId();
  return (
    <div className="w-full max-w-md px-12">
      <Carousel aria-label="Project settings" tabIndex={0} className="w-full">
        <CarouselContent>
          <CarouselItem>
            <div className="grid gap-4 rounded-base border-2 border-border bg-secondary-background p-4">
              <Label htmlFor={titleId}>Project title</Label>
              <Input id={titleId} defaultValue="Project" />
              <span className="text-sm font-heading">Progress</span>
              <Slider defaultValue={[50]} getAriaLabel={() => "Project progress"} />
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="rounded-base border-2 border-border bg-secondary-background p-4">
              Review the project settings before sharing them with your team.
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
