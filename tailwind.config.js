// tailwind.config.js
module.exports = {
  content: ["./public/**/*.html"],
  theme: {
    extend: {
      colors: {
        paper: "#FFFCF2",
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
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in-out'
      }
    }
  },
  plugins: []
}

