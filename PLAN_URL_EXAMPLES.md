# Plan: URL-based Example Selection

## Goal
Add URL query parameter support so users can bookmark/share specific example links. Example: `?example=game-of-life`

## Architecture Overview

### Current State
- App.tsx manages `currentExample` state with `useState(getDefaultExample())`
- ExampleSelector updates this state via `handleExampleChange`
- useExampleState hook caches state per example (schema, compilation results, configs)

### Proposed Solution
Create a new `useUrlExample` hook that:
1. Reads `?example=` query param on mount
2. Syncs URL when example changes
3. Validates example ID against available examples
4. Falls back to default if invalid/missing

## Implementation Plan

### 1. Create `src/hooks/useUrlExample.ts`
```typescript
export function useUrlExample(availableExamples: Example[]) {
  // On mount: read URL param
  // Return: [currentExample, setCurrentExample]
  // Side effect: update URL when example changes (using window.history.replaceState)
}
```

**Key features:**
- Use URLSearchParams to read/write `?example=` param
- Validate example ID exists in availableExamples array
- Use replaceState (not pushState) to avoid polluting history
- Handle browser back/forward with popstate event

### 2. Update `src/App.tsx`
```typescript
// OLD:
const [currentExample, setCurrentExample] = useState<Example>(getDefaultExample());

// NEW:
const [currentExample, setCurrentExample] = useUrlExample(examples);
```

**No other changes needed** - rest of the logic stays the same

### 3. Benefits
- ✅ Shareable links: users can copy URL with `?example=game-of-life`
- ✅ Bookmarkable: save links to specific examples
- ✅ Browser back/forward: works naturally with popstate
- ✅ SEO friendly: clean query params
- ✅ No component changes needed: only App.tsx changes

## Edge Cases to Handle

1. **Invalid example ID**: Fall back to default
2. **Empty param**: Use default
3. **URL update race condition**: Use replaceState (not pushState)
4. **Browser navigation**: Listen to popstate event
5. **Multiple tabs**: Each tab can have different example (independent)

## Files to Modify
- `src/hooks/useUrlExample.ts` (NEW)
- `src/App.tsx` (minimal changes)

## Testing Considerations
- Manual: Share URL with `?example=game-of-life`, verify it loads
- Manual: Click back/forward, verify example switches
- Manual: Invalid `?example=invalid-id`, should use default
- Manual: Changing example, verify URL updates

## Future Extensions
- Add other query params for schema/config customization
- Persist scroll position per example
- Track example history/favorites
