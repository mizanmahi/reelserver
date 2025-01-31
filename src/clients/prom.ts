import client from 'prom-client';

// Create a new Prometheus registry
const register = new client.Registry();

// Enable default metrics collection (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Define a custom metric: HTTP request duration
const httpRequestDuration = new client.Histogram({
   name: 'http_request_duration_seconds',
   help: 'Duration of HTTP requests in seconds',
   labelNames: ['method', 'route', 'status_code'],
   buckets: [0.1, 0.5, 1, 2, 5], // Buckets for response time measurement
});

export const httpRequestCounter = new client.Counter({
   name: 'http_requests_total',
   help: 'Total number of HTTP requests',
   labelNames: ['method', 'route', 'status_code'],
   registers: [register],
});

// Register the metric
register.registerMetric(httpRequestDuration);

export { client, register, httpRequestDuration };
