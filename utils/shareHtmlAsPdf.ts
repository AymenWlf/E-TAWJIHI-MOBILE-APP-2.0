import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export type HtmlPdfPage = {
  width: number;
  height: number;
  margins?: { top: number; right: number; bottom: number; left: number };
};

/**
 * Impression navigateur du document HTML (iframe isolée),
 * même flux que le rapport web (`printOrientationDiagnosticReport`).
 */
function printHtmlInBrowser(html: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('PRINT_UNAVAILABLE'));
      return;
    }

    const printFrame = document.createElement('iframe');
    printFrame.setAttribute('aria-hidden', 'true');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentDocument;
    if (!doc) {
      printFrame.remove();
      reject(new Error('PRINT_UNAVAILABLE'));
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    const runPrint = () => {
      const pending = Array.from(doc.images)
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise<void>((done) => {
              img.addEventListener('load', () => done(), { once: true });
              img.addEventListener('error', () => done(), { once: true });
            }),
        );
      void Promise.all(pending).then(() => {
        window.setTimeout(() => {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
          window.setTimeout(() => {
            printFrame.remove();
            resolve();
          }, 1000);
        }, 250);
      });
    };

    if (doc.readyState === 'complete') {
      runPrint();
    } else {
      printFrame.onload = runPrint;
    }
  });
}

/**
 * PDF du document HTML.
 * Navigateur : boîte d’impression du document (A4, même méthode que le site).
 * Téléphone : fichier PDF puis partage système.
 */
export async function shareHtmlAsPdf(
  html: string,
  fileName: string,
  page?: HtmlPdfPage,
): Promise<void> {
  if (Platform.OS === 'web') {
    await printHtmlInBrowser(html);
    return;
  }

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
    width: page?.width,
    height: page?.height,
    margins: page?.margins,
  });
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
