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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import "./drawer-modal.css";

function DisclosureFixture() {
  return (
    <main>
      <section style={{ display: "grid", gap: 24, maxWidth: 480 }}>
        <Accordion>
          <AccordionItem value="details">
            <AccordionTrigger>Accordion details</AccordionTrigger>
            <AccordionContent keepMounted>
              <p>Native accordion content.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Collapsible>
          <CollapsibleTrigger>Collapsible details</CollapsibleTrigger>
          <CollapsibleContent keepMounted>
            <p>Native collapsible content.</p>
          </CollapsibleContent>
        </Collapsible>
      </section>
    </main>
  );
}

function ModalFixture() {
  const [clicks, setClicks] = React.useState(0);
  const params = new URLSearchParams(location.search);
  const mode = params.get("modal");
  const modal = mode === "false" ? false : mode === "trap-focus" ? "trap-focus" : undefined;
  return (
    <main>
      <button data-testid="background-action" onClick={() => setClicks((value) => value + 1)}>
        Background action
      </button>
      <output data-testid="background-count">{clicks}</output>
      {params.get("surface") === "dialog" ? (
        <Dialog modal={modal}>
          <DialogTrigger>Open dialog</DialogTrigger>
          <DialogContent showCloseButton={false}>
            <DialogTitle>Dialog modal behavior</DialogTitle>
            <DialogDescription>
              Background actions follow the selected modal behavior.
            </DialogDescription>
            <DialogClose>Close dialog</DialogClose>
          </DialogContent>
        </Dialog>
      ) : params.get("surface") === "sheet" ? (
        <Sheet modal={modal}>
          <SheetTrigger>Open sheet</SheetTrigger>
          <SheetContent showCloseButton={false}>
            <SheetTitle>Sheet modal behavior</SheetTitle>
            <SheetDescription>
              Background actions follow the selected modal behavior.
            </SheetDescription>
            <SheetClose>Close sheet</SheetClose>
          </SheetContent>
        </Sheet>
      ) : (
        <Drawer modal={modal}>
          <DrawerTrigger>Open drawer</DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>Drawer modal behavior</DrawerTitle>
            <DrawerDescription>
              Background actions follow the selected modal behavior.
            </DrawerDescription>
            <DrawerClose>Close drawer</DrawerClose>
          </DrawerContent>
        </Drawer>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  new URLSearchParams(location.search).get("surface") === "disclosures" ? (
    <DisclosureFixture />
  ) : (
    <ModalFixture />
  ),
);
