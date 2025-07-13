module.exports = {
  darkMode: "class", // enable dark mode via class
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#15803d", // green
        secondary: "#ffffff", // white
      },
    },
  },
  plugins: [],
};
// This Tailwind CSS configuration file sets up the dark mode, specifies the content files for purging unused styles, and extends the default theme with custom colors.
// It is used to style the application components consistently, ensuring a modern and responsive design.
