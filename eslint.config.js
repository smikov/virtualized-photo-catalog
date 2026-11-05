import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginReactRefresh from 'eslint-plugin-react-refresh'
import pluginPrettier from 'eslint-plugin-prettier/recommended'

/**
 * Правило FSD-границ для слоя.
 *
 * Запрещает импортировать вышестоящие слои в любом виде:
 * - через алиас (`@/pages/...`);
 * - относительным путём (`../../pages/...`).
 *
 * Без второй части правило обходится одним движением руки — достаточно не писать `@/`.
 *
 * Единственное разрешённое исключение — `@/app/store`: типизированные хуки
 * и типы стора нельзя разместить ниже app (иначе store начнёт импортировать
 * вышестоящие слои). Исключение явное и намеренное, всё остальное из `app`
 * нижестоящим слоям запрещено.
 */
function layerBoundaryRule({ layer, forbiddenLayers }) {
  const allowed = layer === 'app' ? [] : ['!@/app/store', '!@/app/store/**', '!**/app/store']

  return {
    files: [`src/${layer}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                ...forbiddenLayers.map((name) => `@/${name}/**`),
                ...forbiddenLayers.map((name) => `**/${name}/**`),
                ...allowed,
              ],
              message: `Слой "${layer}" не может импортировать вышестоящие слои.`,
            },
          ],
        },
      ],
    },
  }
}

export default tseslint.config(
  { ignores: ['dist', 'eslint.config.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  pluginPrettier,
  {
    plugins: {
      'react-hooks': pluginReactHooks,
      'react-refresh': pluginReactRefresh,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  {
    files: ['src/widgets/photos-table/ui/PhotosTableWidget/PhotosTableWidget.tsx'],
    rules: { 'react-hooks/incompatible-library': 'off' },
  },

  layerBoundaryRule({
    layer: 'shared',
    forbiddenLayers: ['app', 'pages', 'widgets', 'features', 'entities'],
  }),

  layerBoundaryRule({
    layer: 'entities',
    forbiddenLayers: ['app', 'pages', 'widgets', 'features'],
  }),

  layerBoundaryRule({ layer: 'features', forbiddenLayers: ['app', 'pages', 'widgets'] }),

  layerBoundaryRule({ layer: 'widgets', forbiddenLayers: ['app', 'pages'] }),

  layerBoundaryRule({ layer: 'pages', forbiddenLayers: ['app'] })
)
