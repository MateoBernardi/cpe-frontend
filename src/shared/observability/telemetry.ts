interface TelemetryPayload {
  [key: string]: unknown
}

/**
 * Telemetria minima local.
 * En produccion se puede reemplazar por Sentry/Datadog u otro collector.
 */
export function logTelemetry(eventName: string, payload: TelemetryPayload = {}): void {
  const event = {
    eventName,
    timestamp: new Date().toISOString(),
    path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    ...payload,
  }

  // Mantener salida simple y consistente para inspeccion manual.
  console.info('[telemetry]', event)
}
