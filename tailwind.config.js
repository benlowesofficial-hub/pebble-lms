// tailwind.config.js
module.exports = {
  content: ["./public/**/*.html"],
  theme: {
    extend: {
      colors: {
        paper: "#a4dfcc",
        background: "#a4dfcc",
        charcoal: "#333333",
        pebbleTeal: "#96B6B6",
        mutedRed: "#D65A4A",
        softYellow: "#E9C46A",
        gentleBlue: "#6CA6C1"
      },
      fontFamily: {
        sans: ["Nunito", "system-ui", "sans-serif"]
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      // Reusable keyframes/animation for fades
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in-out'
      },
      // Soft “premium” shadows
      boxShadow: {
        pebble: "0 2px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
        "pebble-hover": "0 3px 0 rgba(0,0,0,0.05), 0 12px 32px rgba(0,0,0,0.08)"
      }
    }
  },
  plugins: []
}
