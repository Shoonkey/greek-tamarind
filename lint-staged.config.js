/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
const config = {
  '*.{ts,js,json,css,scss,html}': 'prettier --write',
};

export default config;
