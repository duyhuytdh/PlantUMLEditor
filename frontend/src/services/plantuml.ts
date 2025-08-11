import axios, { AxiosError } from 'axios';
import { PlantUMLResponse, PlantUMLError, HealthCheckResponse, PlantUMLCheckResponse } from '../types/api';

// API Base URL - supports environment variables for Docker
const getApiBaseUrl = (): string => {
  // Check environment variable (for Docker)
  if (import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production with nginx proxy, use relative path
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return '/api';
  }
  
  // Development mode - direct connection
  return 'http://localhost:8090';
};

const API_BASE_URL = getApiBaseUrl();

export class PlantUMLService {
  static async generateSVG(plantumlText: string): Promise<PlantUMLResponse> {
    try {
      const response = await axios.post<PlantUMLResponse>(`${API_BASE_URL}/api/plantuml/svg`, {
        plantumlText
      }, {
        timeout: 15000, // 15 second timeout
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout - server may be busy');
        }
        if (error.response) {
          const errorData = error.response.data as PlantUMLError;
          throw new Error(errorData.error || 'Failed to generate diagram');
        }
        if (error.request) {
          throw new Error('Network error - cannot reach server');
        }
      }
      throw new Error('Unknown error occurred');
    }
  }

  static async healthCheck(): Promise<HealthCheckResponse> {
    const response = await axios.get<HealthCheckResponse>(`${API_BASE_URL}/api/plantuml/health`, {
      timeout: 5000, // 5 second timeout for health check
    });
    return response.data;
  }

  static async checkPlantUMLJar(): Promise<PlantUMLCheckResponse> {
    // Use the info endpoint instead of the old check endpoint
    const response = await axios.get<PlantUMLCheckResponse>(`${API_BASE_URL}/api/plantuml/info`);
    return response.data;
  }
}
