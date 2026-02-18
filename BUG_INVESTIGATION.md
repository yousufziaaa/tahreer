# Bug Investigation Report

## Issues Identified

### 1. Title Not Saving / Reverting to "Untitled"

**Root Cause:**
- The `handleTitleBlur` function (lines 118-125) only updates the title state when the text is empty, setting it to 'Untitled...'
- When the user types a title and blurs the field, the function doesn't update the title state with the actual text content
- This causes the title to revert because the state never gets updated with the user's input

**Location:** `src/components/Editor/Editor.tsx:118-125`

**Fix:**
- Update `handleTitleBlur` to read the current textContent and update the title state properly
- Ensure the title state is synced with the contentEditable element's content

---

### 2. Text Disappearing When User Stops Typing

**Root Cause:**
- When loading a piece in `onCreate`, `setContent` is called (line 45), which triggers the `onUpdate` handler
- The `onUpdate` handler captures the `title` state in its closure, which may still be 'Untitled...' during initial load
- This causes the piece to be saved with stale/incorrect data during the loading process
- Additionally, there's no guard to prevent saving during the initial content load, which can cause race conditions

**Location:** `src/components/Editor/Editor.tsx:40-70`

**Fix:**
- Add a flag to track when content is being loaded to prevent premature saves
- Use a ref to access the current title value instead of relying on closure state
- Ensure `onUpdate` doesn't save during initial content load

---

### 3. Spellcheck Not Working

**Root Cause:**
- In the `editorProps.attributes`, `spellcheck` is set as a string `'true'` instead of a boolean `true`
- HTML attributes need boolean values, not string values, for proper functionality

**Location:** `src/components/Editor/Editor.tsx:37`

**Fix:**
- Change `spellcheck: 'true'` to `spellcheck: true`

---

## Summary of Fixes Applied

### 1. Title Saving Fix
- **Changed**: `handleTitleBlur` now properly reads the textContent and updates both the title state and titleRef
- **Added**: Immediate save on blur to ensure title is persisted when user leaves the field
- **Added**: `titleRef` to maintain current title value for use in closures

### 2. Text Disappearing Fix
- **Added**: `isLoadingRef` flag to track when content is being loaded
- **Changed**: `onUpdate` now checks `isLoadingRef` and returns early during initial load to prevent premature saves
- **Changed**: `onUpdate` now uses `titleRef.current` instead of closure `title` state to get the current title value
- **Added**: `titleRef` is kept in sync with title state via useEffect
- **Changed**: `onCreate` sets `isLoadingRef` to true during load and false after a short delay

### 3. Spellcheck Fix
- **Changed**: `spellcheck: 'true'` → `spellcheck: true` (string to boolean)

## Files Modified
- `src/components/Editor/Editor.tsx`

## Testing Recommendations
1. Type a title and blur the field - title should persist
2. Type content, stop typing - content should not disappear
3. Check browser dev tools - spellcheck should be enabled on the editor element
4. Load an existing piece - title and content should load correctly
5. Create a new piece, type title and content - both should save properly
