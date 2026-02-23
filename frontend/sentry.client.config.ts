import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: "https://52576835e4b2986fc984b570c7e94324@o4510932941144064.ingest.de.sentry.io/4510932968341584", // Using the same DSN for now
    integrations: [
        Sentry.replayIntegration(),
    ],
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    tracesSampleRate: 1.0,
    debug: false,
});
