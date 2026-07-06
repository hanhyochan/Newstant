import React from "react";
import type { Preview } from "@storybook/react";

import "../src/app/styles/tokens.css";
import "../src/app/styles/reset.css";
import styles from "../src/app/styles/newsroll.module.css";
import "../src/app/styles/utilities.css";

const preview: Preview = {
  decorators: [
    (Story) =>
      React.createElement(
        "div",
        { className: styles.newsrollScope },
        React.createElement(Story),
      ),
  ],
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
