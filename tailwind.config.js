// tailwind.config.js
module.exports = {
  content: ["./public/**/*.html", "./public/**/*.js", "./*.html"],
  theme: {
    extend: {
      colors: {
        // Neutrals
        canvas: "#FAFAFA",     // page background
        surface: "#FFFFFF",    // cards, header
        ink: "#111827",        // primary text
        inkMuted: "#475569",   // secondary text
        border: "#E5E7EB",     // default borders/dividers
        track: "#EEF2F6",      // progress tracks, subtle fills

        // Pebble brand accent (built around your logo teal #96B6B6)
        pebbleTeal: {
          50:  "#F1F5F5",
          100: "#E3ECEC",
          200: "#C9DADA",
          400: "#96B6B6",
          500: "#7FA2A2",
          600: "#6E8E8E"
        },

        // Semantic tints (use sparingly)
        info:     "#3B82F6",
        infoBg:   "#EAF2FF",
        success:  "#16A34A",
        successBg:"#E9FBEF",
        warn:     "#D97706",
        warnBg:   "#FFF7E6",
        danger:   "#DC2626",
        dangerBg: "#FEECEC"
      },
      fontFamily: {
        sans: ["Nunito", "system-ui", "sans-serif"]
      },
      boxShadow: {
        pebble: "0 2px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
        "pebble-hover": "0 3px 0 rgba(0,0,0,0.05), 0 12px 32px rgba(0,0,0,0.08)"
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } }
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out"
      }
    }
  },
  plugins: []
}

