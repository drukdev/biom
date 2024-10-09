export interface ResponseType {
  statusCode: number;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
  timestamp?: string;
}

export interface retryOptions {
  retries: number;
  factor: number;
  minTimeout: number;
  onRetry: (e: { message: string }, attempt: number) => void;
}
