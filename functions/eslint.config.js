import eslint from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{ ignores: ["lib/", "node_modules/"] },
	eslint.configs.recommended,
	tseslint.configs.recommended,
	prettierConfig,
	{
		rules: {
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ argsIgnorePattern: "^_" },
			],
		},
	},
);
