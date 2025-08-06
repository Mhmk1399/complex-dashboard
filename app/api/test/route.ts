import { initStore } from '../../../utilities/createFolderDisk';

export async function POST(request: Request) {
  try {
    const { storeId } = await request.json();
    const result = await initStore(storeId);
    
    if (result.error) {
      return Response.json({ error: result.error }, { status: 400 });
    }
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}