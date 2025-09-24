import client from 'prom-client';

// Initialize default metrics
client.collectDefaultMetrics({ prefix: 'dashboard_' });

// Custom metrics
export const httpRequestsTotal = new client.Counter({
  name: 'dashboard_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

export const httpRequestDuration = new client.Histogram({
  name: 'dashboard_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

export const activeUsers = new client.Gauge({
  name: 'dashboard_active_users',
  help: 'Number of active users',
  labelNames: ['type']
});