import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const ROOT = process.cwd();
const TARGETS = [
  {
    name: 'web',
    vi: 'apps/web/src/lib/i18n/dictionaries/vi.ts',
    en: 'apps/web/src/lib/i18n/dictionaries/en.ts',
  },
  {
    name: 'admin',
    vi: 'apps/admin/src/lib/i18n/dictionaries/vi.ts',
    en: 'apps/admin/src/lib/i18n/dictionaries/en.ts',
  },
];

function readDictionary(relativePath, exportName) {
  const absolutePath = path.join(ROOT, relativePath);
  const sourceText = fs.readFileSync(absolutePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    absolutePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  let dictionary;
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === exportName &&
        declaration.initializer
      ) {
        let initializer = declaration.initializer;
        while (
          ts.isAsExpression(initializer) ||
          ts.isSatisfiesExpression(initializer) ||
          ts.isParenthesizedExpression(initializer)
        ) {
          initializer = initializer.expression;
        }
        if (ts.isObjectLiteralExpression(initializer)) {
          dictionary = initializer;
        }
      }
    }
  }

  if (!dictionary) {
    throw new Error(`Could not find exported dictionary "${exportName}" in ${relativePath}`);
  }

  return dictionary;
}

function propertyName(node) {
  if (
    ts.isIdentifier(node) ||
    ts.isStringLiteral(node) ||
    ts.isNumericLiteral(node)
  ) {
    return node.text;
  }
  return undefined;
}

function collectKeys(object, prefix = '', keys = new Set()) {
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property) && !ts.isMethodDeclaration(property)) {
      continue;
    }

    const name = propertyName(property.name);
    if (!name) continue;
    const key = prefix ? `${prefix}.${name}` : name;
    keys.add(key);

    if (
      ts.isPropertyAssignment(property) &&
      ts.isObjectLiteralExpression(property.initializer)
    ) {
      collectKeys(property.initializer, key, keys);
    }
  }

  return keys;
}

let hasMismatch = false;

for (const target of TARGETS) {
  const viKeys = collectKeys(readDictionary(target.vi, 'vi'));
  const enKeys = collectKeys(readDictionary(target.en, 'en'));
  const missingInEn = [...viKeys].filter((key) => !enKeys.has(key)).sort();
  const missingInVi = [...enKeys].filter((key) => !viKeys.has(key)).sort();

  console.log(
    `${target.name}: vi=${viKeys.size}, en=${enKeys.size}, missing-en=${missingInEn.length}, missing-vi=${missingInVi.length}`,
  );

  if (missingInEn.length > 0) {
    hasMismatch = true;
    console.log(`  Missing in EN:\n    ${missingInEn.join('\n    ')}`);
  }
  if (missingInVi.length > 0) {
    hasMismatch = true;
    console.log(`  Missing in VI:\n    ${missingInVi.join('\n    ')}`);
  }
}

if (hasMismatch) {
  process.exitCode = 1;
}
