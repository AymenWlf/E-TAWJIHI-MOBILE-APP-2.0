/**
 * metro-config appelle Array.prototype.toReversed (Node 20+).
 * Remplace par Array.from(...).reverse() pour Node 18 (équivalent pour tableaux denses).
 * Idempotent : safe après plusieurs npm install.
 */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'node_modules', 'metro-config', 'src', 'loadConfig.js');

if (!fs.existsSync(file)) {
  console.warn('[patch-metro-node18] skip: metro-config/src/loadConfig.js absent');
  process.exit(0);
}

let s = fs.readFileSync(file, 'utf8');
const marker = '/*_etawjihi_node18_mergeConfig*/';

if (s.includes(marker)) {
  process.exit(0);
}

const a = 'const reversedConfigs = configs.toReversed();';
const b = 'return mergeConfigAsync(nextConfig, reversedConfigs.toReversed());';

if (!s.includes(a) || !s.includes(b)) {
  console.warn(
    '[patch-metro-node18] skip: contenu loadConfig.js inattendu (déjà patché ou version metro différente)',
  );
  process.exit(0);
}

s = s.replace(
  a,
  `const reversedConfigs = Array.from(configs).reverse();${marker}`,
);
s = s.replace(
  b,
  `return mergeConfigAsync(nextConfig, Array.from(reversedConfigs).reverse());${marker}`,
);

fs.writeFileSync(file, s);
console.log('[patch-metro-node18] metro-config/src/loadConfig.js patché pour Node 18');
