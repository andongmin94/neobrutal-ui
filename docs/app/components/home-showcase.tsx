import { Check, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function HomeShowcase() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="home-showcase">
      <div className="home-showcase__caption">
        <span>Not a screenshot.</span>
        <span>Try it out ↓</span>
      </div>
      <Card className="w-full bg-secondary-background">
        <CardHeader>
          <Badge className="w-fit">Built with neobrutal-ui</Badge>
          <h2 className="text-2xl font-heading">Your next big idea.</h2>
          <p className="text-sm text-foreground/70">A few components. A little personality.</p>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              setSaved(true);
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="showcase-name">Workspace name</Label>
              <Input
                id="showcase-name"
                defaultValue="Side project studio"
                onChange={() => setSaved(false)}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="showcase-notifications">Keep me in the loop</Label>
              <Switch id="showcase-notifications" defaultChecked />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button type="submit">
                <Check aria-hidden="true" />
                Save workspace
              </Button>
              <Link
                className={`${buttonVariants({ variant: "outline", size: "sm" })} directory-action-link`}
                to="/docs/card"
              >
                View components
                <ArrowUpRight aria-hidden="true" size={16} />
              </Link>
            </div>
            <output className="min-h-5 text-sm text-foreground/70">
              {saved
                ? "Saved locally in this demo. Nothing was sent."
                : "Editable source. No hosted UI dependency."}
            </output>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
