import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import dotenv from 'dotenv';

dotenv.config();

const dsn = process.env.SENTRY_DSN;

if (dsn) {
    Sentry.init({
        dsn,
        integrations: [
            nodeProfilingIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0, //  Capture 100% of the transactions
        // Set sampling rate for profiling - this is relative to tracesSampleRate
        profilesSampleRate: 1.0,
        environment: process.env.NODE_ENV || 'development'
    });
    console.log('[Sentry] Initialized');
} else {
    console.warn('[Sentry] SENTRY_DSN not found. Error tracking disabled.');
}

export default Sentry;

