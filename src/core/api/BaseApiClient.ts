import { Config } from '../config/Config.js';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export class BaseApiClient<T> {
  protected readonly baseUrl: string;

  constructor(protected readonly endpoint: string = '') {
    this.baseUrl = Config.getConfig().baseUrl;
  }

  public async getAll(): Promise<ApiResponse<T[]>> {
    return this.request<T[]>(this.endpoint);
  }

  public async getById(id: string | number): Promise<ApiResponse<T>> {
    return this.request<T>(`${this.endpoint}/${id}`);
  }

  public async create(entity: Omit<T, 'id'>): Promise<ApiResponse<T>> {
    return this.request<T>(this.endpoint, {
      method: 'POST',
      body: JSON.stringify(entity),
    });
  }

  public async update(
    id: string | number,
    entity: Partial<T>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(`${this.endpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entity),
    });
  }

  public async delete(
    id: string | number,
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>(`${this.endpoint}/${id}`, {
      method: 'DELETE',
    });
  }

  protected buildUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.baseUrl}/${cleanPath}`;
  }

  protected async request<R>(
    path: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<R>> {
    const url = this.buildUrl(path);
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} url: ${url}`);
    }
    const data = await response.json();
    return { data, status: response.status };
  }
}
