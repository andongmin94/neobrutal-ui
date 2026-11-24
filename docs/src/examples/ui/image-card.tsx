import ImageCard from "@/components/ui/image-card";

export default function ImageCardDemo() {
  return (
    <ImageCard
      caption="neobrutal-ui documentation preview"
      imageUrl="/preview.png"
      alt="Screenshot of the component documentation"
      className="w-full max-w-sm [&_img]:aspect-auto"
    />
  );
}
