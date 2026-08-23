/**
 * api.ts
 * ---------------------------------------------------------------------------
 * API helper service for connecting Next.js frontend with Spring Boot backend.
 * Uses localStorage to persist JWT tokens across sessions.
 * ---------------------------------------------------------------------------
 */

const API_BASE = '/api/v1';

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

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ accessToken: string; tokenType: string; userId: string; email: string; fullName: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (data: { email: string; password: string; fullName: string; major: string; collegeYear: number }) =>
      request<{ accessToken: string; tokenType: string; userId: string; email: string; fullName: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  profiles: {
    getMe: () => request<any>('/profiles/me'),
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
  },
  applications: {
    updateStatus: (applicationId: string, status: 'ACCEPTED' | 'REJECTED') =>
      request<any>(`/applications/${applicationId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    getMyApplications: () => request<any[]>('/applications/me'),
  },
};
