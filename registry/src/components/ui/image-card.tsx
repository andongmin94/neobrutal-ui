import { cn } from "@/lib/utils";

type Props = {
  imageUrl: string;
  alt: string;
  caption: string;
  className?: string;
};

export default function ImageCard({ imageUrl, alt, caption, className }: Props) {
  return (
    <figure
      className={cn(
        "w-[250px] min-w-0 max-w-full overflow-hidden rounded-base border-2 border-border bg-main font-base shadow-shadow",
        className,
      )}
    >
      <img className="w-full aspect-4/3 object-cover" src={imageUrl} alt={alt} />
      <figcaption className="border-t-2 text-main-foreground border-border p-4 wrap-anywhere">
        {caption}
      </figcaption>
    </figure>
  );
}
