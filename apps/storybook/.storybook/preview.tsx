import { withThemeByDataAttribute } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";
import "./preview.css";

const preview: Preview = {
  decorators: [
    // Toolbar switch → sets <html data-theme>. Components never know about themes.
    withThemeByDataAttribute({
      themes: { light: "light", dark: "dark" },
      defaultTheme: "light",
      attributeName: "data-theme",
    }),
  ],
  parameters: {
    controls: { matchers: { date: /Date$/i } },
    backgrounds: { disable: true },
    // Accessibility is a gate: violations fail the story when run through the test runner (CI).
    a11y: { test: "error" },
    options: {
      storySort: {
        order: [
          "Foundations",
          [
            "Introduction",
            "Design ↔ Code",
            "Colors",
            "Typography",
            "Spacing",
            "Radius",
            "Shadows",
            "Tokens",
            "Themes",
            "Icons",
          ],
          "Components",
          "Patterns",
        ],
      },
    },
  },
};

export default preview;
