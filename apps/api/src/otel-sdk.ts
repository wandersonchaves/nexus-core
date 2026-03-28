import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

// The Resource can be configured via environment variables like OTEL_SERVICE_NAME
const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
});

export const otelSDK = new NodeSDK({
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

// Graceful shutdown
process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () => console.log('OTEL SDK shut down successfully'),
      (err) => console.error('Error shutting down OTEL SDK', err),
    )
    .finally(() => process.exit(0));
});
