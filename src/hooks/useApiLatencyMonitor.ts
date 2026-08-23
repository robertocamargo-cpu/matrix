/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef } from 'react';
import { LeadLog } from '../types';

export interface ApiLatencyRecord {
  id: string;
  endpoint: string;
  method: string;
  durationMs: number;
  status: number | 'error';
  timestamp: string;
  isHighLatency: boolean; // > 5000ms
  leadId?: string;
}

export function useApiLatencyMonitor(
  leadId?: string,
  onHighLatencyAlert?: (log: LeadLog) => void
) {
  const [latencyHistory, setLatencyHistory] = useState<ApiLatencyRecord[]>([]);
  const onHighLatencyRef = useRef(onHighLatencyAlert);
  onHighLatencyRef.current = onHighLatencyAlert;

  const trackApiCall = useCallback(async <T>(
    endpoint: string,
    fetchPromise: () => Promise<Response>,
    method = 'GET'
  ): Promise<{ response: Response; data: T; durationMs: number }> => {
    const startTime = performance.now();
    let status: number | 'error' = 'error';
    let response: Response;
    let data: T;

    try {
      response = await fetchPromise();
      status = response.status;
      data = await response.json();
    } catch (err) {
      const durationMs = Math.round(performance.now() - startTime);
      const isHighLatency = durationMs > 5000;
      
      const record: ApiLatencyRecord = {
        id: 'lat_' + Math.random().toString(36).substring(2, 9),
        endpoint,
        method,
        durationMs,
        status: 'error',
        timestamp: new Date().toLocaleTimeString(),
        isHighLatency,
        leadId
      };

      setLatencyHistory(prev => [record, ...prev.slice(0, 49)]);

      if (isHighLatency && onHighLatencyRef.current && leadId) {
        onHighLatencyRef.current({
          id: 'log_lat_' + Math.random().toString(36).substring(2, 9),
          leadId,
          message: `⚠️ [Aviso de Latência Alta] A requisição para "${endpoint}" levou ${(durationMs / 1000).toFixed(2)}s (> 5.0s) e retornou erro de rede. Verifique a estabilidade do provedor.`,
          type: 'warn',
          timestamp: new Date().toLocaleTimeString()
        });
      }

      throw err;
    }

    const durationMs = Math.round(performance.now() - startTime);
    const isHighLatency = durationMs > 5000;

    const record: ApiLatencyRecord = {
      id: 'lat_' + Math.random().toString(36).substring(2, 9),
      endpoint,
      method,
      durationMs,
      status,
      timestamp: new Date().toLocaleTimeString(),
      isHighLatency,
      leadId
    };

    setLatencyHistory(prev => [record, ...prev.slice(0, 49)]);

    if (isHighLatency && onHighLatencyRef.current && leadId) {
      onHighLatencyRef.current({
        id: 'log_lat_' + Math.random().toString(36).substring(2, 9),
        leadId,
        message: `⚠️ [Aviso de Latência Alta] Resposta de "${endpoint}" demorou ${(durationMs / 1000).toFixed(2)}s (> 5.0s). Possível lentidão na rede ou gargalo no provedor externo.`,
        type: 'warn',
        timestamp: new Date().toLocaleTimeString()
      });
    }

    return { response, data, durationMs };
  }, [leadId]);

  return {
    latencyHistory,
    trackApiCall
  };
}
