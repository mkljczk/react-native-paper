---
title: Migration from Paper 5.x to 6.x
---

## General changes

### Animations

React Native Paper 6 uses [Reanimated](https://docs.swmansion.com/react-native-reanimated/) for most animations instead of the built-in React Native `Animated` API. So make sure to install `react-native-reanimated` 4.3.0 or later and `react-native-worklets` 0.8.1 or later, then complete the Reanimated setup. See the [getting started guide](./getting-started) for Expo and Community CLI instructions.

The following props now accept animated styles returned from `useAnimatedStyle`. They no longer accept `Animated.Value` or `Animated.AnimatedInterpolation` where these were previously supported:

- `Appbar.Action` and `Appbar.BackAction`: `style`
- `Badge`: `style`
- `Banner`: `style`
- `BottomNavigation`: `barStyle`, and `BottomNavigation.Bar`: `style`
- `Button`: `style`
- `Card`: `style`
- `Chip`: `style`
- `Dialog`: `style`
- `Drawer.CollapsedItem`: `style`
- `FAB` and `FAB.Extended`: `style`
- `IconButton`: `style`
- `Menu`: `contentStyle`
- `Modal`: `contentContainerStyle`
- `Searchbar`: `style`
- `Snackbar`: `style`
- `Surface`: `style`
- `ToggleButton`: `style`

So you can use Reanimated's `useSharedValue` and `useAnimatedStyle` to animate these components instead of the React Native `Animated` API.

```tsx
import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

const MyComponent = () => {
  const opacity = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Card style={animatedStyle}>Button</Card>;
};
```

### Elevation

The `elevation` prop no longer accepts a React Native `Animated.Value` in the following components:

- `Banner`
- `Card`
- `Searchbar`
- `Snackbar`
- `Surface`

You can use an elevation level from `0` to `5` instead. Changes to the elevation level are animated automatically.

### Styles

The following component style props no longer support overriding their background color or border radius:

- `Banner`
- `Button`
- `Card`
- `Chip`
- `Dialog`
- `Menu`: `contentStyle`
- `Searchbar`
- `Snackbar`

You can use the component's color prop where available, or override the corresponding theme colors.

### Test IDs

Some hardcoded and generated test IDs have been removed for the following components:

- `Appbar.Header`: `${testID}-root-layer`
- `Surface`: `surface` and `${testID}-outer-layer`

You can specify a `testID` explicitly and use that value to query the component.

## Components

### BottomNavigation

The bar follows the Material Design 3 Expressive navigation bar spec.

- Height is 64dp (was 80dp when unlabeled, and the label used a 56dp height constant).
- The active indicator is 56×32 with a full corner, and it now stays mounted so the pill can scale and fade with a spatial spring.
- Active labels use the `secondary` color and `labelMediumEmphasized`. Horizontal items (medium windows) place the label on the indicator and use `onSecondaryContainer`.
- Destinations use visible state layers. The previous `rippleColor: 'transparent'` treatment is gone.
- `itemLayout` selects `vertical`, `horizontal`, or `auto` (switches at 600dp). The default is `auto`.
- `shifting` no longer translates icons or requires two tabs. It only fades inactive labels in place.
- Scene and bar animations use Reanimated. `barStyle` / `BottomNavigation.Bar` `style` accept Reanimated animated styles, not `Animated.Value`. `sceneAnimationEasing` is an `(value: number) => number` function.
- Screens still lazy-mount on first visit. Route updates only remount a destination when its `key` changes; inactive screens keep their mounted state.

```diff
 <BottomNavigation
   navigationState={{ index, routes }}
   onIndexChange={setIndex}
   renderScene={renderScene}
-  sceneAnimationEasing={Easing.ease}
+  itemLayout="auto"
+  sceneAnimationEnabled
+  sceneAnimationType="opacity"
 />
```

### Appbar

The `style` props for `Appbar` and `Appbar.Header` no longer accept `Animated.Value` or `Animated.AnimatedInterpolation`. They only accept static styles.

The `style.elevation` property is no longer supported. Use the `elevated` prop to control Appbar elevation.

### Banner

The banner background is now always `theme.colors.surfaceContainerLow` and no longer depends on the `elevation` prop, which only controls the shadow. At the default `elevation` of `1` the rendered color is unchanged.

### Menu

The menu background is now always `theme.colors.surfaceContainer`, following the Material Design 3 spec, and no longer depends on the `elevation` prop, which only controls the shadow. At the default `elevation` of `2` the rendered color is unchanged.

### Surface

- The `elevation` prop no longer accepts a React Native `Animated.Value`. Any `elevation` changes are animated automatically.
- The `style` prop no longer configures elevation, background color, or border radius. Use these props instead:
  - `elevation`
  - `backgroundColor`
  - `borderRadius`
  - `borderBottomEndRadius`
  - `borderBottomLeftRadius`
  - `borderBottomRightRadius`
  - `borderBottomStartRadius`
  - `borderEndEndRadius`
  - `borderEndStartRadius`
  - `borderStartEndRadius`
  - `borderStartStartRadius`
  - `borderTopEndRadius`
  - `borderTopLeftRadius`
  - `borderTopRightRadius`
  - `borderTopStartRadius`
  - `borderCurve`
- The `pointerEvents` prop is no longer supported as it's deprecated in React Native Web. You can specify `pointerEvents` in the `style` prop instead.
- The `overflow: 'hidden'` style is no longer supported in `style` as it can clip shadows. You can nest a `View` inside the `Surface` and apply `overflow: 'hidden'` to that instead.
- The default `testID` for `Surface` was removed. You can specify a `testID` explicitly if you need it.
- A new `container` prop sets the background to a semantic surface-family color role from the theme (e.g. `container="surfaceContainerLow"`). When `container` is set, `elevation` only controls the shadow. Precedence: `backgroundColor` > `container` > the color derived from `elevation`.

e.g.:

```diff
<Surface
- style={{
-   backgroundColor: 'red',
-   borderRadius: 8,
-   overflow: 'hidden',
- }}
+ backgroundColor="red"
+ borderRadius={8}
>
+ <View style={{ overflow: 'hidden' }}>
    <Text>Content</Text>
+ </View>
</Surface>
```

### Modal

`Modal` now uses a `Portal` internally and doesn't require an explicit `Portal` wrapper. So you need to remove any existing `Portal` wrappers around `Modal`:

```diff
-<Portal>
-  <Modal visible={visible} onDismiss={hideModal}>
-    <Text>Content</Text>
-  </Modal>
-</Portal>
+<Modal visible={visible} onDismiss={hideModal}>
+  <Text>Content</Text>
+</Modal>
```

- The `contentContainerStyle` prop no longer configures the background color or any border radius property. We have added new props for these:
  - `contentBackgroundColor`
  - `contentBorderRadius`
- We have added the `contentElevation` prop to configure the elevation of the modal content.

e.g.:

```diff
<Modal
  visible={visible}
- contentContainerStyle={{
-   backgroundColor: 'white',
-   borderRadius: 8,
-   padding: 20,
- }}
+ contentBackgroundColor="white"
+ contentBorderRadius={8}
+ contentElevation={2}
+ contentContainerStyle={{ padding: 20 }}
>
  <Text>Content</Text>
</Modal>
```

The modal content now has the `dialog` role, so it needs an accessible name. You can provide one with the new `aria-label` prop:

```diff
-<Modal visible={visible} onDismiss={hideModal}>
+<Modal visible={visible} onDismiss={hideModal} aria-label="Example modal">
   <Text>Content</Text>
 </Modal>
```

The overlay behind the content is now hidden from assistive technology. Instead, when the modal is `dismissable`, screen reader users can dismiss it with a visually hidden button inside the dialog.

The `overlayAccessibilityLabel` prop was renamed to `dismissAccessibilityLabel`, which is used for the button's accessibility label:

```diff
<Modal
  visible={visible}
  onDismiss={hideModal}
- overlayAccessibilityLabel="Close"
+ dismissAccessibilityLabel="Close"
>
  <Text>Content</Text>
</Modal>
```

Previously, the Android back button dismissed the modal when `dismissable` was `true`, even if `dismissableBackButton` was `false`. The `dismissableBackButton` prop can now prevent the modal from being dismissed via the back button independently of the `dismissable` prop.

### Dialog

`Dialog` now uses a `Portal` internally and doesn't require an explicit `Portal` wrapper. So you need to remove any existing `Portal` wrappers around `Dialog`:

```diff
-<Portal>
-  <Dialog visible={visible} onDismiss={hideDialog}>
-    <Dialog.Title>Alert</Dialog.Title>
-  </Dialog>
-</Portal>
+<Dialog visible={visible} onDismiss={hideDialog}>
+  <Dialog.Title>Alert</Dialog.Title>
+</Dialog>
```

The dialog now has the `dialog` role. On web, the dialog's accessible name is set automatically by `Dialog.Title`. You can specify a different name with the new `aria-label` prop, e.g. when the dialog has no title:

```jsx
<Dialog visible={visible} onDismiss={hideDialog} aria-label="Delete file">
  <Dialog.Content>
    <Text>Are you sure?</Text>
  </Dialog.Content>
</Dialog>
```

When the dialog is `dismissable`, screen reader users can dismiss it with a visually hidden button inside the dialog. You can change the button's accessibility label with the new `dismissAccessibilityLabel` prop.

- The default elevation changed from level `1` to level `3`.
- The `style` prop no longer configures the background color or border radius. You can override `theme.colors.surfaceContainerHigh` and `theme.shapes.corner.extraLarge` using the `theme` prop instead.

### Menu

The `overlayAccessibilityLabel` prop was renamed to `dismissAccessibilityLabel`:

```diff
<Menu
  visible={visible}
  onDismiss={closeMenu}
  anchor={anchor}
- overlayAccessibilityLabel="Close"
+ dismissAccessibilityLabel="Close"
>
  <Menu.Item title="Item" />
</Menu>
```

### Tooltip

The `Tooltip` trigger is now a render function. Spread the supplied props onto
the trigger element so the tooltip can attach its interactions without cloning
the element.

```tsx
// Before (v5)
<Tooltip title="Print">
  <Appbar.Action icon="printer" onPress={handlePrint} />
</Tooltip>

// After (v6)
<Tooltip title="Print">
  {(props) => (
    <Appbar.Action {...props} icon="printer" onPress={handlePrint} />
  )}
</Tooltip>
```

`Tooltip.Rich` is new in Paper 6.x and follows the same render-function pattern
for its trigger:

```tsx
<Tooltip.Rich content="Print the current document">
  {(props) => <Appbar.Action {...props} icon="printer" onPress={handlePrint} />}
</Tooltip.Rich>
```

### Searchbar

The `Searchbar` modes use the latest Material 3 terminology in Paper 6.x:

- **`mode="bar"`** → **`mode="contained"`**
- **`mode="view"`** → **`mode="divided"`**

```tsx
// Before (v5)
<Searchbar mode="bar" value={query} onChangeText={setQuery} />
<Searchbar mode="view" value={query} onChangeText={setQuery} />

// After (v6)
<Searchbar mode="contained" value={query} onChangeText={setQuery} />
<Searchbar mode="divided" value={query} onChangeText={setQuery} />
```

The default `contained` mode adds 24dp horizontal margins and animates them to
12dp while focused. To keep a full-width Searchbar, provide a horizontal margin;
this replaces the built-in margin and disables the focus animation:

```tsx
<Searchbar
  value={query}
  onChangeText={setQuery}
  style={{ marginHorizontal: 0 }}
/>
```

<<<<<<< HEAD
Any horizontal margin, including `margin`, disables the built-in focus
animation. Use `marginVertical` when you only need vertical spacing and want to
keep the animated horizontal margins.
=======
### FAB

To preserve the v5 FAB color treatment, update the `variant` prop:

| v5 | v6 |
| --- | --- |
| `primary` | `primaryContainer` |
| `secondary` | `secondaryContainer` |
| `tertiary` | `tertiaryContainer` |

If you omit `variant`, no change is needed. Replace `variant="surface"` with
one of the supported color variants, such as `primaryContainer`.

For custom colors, replace `color` with `contentColor` and move
`style.backgroundColor` to `containerColor`:

```diff
<FAB
  icon="plus"
- color="#ffffff"
- style={{ backgroundColor: '#6750a4', position: 'absolute', bottom: 16, right: 16 }}
+ contentColor="#ffffff"
+ containerColor="#6750a4"
+ style={{ position: 'absolute', bottom: 16, right: 16 }}
/>
```
>>>>>>> likevy/fix/fab-md3-spec-accuracy

### TextInput

The Paper 6.x `TextInput` is a complete rewrite with a new API. Import the component the same way, but note that the props and behavior have changed significantly.

#### Types

```tsx
import { TextInput, type TextInputProps } from 'react-native-paper';
```

#### Variant

- **`mode="flat"`** → **`variant="filled"`**
- **`mode="outlined"`** → **`variant="outlined"`**

```tsx
// Before (v5)
<TextInput mode="flat" label="Filled" />
<TextInput mode="outlined" label="Outlined" />

// After (v6)
<TextInput variant="filled" label="Filled" />
<TextInput variant="outlined" label="Outlined" />
```

#### Adornments

- **`left` / `right`** → **`startAccessory` / `endAccessory`**
- **`TextInput.Affix`** → **`prefix` / `suffix`**, or **`TextInput.Icon`**, or **`startAccessory` / `endAccessory`**

```tsx
// Before (v5)
<TextInput
  left={<TextInput.Icon icon="email" />}
  right={<TextInput.Affix text={`${value.length}/80`} />}
/>

// After (v6)
<TextInput
  startAccessory={(p) => <TextInput.Icon {...p} icon="email" />}
  endAccessory={(p) => <CustomComponent {...p} />}
  maxLength={100}
  prefix="$"
  suffix="/100"
  counter
/>
```

`TextInput.Icon` is decorative when no press handlers are provided. Decorative icons are
hidden from assistive technology and do not create a keyboard focus stop.
Icons with `onPress`, `onLongPress`, `onPressIn`, or `onPressOut` require an accessible name:

```tsx
<TextInput
  label="Search"
  startAccessory={(props) => <TextInput.Icon {...props} icon="magnify" />}
  endAccessory={(props) => (
    <TextInput.Icon {...props} icon="close" aria-label="Clear search" onPress={() => setValue('')} />
  )}
/>
```

#### Label and supporting text

- **`label: React.Element | string`** → **`string`**
- **`HelperText`** was removed; use **`supportingText`**.

```tsx
// Before (v5)
<>
  <TextInput
    label="Email"
    error={hasError}
    disabled={isDisabled}
  />
  <HelperText type="error" visible={hasError}>
    Enter a valid email
  </HelperText>
</>

// After (v6)
<TextInput
  label="Email"
  error={hasError}
  disabled={isDisabled}
  supportingText="Enter a valid email"
/>
```

Supporting text and the character counter describe the field without becoming
part of its accessible name. On web, their generated `nativeID` values are
referenced by the input's `aria-describedby`. Additional IDs passed through
`aria-describedby` are preserved. On Android and iOS, these descriptions are
included in `accessibilityHint`, alongside any hint you provide, because React
Native does not support native described-by relationships.

When no label or explicit accessible name is supplied, the placeholder names the
field, including after text is entered. A disabled field always exposes its
disabled state, even when `aria-disabled={false}` is supplied.

Error supporting text uses `role="alert"`. Android uses an assertive live region;
iOS announces changed error messages through `AccessibilityInfo`.
Custom input renderers should forward the accessibility props they receive.
Explicit `aria-invalid` values are preserved; when omitted, validity is derived
from `error` and the character counter.
Empty fields remain visible to native accessibility before focus and after
clearing. The field content no longer fades with the floating label.

The filled resting indicator now uses `onSurfaceVariant`; outlined fields use
`outline` at rest. Both change to `onSurface` on hover. Invalid fields use `error`
at rest and `onErrorContainer` on hover. Focus takes precedence over hover and
uses `primary` (or `error` for an invalid field).

#### Removed props

No direct `TextInput` equivalents for:

- **`dense`**, **`contentStyle`**, **`underlineStyle`**
- **`underlineColor`**, **`activeUnderlineColor`**, **`outlineColor`**, **`activeOutlineColor`**, **`textColor`**

Use **`style`** on the inner input and the **`theme`** for colors.

```tsx
import { MD3LightTheme, TextInput } from 'react-native-paper';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    outline: '#79747E',
    primary: '#6750A4',
  },
};

// Before (v5)
<TextInput
  dense
  contentStyle={{
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  }}
  outlineStyle={{
    borderRadius: 12,
    borderWidth: 2,
  }}
  outlineColor="#79747E"
  activeOutlineColor="#6750A4"
  textColor="#1C1B1F"
  style={{ fontSize: 16 }}
/>

// After (v6)
<TextInput
  theme={theme}
  style={{ fontSize: 16, color: '#1C1B1F' }}
/>
```

### DataTable

The Paper 6.x `DataTable` adds table semantics. The structure it produces and the accessible names it exposes have both changed. Existing tables should still be working.

#### Touch handling

Rows, cells and titles with no touch handler render a plain `View` instead of a disabled touchable

```tsx
// Before (v5): announced as a disabled control
<DataTable.Row>
  <DataTable.Cell>{item.name}</DataTable.Cell>
</DataTable.Row>

// After (v6): pass a handler if the row is meant to be pressable
<DataTable.Row onPress={() => select(item)}>
  <DataTable.Cell>{item.name}</DataTable.Cell>
</DataTable.Row>
```

#### Screen reader announcements

- new `rowCount`, `firstRowIndex` needed for correct row positions when paginating
- `nativeFocusMode="cell"` gives one stop per cell instead of one per row
- `accessible={false}` on a row opts that row out
- `formatRowPosition` replaces the wording, or removes it with `null`
- rows are numbered by their position among the table's rows. A component of your own counts as the one row. A row inside a `View` or a wrapper of your own is counted but not numbered: pass `index` on such a row.

```tsx
// Before (v5)
<DataTable>
  {items.slice(from, to).map((item) => (
    <DataTable.Row key={item.key}>{/* ... */}</DataTable.Row>
  ))}
</DataTable>

// After (v6)
<DataTable aria-label="Nutrition" rowCount={items.length} firstRowIndex={from}>
  {items.slice(from, to).map((item) => (
    <DataTable.Row key={item.key}>{/* ... */}</DataTable.Row>
  ))}
</DataTable>
```

#### Pagination labels

- `labels` is new, and localizes every control
- `aria-label="pagination-container"` and `aria-label="Options Select"` were removed: reach the controls by role or text, e.g. `getByRole('button', { name: 'Rows per page, 2' })`

```tsx
// After (v6)
<DataTable.Pagination
  labels={{
    container: 'Paginacja',
    previousPage: 'Poprzednia strona',
    nextPage: 'Następna strona',
    pageStatus: ({ page, numberOfPages }) =>
      `Strona ${page} z ${numberOfPages}`,
  }}
  /* ... */
/>
```

#### Alignment

- `numeric` is unchanged, and now also applies tabular figures
- `align` is new, accepts `'start'`, `'center'`, `'end'`

```tsx
// Before (v5): right-aligned
<DataTable.Cell numeric>{item.calories}</DataTable.Cell>

// After (v6): right-aligned, plus lined-up digits
<DataTable.Cell numeric>{item.calories}</DataTable.Cell>

// Centred, still with lined-up digits
<DataTable.Cell numeric align="center">{item.calories}</DataTable.Cell>

// Right-aligned text that is not numeric
<DataTable.Cell align="end">{item.status}</DataTable.Cell>
```

`align` defaults to `'end'` for numeric columns and `'start'` otherwise.

#### Text wrapping

- **single line, always** → single line at the default font scale, unclamped above it
- `numberOfLines` is honoured exactly at every font scale; pass `0` to never clamp

#### Column definitions

- `columns` on `DataTable` is new and optional
- `column` on a title or cell selects one by key, and is only needed where position is unreliable

```tsx
// Before (v5)
const styles = StyleSheet.create({ first: { flex: 2 } });

<DataTable.Title style={styles.first}>Dessert</DataTable.Title>
<DataTable.Cell style={styles.first}>{item.name}</DataTable.Cell>

// After (v6)
const columns = [{ key: 'name', flex: 2 }, { key: 'calories', numeric: true }];

<DataTable columns={columns}>
  <DataTable.Title>Dessert</DataTable.Title>
  <DataTable.Cell>{item.name}</DataTable.Cell>
</DataTable>
```

### ToggleButton

`ToggleButton`, `ToggleButton.Group` and `ToggleButton.Row` were removed. For an
icon-only toggle, use `IconButton` with the `selected` prop. For a set of
mutually exclusive options, use `SegmentedButtons`.

```tsx
// Before (v5)
<ToggleButton.Group value={value} onValueChange={setValue}>
  <ToggleButton icon="format-bold" value="bold" />
  <ToggleButton icon="format-italic" value="italic" />
</ToggleButton.Group>

// After (v6)
<>
  <IconButton
    icon="format-bold"
    selected={value === 'bold'}
    onPress={() => setValue('bold')}
  />
  <IconButton
    icon="format-italic"
    selected={value === 'italic'}
    onPress={() => setValue('italic')}
  />
</>
```
