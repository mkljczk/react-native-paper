import { Dimensions, StyleSheet, View } from 'react-native';

import { expect, it, jest } from '@jest/globals';
import { act, screen, waitFor } from '@testing-library/react-native';

import { render } from '../../test-utils';
import { LightTheme } from '../../theme/schemes';
import type { Elevation } from '../../theme/types';
import Button from '../Button/Button';
import Divider from '../Divider';
import Menu from '../Menu/Menu';
import Portal from '../Portal/Portal';

it('renders visible menu', async () => {
  const tree = (
    await render(
      <Portal.Host>
        <Menu
          visible
          onDismiss={jest.fn()}
          anchor={<Button mode="outlined">Open menu</Button>}
        >
          <Menu.Item onPress={jest.fn()} title="Undo" />
          <Menu.Item onPress={jest.fn()} title="Redo" />
        </Menu>
      </Portal.Host>
    )
  ).toJSON();

  expect(tree).toMatchSnapshot();
});

it('renders not visible menu', async () => {
  const tree = (
    await render(
      <Portal.Host>
        <Menu
          visible={false}
          onDismiss={jest.fn()}
          anchor={<Button mode="outlined">Open menu</Button>}
        >
          <Menu.Item onPress={jest.fn()} title="Undo" />
          <Menu.Item onPress={jest.fn()} title="Redo" />
        </Menu>
      </Portal.Host>
    )
  ).toJSON();

  expect(tree).toMatchSnapshot();
});

const elevations: Elevation[] = [0, 1, 2, 3, 4, 5];

elevations.forEach((elevation) =>
  it(`renders menu with surfaceContainerLow background regardless of elevation value = ${elevation}`, async () => {
    const testID = 'menu-with-elevation';

    await render(
      <Portal.Host>
        <Menu
          visible
          onDismiss={jest.fn()}
          anchor={<Button mode="outlined">Open menu</Button>}
          elevation={elevation}
          mode="flat"
          testID={testID}
        >
          <Menu.Item onPress={jest.fn()} title="Undo" />
          <Menu.Item onPress={jest.fn()} title="Redo" />
        </Menu>
      </Portal.Host>
    );

    // C1: MD3 menu fill is surfaceContainerLow, not elevation.levelN
    // (level2 is surfaceContainer tones in this theme — a different color).
    expect(screen.getByTestId(testID)).toHaveStyle({
      backgroundColor: LightTheme.colors.surfaceContainerLow,
    });
    expect(LightTheme.colors.surfaceContainerLow).not.toBe(
      LightTheme.colors.elevation.level2
    );
  })
);

it('uses corner.large for the menu surface', async () => {
  const theme = LightTheme;

  await render(
    <Portal.Host>
      <Menu
        visible
        onDismiss={jest.fn()}
        anchor={<Button mode="outlined">Open menu</Button>}
        testID="menu"
      >
        <Menu.Item onPress={jest.fn()} title="Undo" />
      </Menu>
    </Portal.Host>
  );

  expect(screen.getByTestId('menu')).toHaveStyle({
    borderRadius: theme.shapes.corner.large,
  });
});

it('uses tertiaryContainer for vibrant color scheme', async () => {
  const theme = LightTheme;

  await render(
    <Portal.Host>
      <Menu
        visible
        colorScheme="vibrant"
        onDismiss={jest.fn()}
        anchor={<Button mode="outlined">Open menu</Button>}
        testID="menu"
      >
        <Menu.Item onPress={jest.fn()} title="Undo" />
      </Menu>
    </Portal.Host>
  );

  expect(screen.getByTestId('menu')).toHaveStyle({
    backgroundColor: theme.colors.tertiaryContainer,
  });
});

it('inherits the vibrant color scheme for items rendered inside a wrapper', async () => {
  const theme = LightTheme;

  await render(
    <Portal.Host>
      <Menu
        visible
        colorScheme="vibrant"
        onDismiss={jest.fn()}
        anchor={<Button mode="outlined">Open menu</Button>}
      >
        <View>
          <Menu.Item onPress={jest.fn()} title="Undo" testID="wrapped-item" />
        </View>
      </Menu>
    </Portal.Host>
  );

  expect(screen.getByText('Undo')).toHaveStyle({
    color: theme.colors.onTertiaryContainer,
  });
});

