"use client";

import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { useRender } from "@base-ui/react/use-render";

import * as React from "react";

import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue | null>(null);

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const formContext = useFormContext();

  if (!formContext) {
    throw new Error("useFormField should be used within <Form>");
  }
  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }
  if (!itemContext) {
    throw new Error("useFormField should be used within <FormItem>");
  }

  const formState = useFormState({
    control: formContext.control,
    name: fieldContext.name,
  });
  const fieldState = formContext.getFieldState(fieldContext.name, formState);
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn("grid gap-2", className)} {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("font-heading", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

type FormControlProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactElement;
};

const FormControl = React.forwardRef<HTMLElement, FormControlProps>(function FormControl(
  { children, ...props },
  forwardedRef,
) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  // A fragment cannot receive the ID, accessibility attributes, and forwarded ref.
  // Never silently discard siblings or turn a missing control into an empty span.
  if (!React.isValidElement(children) || children.type === React.Fragment) {
    throw new Error("FormControl requires exactly one non-Fragment React element.");
  }

  return useRender({
    defaultTagName: "span",
    props: {
      "data-slot": "form-control",
      id: formItemId,
      "aria-describedby": !error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`,
      "aria-invalid": !!error,
      ...props,
    },
    ref: forwardedRef,
    render: children,
    state: {},
  });
});

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-sm font-base text-foreground", className)}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-sm font-base text-error", className)}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
