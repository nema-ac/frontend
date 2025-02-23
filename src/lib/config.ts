interface Config {
  api: {
    baseUrl: string;
  };
}

function getApiBaseUrl(): string {
  if (process.env.API_BASE_URL) {
    return process.env.API_BASE_URL;
  }

  return 'http://localhost:3001';
}

export const config: Config = {
  api: {
    baseUrl: getApiBaseUrl(),
  },
};
