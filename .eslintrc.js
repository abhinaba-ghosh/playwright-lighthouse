module.exports = {
  root: true,
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 2020,
  },
  extends: ['eslint:recommended', 'prettier', 'plugin:prettier/recommended'],
  env: {
    node: true,
    es6: true,
  },
};
