module.exports = {
    theme: {
      extend: {
        keyframes: {
          sparkle: {
            "0%, 100%": { opacity: "0.75", scale: "0.9" },
            "50%": { opacity: "1", scale: "1" },
          },
        },
        animation: {
          sparkle: "sparkle 2s ease-in-out infinite",
        },
    },
  },
};