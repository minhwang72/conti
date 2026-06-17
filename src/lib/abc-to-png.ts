// Client-side only: renders ABC notation via abcjs, converts to PNG base64

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
    if (!svg) throw new Error('악보 렌더링 실패 (SVG 없음)');

    // XMLSerializer로 namespace 포함한 올바른 SVG 문자열 생성
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);

    const vb = svg.viewBox.baseVal;
    const svgW = Math.max(vb.width, 100);
    const svgH = Math.max(vb.height, 100);

    const base64 = await new Promise<string>((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = svgW * 2;
      canvas.height = svgH * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas 미지원')); return; }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const img = new Image();
      img.width = canvas.width;
      img.height = canvas.height;

      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png').split(',')[1]);
      };
      img.onerror = (e) => {
        console.error('[abcToPng] img load failed', e, svgStr.slice(0, 200));
        reject(new Error('SVG→PNG 변환 실패'));
      };

      // base64 인코딩 방식 (encodeURIComponent보다 안정적)
      const svgBase64 = btoa(unescape(encodeURIComponent(svgStr)));
      img.src = 'data:image/svg+xml;base64,' + svgBase64;
    });

    return { base64, mimeType: 'image/png' };
  } finally {
    document.body.removeChild(container);
  }
}
