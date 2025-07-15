import { NextRequest, NextResponse } from 'next/server';

export async function initStore(storeId: string): Promise<NextResponse> {
 

    const token = process.env.FLASK_SECRET_TOKEN;

  if (!storeId) {
    return NextResponse.json({ error: 'Missing Store-Id in header' }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
  }

  try {
    const response = await fetch('http://91.216.104.8:5000/init-store', {
      method: 'GET',
      headers: {
        'Store-Id': storeId,
        'Authorization': `Bearer ${token}`,
      },
    });


    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error || 'Request failed' }, { status: response.status });
    }

    const data = await response.json();
    console.log(data,"this is data")
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Network error' }, { status: 500 });
  }
}