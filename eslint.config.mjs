import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  globalIgnores([
    ".next/**",
    ".open-next/**",
    "Croquis/**",
    "favicon_111.ico/**",
    "illustrations/**",
    "app/api/checkout/route 2.ts"
  ])
]);
