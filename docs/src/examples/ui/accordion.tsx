import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const questions = [
  {
    value: "source",
    question: "Do I own the installed source?",
    answer: "Yes. The CLI copies the component files into your application so you can edit them directly.",
  },
  {
    value: "theme",
    question: "Can I change the visual style?",
    answer: "Use a preset or adjust the shared color, radius, type, and shadow tokens for your product.",
  },
  {
    value: "framework",
    question: "Does it work outside Next.js?",
    answer: "Yes. The registry is verified in fresh Next.js and Vite consumers.",
  },
];

export default function AccordionDemo() {
  return (
    <Accordion type="single" collapsible className="w-full max-w-xl">
      {questions.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
