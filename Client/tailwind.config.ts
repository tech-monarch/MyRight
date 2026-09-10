import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#092e57", // headings, primary buttons, dark surfaces
        blue: {
          DEFAULT: "#2a61ce", // accents, links, icons, active states
          light: "#e4ebfa", // pill/badge backgrounds
        },
        surface: {
          DEFAULT: "#ffffff",
          off: "#f5f8fa",
          muted: "#e9ecef",
        },
        text: {
          main: "#092e57",
          muted: "#5c6c7f",
        },
        border: {
          DEFAULT: "#e2e8f0",
        },
        // Status colors kept simple and semantic, tuned to sit next to the blue palette.
        success: { DEFAULT: "#1a8754", light: "#e3f6ec" },
        warning: { DEFAULT: "#b5790a", light: "#fbf0da" },
        danger: { DEFAULT: "#c53030", light: "#fbe6e6" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        lg: "16px",
        xl: "20px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(9,46,87,0.08), 0 1px 2px rgba(9,46,87,0.04)",
        raised: "0 4px 14px rgba(9,46,87,0.10)",
      },
      maxWidth: {
        prose: "65ch",
      },
    },
  },
  plugins: [],
};

export default config;