it('rounds first and last item corners from child order', async () => {
  const theme = LightTheme;
  const radius = theme.shapes.corner.medium;

  await render(
    <Portal.Host>
      <Menu
        visible
        onDismiss={jest.fn()}
        anchor={<Button mode="outlined">Open menu</Button>}
      >
        <Menu.Item onPress={jest.fn()} title="First" testID="first-item" />
        <Menu.Item onPress={jest.fn()} title="Middle" testID="mid-item" />
        <Menu.Item onPress={jest.fn()} title="Last" testID="last-item" />
      </Menu>
    </Portal.Host>
  );

  expect(screen.getByTestId('first-item')).toHaveStyle({
    borderTopLeftRadius: radius,
    borderTopRightRadius: radius,
  });
  expect(screen.getByTestId('last-item')).toHaveStyle({
    borderBottomLeftRadius: radius,
    borderBottomRightRadius: radius,
  });
  expect(screen.getByTestId('mid-item')).not.toHaveStyle({
    borderRadius: radius,
  });
});

it('applies medium corners from explicit roundedTop / roundedBottom props', async () => {
  const theme = LightTheme;
  const radius = theme.shapes.corner.medium;

  await render(
    <Portal.Host>
      <Menu
        visible
        onDismiss={jest.fn()}
        anchor={<Button mode="outlined">Open menu</Button>}
      >
        <Menu.Item
          onPress={jest.fn()}
          title="First"
          testID="first-item"
          roundedTop
        />
        <Menu.Item onPress={jest.fn()} title="Middle" testID="mid-item" />
        <Menu.Item
          onPress={jest.fn()}
          title="Last"
          testID="last-item"
          roundedBottom
        />
      </Menu>
    </Portal.Host>
  );

  expect(screen.getByTestId('first-item')).toHaveStyle({
    borderTopLeftRadius: radius,
    borderTopRightRadius: radius,
  });
  expect(screen.getByTestId('last-item')).toHaveStyle({
    borderBottomLeftRadius: radius,
    borderBottomRightRadius: radius,
  });
  expect(screen.getByTestId('mid-item')).not.toHaveStyle({
    borderRadius: radius,
  });
});

it('inherits the vibrant color scheme without a React.Children walk', async () => {
  const theme = LightTheme;

  await render(
    <Portal.Host>
      <Menu
        visible
        colorScheme="vibrant"
        onDismiss={jest.fn()}
        anchor={<Button mode="outlined">Open menu</Button>}
      >
        <View>
          <Menu.Item onPress={jest.fn()} title="Undo" testID="nested-item" />
        </View>
      </Menu>
    </Portal.Host>
  );

  expect(screen.getByText('Undo')).toHaveStyle({
    color: theme.colors.onTertiaryContainer,
  });
});

it('still renders Divider between items', async () => {
  await render(
    <Portal.Host>
      <Menu
        visible
        onDismiss={jest.fn()}
        anchor={<Button mode="outlined">Open menu</Button>}
      >
        <Menu.Item onPress={jest.fn()} title="A" />
        <Divider testID="menu-divider" />
        <Menu.Item onPress={jest.fn()} title="B" />
      </Menu>
    </Portal.Host>
  );
  expect(screen.getByTestId('menu-divider')).toBeOnTheScreen();
});

