
declare const pdfjsLib: any;

interface TextItem {
  str: string;
  x: number;
  y: number;
  width: number;
}

export const extractTextFromPDF = async (data: ArrayBuffer | File, onProgress?: (percent: number) => void): Promise<string> => {
  const source = data instanceof File ? await data.arrayBuffer() : data;
  const loadingTask = pdfjsLib.getDocument({ data: source });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  let fullText = "";

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    
    const items: TextItem[] = content.items.map((item: any) => ({
      str: item.str,
      x: item.transform[4],
      y: item.transform[5],
      width: item.width
    }));

    // Ordenação espacial para manter integridade da tabela
    items.sort((a, b) => {
      if (Math.abs(a.y - b.y) < 5) {
        return a.x - b.x;
      }
      return b.y - a.y;
    });

    let pageText = "";
    let currentY = items.length > 0 ? items[0].y : 0;
    
    for (const item of items) {
      if (Math.abs(item.y - currentY) > 5) {
        pageText += "\n";
        currentY = item.y;
      } else if (pageText.length > 0 && !pageText.endsWith("\n")) {
        pageText += " ";
      }
      pageText += item.str;
    }
    
    fullText += pageText + "\n---PAGE_BREAK---\n";
    
    if (onProgress) {
      onProgress(Math.round((i / numPages) * 100));
    }
  }

  return fullText;
};
