const plugin = require('tailwindcss/plugin')

module.exports = plugin(function ({ addUtilities }) {
    let newUtilities = {};

    for (let i = 0; i <= 100; i = i + 10) {
        newUtilities[`.-z-${i}`] = {
            zIndex: `-${i}`
        };
    }

    for (let i = 1; i < 10; i = i + 1) {
        newUtilities[`.z-${i}`] = {
            zIndex: `${i}`
        };
    }

    for (let i = 1; i < 10; i = i + 1) {
        newUtilities[`.-z-${i}`] = {
            zIndex: `-${i}`
        };
    }

    addUtilities(newUtilities, {
        variants: ['responsive', 'hover'],
    })
});