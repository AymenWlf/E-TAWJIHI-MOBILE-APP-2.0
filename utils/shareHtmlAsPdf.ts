import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

/**
 * Génère un PDF via expo-print (rendu HTML → fichier) puis ouvre le partage
 * système (Enregistrer / Imprimer) — même flux que les reçus de paiement.
 */
export async function shareHtmlAsPdf(html: string, fileName: string): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('SHARE_UNAVAILABLE');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: fileName,
  });
}
