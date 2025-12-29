---
title: "React 开发技巧分享"
date: "2024-12-20"
description: "分享一些在 React 开发中常用的技巧和最佳实践，帮助提升开发效率。"
tags: ["React", "前端", "技术"]
cover: "/blogs/covers/react-tips.jpg"
---

# React 开发技巧分享

在日常开发中，我积累了一些 React 的实用技巧，今天来分享一下。

## 1. 使用自定义 Hooks 复用逻辑

自定义 Hooks 是复用状态逻辑的最佳方式：

```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue] as const;
}
```

## 2. 条件渲染的优雅写法

避免过多的三元表达式：

```tsx
// ❌ 不推荐
{condition ? <ComponentA /> : null}

// ✅ 推荐
{condition && <ComponentA />}
```

## 3. 使用 useMemo 和 useCallback

合理使用可以避免不必要的重渲染：

```typescript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

## 总结

这些技巧能帮助你写出更优雅、更高效的 React 代码。持续学习，不断进步！
