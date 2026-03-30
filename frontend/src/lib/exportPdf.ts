export async function exportElementToPdf(element: HTMLElement, filename: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const exportId = `fc-pdf-root-${Date.now().toString(36)}`;
  element.setAttribute('data-fc-pdf-root', exportId);

  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
      foreignObjectRendering: false,
      windowWidth: Math.max(element.scrollWidth, element.clientWidth),
      windowHeight: Math.max(element.scrollHeight, element.clientHeight),
      scrollX: 0,
      scrollY: -window.scrollY,
      onclone: (clonedDocument) => {
        const clonedElement = clonedDocument.querySelector<HTMLElement>(
          `[data-fc-pdf-root="${exportId}"]`,
        );

        if (!clonedElement) {
          return;
        }

        const exportStyle = clonedDocument.createElement('style');
        exportStyle.textContent = `
          [data-fc-pdf-root="${exportId}"],
          [data-fc-pdf-root="${exportId}"] * {
            animation: none !important;
            transition: none !important;
            backdrop-filter: none !important;
            filter: none !important;
            text-shadow: none !important;
          }

          [data-fc-pdf-root="${exportId}"] {
            color: #0f1b2d !important;
            background: #ffffff !important;
            box-shadow: none !important;
            overflow: visible !important;
          }

          [data-fc-pdf-root="${exportId}"] .fc-card,
          [data-fc-pdf-root="${exportId}"] .fc-stat,
          [data-fc-pdf-root="${exportId}"] .fc-report-sheet__meta {
            background: #ffffff !important;
            color: #0f1b2d !important;
            border-color: #d8e0ea !important;
            box-shadow: none !important;
          }

          [data-fc-pdf-root="${exportId}"] .fc-report-sheet__meta,
          [data-fc-pdf-root="${exportId}"] .fc-stat--accent {
            background: #f5f7fb !important;
          }

          [data-fc-pdf-root="${exportId}"] .fc-empty,
          [data-fc-pdf-root="${exportId}"] .fc-bar-track,
          [data-fc-pdf-root="${exportId}"] .fc-progress,
          [data-fc-pdf-root="${exportId}"] .fc-donut-chart__track {
            background: #eef2f6 !important;
            stroke: #eef2f6 !important;
            border-color: #d8e0ea !important;
          }

          [data-fc-pdf-root="${exportId}"] .fc-tag-pos {
            color: #0d8f6e !important;
          }

          [data-fc-pdf-root="${exportId}"] .fc-tag-neg {
            color: #c43d3d !important;
          }
        `;

        clonedDocument.head.appendChild(exportStyle);
        clonedDocument.body.style.background = '#ffffff';
        clonedElement.style.width = `${element.scrollWidth}px`;
        clonedElement.style.maxWidth = 'none';
      },
    });
  } finally {
    element.removeAttribute('data-fc-pdf-root');
  }

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
