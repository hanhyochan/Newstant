import type { Preview } from "@storybook/react";

import "../src/app/styles/reset.css";
import "../src/app/styles/appearance.css";
import "../src/app/styles/common-layout.css";
import "../src/app/styles/components.css";
import "../src/app/styles/utilities.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "neutral-95",
      values: [
        { name: "neutral-95", value: "#dbdcdf" },
        { name: "white", value: "#ffffff" },
        { name: "dark", value: "#111111" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
