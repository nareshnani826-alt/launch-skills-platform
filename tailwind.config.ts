import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1a1a1a",
        accent: "#C41874",
        navy: "#0B1120",
        "launch-purple": "#6B2F85",
        "launch-purple-deep": "#5C2275",
        "launch-pink": "#DE1B83",
        "launch-cyan": "#CDEEFE",
      },
      transitionTimingFunction: {
        launch: "cubic-bezier(.2,.7,.2,1)",
      },
    },
  },
  plugins: [],
};
export default config;
