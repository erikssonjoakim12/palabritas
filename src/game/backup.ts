import { G, today, type SaveData } from './state';

/*
  Moving a save between phones and browsers, and keeping a backup: the save as a small file. Exporting shares it
  (Android's share menu: Google Drive, WhatsApp, email...) or downloads it. It's a .txt file: Chrome on Android only
  shares some kinds of files (not .json), so a .txt gets the share menu; importing picks a file and checks it's
  a Palabritas save. Loading it runs the same updates as any save (state.ts migrate), so old files keep working.
*/

/** What's in the file: the save, with a label so other files are turned away. */
const KIND = 'palabritas-partida';

/** The current save as a file's text. */
export function exportText(): string {
  return JSON.stringify({ kind: KIND, exported: today(), save: G.save });
}

/** A save from a file's text, or null if it isn't one. */
export function readSave(text: string): SaveData | null {
  try {
    const data = JSON.parse(text);
    const save = data?.kind === KIND ? data.save : null;
    const ok = save && typeof save.name === 'string' && Array.isArray(save.party) && save.flags && typeof save.flags === 'object';
    return ok ? (save as SaveData) : null;
  } catch {
    return null;
  }
}

/** Share the save file (where the phone can) or download it. False if you cancelled sharing. */
export async function exportSave(): Promise<boolean> {
  const name = `palabritas-${G.save.name.normalize('NFD').replace(/[^\w-]/g, '') || 'partida'}-${today()}.txt`;
  const file = new File([exportText()], name, { type: 'text/plain' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Palabritas' });
      return true;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return false;
      // Sharing failed for another reason: download it instead.
    }
  }
  const url = URL.createObjectURL(file);
  Object.assign(document.createElement('a'), { href: url, download: name }).click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return true;
}

/** Pick a file and read it: its text, or null if you cancelled. */
export function pickFile(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = Object.assign(document.createElement('input'), { type: 'file', accept: '.txt,.json,text/plain,application/json' });
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      file.text().then(resolve, () => resolve(null));
    });
    input.addEventListener('cancel', () => resolve(null));
    input.click();
  });
}
