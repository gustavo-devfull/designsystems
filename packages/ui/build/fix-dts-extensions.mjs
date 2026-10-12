import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * tsc emits relative specifiers exactly as written in the source ("./components/Button").
 * Under `moduleResolution: node16/nodenext` an ESM package must spell them out ("./components/Button/index.js"),
 * otherwise consumers' TypeScript cannot resolve our types. This rewrites every relative specifier in
 * dist/**\/*.d.ts to the explicit form, based on what actually exists on disk.
 */
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const SPECIFIER = /(\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)(["'])(\.{1,2}\/[^"']*)\2/g;

function explicit(fromFile, specifier) {
  if (/\.(js|css|json)$/.test(specifier)) return specifier;
  const base = path.resolve(path.dirname(fromFile), specifier);
  if (existsSync(`${base}.d.ts`)) return `${specifier}.js`;
  if (existsSync(path.join(base, "index.d.ts"))) return `${specifier.replace(/\/$/, "")}/index.js`;
  throw new Error(`Cannot resolve "${specifier}" imported from ${path.relative(dist, fromFile)}`);
}

let rewritten = 0;
for (const file of walk(dist).filter((f) => f.endsWith(".d.ts"))) {
  const source = readFileSync(file, "utf8");
  const next = source.replace(
    SPECIFIER,
    (_, lead, quote, specifier) => `${lead}${quote}${explicit(file, specifier)}${quote}`,
  );
  if (next !== source) {
    writeFileSync(file, next);
    rewritten += 1;
  }
}
console.log(`Made relative type imports explicit in ${rewritten} declaration files.`);
