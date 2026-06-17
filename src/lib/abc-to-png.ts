// Client-side only: renders ABC notation via abcjs, converts to PNG base64

function svgToPngBase64(svgHtml: string, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) { reject(new Error('Canvas not supported')); return; }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const img = new Image();
    // data: URL 방식 (blob: URL은 일부 환경에서 CSP로 차단됨)
    const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgHtml);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png').split(',')[1]);
    };
    img.onerror = (e) => {
      console.error('[abcToPng] img.onerror', e);
      reject(new Error('SVG 렌더링 실패 (img.onerror)'));
    };
    img.src = dataUrl;
  });
}

export async function abcToPng(abc: string): Promise<{ base64: string; mimeType: 'image/png' }> {
  const abcjsMod = await import('abcjs');
  const abcjs = abcjsMod.default;

  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:800px;background:#fff';
  document.body.appendChild(container);

  try {
    abcjs.renderAbc(container, abc, {
      staffwidth: 760,
      scale: 1.2,
      add_classes: true,
      paddingright: 20,
      paddingleft: 20,
      paddingtop: 15,
      paddingbottom: 15,
    });

    const svg = container.querySelector('svg');
    if (!svg) throw new Error('악보 렌더링 실패');

    const vb = svg.viewBox.baseVal;
    const svgW = vb.width || 800;
    const svgH = vb.height || 400;

    // 2× resolution for crisp output
    const base64 = await svgToPngBase64(svg.outerHTML, svgW * 2, svgH * 2);
    return { base64, mimeType: 'image/png' };
  } finally {
    document.body.removeChild(container);
  }
}