it('uses the default anchorPosition of top', async () => {
  const testID = 'top-positioned-menu';
  const dimensionsSpy = jest.spyOn(Dimensions, 'get').mockReturnValue({
    width: 400,
    height: 800,
    scale: 2,
    fontScale: 2,
  });
  const measureSpy = jest
    .spyOn(View.prototype, 'measureInWindow')
    .mockImplementation((fn) => fn(100, 100, 80, 32));

  function makeMenu(visible: boolean) {
    return (
      <Portal.Host>
        <Menu
          visible={visible}
          onDismiss={jest.fn()}
          anchor={
            <Button mode="outlined" testID="anchor">
              Open menu
            </Button>
          }
          testID={testID}
        >
          <Menu.Item onPress={jest.fn()} title="Undo" />
          <Menu.Item onPress={jest.fn()} title="Redo" />
        </Menu>
      </Portal.Host>
    );
  }

  const { rerender, toJSON } = await render(makeMenu(false));

  // You must update instead of creating directly and using it because
  // componentDidUpdate isn't called by default in jest. Forcing the update
  // than triggers measureInWindow, which is how Menu decides where to show
  // itself.
  await act(async () => {
    await rerender(makeMenu(true));
    // Menu waits a tick for Portal refs to be up-to-date.
    await Promise.resolve();
  });

  await waitFor(() => {
    const json = JSON.stringify(toJSON());
    expect(json).toContain('"left":100');
    expect(json).toContain('"top":100');
  });

  expect(toJSON()).toMatchSnapshot();

  measureSpy.mockRestore();
  dimensionsSpy.mockRestore();
});

it('respects anchorPosition bottom', async () => {
  const testID = 'bottom-positioned-menu';
  const dimensionsSpy = jest.spyOn(Dimensions, 'get').mockReturnValue({
    width: 400,
    height: 800,
    scale: 2,
    fontScale: 2,
  });
  const measureSpy = jest
    .spyOn(View.prototype, 'measureInWindow')
    .mockImplementation((fn) => fn(100, 100, 80, 32));

  function makeMenu(visible: boolean) {
    return (
      <Portal.Host>
        <Menu
          visible={visible}
          onDismiss={jest.fn()}
          anchor={
            <Button mode="outlined" testID="anchor">
              Open menu
            </Button>
          }
          anchorPosition="bottom"
          testID={testID}
        >
          <Menu.Item onPress={jest.fn()} title="Undo" />
          <Menu.Item onPress={jest.fn()} title="Redo" />
        </Menu>
      </Portal.Host>
    );
  }

  const { rerender, toJSON } = await render(makeMenu(false));

  await act(async () => {
    await rerender(makeMenu(true));
    // Menu waits a tick for Portal refs to be up-to-date.
    await Promise.resolve();
  });

  await waitFor(() => {
    const json = JSON.stringify(toJSON());
    expect(json).toContain('"left":100');
    expect(json).toContain('"top":132');
  });

  expect(toJSON()).toMatchSnapshot();

  measureSpy.mockRestore();
  dimensionsSpy.mockRestore();
});

it('renders menu with mode "elevated"', async () => {
  const testID = 'elevated-menu';

  await render(
    <Portal.Host>
      <Menu
        visible
        onDismiss={jest.fn()}
        anchor={<Button mode="outlined">Open menu</Button>}
        mode="elevated"
        testID={testID}
      >
        <Menu.Item onPress={jest.fn()} title="Undo" />
        <Menu.Item onPress={jest.fn()} title="Redo" />
      </Menu>
    </Portal.Host>
  );

  // eslint-disable-next-line no-restricted-syntax -- TODO: replace TestInstance props access with a user-visible assertion.
  const styles = StyleSheet.flatten(screen.getByTestId(testID).props.style);

  expect(styles).toHaveProperty('shadowColor');
  expect(styles).toHaveProperty('shadowOpacity');
});

it('renders menu with mode "flat"', async () => {
  const testID = 'flat-menu';

  await render(
    <Portal.Host>
      <Menu
        visible
        onDismiss={jest.fn()}
        anchor={<Button mode="outlined">Open menu</Button>}
        mode="flat"
        testID={testID}
      >
        <Menu.Item onPress={jest.fn()} title="Undo" />
        <Menu.Item onPress={jest.fn()} title="Redo" />
      </Menu>
    </Portal.Host>
  );

  // eslint-disable-next-line no-restricted-syntax -- TODO: replace TestInstance props access with a user-visible assertion.
  const styles = StyleSheet.flatten(screen.getByTestId(testID).props.style);

  expect(styles).not.toHaveProperty('shadowColor');
  expect(styles).not.toHaveProperty('shadowOpacity');
});
