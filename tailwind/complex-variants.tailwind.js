const plugin = require('tailwindcss/plugin')

module.exports = plugin(function ({ addVariant, e }) {
    addVariant('nextOnChecked', ({ modifySelectors, separator }) => {
      modifySelectors(({ className }) => {
        return `.${e(`nextOnChecked${separator}${className}`)}:checked + *`;
      })
    });
  });

//   plugin(function ({ addVariant, e }) {
//   addVariant("focused-sibling", ({ container }) => {
//     container.walkRules((rule) => {
//       rule.selector = `:focus + .focused-sibling\\:${rule.selector.slice(1)}`;
//     });
//   });
// });