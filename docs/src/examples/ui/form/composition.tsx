"use client";

import { useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function FormComposition() {
  const id = useId();
  const form = useForm({ defaultValues: { first: "", second: "" }, mode: "onChange" });
  const controlRef = useRef<HTMLElement>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [blurCount, setBlurCount] = useState(0);
  const [message, setMessage] = useState("");

  return (
    <Form {...form}>
      <form
        aria-label="Optional field composition"
        className="grid w-full max-w-md gap-5"
        onSubmit={form.handleSubmit(() => setMessage("Both fields are valid. Nothing was saved."))}
      >
        <FormField
          control={form.control}
          name="first"
          rules={{ required: "Enter the first value." }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>First value</FormLabel>
              <FormControl ref={controlRef} onBlur={() => setBlurCount((count) => count + 1)}>
                <Input {...field} id={`${id}-custom-input`} aria-describedby={`${id}-external`} />
              </FormControl>
              <p id={`${id}-external`} className="text-sm">
                This help belongs to the application.
              </p>
              {showHelp && (
                <FormDescription id={`${id}-custom-help`}>Optional field help.</FormDescription>
              )}
              <FormMessage id={`${id}-custom-error`} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="second"
          rules={{ required: "Enter the second value." }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Second value</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="neutral" onClick={() => setShowHelp((value) => !value)}>
            {showHelp ? "Hide help" : "Show help"}
          </Button>
          <Button type="button" variant="neutral" onClick={() => controlRef.current?.focus()}>
            Focus first field
          </Button>
          <Button type="submit">Validate fields</Button>
        </div>
        <p className="text-sm">First field blur events: {blurCount}</p>
        <p className="text-sm">
          First field touched: {form.formState.touchedFields.first ? "yes" : "no"}
        </p>
        <output className="text-sm">{message}</output>
      </form>
    </Form>
  );
}
