export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi(
  baseUrl: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<unknown> {
  const url = `${baseUrl}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message || 'An error occurred');
  }

  return data;
}

export function createApiClient(baseUrl: string) {
  return {
    get: <T>(endpoint: string, options?: RequestInit) =>
      fetchApi(baseUrl, endpoint, { ...options, method: 'GET' }) as Promise<T>,

    post: <T>(endpoint: string, data: unknown, options?: RequestInit) =>
      fetchApi(baseUrl, endpoint, {
        ...options,
        method: 'POST',
        body: JSON.stringify(data),
      }) as Promise<T>,
  };
}

interface WalletCheckResponse {
  exists: boolean;
  projected_amount: number | null;
}

interface WalletEligibilityResult {
  isEligible: boolean;
  projectedAmount?: number;
  message: string;
}

export async function checkWalletEligibility(baseUrl: string, walletAddress: string): Promise<WalletEligibilityResult> {
  try {
    const apiClient = createApiClient(baseUrl);
    const response = await apiClient.get<WalletCheckResponse>(`/check-wallet/${walletAddress}`);

    if (response.exists) {
      return {
        isEligible: true,
        projectedAmount: response.projected_amount!,
        message: 'Congratulations! Your wallet is eligible for the $NEMA airdrop. ' +
          'Please note that the projected amount shown is an estimate and the final ' +
          'amount may vary when the airdrop contract is deployed.'
      };
    } else {
      return {
        isEligible: false,
        message: 'We were unable to find your wallet in our airdrop list. ' +
          'If you believe this is a mistake, please reach out to us in the Telegram channel ' +
          'for manual verification. Please note that manual verification does not guarantee ' +
          'inclusion in the airdrop.'
      };
    }
  } catch (error) {
    // Handle API errors
    const errorMessage = error instanceof ApiError
      ? `API Error: ${error.message}`
      : 'An unexpected error occurred while checking wallet eligibility';

    return {
      isEligible: false,
      message: `${errorMessage}. Please try again later or contact support if the issue persists.`
    };
  }
}

interface LinkWalletRequest {
  solanaAddress: string;
  ethAddress: string;
  signature: string;
  message: string;
}

interface LinkWalletResponse {
  success: boolean;
  message: string;
}

export async function linkWalletAddresses(
  baseUrl: string,
  solanaAddress: string,
  ethAddress: string,
  signature: string,
  message: string
): Promise<LinkWalletResponse> {
  try {
    const apiClient = createApiClient(baseUrl);
    const payload: LinkWalletRequest = {
      solanaAddress,
      ethAddress,
      signature,
      message
    };

    const response = await apiClient.post<LinkWalletResponse>('/link-wallet', payload);
    return response;
  } catch (error) {
    const errorMessage = error instanceof ApiError
      ? `API Error: ${error.message}`
      : 'An unexpected error occurred while linking wallets';

    return {
      success: false,
      message: errorMessage
    };
  }
}

interface CheckLinkResponse {
  linked: boolean;
  eth_address?: string;
}

export async function checkWalletLink(baseUrl: string, solanaAddress: string): Promise<CheckLinkResponse> {
  try {
    const apiClient = createApiClient(baseUrl);
    return await apiClient.get<CheckLinkResponse>(`/check-link/${solanaAddress}`);
  } catch {
    return {
      linked: false
    };
  }
}
