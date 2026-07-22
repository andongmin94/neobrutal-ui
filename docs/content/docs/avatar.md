---
title: Avatar
description: An image element with a fallback for representing the user.
shadcnDocsLink: https://ui.shadcn.com/docs/components/avatar
---

<ComponentPreview component="avatar">

```tsx file=<rootDir>/src/examples/ui/avatar/index.tsx
```

</ComponentPreview>

## Installation

<Installation component="avatar">

```tsx file=<rootDir>/src/components/ui/avatar.tsx
```

</Installation>

## Usage

```ts
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
```

```tsx
<Avatar>
  <AvatarImage src="https://github.com/andongmin94.png?size=80" alt="@andongmin94" />
  <AvatarFallback>AM</AvatarFallback>
</Avatar>
```

## Examples

### Fallback

<ComponentPreview component="avatar" example="fallback">

```tsx file=<rootDir>/src/examples/ui/avatar/fallback.tsx
```

</ComponentPreview>
