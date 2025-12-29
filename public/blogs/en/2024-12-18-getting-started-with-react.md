---
title: "Getting Started with React"
date: "2024-12-18"
description: "A beginner's guide to React, covering the basics and best practices."
tags: ["React", "Frontend", "Tutorial"]
---

# Getting Started with React

React is a popular JavaScript library for building user interfaces.

## Why React?

- **Component-Based** - Build encapsulated components
- **Declarative** - Design simple views for each state
- **Learn Once, Write Anywhere** - Use with Node.js or mobile apps

## Creating Your First Component

```tsx
function Welcome({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}

export default function App() {
  return <Welcome name="World" />;
}
```

## Using State

```tsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

## Best Practices

1. Keep components small and focused
2. Use TypeScript for type safety
3. Lift state up when needed
4. Use custom hooks for reusable logic

Happy coding!
