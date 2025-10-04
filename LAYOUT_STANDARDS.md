# Maidaan App - Page Layout Standards

## MANDATORY RULES

**ALL pages in the app MUST use the `PageLayout` component from `/src/components/layout/page-layout.tsx`**

No exceptions. No custom layout implementations. This ensures:
- Consistent spacing across the app
- Proper responsive behavior
- Dark mode compatibility
- Predictable user experience

## Page Layout Component

```tsx
import PageLayout from "@/components/layout/page-layout";
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | required | Main page content |
| `showBack` | boolean | false | Show back button in header |
| `onBack` | () => void | undefined | Custom back action (defaults to router.back()) |
| `headerContent` | ReactNode | undefined | Additional content in header (after back button) |
| `footer` | ReactNode | undefined | Fixed footer content at bottom |
| `maxWidth` | "sm" \| "md" \| "lg" \| "xl" \| "full" | "md" | Content area max width |
| `variant` | "default" \| "muted" | "default" | Background color variant |
| `paddingBottom` | boolean | false | Add bottom padding for fixed footers (pb-32) |

### Max Width Values

- `sm`: 384px (24rem)
- `md`: 448px (28rem) - **DEFAULT**
- `lg`: 512px (32rem)
- `xl`: 576px (36rem)
- `full`: 100%

## Standard Layout Structure

```
┌─────────────────────────────────┐
│ Header (sticky, optional)       │ ← Back button + headerContent
├─────────────────────────────────┤
│                                 │
│ Main Content (centered)         │ ← children with max-width
│ - p-4 padding                   │
│ - space-y-6 between sections    │
│                                 │
├─────────────────────────────────┤
│ Footer (fixed, optional)        │ ← Action buttons, etc.
└─────────────────────────────────┘
```

## Usage Examples

### 1. Detail Page with Back Button

```tsx
export default function MatchDetailPage() {
  return (
    <PageLayout showBack paddingBottom footer={
      <div className="flex gap-3">
        <Button onClick={handleJoin} className="flex-1">Join</Button>
        <Button onClick={handleShare} variant="outline" className="flex-1">Share</Button>
      </div>
    }>
      {/* Your content here */}
      <Card>...</Card>
      <Card>...</Card>
    </PageLayout>
  );
}
```

### 2. List Page (No Header)

```tsx
export default function PlayPage() {
  return (
    <PageLayout>
      <Tabs>
        <TabsList>...</TabsList>
        <TabsContent>...</TabsContent>
      </Tabs>
    </PageLayout>
  );
}
```

### 3. Form Page with Custom Back

```tsx
export default function EditProfilePage() {
  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (confirm("Discard changes?")) router.back();
    } else {
      router.back();
    }
  };

  return (
    <PageLayout showBack onBack={handleBack}>
      <form>...</form>
    </PageLayout>
  );
}
```

### 4. Full-Width Page

```tsx
export default function MapPage() {
  return (
    <PageLayout maxWidth="full" showBack>
      <div className="w-full h-screen">
        <Map />
      </div>
    </PageLayout>
  );
}
```

### 5. Muted Background

```tsx
export default function AdminDashboard() {
  return (
    <PageLayout variant="muted">
      <StatsCards />
      <TimeSlots />
    </PageLayout>
  );
}
```

## DO NOT

❌ **DO NOT** create custom page wrappers:
```tsx
// WRONG - Do not do this
<div className="min-h-screen bg-background pb-32">
  <header>...</header>
  <main>...</main>
  <footer>...</footer>
</div>
```

❌ **DO NOT** use inconsistent spacing:
```tsx
// WRONG - Do not do this
<div className="p-6">  // Should be p-4
<div className="space-y-8">  // Should be space-y-6
```

❌ **DO NOT** hardcode max-width values:
```tsx
// WRONG - Do not do this
<div className="max-w-[450px]">  // Use maxWidth prop
```

## DO

✅ **DO** use PageLayout for all pages
✅ **DO** use standard spacing (p-4, space-y-6)
✅ **DO** use maxWidth prop for width control
✅ **DO** set paddingBottom when using fixed footer

## Migration Checklist

When updating existing pages:

1. [ ] Import PageLayout component
2. [ ] Wrap entire page content with PageLayout
3. [ ] Move back button to `showBack` prop
4. [ ] Move footer to `footer` prop
5. [ ] Add `paddingBottom` if footer exists
6. [ ] Remove custom layout divs
7. [ ] Verify spacing matches (p-4, space-y-6)
8. [ ] Test responsive behavior
9. [ ] Test dark mode
10. [ ] Test back button functionality

## Benefits

- **Consistency**: All pages look and feel the same
- **Maintainability**: Update layout in one place
- **Accessibility**: Standard patterns for screen readers
- **Responsiveness**: Built-in mobile/desktop handling
- **Dark Mode**: Automatic theme support
- **Developer Experience**: Less code, faster development
