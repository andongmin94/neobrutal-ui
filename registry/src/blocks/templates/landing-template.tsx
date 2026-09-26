"use client";

import { ArrowRight, Check, CheckCheck, MessageSquare, Radio, Sparkles } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const FEATURES = [
  {
    icon: MessageSquare,
    title: "A little context goes a long way.",
    description:
      "Share what moved forward, what comes next, and where you need a hand. Three prompts, one useful update.",
  },
  {
    icon: CheckCheck,
    title: "Catch up on your schedule.",
    description:
      "Read a clear team digest when your work allows it. Decisions stay with the conversation that led to them.",
  },
  {
    icon: Sparkles,
    title: "Make space for the actual work.",
    description:
      "Keep routine updates out of the calendar. Save your time together for the conversations that need it.",
  },
];

const FAQS = [
  [
    "Does Relay replace every meeting?",
    "No. Use written updates for routine progress and keep live conversations for decisions, feedback, and time together.",
  ],
  [
    "Can I start with a small team?",
    "The Starter plan is designed for up to five people. Move to Team when you need more members, shared spaces, and a longer history.",
  ],
  [
    "What happens when I choose a plan?",
    "This is a product landing page example. Choosing a plan only updates the selection on this page; it does not create an account, start a subscription, or take payment.",
  ],
];

