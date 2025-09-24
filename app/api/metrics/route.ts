import { NextResponse } from 'next/server';
import client from 'prom-client';
import '@/lib/metrics-config'; // Initialize metrics

export async function GET() {
  try {
    const metrics = await client.register.metrics();
    return new NextResponse(metrics, {
      headers: { 'Content-Type': client.register.contentType }
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    return new NextResponse('Error generating metrics', { status: 500 });
  }
}