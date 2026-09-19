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
const FormFieldContext = React.createContext<{ name: string } | null>(null);

type Association = "control" | "description" | "message";
type FormItemContextValue = {
  id: string;
  ids: Partial<Record<Association, string>>;
  register: (part: Association, id: string) => () => void;
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

function useFormField() {
  const field = React.useContext(FormFieldContext);
  const item = React.useContext(FormItemContext);
  const form = useFormContext();
  if (!form) throw new Error("useFormField should be used within <Form>");
  if (!field) throw new Error("useFormField should be used within <FormField>");
  if (!item) throw new Error("useFormField should be used within <FormItem>");

  const state = useFormState({ control: form.control, name: field.name, exact: true });
  return {
    ...item,
    name: field.name,
    formItemId: item.ids.control ?? `${item.id}-form-item`,
    formDescriptionId: `${item.id}-form-item-description`,
    formMessageId: `${item.id}-form-item-message`,
    ...form.getFieldState(field.name, state),
  };
}

function FormItem({ id: providedId, className, ...props }: React.ComponentProps<"div">) {
  const generatedId = React.useId();
  const id = providedId ?? generatedId;
  const [ids, setIds] = React.useState<FormItemContextValue["ids"]>({});
  const register = React.useCallback((part: Association, targetId: string) => {
    setIds((current) => (current[part] === targetId ? current : { ...current, [part]: targetId }));
    return () => {
      setIds((current) =>
        current[part] === targetId ? { ...current, [part]: undefined } : current,
      );
    };
  }, []);

  return (
    <FormItemContext.Provider value={{ id, ids, register }}>
      <div
        id={providedId}
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function useAssociation(
  register: FormItemContextValue["register"],
  part: Association,
  id: string,
  present = true,
) {
  // Register only rendered parts. Never point at a description or error that is absent.
  React.useLayoutEffect(() => {
    if (present) return register(part, id);
  }, [register, part, id, present]);
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
  const { error, id, ids, register } = useFormField();
  if (!React.isValidElement(children) || children.type === React.Fragment) {
    throw new Error("FormControl requires exactly one non-Fragment React element.");
  }
  const childProps = children.props as React.HTMLAttributes<HTMLElement>;
  const controlId = childProps.id ?? props.id ?? `${id}-form-item`;
  useAssociation(register, "control", controlId);
  const describedBy =
    [
      ...new Set(
        [props["aria-describedby"], childProps["aria-describedby"], ids.description, ids.message]
          .filter(Boolean)
          .flatMap((value) => value!.split(/\s+/).filter(Boolean)),
      ),
    ].join(" ") || undefined;
  const associations = {
    id: controlId,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : (childProps["aria-invalid"] ?? props["aria-invalid"] ?? false),
  };

  return useRender({
    defaultTagName: "span",
    props: { "data-slot": "form-control", ...props, ...associations },
    ref: forwardedRef,
    // useRender composes the child's ref and event handlers; only IDREFs need merging here.
    render: React.cloneElement(
      children as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
      associations,
    ),
    state: {},
  });
});

function FormDescription({ id, className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId, register } = useFormField();
  const descriptionId = id ?? formDescriptionId;
  useAssociation(register, "description", descriptionId);
  return (
    <p
      data-slot="form-description"
      id={descriptionId}
      className={cn("text-sm font-base text-foreground", className)}
      {...props}
    />
  );
}

function FormMessage({ id, className, children, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId, register } = useFormField();
  const messageId = id ?? formMessageId;
  const body = error ? String(error.message ?? "") : children;
  const present = body !== undefined && body !== null && body !== false && body !== "";
  useAssociation(register, "message", messageId, present);
  if (!present) return null;
  return (
    <p
      data-slot="form-message"
      id={messageId}
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
