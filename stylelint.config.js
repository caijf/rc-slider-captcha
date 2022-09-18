module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-css-modules',
    'stylelint-config-rational-order',
    'stylelint-config-prettier',
    'stylelint-no-unsupported-browser-features'
  ],
  plugins: ['stylelint-declaration-block-no-ignored-properties'],
  customSyntax: 'postcss-less',
  rules: {
    'plugin/declaration-block-no-ignored-properties': true,
    'no-descending-specificity': null,
    'no-invalid-position-at-import-rule': null,
    'declaration-empty-line-before': null,
    'keyframes-name-pattern': null,
    'custom-property-pattern': null,
    'number-max-precision': 8,
    'alpha-value-notation': 'number',
    'color-function-notation': 'legacy',
    'selector-class-pattern': null,
    'selector-id-pattern': null,
    'font-family-no-missing-generic-family-keyword': null,
    'rule-empty-line-before': null,
    'import-notation': ['string'],
    'value-keyword-case': ['lower', { ignoreKeywords: ['optimizeLegibility'] }],
    'selector-no-vendor-prefix': [
      true,
      { ignoreSelectors: ['::-webkit-input-placeholder', '/-moz-.*/'] }
    ]
  },
  ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts']
};
