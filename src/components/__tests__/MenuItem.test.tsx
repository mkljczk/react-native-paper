import { Platform } from 'react-native';

import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { render, screen } from '../../test-utils';
import { LightTheme } from '../../theme/schemes';
import { tokens } from '../../theme/tokens';
import { resolveCornerRadius } from '../../theme/utils/shape';
import Menu from '../Menu/Menu';
import { runMenuCloseMotion, runMenuOpenMotion } from '../Menu/motion';
import { MenuTokens } from '../Menu/tokens';
import {
  getMenuContainerBorderRadius,
  getMenuContainerColor,
  getMenuItemBorderRadius,
  getMenuItemColor,
} from '../Menu/utils';

const stateOpacity = tokens.md.sys.state.opacity;

describe('Menu Item', () => {
  it('renders menu item', async () => {
    const tree = (
      await render(
        <>
          <Menu.Item
            testID="menu-item"
            leadingIcon="redo"
            onPress={() => {}}
            title="Redo"
          />
          <Menu.Item
            testID="menu-item"
            leadingIcon="undo"
            onPress={() => {}}
            title="Undo"
          />
          <Menu.Item
            testID="menu-item"
            leadingIcon="content-cut"
            onPress={() => {}}
            title="Cut"
            disabled
          />
          <Menu.Item
            testID="menu-item"
            leadingIcon="content-copy"
            onPress={() => {}}
            title="Copy"
            disabled
          />
          <Menu.Item testID="menu-item" onPress={() => {}} title="Paste" />
        </>
      )
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('should have titleMaxFontSizeMultiplier passed to title', async () => {
    const labelMaxFontSizeMultiplier = 2;

    await render(
      <Menu.Item
        testID="menu-item"
        titleMaxFontSizeMultiplier={labelMaxFontSizeMultiplier}
        leadingIcon="content-cut"
        onPress={() => {}}
        title="Cut"
      />
    );

    expect(screen.getByText('Cut')).toHaveProp(
      'maxFontSizeMultiplier',
      labelMaxFontSizeMultiplier
    );
  });

  it('accepts aria-checked prop', async () => {
    await render(
      <Menu.Item testID="menu-item" aria-checked={true} title="Option 1" />
    );

    expect(screen.getByRole('menuitem')).toHaveProp(
      'accessibilityState',
      expect.objectContaining({ checked: true })
    );
  });

  it('uses labelLarge for the title', async () => {
    await render(<Menu.Item title="Paste" />);

    expect(screen.getByText('Paste')).toHaveStyle(LightTheme.fonts.labelLarge);
  });

  it('renders supporting and trailing supporting text', async () => {
    const theme = LightTheme;
    await render(
      <Menu.Item
        testID="menu-item"
        title="Share"
        supportingText="Send a link"
        trailingSupportingText="⌘S"
        aria-label="Share, send a link, keyboard shortcut Command S"
      />
    );

    expect(screen.getByTestId('menu-item-supporting')).toHaveTextContent(
      'Send a link'
    );
    expect(
      screen.getByTestId('menu-item-trailing-supporting')
    ).toHaveTextContent('⌘S');
    // two-line anatomy must not use fixed 48 height (would clip supporting)
    expect(screen.getByTestId('menu-item')).toHaveStyle({
      minHeight: 48,
      paddingVertical: 8,
    });
    // B2: supporting uses bodySmall + onSurfaceVariant
    expect(screen.getByTestId('menu-item-supporting')).toHaveStyle({
      ...theme.fonts.bodySmall,
      color: theme.colors.onSurfaceVariant,
    });
    // B3: trailing supporting uses labelLarge
    expect(screen.getByTestId('menu-item-trailing-supporting')).toHaveStyle({
      ...theme.fonts.labelLarge,
      color: theme.colors.onSurfaceVariant,
    });
    // Supporting + trailing content is user-visible; explicit aria-label stays on the menuitem
    expect(screen.getByText('Send a link')).toBeOnTheScreen();
    expect(screen.getByText('⌘S')).toBeOnTheScreen();
    expect(
      screen.getByRole('menuitem', {
        name: 'Share, send a link, keyboard shortcut Command S',
      })
    ).toBeOnTheScreen();
  });

  it('renders numeric supporting text values like 0', async () => {
    await render(
      <Menu.Item
        testID="menu-item"
        title="Unread"
        supportingText={0}
        trailingSupportingText={0}
      />
    );

    expect(screen.getByTestId('menu-item-supporting')).toHaveTextContent('0');
    expect(
      screen.getByTestId('menu-item-trailing-supporting')
    ).toHaveTextContent('0');
  });

  it('ignores boolean placeholders for supporting text', async () => {
    await render(
      <Menu.Item
        testID="menu-item"
        title="Paste"
        supportingText={false}
        trailingSupportingText={false}
      />
    );

    expect(screen.queryByTestId('menu-item-supporting')).toBeNull();
    expect(screen.queryByTestId('menu-item-trailing-supporting')).toBeNull();
  });

  it('grows for a trailing-only row so large font scales are not clipped', async () => {
    await render(
      <Menu.Item testID="menu-item" title="Share" trailingSupportingText="⌘S" />
    );

    expect(screen.getByTestId('menu-item')).toHaveStyle({
      minHeight: MenuTokens.sizes.itemHeight,
      paddingVertical: 8,
    });
    expect(screen.getByTestId('menu-item')).not.toHaveStyle({
      height: MenuTokens.sizes.itemHeight,
    });
  });

  it('caps supporting text font scaling like the title', async () => {
    await render(
      <Menu.Item
        testID="menu-item"
        title="Share"
        supportingText="Send a link"
        trailingSupportingText="⌘S"
        supportingTextMaxFontSizeMultiplier={2}
        trailingSupportingTextMaxFontSizeMultiplier={3}
      />
    );

    expect(screen.getByTestId('menu-item-supporting')).toHaveProp(
      'maxFontSizeMultiplier',
      2
    );
    expect(screen.getByTestId('menu-item-trailing-supporting')).toHaveProp(
      'maxFontSizeMultiplier',
      3
    );
  });

  it('defaults supporting text scaling to the title cap', async () => {
    await render(
      <Menu.Item
        testID="menu-item"
        title="Share"
        supportingText="Send a link"
        trailingSupportingText="⌘S"
      />
    );

    expect(screen.getByTestId('menu-item-supporting')).toHaveProp(
      'maxFontSizeMultiplier',
      1.5
    );
    expect(screen.getByTestId('menu-item-trailing-supporting')).toHaveProp(
      'maxFontSizeMultiplier',
      1.5
    );
  });

  it('pins trailing supporting text to the trailing edge', async () => {
    await render(
      <Menu.Item testID="menu-item" title="Copy" trailingSupportingText="⌘C" />
    );

    expect(screen.getByTestId('menu-item-content')).not.toHaveStyle({
      alignSelf: 'flex-start',
    });
    expect(screen.getByTestId('menu-item-trailing-supporting')).toHaveStyle({
      flexShrink: 0,
    });
  });

  it('keeps fixed height for single-line items', async () => {
    await render(<Menu.Item testID="menu-item" title="Paste" />);
    expect(screen.getByTestId('menu-item')).toHaveStyle({ height: 48 });
  });

  it('uses dense item height of 32 when dense', async () => {
    await render(<Menu.Item testID="menu-item" title="Share" dense />);
    expect(screen.getByTestId('menu-item')).toHaveStyle({
      height: MenuTokens.sizes.denseItemHeight,
      minHeight: MenuTokens.sizes.denseItemHeight,
    });
    expect(MenuTokens.sizes.denseItemHeight).toBe(32);
  });

  it('announces selection as checked state and applies selected colors', async () => {
    const theme = LightTheme;
    await render(<Menu.Item testID="menu-item" title="Paste" selected />);

    expect(screen.getByRole('menuitem')).toHaveProp(
      'accessibilityState',
      expect.objectContaining({ checked: true })
    );
    expect(screen.getByTestId('menu-item')).toHaveStyle({
      backgroundColor: theme.colors.tertiaryContainer,
    });
    expect(screen.getByText('Paste')).toHaveStyle({
      color: theme.colors.onTertiaryContainer,
    });
  });

  it('disabled wins over selected for content opacity', async () => {
    await render(
      <Menu.Item testID="menu-item" title="Paste" selected disabled />
    );

    expect(screen.getByRole('menuitem')).toHaveProp(
      'accessibilityState',
      expect.objectContaining({ disabled: true })
    );
    // selected container is suppressed when disabled
    expect(screen.getByTestId('menu-item')).not.toHaveStyle({
      backgroundColor: LightTheme.colors.tertiaryContainer,
    });
    // I3: rendered content row must apply disabled opacity from the real path
    expect(screen.getByTestId('menu-item-content')).toHaveStyle({
      opacity: stateOpacity.disabled,
    });
  });

  it('applies rendered disabled opacity on the content row', async () => {
    await render(<Menu.Item testID="menu-item" title="Cut" disabled />);
    expect(screen.getByTestId('menu-item-content')).toHaveStyle({
      opacity: stateOpacity.disabled,
    });
  });

  it('applies corner.medium on all sides when selected', async () => {
    const theme = LightTheme;
    const radius = resolveCornerRadius(theme, MenuTokens.shapes.item);

    await render(
      <Menu.Item
        testID="menu-item"
        title="Paste"
        selected
        roundedTop
        roundedBottom={false}
      />
    );

    expect(screen.getByTestId('menu-item')).toHaveStyle({
      borderRadius: radius,
    });
  });
});

describe('getMenuItemColor - title color', () => {
  it('should return disabled color if disabled, for theme version 3', () => {
    expect(
      getMenuItemColor({
        theme: LightTheme,
        disabled: true,
      })
    ).toMatchObject({
      titleColor: LightTheme.colors.onSurface,
      contentOpacity: stateOpacity.disabled,
    });
  });

  it('should return correct theme color, for theme version 3', () => {
    expect(
      getMenuItemColor({
        theme: LightTheme,
      })
    ).toMatchObject({
      titleColor: LightTheme.colors.onSurface,
    });
  });

  it('returns selected tertiary roles when selected', () => {
    const theme = LightTheme;
    expect(
      getMenuItemColor({
        theme,
        selected: true,
      })
    ).toMatchObject({
      titleColor: theme.colors.onTertiaryContainer,
      iconColor: theme.colors.onTertiaryContainer,
      containerColor: theme.colors.tertiaryContainer,
      contentOpacity: stateOpacity.enabled,
    });
  });

  it('ignores selected colors when disabled', () => {
    const theme = LightTheme;
    expect(
      getMenuItemColor({
        theme,
        selected: true,
        disabled: true,
      })
    ).toMatchObject({
      titleColor: theme.colors.onSurface,
      containerColor: undefined,
      contentOpacity: stateOpacity.disabled,
    });
  });
});

describe('getMenuItemColor - icon color', () => {
  it('should return disabled color if disabled, for theme version 3', () => {
    expect(
      getMenuItemColor({
        theme: LightTheme,
        disabled: true,
      })
    ).toMatchObject({
      iconColor: LightTheme.colors.onSurfaceVariant,
      contentOpacity: stateOpacity.disabled,
    });
  });

  it('should return correct theme color, for theme version 3', () => {
    expect(
      getMenuItemColor({
        theme: LightTheme,
      })
    ).toMatchObject({
      iconColor: LightTheme.colors.onSurfaceVariant,
    });
  });
});

describe('Menu shape tokens', () => {
  it('resolves container border radius to corner.large', () => {
    const theme = LightTheme;
    expect(getMenuContainerBorderRadius(theme)).toBe(
      resolveCornerRadius(theme, MenuTokens.shapes.container)
    );
    expect(getMenuContainerBorderRadius(theme)).toBe(theme.shapes.corner.large);
  });

  it('resolves standard container fill to surfaceContainerLow (C1)', () => {
    const theme = LightTheme;
    expect(getMenuContainerColor({ theme, elevation: 2 })).toBe(
      theme.colors.surfaceContainerLow
    );
    expect(getMenuContainerColor({ theme, elevation: 2 })).not.toBe(
      theme.colors.elevation.level2
    );
    expect(MenuTokens.standardColors.container).toBe('surfaceContainerLow');
  });

  it('applies corner.medium on selected items', () => {
    const theme = LightTheme;
    const radius = resolveCornerRadius(theme, MenuTokens.shapes.item);
    expect(getMenuItemBorderRadius({ theme, selected: true })).toMatchObject({
      borderRadius: radius,
    });
  });

  it('applies top/bottom corner.medium for first/last items', () => {
    const theme = LightTheme;
    const radius = resolveCornerRadius(theme, MenuTokens.shapes.item);
    expect(getMenuItemBorderRadius({ theme, roundedTop: true })).toMatchObject({
      borderTopLeftRadius: radius,
      borderTopRightRadius: radius,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    });
    expect(
      getMenuItemBorderRadius({ theme, roundedBottom: true })
    ).toMatchObject({
      borderBottomLeftRadius: radius,
      borderBottomRightRadius: radius,
    });
  });

  it('uses full corner.medium when selected even if only roundedTop was set', () => {
    const theme = LightTheme;
    const radius = resolveCornerRadius(theme, MenuTokens.shapes.item);
    expect(
      getMenuItemBorderRadius({
        theme,
        selected: true,
        roundedTop: true,
        roundedBottom: false,
      })
    ).toMatchObject({ borderRadius: radius });
  });
});

describe('Menu open/close motion', () => {
  it('snaps scale and opacity when reduce-motion is enabled', () => {
    const scale = { value: 0 };
    const opacity = { value: 0 };
    const finish = jest.fn();

    const path = runMenuOpenMotion({
      reduceMotion: true,
      scale,
      opacity,
      theme: LightTheme,
      onFinish: finish,
    });

    expect(path).toBe('snap');
    expect(finish).toHaveBeenCalled();
    expect(scale.value).toBe(1);
    expect(opacity.value).toBe(1);
  });

  it('springs to the resting state when reduce-motion is off', () => {
    const scale = { value: 0 };
    const opacity = { value: 0 };
    const finish = jest.fn();

    const path = runMenuOpenMotion({
      reduceMotion: false,
      scale,
      opacity,
      theme: LightTheme,
      onFinish: finish,
    });

    expect(path).toBe('spring');
    // Spring path animates asynchronously: the shared value holds the
    // animation object (not the settled target) and the callback has not run.
    expect(scale.value).not.toBe(1);
    expect(finish).not.toHaveBeenCalled();
  });

  it('snaps opacity to 0 on close when reduce-motion is enabled', () => {
    const opacity = { value: 1 };
    const finish = jest.fn();

    const path = runMenuCloseMotion({
      reduceMotion: true,
      opacity,
      theme: LightTheme,
      onFinish: finish,
    });

    expect(path).toBe('snap');
    expect(finish).toHaveBeenCalled();
    expect(opacity.value).toBe(0);
  });
});

describe('Menu.Item ARIA role', () => {
  const setPlatform = (os: 'web' | 'ios') => {
    Object.defineProperty(Platform, 'OS', {
      get: () => os,
      configurable: true,
    });
  };

  afterEach(() => setPlatform('ios'));

  it('keeps plain menuitem on native so the Android role description survives', async () => {
    setPlatform('ios');
    await render(<Menu.Item testID="menu-item" title="Paste" selected />);
    expect(screen.getByRole('menuitem')).toBeOnTheScreen();
  });

  it('uses menuitemradio on web for single selection', async () => {
    setPlatform('web');
    await render(<Menu.Item testID="menu-item" title="Paste" selected />);
    expect(screen.getByTestId('menu-item')).toHaveProp('role', 'menuitemradio');
  });

  it('uses menuitemcheckbox on web when aria-checked is given', async () => {
    setPlatform('web');
    await render(
      <Menu.Item testID="menu-item" title="Paste" aria-checked="mixed" />
    );
    expect(screen.getByTestId('menu-item')).toHaveProp(
      'role',
      'menuitemcheckbox'
    );
  });

  it('stays menuitem on web when neither selection prop is used', async () => {
    setPlatform('web');
    await render(<Menu.Item testID="menu-item" title="Paste" />);
    expect(screen.getByTestId('menu-item')).toHaveProp('role', 'menuitem');
  });
});
