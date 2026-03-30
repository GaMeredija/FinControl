export async function exportElementToPdf(element: HTMLElement, filename: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    windowWidth: Math.max(element.scrollWidth, element.clientWidth),
  });

  const imageData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  const margin = 10;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;
  const imageHeight = (canvas.height * usableWidth) / canvas.width;

  let heightLeft = imageHeight;
  let position = margin;

  pdf.addImage(imageData, 'PNG', margin, position, usableWidth, imageHeight, undefined, 'FAST');
  heightLeft -= usableHeight;

  while (heightLeft > 0) {
    position = margin - (imageHeight - heightLeft);
    pdf.addPage();
    pdf.addImage(imageData, 'PNG', margin, position, usableWidth, imageHeight, undefined, 'FAST');
    heightLeft -= usableHeight;
  }

  pdf.save(filename);
}
