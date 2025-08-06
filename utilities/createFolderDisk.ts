export async function initStore(storeId: string): Promise<{ success?: boolean; error?: string }> {
  if (!storeId) return { error: 'Missing storeId' };

  const token = process.env.VPS_TOKEN;
  const url = process.env.VPS_URL;

  if (!token || !url) return { error: 'Missing token or URL' };

  try {
    const response = await fetch(`${url}/store/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ storeId })
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.detail || data.error || 'Request failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('Network error:', error);
    return { error: 'Network error' };
  }
}
