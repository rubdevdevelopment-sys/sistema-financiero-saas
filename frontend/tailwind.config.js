import forms from "@tailwindcss/forms";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#38bdf8",
          600: "#0284c7",
          700: "#0369a1"
        },
        ink: {
          950: "#020617"
        }
      },
      boxShadow: {
        panel: "0 20px 60px rgba(15, 23, 42, 0.18)"
      },
      backgroundImage: {
        hero:
          "radial-gradient(circle at top left, rgba(56,189,248,0.22), transparent 35%), radial-gradient(circle at 80% 10%, rgba(16,185,129,0.14), transparent 28%), linear-gradient(135deg, #020617 0%, #0f172a 48%, #082f49 100%)",
        platform:
          "radial-gradient(circle at 20% 10%, rgba(56,189,248,0.24), transparent 34%), radial-gradient(circle at 85% 18%, rgba(20,184,166,0.16), transparent 26%), linear-gradient(150deg, #020617 0%, #0f172a 45%, #0c4a6e 100%)"
      }
    }
  },
  plugins: [forms]
};
