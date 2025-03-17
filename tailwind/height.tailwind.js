const plugin = require('tailwindcss/plugin')

module.exports = plugin(function ({ addUtilities }) {
    let newUtilities = {};

    for (let i = 10; i <= 100; i = i + 1) {
        newUtilities[`.h-screen-${i}`] = {
            height: `${i}vh`
        };
    }

    for (let i = 10; i <= 100; i = i + 1) {
        newUtilities[`.max-h-screen-${i}`] = {
            maxHeight: `${i}vh`
        };
    }

    for (let i = 10; i <= 100; i = i + 1) {
        newUtilities[`.min-h-screen-${i}`] = {
            minHeight: `${i}vh`
        };
    }

    for (let i = 10; i <= 1000; i = i + 50) {
        newUtilities[`.min-h-${i}`] = {
            minHeight: `${i}px`
        };
    }

    addUtilities(newUtilities, {
        variants: ['responsive', 'hover'],
    })
});