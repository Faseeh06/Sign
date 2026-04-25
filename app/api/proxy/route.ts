import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  
  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'image/gif, image/webp, image/*;q=0.8',
        'Referer': 'https://www.lifeprint.com/',
      },
    });

    if (!response.ok) {
      return new NextResponse("Failed to fetch image", { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    
    // Pass along headers
    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('content-type') || 'image/gif');
    headers.set('Cache-Control', 'public, max-age=86400');

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
