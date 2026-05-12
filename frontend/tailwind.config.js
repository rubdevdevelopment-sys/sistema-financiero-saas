import forms from "@tailwindcss/forms";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d"
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
          "radial-gradient(circle at top left, rgba(34,197,94,0.2), transparent 35%), radial-gradient(circle at 80% 10%, rgba(14,165,233,0.16), transparent 28%), linear-gradient(135deg, #020617 0%, #0f172a 50%, #111827 100%)"
      }
    }
  },
  plugins: [forms]
};
