module.exports = {
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', "prettier"],
	rules: {
		"prettier/prettier": "error"
	},
	env: {
		browser: true,
		node: true,
	},
	root: true,
  };