const plugin = require('tailwindcss/plugin')

module.exports = plugin(function({ addUtilities }) {
    let newUtilities = {
      '.clippath-none': {
        clipPath: 'none'
      }
    };
  
    for (let i = 10; i <= 100; i = i + 5) {
      newUtilities[`.clippath-reg-${i}`] = {
        clipPath: `polygon(${i}% 0%, 100% ${i}%, ${i}% 100%,  0% ${i}%)`,
      };
    }

    for (let i = 10; i <= 100; i = i + 5) {
        newUtilities[`.clippath-regY-tr-${i}`] = {
            clipPath: `polygon(0 0 , 100% ${i}%, 100% 100%, 0 100%)`,
        };
    }

    for (let i = 10; i <= 100; i = i + 5) {
        newUtilities[`.clippath-regY-tl-${i}`] = {
            clipPath: `polygon(0 ${i}% , 100% 0, 100% 100%, 0 100%)`,
        };
    }

    for (let i = 10; i <= 100; i = i + 5) {
        newUtilities[`.clippath-regY-bl-${i}`] = {
            clipPath: `polygon(0 0 , 100% 0, 100% 100%, 0 ${i}%)`,
        };
    }

    for (let i = 10; i <= 100; i = i + 5) {
        newUtilities[`.clippath-regY-br-${i}`] = {
            clipPath: `polygon(0 0 , 100% 0, 100% ${i}%, 0 100%)`,
        };
    }

    for (let i = 10; i <= 100; i = i + 5) {
        newUtilities[`.clippath-regX-tr-${i}`] = {
            clipPath: `polygon(0 0 , ${i}% 0, 100% 100%, 0 100%)`,
        };
    }

    for (let i = 10; i <= 100; i = i + 5) {
        newUtilities[`.clippath-regX-tl-${i}`] = {
            clipPath: `polygon(${i}% 0 , 100% 0, 100% 100%, 0 100%)`,
        };
    }

    for (let i = 10; i <= 100; i = i + 5) {
        newUtilities[`.clippath-regX-bl-${i}`] = {
            clipPath: `polygon(0 0 , 100% 0, 100% 100%, ${i}% 100%)`,
        };
    }

    for (let i = 10; i <= 100; i = i + 5) {
        newUtilities[`.clippath-regX-br-${i}`] = {
            clipPath: `polygon(0 0 , 100% 0, ${i}% 100%, 0 100%)`,
        };
    }

    for (let i = 10; i <= 100; i = i + 5) {
        newUtilities[`.clippath-circle-${i}`] = {
            clipPath: `circle(${i}%)`,
        };
    }

    for (let i = 10; i <= 100; i = i + 5) {
        newUtilities[`.clippath-ellipse-r-${i}`] = {
            clipPath: `circle(${i}%)`,
        };
    }

    for (let i = 10; i <= 100; i = i + 5) {
        newUtilities[`.clippath-ellipse-l-${i}`] = {
            clipPath: `circle(${i}%)`,
        };
    }

    for (let i = 10; i <= 100; i = i + 5) {
        newUtilities[`.clippath-ellipse-t-${i}`] = {
            clipPath: `circle(${i}%)`,
        };
    }

    for (let i = 10; i <= 100; i = i + 5) {
        newUtilities[`.clippath-ellipse-b-${i}`] = {
            clipPath: `circle(${i}%)`,
        };
    }
  
    addUtilities(newUtilities, {
      variants: ['responsive', 'hover'],
    })
  });