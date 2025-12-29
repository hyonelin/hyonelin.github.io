---
title: "TypeScript 入门指南"
date: "2024-12-15"
description: "TypeScript 基础知识介绍，从零开始学习类型系统。"
tags: ["TypeScript", "前端", "技术"]
cover: "/blogs/covers/typescript.jpg"
---

# TypeScript 入门指南

TypeScript 是 JavaScript 的超集，添加了静态类型检查。

## 为什么使用 TypeScript？

- **类型安全** - 在编译时发现错误
- **更好的 IDE 支持** - 智能提示和自动补全
- **代码可维护性** - 类型即文档

## 基础类型

```typescript
// 基本类型
let name: string = "Alice";
let age: number = 25;
let isActive: boolean = true;

// 数组
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["Alice", "Bob"];

// 对象
interface User {
  name: string;
  age: number;
  email?: string; // 可选属性
}

const user: User = {
  name: "Alice",
  age: 25,
};
```

## 函数类型

```typescript
// 函数参数和返回值类型
function add(a: number, b: number): number {
  return a + b;
}

// 箭头函数
const multiply = (a: number, b: number): number => a * b;
```

## 泛型

```typescript
function identity<T>(arg: T): T {
  return arg;
}

const result = identity<string>("hello");
```

## 总结

TypeScript 能让你的代码更加健壮和可维护。开始使用吧！
