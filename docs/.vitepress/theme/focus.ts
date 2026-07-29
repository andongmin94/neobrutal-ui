const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function trapTabFocus(event: KeyboardEvent) {
  if (event.key !== "Tab") return;

  const container = event.currentTarget;
  if (!(container instanceof HTMLElement)) return;

  const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.getClientRects().length > 0,
  );

  const first = focusable[0];
  const last = focusable.at(-1);
  if (!first || !last) return;

  const activeElement = document.activeElement;
  const movingBeforeFirst =
    event.shiftKey && (activeElement === first || !container.contains(activeElement));
  const movingPastLast = !event.shiftKey && activeElement === last;

  if (movingBeforeFirst || movingPastLast) {
    event.preventDefault();
    (movingBeforeFirst ? last : first).focus();
  }
}
