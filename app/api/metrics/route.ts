import { NextResponse } from 'next/server';
import client from 'prom-client';

// Initialize default metrics
client.collectDefaultMetrics({ prefix: 'dashboard_' });

// Custom metrics
const httpRequestsTotal = new client.Counter({
  name: 'dashboard_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestDuration = new client.Histogram({
  name: 'dashboard_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const activeUsers = new client.Gauge({
  name: 'dashboard_active_users',
  help: 'Number of active users',
  labelNames: ['type']
});

export async function GET() {
  try {
    const metrics = await client.register.metrics();
    return new NextResponse(metrics, {
      headers: { 'Content-Type': client.register.contentType }
    });
  } catch (error) {
    return new NextResponse('Error generating metrics', { status: 500 });
  }
}

// Export metrics for use in other parts of the app
export { httpRequestsTotal, httpRequestDuration, activeUsers };