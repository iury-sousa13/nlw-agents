// ts-loader.mjs

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { transform } from "esbuild";

const tsExts = [".ts", ".tsx", ".mts", ".cts"];

export async function resolve(specifier, context, nextResolve) {
	// Evita resolver módulos internos ou absolutos
	if (specifier.startsWith(".") || specifier.startsWith("/")) {
		const parentPath = fileURLToPath(context.parentURL || import.meta.url);
		const resolvedBase = path.resolve(path.dirname(parentPath), specifier);

		// Tenta encontrar um arquivo com extensão válida
		for (const ext of tsExts) {
			const candidate = `${resolvedBase}${ext}`;
			try {
				await fs.access(candidate);
				return {
					url: pathToFileURL(candidate).href,
					format: "module",
					shortCircuit: true,
				};
			} catch {}
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
	const sourceCode = await fs.readFile(filePath, "utf8");

	const { code } = await transform(sourceCode, {
		loader: ext === ".tsx" ? "tsx" : "ts",
		format: "esm",
		target: "es2022",
		sourcemap: "inline",
		sourcefile: filePath,
	});

	return {
		format: "module",
		shortCircuit: true,
		source: code,
	};
}
