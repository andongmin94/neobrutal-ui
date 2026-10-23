import * as React from "react";
import { createRoot } from "react-dom/client";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import "./drawer-modal.css";

function DrawerModalFixture() {
  const [clicks, setClicks] = React.useState(0);
  const nonModal = new URLSearchParams(location.search).get("modal") === "false";
  return (
    <main>
      <button data-testid="background-action" onClick={() => setClicks((value) => value + 1)}>
        Background action
      </button>
      <output data-testid="background-count">{clicks}</output>
      <Drawer {...(nonModal ? { modal: false } : {})}>
        <DrawerTrigger>Open drawer</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Drawer modal behavior</DrawerTitle>
          <DrawerDescription>
            Background actions remain available only in the non-modal variant.
          </DrawerDescription>
          <DrawerClose>Close drawer</DrawerClose>
        </DrawerContent>
      </Drawer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<DrawerModalFixture />);
