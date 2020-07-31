module.exports = {
    env: {
        browser: true,
        es6: true,
    },
    extends: [
        'airbnb',
        'airbnb/hooks',
        'eslint:recommended',
        'plugin:react/recommended',
    ],
    parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    plugins: [ 'react' ],
    rules: {
        'quote-props': [ 'error', 'consistent' ],
        'linebreak-style': [ 'error', 'unix' ],
        'quotes': [ 'error', 'single' ],
        'semi': [ 'error', 'always' ],
        'array-bracket-spacing': [ 'error', 'always', {
            singleValue: true,
            objectsInArrays: false,
            arraysInArrays: false,
        }],
        'object-curly-newline': [ 'error', {
            ImportDeclaration: { multiline: true, minProperties: 3 },
        }],
        'indent': [ 'error', 4 ],
        'react/jsx-indent': [ 'error', 4 ],
        'react/jsx-indent-props': [ 'error', 4 ],
        'no-param-reassign': [ 'error', { 'props': false }],
        'no-return-assign': 'off',
        'react/jsx-filename-extension': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react/prop-types': 'off',
        'react/display-name': 'off',
    },
};
