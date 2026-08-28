import { Config } from "../config/Config"

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export class BaseApiClient<T> {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async getAll(): Promise<ApiResponse<T[]>> {
    const response = await fetch(`${Config.getConfig().baseUrl}/${this.endpoint}`);
    const data = await response.json();
    return {
      data,
      status: response.status
    };
  }

  async getById(id: string | number): Promise<ApiResponse<T>> {
    const response = await fetch(`${Config.getConfig().baseUrl}/${this.endpoint}/${id}`);
    const data = await response.json();
    return {
      data,
      status: response.status
    };
  }

  async create(entity: Omit<T, 'id'>): Promise<ApiResponse<T>> {
    const response = await fetch(`${Config.getConfig().baseUrl}/${this.endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entity),
    });
    const data = await response.json();
    return {
      data,
      status: response.status
    };
  }

  async update(id: string | number, entity: Partial<T>): Promise<ApiResponse<T>> {
    const response = await fetch(`${Config.getConfig().baseUrl}/${this.endpoint}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entity),
    });
    const data = await response.json();
    return {
      data,
      status: response.status
    };
  }

  async delete(id: string | number): Promise<ApiResponse<{ success: boolean }>> {
    const response = await fetch(`${Config.getConfig().baseUrl}/${this.endpoint}/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return {
      data,
      status: response.status
    };
  }
}
