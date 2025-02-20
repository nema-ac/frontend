interface Config {
  api: {
    baseUrl: string;
  };
}

function getApiBaseUrl(): string {
  // For production (deployed on fly.io)
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // For local development
  return 'http://localhost:3001';
}

export const config: Config = {
  api: {
    baseUrl: getApiBaseUrl(),
  },
};
