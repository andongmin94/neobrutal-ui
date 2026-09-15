export async function copyText(value: string) {
  if (!navigator.clipboard?.writeText) {
    throw new Error("Clipboard access is unavailable. Copy the visible text manually.");
  }
  await navigator.clipboard.writeText(value);
}
