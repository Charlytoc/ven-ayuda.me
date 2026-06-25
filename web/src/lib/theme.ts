import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Japanese flag red (Hinomaru) anchored at index 6.
// Index 6 is the default primaryShade used by Mantine's filled components in light mode.
const jpRed: MantineColorsTuple = [
  "#fff0f3", // 0 — lightest tint
  "#ffd6de", // 1
  "#ffaabb", // 2
  "#ff7a96", // 3
  "#f74d6b", // 4
  "#d42040", // 5
  "#bc002d", // 6 — Hinomaru red
  "#8f0022", // 7
  "#650018", // 8
  "#40000f", // 9 — darkest shade
];

// Pure monochrome dark scale — no warm/cool tint, true neutral blacks.
// dark[7] = app body background in dark mode.
// dark[6] = paper / card surface in dark mode.
const darkScale: MantineColorsTuple = [
  "#c8c8c8", // 0 — primary text
  "#a8a8a8", // 1
  "#888888", // 2
  "#606060", // 3
  "#404040", // 4
  "#2e2e2e", // 5
  "#1e1e1e", // 6 — card/paper
  "#111111", // 7 — body
  "#0a0a0a", // 8
  "#050505", // 9
];

export const theme = createTheme({
  primaryColor: "jpRed",
  // In light mode use shade 6 (#bc002d); in dark mode use shade 5 (#d42040) for better
  // contrast on dark surfaces without losing the Japanese red character.
  primaryShade: { light: 6, dark: 5 },

  colors: {
    jpRed,
    dark: darkScale,
  },

  white: "#ffffff",
  black: "#0a0a0a",

  fontFamily: "Inter, Arial, Helvetica, sans-serif",

  defaultRadius: "md",

  components: {
    // Ensure Paper uses our dark[6] surface in dark mode (Mantine default).
    // No override needed — Mantine reads dark[6] for Paper automatically.
  },
});
