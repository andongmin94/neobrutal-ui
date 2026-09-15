import { Checkbox } from "@/components/ui/checkbox";

const options = [
  {
    id: "component-source",
    label: "Component source",
    detail: "Include the editable React and TypeScript files.",
    checked: true,
  },
  {
    id: "theme-tokens",
    label: "Theme tokens",
    detail: "Include the matching light and dark CSS variables.",
    checked: true,
  },
  {
    id: "private-preview",
    label: "Private preview link",
    detail: "Available after connecting a deployment provider.",
    checked: false,
    disabled: true,
  },
];

export default function CheckboxDemo() {
  return (
    <fieldset className="w-full max-w-md rounded-base border-2 border-border bg-secondary-background p-4 shadow-shadow">
      <legend className="px-2 font-heading">Release contents</legend>
      <div className="divide-y-2 divide-border">
        {options.map((option) => (
          <label
            key={option.id}
            htmlFor={option.id}
            className={`flex min-h-16 items-start gap-3 py-3 first:pt-1 last:pb-1 ${
              option.disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            }`}
          >
            <Checkbox
              id={option.id}
              defaultChecked={option.checked}
              disabled={option.disabled}
              className="mt-0.5"
            />
            <span>
              <strong className="block font-heading">{option.label}</strong>
              <span className="mt-1 block text-sm leading-5 text-foreground/75">
                {option.detail}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
