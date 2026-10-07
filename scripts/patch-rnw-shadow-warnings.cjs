/**
 * Coupe les warnOnce RN Web sur shadow* / textShadow* (conversion CSS conservée).
 * Idempotent.
 */
const fs = require('fs');
const path = require('path');

const marker = '/*_etawjihi_silence_shadow_warn*/';

const targets = [
  path.join(__dirname, '..', 'node_modules', 'react-native-web', 'dist', 'exports', 'StyleSheet', 'preprocess.js'),
  path.join(__dirname, '..', 'node_modules', 'react-native-web', 'src', 'exports', 'StyleSheet', 'preprocess.js'),
];

function patchFile(file) {
  if (!fs.existsSync(file)) return false;
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes(marker)) return true;

  const before = s;

  // dist (compiled) — exact strings observed in RNW 0.21
  s = s.replace(
    `warnOnce('shadowStyles', "\\"shadow*\\" style props are deprecated. Use \\"boxShadow\\".");`,
    `${marker}/* shadow warn silenced */`,
  );
  s = s.replace(
    `warnOnce('textShadowStyles', "\\"textShadow*\\" style props are deprecated. Use \\"textShadow\\".");`,
    `${marker}/* textShadow warn silenced */`,
  );

  // src (flow) — single-quoted message
  s = s.replace(
    /warnOnce\(\s*'shadowStyles'\s*,\s*`?["']shadow\*["'] style props are deprecated\. Use ["']boxShadow["']\.["']\s*\)\s*;?/g,
    `${marker}/* shadow warn silenced */`,
  );
  s = s.replace(
    /warnOnce\(\s*'textShadowStyles'\s*,\s*`?["']textShadow\*["'] style props are deprecated\. Use ["']textShadow["']\.["']\s*\)\s*;?/g,
    `${marker}/* textShadow warn silenced */`,
  );

  // Broad fallback: any warnOnce mentioning shadow* deprecation
  s = s.replace(
    /warnOnce\(\s*['"]shadowStyles['"][\s\S]*?\)\s*;/m,
    `${marker}/* shadow warn silenced */`,
  );
  s = s.replace(
    /warnOnce\(\s*['"]textShadowStyles['"][\s\S]*?\)\s*;/m,
    `${marker}/* textShadow warn silenced */`,
  );

  if (s === before) return false;
  fs.writeFileSync(file, s);
  console.log(`[patch-rnw-shadow-warnings] patché ${path.relative(process.cwd(), file)}`);
  return true;
}

let ok = false;
for (const t of targets) {
  if (patchFile(t)) ok = true;
}
if (!ok) {
  console.warn('[patch-rnw-shadow-warnings] skip: aucun fichier patché');
  process.exit(0);
}