export default function LandingTemplate() {
  const [yearly, setYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"Starter" | "Team" | null>(null);
  const teamPrice = yearly ? 10 : 12;
  const teamBilling = yearly ? "$120 per person, billed yearly" : "$12 per person, billed monthly";

  return (
    <div id="relay-top" className="min-h-dvh bg-background text-foreground">
      <header className="border-b-2 border-border bg-secondary-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a
            href="#relay-top"
            className="flex items-center gap-2 font-heading"
            aria-label="Relay home"
          >
            <Radio aria-hidden="true" className="size-6" />
            <span className="text-xl tracking-tight">relay</span>
          </a>
          <nav
            aria-label="Primary navigation"
            className="flex items-center gap-4 text-sm font-heading sm:gap-6"
          >
            <a className="underline-offset-4 hover:underline" href="#how-it-works">
              How it works
            </a>
            <a className="underline-offset-4 hover:underline" href="#pricing">
              Pricing
            </a>
            <a className="underline-offset-4 hover:underline" href="#questions">
              FAQ
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section
          aria-labelledby="relay-title"
          className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16"
        >
          <div>
            <Badge variant="neutral">Small updates. More room to think.</Badge>
            <h1
              id="relay-title"
              className="mt-6 max-w-xl text-4xl leading-[1.05] font-heading tracking-tight sm:text-6xl"
            >
              Keep your team in the loop.
              <br />
              Keep your day open.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-foreground/75">
              A calm home for team updates. Share your progress, unblock each other, and get back to
              work without another status meeting.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#pricing" className={buttonVariants({ size: "lg" })}>
                Find your plan <ArrowRight aria-hidden="true" />
              </a>
              <a
                href="#how-it-works"
                className={buttonVariants({ variant: "neutral", size: "lg" })}
              >
                See how it works
              </a>
            </div>
            <p className="mt-5 text-xs text-foreground/65">
              Built around a simple idea: progress deserves context.
            </p>
          </div>

          <Card className="gap-0 overflow-hidden bg-secondary-background py-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border bg-main px-5 py-4 text-main-foreground">
              <span className="flex items-center gap-2 font-heading">
                <Radio aria-hidden="true" className="size-4" /> Studio / Weekly update
              </span>
              <span className="font-mono text-xs">PREVIEW</span>
            </div>
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-base border-2 border-border bg-background text-sm font-heading"
                >
                  JL
                </span>
                <div>
                  <p className="text-sm font-heading">Jamie Lee</p>
                  <p className="mt-0.5 text-xs text-foreground/65">
                    Product design · Monday, 9:14 AM
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-5 text-sm leading-6">
                <div>
                  <h2 className="font-heading">What moved forward?</h2>
                  <p className="text-foreground/75">
                    The new onboarding flow is ready for a first look. Five screens, fewer
                    questions, a much clearer next step.
                  </p>
                </div>
                <div>
                  <h2 className="font-heading">What’s next?</h2>
                  <p className="text-foreground/75">
                    Testing the prototype with three teammates on Wednesday.
                  </p>
                </div>
                <div>
                  <h2 className="font-heading">Where could you use a hand?</h2>
                  <p className="text-foreground/75">A second pair of eyes on the welcome copy.</p>
                </div>
              </div>
              <p className="mt-6 flex items-center gap-2 border-t-2 border-border pt-4 text-xs font-heading">
                <CheckCheck aria-hidden="true" className="size-4" /> Caught up · 4 teammates
              </p>
            </div>
          </Card>
        </section>

        <section
          id="how-it-works"
          aria-labelledby="how-title"
          className="scroll-mt-6 border-y-2 border-border bg-secondary-background"
        >
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
            <p className="text-xs font-heading uppercase tracking-widest">
              Less chasing. More understanding.
            </p>
            <h2 id="how-title" className="mt-3 text-3xl font-heading tracking-tight sm:text-4xl">
              A good week starts with context.
            </h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, description }, index) => (
                <article key={title} className="border-t-2 border-border pt-5">
                  <div className="mb-5 flex items-center justify-between">
                    <Icon aria-hidden="true" className="size-6" />
                    <span className="font-mono text-xs text-foreground/60">0{index + 1}</span>
                  </div>
                  <h3 className="max-w-xs text-xl leading-snug font-heading">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-foreground/75">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="pricing"
          aria-labelledby="pricing-title"
          className="mx-auto max-w-4xl scroll-mt-6 px-5 py-12 sm:px-8 sm:py-16"
        >
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-heading uppercase tracking-widest">
                Room for your whole team
              </p>
              <h2
                id="pricing-title"
                className="mt-3 text-3xl font-heading tracking-tight sm:text-4xl"
              >
                Simple plans. Clear pricing.
              </h2>
            </div>
            <label className="flex cursor-pointer items-center gap-3 text-sm font-heading">
              <Switch checked={yearly} onCheckedChange={setYearly} aria-label="Yearly billing" />{" "}
              Bill yearly <span className="text-xs text-foreground/65">Save $24 / person</span>
            </label>
          </div>
          <p className="mt-4 text-sm text-foreground/70">
            Illustrative plans for this template. Prices are in USD.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <Card className="gap-0 bg-secondary-background px-5 sm:px-6">
              <h3 className="text-xl font-heading">Starter</h3>
              <p className="mt-2 text-sm text-foreground/75">
                For a small team finding its rhythm.
              </p>
              <p className="mt-6">
                <span className="text-4xl font-heading">$0</span>
                <span className="ml-2 text-sm">/ forever</span>
              </p>
              <p className="mt-2 text-xs text-foreground/65">Free for up to 5 people</p>
              <ul className="my-6 space-y-3 text-sm">
                {["Weekly team updates", "One shared space", "30 days of update history"].map(
                  (feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                      {feature}
                    </li>
                  ),
                )}
              </ul>
              <Button
                type="button"
                variant={selectedPlan === "Starter" ? "default" : "neutral"}
                aria-pressed={selectedPlan === "Starter"}
                onClick={() => setSelectedPlan("Starter")}
                className="mt-auto w-full"
              >
                {selectedPlan === "Starter" ? "Starter selected" : "Choose Starter"}
              </Button>
            </Card>
            <Card className="gap-0 bg-secondary-background px-5 sm:px-6">
              <h3 className="text-xl font-heading">Team</h3>
              <p className="mt-2 text-sm text-foreground/75">
                For more people, projects, and progress.
              </p>
              <p className="mt-6">
                <span className="text-4xl font-heading">${teamPrice}</span>
                <span className="ml-2 text-sm">/ person / month</span>
              </p>
              <p className="mt-2 text-xs text-foreground/65">{teamBilling}</p>
              <ul className="my-6 space-y-3 text-sm">
                {[
                  "Everything in Starter",
                  "Unlimited people and spaces",
                  "Unlimited update history",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                variant={selectedPlan === "Team" ? "default" : "neutral"}
                aria-pressed={selectedPlan === "Team"}
                onClick={() => setSelectedPlan("Team")}
                className="mt-auto w-full"
              >
                {selectedPlan === "Team" ? "Team selected" : "Choose Team"}
              </Button>
            </Card>
          </div>
          <p role="status" className="mt-6 min-h-12 text-sm leading-6 text-foreground/75">
            {selectedPlan
              ? `${selectedPlan} selected. ${selectedPlan === "Team" ? `${teamBilling}.` : "Free for up to 5 people."} This preview does not create an account or charge you.`
              : "Choose a plan to preview your selection. No account or payment is required."}
          </p>
        </section>

        <section
          id="questions"
          aria-labelledby="questions-title"
          className="border-t-2 border-border bg-secondary-background"
        >
          <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
            <h2 id="questions-title" className="text-3xl font-heading tracking-tight">
              A few good questions.
            </h2>
            <div className="mt-8 border-t-2 border-border">
              {FAQS.map(([question, answer]) => (
                <details key={question} className="border-b-2 border-border py-4">
                  <summary className="cursor-pointer text-sm leading-6 font-heading">
                    {question}
                  </summary>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/75">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6 text-xs sm:px-8">
          <p className="text-foreground/65">
            Relay · A fictional product, a practical starting point.
          </p>
          <a href="#relay-top" className="font-heading underline-offset-4 hover:underline">
            Back to top ↑
          </a>
        </div>
      </footer>
    </div>
  );
}
