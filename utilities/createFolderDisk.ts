import { NextResponse } from 'next/server';

export async function initStore(storeId: string): Promise<NextResponse> {
  if (!storeId) {
    return NextResponse.json({ error: 'Missing Store-Id in header' }, { status: 400 });
  }

  const token = process.env.VPS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
  }

  try {
    const response = await fetch(`${process.env.VPS_URL}/init-store`, {
      method: 'GET',
      headers: {
        'storeId': storeId,
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Request failed' }, { status: response.status });
    }
    
    return data
  } catch (error) {
    console.error('Network error:', error);
    return NextResponse.json({ error: 'Network error' }, { status: 500 });
  }
}