import sanitize from 'sanitize-html';
import { fileTypeFromBuffer } from 'file-type';
export async function validateMedia(buffer: Buffer, privateFile = false) {
  const type = await fileTypeFromBuffer(buffer);
  if (
    !privateFile &&
    !type &&
    buffer.length <= 1024 * 1024 &&
    /^\s*(?:<\?xml[^>]*>\s*)?<svg[\s>]/i.test(buffer.toString('utf8'))
  ) {
    const svg = sanitize(buffer.toString('utf8'), {
      allowedTags: [
        'svg',
        'g',
        'path',
        'rect',
        'circle',
        'ellipse',
        'line',
        'polyline',
        'polygon',
        'title',
        'desc',
      ],
      allowedAttributes: {
        '*': [
          'd',
          'fill',
          'stroke',
          'stroke-width',
          'stroke-linecap',
          'stroke-linejoin',
          'opacity',
          'fill-opacity',
          'stroke-opacity',
          'transform',
          'x',
          'y',
          'x1',
          'x2',
          'y1',
          'y2',
          'cx',
          'cy',
          'r',
          'rx',
          'ry',
          'points',
          'width',
          'height',
          'viewBox',
          'xmlns',
        ],
      },
      parser: { lowerCaseAttributeNames: false },
      allowedSchemes: [],
      allowProtocolRelative: false,
    });
    if (
      /(?:url\s*\(|javascript|data:|https?:)/i.test(
        svg.replace(/xmlns="http:\/\/www.w3.org\/2000\/svg"/g, ''),
      )
    )
      throw Object.assign(new Error('SVG must contain only self-contained vector shapes'), {
        status: 400,
      });
    return { buffer: Buffer.from(svg), mime: 'image/svg+xml' };
  }
  const allowed = privateFile
    ? ['application/pdf']
    : ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
  if (!type || !allowed.includes(type.mime))
    throw Object.assign(
      new Error(
        privateFile
          ? 'Resume must be a PDF'
          : 'Use JPEG, PNG, WebP, GIF, sanitized SVG, MP4 or WebM media',
      ),
      { status: 400 },
    );
  return { buffer, mime: type.mime };
}
