---
title: Input Group
description: Combines inputs with icons, text, and actions inside one field boundary.
shadcnDocsLink: https://ui.shadcn.com/docs/components/input-group
---

<ComponentPreview component="input-group">

```tsx file=<rootDir>/src/examples/ui/input-group.tsx
```

</ComponentPreview>

## Installation

<Installation component="input-group">

```tsx file=<rootDir>/src/components/ui/input-group.tsx
```

</Installation>

## Usage

```tsx
import { Search } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
```

```tsx
<InputGroup>
  <InputGroupAddon>
    <Search aria-hidden="true" />
  </InputGroupAddon>
  <InputGroupInput aria-label="Search components" placeholder="Search components..." />
</InputGroup>
```
