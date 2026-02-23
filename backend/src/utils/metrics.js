import promClient from 'prom-client';

const register = new promClient.Registry();

// Add default metrics (CPU, Memory, etc.)
promClient.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestsTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
});

export const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 10], // seconds
});

register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDuration);

/**
 * Middleware to track HTTP request metrics
 */
export const metricsMiddleware = (req, res, next) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const diff = process.hrtime(start);
        const durationInSeconds = diff[0] + diff[1] / 1e9;
        const route = req.baseUrl + (req.route ? req.route.path : req.path);

        httpRequestsTotal.inc({
            method: req.method,
            route,
            status: res.statusCode,
        });

        httpRequestDuration.observe({
            method: req.method,
            route,
            status: res.statusCode,
        }, durationInSeconds);
    });

    next();
};

export default register;
