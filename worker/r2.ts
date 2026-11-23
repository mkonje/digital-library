// worker/r2.ts
import { Env } from './types';

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
}

export async function uploadToR2(
  bucket: R2Bucket,
  key: string,
  data: ArrayBuffer | ReadableStream | string,
  contentType: string,
  metadata?: Record<string, string>
): Promise<R2Object> {
  const customMetadata: Record<string, string> = {
    uploadedAt: Date.now().toString(),
    ...metadata,
  };

  return await bucket.put(key, data, {
    httpMetadata: {
      contentType: contentType,
    },
    customMetadata,
  });
}

export async function getFromR2(bucket: R2Bucket, key: string): Promise<R2ObjectBody | null> {
  return await bucket.get(key);
}

export async function deleteFromR2(bucket: R2Bucket, key: string): Promise<void> {
  await bucket.delete(key);
}

// Minimal valid PDF generator for demo books and placeholder reading
export function generateSamplePDF(title: string, author: string, category: string): Uint8Array {
  const content = `%PDF-1.4
1 0 obj
<<
  /Title (${title.replace(/[\(\)]/g, '')})
  /Author (${author.replace(/[\(\)]/g, '')})
  /Creator (MaktabaYetu Digital Library)
  /Producer (Cloudflare Native Engine)
>>
endobj
2 0 obj
<<
  /Type /Catalog
  /Pages 3 0 R
>>
endobj
3 0 obj
<<
  /Type /Pages
  /Kids [4 0 R 6 0 R]
  /Count 2
>>
endobj
4 0 obj
<<
  /Type /Page
  /Parent 3 0 R
  /MediaBox [0 0 612 792]
  /Resources <<
    /Font <<
      /F1 5 0 R
    >>
  >>
  /Contents 7 0 R
>>
endobj
5 0 obj
<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica-Bold
>>
endobj
6 0 obj
<<
  /Type /Page
  /Parent 3 0 R
  /MediaBox [0 0 612 792]
  /Resources <<
    /Font <<
      /F1 5 0 R
    >>
  >>
  /Contents 8 0 R
>>
endobj
7 0 obj
<<
  /Length 280
>>
stream
BT
/F1 28 Tf
50 720 Td
(MAKTABAYETU DIGITAL LIBRARY) Tj
/F1 16 Tf
0 -40 Td
(${title.substring(0, 45).replace(/[\(\)]/g, '')}) Tj
/F1 12 Tf
0 -30 Td
(Mwandishi: ${author.replace(/[\(\)]/g, '')}) Tj
0 -20 Td
(Kategoria: ${category.replace(/[\(\)]/g, '')}) Tj
0 -40 Td
([MAUDHUI YA MAJARIBIO / DEMO DOCUMENT]) Tj
0 -30 Td
(Hiki ni kitabu cha mfano kilichotolewa kwenye jukwaa la MaktabaYetu.) Tj
0 -20 Td
(Unaweza kusoma, kupitia kurasa na kuona ubora wa PDF reader yetu.) Tj
ET
endstream
endobj
8 0 obj
<<
  /Length 220
>>
stream
BT
/F1 20 Tf
50 720 Td
(Ukurasa wa Pili - Muhtasari wa Maudhui) Tj
/F1 12 Tf
0 -40 Td
(1. Utangulizi na Historia ya Uandishi) Tj
0 -25 Td
(2. Kanuni Muhimu za Elimu ya Kidijitali) Tj
0 -25 Td
(3. Mbinu za Utafiti na Usomaji Bora) Tj
0 -40 Td
(Imechakatwa rasmi kupitia MaktabaYetu Cloudflare Engine.) Tj
ET
endstream
endobj
xref
0 9
0000000000 65535 f 
0000000010 00000 n 
0000000160 00000 n 
0000000215 00000 n 
0000000282 00000 n 
0000000412 00000 n 
0000000488 00000 n 
0000000618 00000 n 
0000000951 00000 n 
trailer
<<
  /Size 9
  /Root 2 0 R
  /Info 1 0 R
>>
startxref
1224
%%EOF`;

  return new TextEncoder().encode(content);
}
