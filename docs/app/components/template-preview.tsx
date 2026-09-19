import type { ReactNode } from "react";

// Presentation presets for the documentation gallery only.
// Installable templates inherit the consuming project's CSS variables.
const previewThemes = {
  blog: "[color-scheme:light] [--background:#fff5cc] [--secondary-background:#fff] [--foreground:#000] [--main-foreground:#000] [--main:#ffbe00] [--border:#000] [--ring:#000] [--box-shadow-x:0px] [--box-shadow-y:4px] [--reverse-box-shadow-x:0px] [--reverse-box-shadow-y:-4px] [--shadow:0px_4px_0px_0px_var(--border)] [--radius:10px] [--base-font-weight:500] [--heading-font-weight:700] dark:[color-scheme:dark] dark:[--background:#2c304c] dark:[--secondary-background:#222] dark:[--foreground:#ececec] dark:[--main:#ffbe00] dark:[--ring:#fff]",
  portfolio: "[color-scheme:light] [--background:#fff0dc] [--secondary-background:#fff] [--foreground:#000] [--main-foreground:#000] [--main:#ff7b07] [--border:#000] [--ring:#000] [--box-shadow-x:4px] [--box-shadow-y:4px] [--reverse-box-shadow-x:-4px] [--reverse-box-shadow-y:-4px] [--shadow:4px_4px_0px_0px_var(--border)] [--radius:5px] [--base-font-weight:500] [--heading-font-weight:700] dark:[color-scheme:dark] dark:[--background:#2c304c] dark:[--secondary-background:#222] dark:[--foreground:#ececec] dark:[--main:#ff7b07] dark:[--ring:#fff]",
  cms: "[color-scheme:light] [--background:#e7e8ff] [--secondary-background:#fff] [--foreground:#000] [--main-foreground:#000] [--main:#7983ff] [--border:#000] [--ring:#000] [--box-shadow-x:4px] [--box-shadow-y:4px] [--reverse-box-shadow-x:-4px] [--reverse-box-shadow-y:-4px] [--shadow:4px_4px_0px_0px_var(--border)] [--radius:5px] [--base-font-weight:600] [--heading-font-weight:700] dark:[color-scheme:dark] dark:[--background:#2c304c] dark:[--secondary-background:#222] dark:[--foreground:#ececec] dark:[--main:#7983ff] dark:[--ring:#fff]",
  links: "[color-scheme:light] [--background:#dceafe] [--secondary-background:#fff] [--foreground:#000] [--main-foreground:#000] [--main:#5093fe] [--border:#000] [--ring:#000] [--box-shadow-x:4px] [--box-shadow-y:4px] [--reverse-box-shadow-x:-4px] [--reverse-box-shadow-y:-4px] [--shadow:4px_4px_0px_0px_var(--border)] [--radius:5px] [--base-font-weight:400] [--heading-font-weight:600] dark:[color-scheme:dark] dark:[--background:#2c304c] dark:[--secondary-background:#222] dark:[--foreground:#ececec] dark:[--main:#5093fe] dark:[--ring:#fff]",
};

export function TemplatePreview({ children, name }: { children: ReactNode; name: string }) {
  const className = previewThemes[name as keyof typeof previewThemes];
  if (!className) throw new Error(`Unknown template preview: ${name}`);

  return (
    <div className={className} data-template-preview={name}>
      {children}
      <p className="border-t-2 border-border bg-secondary-background px-4 py-3 text-sm text-foreground">
        This preview uses a gallery preset. Installed templates inherit your project's theme.
      </p>
    </div>
  );
}
