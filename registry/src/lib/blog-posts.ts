export type BlogPostSection = {
  body: readonly string[];
  heading: string;
  points?: readonly string[];
};

export type BlogPost = {
  intro: string;
  publishedAt: string;
  publishedLabel: string;
  readTime: string;
  sections: readonly BlogPostSection[];
  slug: string;
  summary: string;
  title: string;
  topic: string;
};

export const BLOG_POSTS = [
  {
    slug: "small-interfaces",
    title: "Why Small Interfaces Age Better",
    summary: "A practical case for fewer controls, clearer defaults, and less maintenance.",
    topic: "Design",
    publishedAt: "2026-07-12",
    publishedLabel: "Jul 12",
    readTime: "5 min",
    intro:
      "Small interfaces are easier to understand on the first visit and easier to maintain on the hundredth release.",
    sections: [
      {
        heading: "Start with the boundary",
        body: [
          "A useful interface begins by deciding what it will not ask the user to manage. Every exposed option becomes a promise the product has to explain, support, and preserve.",
          "Keep the controls that change the outcome. Move rare configuration closer to the moment it becomes relevant instead of presenting it up front.",
        ],
      },
      {
        heading: "Make the default path obvious",
        body: [
          "A strong default removes a decision without hiding what happened. People should be able to complete the common task and still understand the system's choice.",
        ],
        points: [
          "Name the primary action precisely.",
          "Show the current state beside the control that changes it.",
          "Keep advanced choices available without making them mandatory.",
        ],
      },
      {
        heading: "Leave room to remove things",
        body: [
          "Maintenance gets lighter when each control has a clear owner and measurable purpose. If nobody can explain why an option still exists, removing it may be the most useful design improvement.",
        ],
      },
    ],
  },
  {
    slug: "reading-a-codebase",
    title: "Reading a Codebase Before Changing It",
    summary: "The files and questions that reveal how an unfamiliar project really works.",
    topic: "Engineering",
    publishedAt: "2026-07-06",
    publishedLabel: "Jul 6",
    readTime: "8 min",
    intro:
      "The fastest way into an unfamiliar codebase is to follow one real workflow from its entry point to its visible result.",
    sections: [
      {
        heading: "Trace one path end to end",
        body: [
          "Begin with a route, command, or event that you can reproduce. Follow the data through the components and services it touches, and note where validation and side effects happen.",
          "This gives the directory structure a purpose. Names that looked abstract become parts of a concrete flow.",
        ],
      },
      {
        heading: "Find the contracts",
        body: [
          "Types, tests, schemas, and adapters describe the boundaries that other code already depends on. Read those before changing an implementation detail that appears local.",
        ],
        points: [
          "Inputs accepted at the boundary",
          "Outputs consumed by another module",
          "Errors that are intentionally surfaced",
          "Tests that describe behavior rather than implementation",
        ],
      },
      {
        heading: "Write a small change map",
        body: [
          "Before editing, list the files that own the behavior, the callers that rely on it, and the checks that will prove the change. The map can be short; its job is to prevent a local fix from becoming a hidden system change.",
        ],
      },
    ],
  },
  {
    slug: "useful-empty-states",
    title: "Empty States Should Point Somewhere",
    summary: "Five ways to turn a blank screen into a useful next step.",
    topic: "Product",
    publishedAt: "2026-06-28",
    publishedLabel: "Jun 28",
    readTime: "4 min",
    intro:
      "An empty state is not a pause in the product. It is the moment when the interface has the most responsibility to explain what comes next.",
    sections: [
      {
        heading: "Explain why it is empty",
        body: [
          "No data can mean a first visit, a narrow filter, a failed request, or missing access. Use language that reflects the actual cause instead of showing the same generic message everywhere.",
        ],
      },
      {
        heading: "Offer one useful next step",
        body: [
          "The primary action should resolve the empty state or help the user understand it. Secondary links can provide examples or documentation, but they should not compete with the next action.",
        ],
        points: [
          "Create the first item",
          "Clear the active filters",
          "Invite a teammate who owns the data",
          "Retry a failed request",
          "Open a relevant example",
        ],
      },
      {
        heading: "Keep the state compact",
        body: [
          "A blank screen does not need a marketing page inside it. A direct heading, one sentence, and a clear action usually provide enough context without slowing down repeat users.",
        ],
      },
    ],
  },
  {
    slug: "quiet-debugging",
    title: "A Quieter Way to Debug Frontend Work",
    summary: "A short loop for isolating layout, state, and network problems without guessing.",
    topic: "Engineering",
    publishedAt: "2026-06-19",
    publishedLabel: "Jun 19",
    readTime: "7 min",
    intro:
      "Debugging gets faster when each experiment answers one question and changes one variable.",
    sections: [
      {
        heading: "Reduce the surface area",
        body: [
          "Reproduce the problem in the smallest route, viewport, and state you can. Disable unrelated animation and data refreshes so the signal does not move while you inspect it.",
        ],
      },
      {
        heading: "Use a short loop",
        body: [
          "State the current hypothesis before touching the code. Then run the smallest observation or change that could disprove it.",
        ],
        points: [
          "Observe the DOM, computed styles, state, and request timing.",
          "Change one variable.",
          "Reproduce from the same starting state.",
          "Keep or revert the change immediately.",
        ],
      },
      {
        heading: "Record the useful result",
        body: [
          "When the cause is subtle, leave a focused regression test or a short comment near the constraint. The goal is not to preserve the debugging story; it is to prevent the same ambiguity from returning.",
        ],
      },
    ],
  },
  {
    slug: "decision-notes",
    title: "Write Down the Decision, Not the Meeting",
    summary: "A tiny note format that preserves context without becoming more process.",
    topic: "Workflow",
    publishedAt: "2026-06-11",
    publishedLabel: "Jun 11",
    readTime: "6 min",
    intro:
      "A useful decision note lets someone understand what changed and why without replaying the meeting that produced it.",
    sections: [
      {
        heading: "Capture the durable parts",
        body: [
          "Attendance, discussion order, and every rejected sentence rarely matter later. The decision, the constraints behind it, and the consequences for future work usually do.",
        ],
        points: [
          "Decision: what the team will do",
          "Context: the constraint or evidence that shaped it",
          "Consequences: what becomes easier, harder, or intentionally unsupported",
        ],
      },
      {
        heading: "Keep one source of truth",
        body: [
          "Link the note from the issue, pull request, or project page where the work continues. Copies in several tools drift quickly and make a settled decision look unresolved.",
        ],
      },
      {
        heading: "Update decisions explicitly",
        body: [
          "A decision can change. Add a short superseding note and link the two records instead of silently rewriting the old context. Future readers can then see both the current direction and the reason it moved.",
        ],
      },
    ],
  },
  {
    slug: "honest-forms",
    title: "Shorter Forms Without Hidden Questions",
    summary: "Use grouping, timing, and defaults to reduce friction while staying honest.",
    topic: "Design",
    publishedAt: "2026-06-02",
    publishedLabel: "Jun 2",
    readTime: "5 min",
    intro:
      "A form feels short when every question arrives at the right moment and its purpose is easy to understand.",
    sections: [
      {
        heading: "Ask only when the answer matters",
        body: [
          "Collect information at the point where it changes the result. Questions needed only for a later workflow can wait until that workflow begins.",
        ],
      },
      {
        heading: "Use defaults without hiding choices",
        body: [
          "A default should reflect the most common safe answer and remain visible to the person submitting the form. Preselected values that are easy to miss save clicks by creating uncertainty elsewhere.",
        ],
        points: [
          "Group fields by the task they support.",
          "Explain why sensitive information is required.",
          "Reveal conditional questions as soon as the triggering choice is made.",
        ],
      },
      {
        heading: "Audit the work after submit",
        body: [
          "Reducing visible fields is not an improvement if the user must correct assumptions on the next screen. Review the entire path through confirmation and editing, not only the initial form length.",
        ],
      },
    ],
  },
] as const satisfies readonly BlogPost[];

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
