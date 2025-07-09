// ts-loader.mjs

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { transform } from 'esbuild';

const tsExts = ['.ts', '.tsx', '.mts', '.cts'];

export async function resolve(specifier, context, nextResolve) {
  // Lida apenas com imports relativos ou absolutos no sistema
  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    const parentPath = fileURLToPath(context.parentURL || import.meta.url);
    const resolvedBase = path.resolve(path.dirname(parentPath), specifier);

    // Tenta resolver como arquivo direto com extensão omitida
    for (const ext of tsExts) {
      const fileCandidate = `${resolvedBase}${ext}`;
      try {
        await fs.access(fileCandidate);
        return {
          url: pathToFileURL(fileCandidate).href,
          format: 'module',
          shortCircuit: true,
        };
      } catch {
        // continue trying
      }
    }

    // Tenta resolver como diretório com index.ts ou index.tsx
    try {
      const stat = await fs.stat(resolvedBase);
      if (stat.isDirectory()) {
        for (const ext of tsExts) {
          const indexCandidate = path.join(resolvedBase, `index${ext}`);
          try {
            await fs.access(indexCandidate);
            return {
              url: pathToFileURL(indexCandidate).href,
              format: 'module',
              shortCircuit: true,
            };
          } catch {
            // continue trying
          }
        }
      }
    } catch {
      // not a valid directory, ignore
    }
  }

  // fallback padrão
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  const ext = path.extname(url);
  if (!tsExts.includes(ext)) {
    return nextLoad(url, context);
  }

  const filePath = fileURLToPath(url);
  const sourceCode = await fs.readFile(filePath, 'utf8');

  const { code } = await transform(sourceCode, {
    loader: ext === '.tsx' ? 'tsx' : 'ts',
    format: 'esm',
    target: 'es2022',
    sourcemap: 'inline',
    sourcefile: filePath,
  });

  return {
    format: 'module',
    shortCircuit: true,
    source: code,
  };
}
