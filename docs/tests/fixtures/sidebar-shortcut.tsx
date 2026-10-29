import * as React from "react";
import { createRoot } from "react-dom/client";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import "./sidebar-shortcut.css";

function Controls() {
  const { open, openMobile, isMobile } = useSidebar();
  return (
    <main>
      <h1>Sidebar shortcut ownership</h1>
      <SidebarTrigger />
      <output aria-label="Current sidebar open">{String(isMobile ? openMobile : open)}</output>
      <button type="button">Shortcut target</button>
      <button type="button" onKeyDown={(event) => event.preventDefault()}>
        Owned shortcut
      </button>
      <input aria-label="Editor input" />
      <textarea aria-label="Editor notes" />
      <select aria-label="Editor choice">
        <option>One</option>
        <option>Two</option>
      </select>
      {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Exercise an editable DOM editor rather than a native text field. */}
      <div contentEditable suppressContentEditableWarning role="textbox" aria-label="Rich editor">
        <span>Editable text</span>
      </div>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(
  <SidebarProvider>
    <Controls />
  </SidebarProvider>,
);
