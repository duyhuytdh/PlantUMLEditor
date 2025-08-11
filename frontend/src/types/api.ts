export interface PlantUMLResponse {
  svg: string;
}

export interface PlantUMLError {
  error: string;
}

export interface HealthCheckResponse {
  status: string;
  message: string;
}

export interface PlantUMLCheckResponse {
  status: 'available' | 'missing';
  version?: string;
  path?: string;
  message?: string;
}
