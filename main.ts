import { existsSync } from 'node:fs';
import { cp, mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { buildDossier } from './vendor/makefun-frontend.ts';

const dossierLimits = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

async function packageEntry(destination: string) {
  await mkdir(destination, { recursive: true });
  for (const folder of ['app', 'screenshots']) {
    const source = new URL(`./${folder}/`, import.meta.url);
    if (folder === 'screenshots' && !existsSync(source)) continue;
    await cp(source, join(destination, folder), { recursive: true });
  }
  const dossierBytes = buildDossier(destination, dossierLimits);
  await writeFile(join(destination, 'dossier.json'), dossierBytes);
}

await packageEntry(resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output'));
