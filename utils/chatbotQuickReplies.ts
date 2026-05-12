/**
 * Détection des réponses rapides « Souhaitez-vous : » + A) B) C) (même logique que le widget web).
 * Les options ne sont parsées qu’après le délimiteur pour éviter de confondre avec d’autres listes.
 */

const OPTIONS_DELIMITER = /Souhaitez-vous\s*:\s*/i;

const LINE_OPTION = /^\s*([A-Ea-e])[.)]\s*(.+)$/;

export type ChatbotQuickReplyOption = { letter: string; label: string };

export type ParsedAssistantQuickReplies = {
  mainContent: string;
  options: ChatbotQuickReplyOption[];
};

/**
 * @returns `null` si pas de bloc valide (min. 2 options, comme le web).
 */
export function parseAssistantQuickReplies(content: string): ParsedAssistantQuickReplies | null {
  const delimMatch = content.match(OPTIONS_DELIMITER);
  if (!delimMatch || delimMatch.index === undefined) return null;

  const mainContent = content.slice(0, delimMatch.index).trim();
  const optionsPart = content.slice(delimMatch.index + delimMatch[0].length).trim();

  const options: ChatbotQuickReplyOption[] = [];

  const lines = optionsPart.split(/\n/);
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(LINE_OPTION);
    if (m) {
      const letter = m[1].toUpperCase();
      const label = m[2].trim().replace(/\s*[?.]\s*$/u, '');
      options.push({ letter, label });
    } else if (options.length > 0 && lines[i].trim() !== '') {
      break;
    }
  }
  if (options.length >= 2) {
    return { mainContent, options };
  }

  options.length = 0;
  const inlineParts = optionsPart.split(/\s*,\s*(?=[A-Ea-e][.)])/);
  const optionRegex = /^([A-Ea-e])[.)]\s*(.+)$/s;
  for (let i = 0; i < inlineParts.length; i++) {
    const part = inlineParts[i].trim();
    const match = part.match(optionRegex);
    if (match) {
      options.push({
        letter: match[1].toUpperCase(),
        label: match[2].trim().replace(/\s*[?.]\s*$/u, ''),
      });
    } else if (i === 0 && part.length > 0) {
      const lastOption = part.match(/(.*?)\s*([A-Ea-e])[.)]\s*(.+)$/s);
      if (lastOption) {
        options.push({
          letter: lastOption[2].toUpperCase(),
          label: lastOption[3].trim().replace(/\s*[?.]\s*$/u, ''),
        });
      }
    }
  }
  if (options.length >= 2) {
    return { mainContent, options };
  }

  return null;
}
