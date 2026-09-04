/**
 * api.ts
 * ---------------------------------------------------------------------------
 * API helper service for connecting Next.js frontend with Spring Boot backend.
 * Uses localStorage to persist JWT tokens across sessions.
 * ---------------------------------------------------------------------------
 */

const API_BASE = '/api/v1';

// ---------------------------------------------------------------------------
// Retry / cold-start handling — Render free tier can take 30-60s to wake up.
// Retry on 502/503/504 or network/timeout errors up to 3 times with delay.
// ---------------------------------------------------------------------------
const RETRYABLE_STATUSES = new Set([502, 503, 504]);
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2500;
const REQUEST_TIMEOUT_MS = 15000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  return RETRYABLE_STATUSES.has(status);
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') return true;
  if (error instanceof TypeError) {
    const msg = (error.message || '').toLowerCase();
    return msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('load failed') || msg.includes('network');
  }
  return false;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sidequest_jwt_token');
}

export function setStoredToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sidequest_jwt_token', token);
  }
}

export function removeStoredToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sidequest_jwt_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint}`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    // Allow caller-provided signal to also abort
    const callerSignal = options.signal as AbortSignal | undefined;
    if (callerSignal) {
      if (callerSignal.aborted) controller.abort();
      else callerSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (isRetryableStatus(response.status) && attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS);
          continue;
        }
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
      }

      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return undefined as unknown as T;
      }
      const text = await response.text();
      if (!text) return undefined as unknown as T;
      try {
        return JSON.parse(text) as T;
      } catch {
        return undefined as unknown as T;
      }
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      const retryable = isNetworkError(error) || (error instanceof Error && error.message.startsWith('API Error 50'));
      // Also catch explicit retryable status already handled above; here handle network/timeout
      if (retryable && attempt < MAX_RETRIES) {
        // Don't retry on explicit 4xx client errors that slipped through as Error with 4xx — those are not retryable
        if (error instanceof Error && /^API Error (4\d\d):/.test(error.message)) {
          throw error;
        }
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      throw error;
    }
  }
  throw new Error('API request failed after retries');
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ accessToken: string; tokenType: string; userId: string; email: string; fullName: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (data: { email: string; password: string; fullName: string; major: string; username: string }) =>
      request<{ accessToken: string; tokenType: string; userId: string; email: string; fullName: string; username: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  profiles: {
    getMe: () => request<any>('/profiles/me'),
    getById: (userId: string) => request<any>(`/profiles/${userId}`),
    updateMe: (data: any) =>
      request<any>('/profiles/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
  skills: {
    getSkillTree: () => request<any[]>('/skills'),
    upsertMySkill: (data: { skillId: string; rankTier: string }) =>
      request<any>('/skills/me', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    removeMySkill: (skillId: string) =>
      request<void>(`/skills/me/${skillId}`, {
        method: 'DELETE',
      }),
  },
  projects: {
    create: (data: { title: string; description: string; repoLink?: string; roles: Array<{ roleTitle: string; spotCount: number; requiredSkillIds?: string[] }> }) =>
      request<any>('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    list: (params?: { skill?: string; search?: string; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.skill) searchParams.append('skill', params.skill);
      if (params?.search) searchParams.append('search', params.search);
      if (params?.status) searchParams.append('status', params.status);
      const qs = searchParams.toString();
      return request<any[]>(`/projects${qs ? `?${qs}` : ''}`);
    },
    getById: (id: string) => request<any>(`/projects/${id}`),
    applyToRole: (projectId: string, roleId: string) =>
      request<any>(`/projects/${projectId}/roles/${roleId}/apply`, {
        method: 'POST',
      }),
    getApplications: (projectId: string) => request<any[]>(`/projects/${projectId}/applications`),
    delete: (projectId: string) =>
      request<void>(`/projects/${projectId}`, {
        method: 'DELETE',
      }),
    vote: (projectId: string, type: 'UP' | 'DOWN') =>
      request<any>(`/projects/${projectId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ type }),
      }),
    getVote: (projectId: string) => request<any>(`/projects/${projectId}/vote`),
  },
  applications: {
    updateStatus: (applicationId: string, status: 'ACCEPTED' | 'REJECTED') =>
      request<any>(`/applications/${applicationId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    getMyApplications: () => request<any[]>('/applications/me'),
    withdraw: (applicationId: string) =>
      request<void>(`/applications/${applicationId}`, {
        method: 'DELETE',
      }),
  },
};
