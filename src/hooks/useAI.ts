import { useState } from 'react';

interface UseAIOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useAI(endpoint: string, options?: UseAIOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const execute = async (payload: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ai/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI request failed');
      }

      const result = await response.json();
      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    execute,
    loading,
    error,
    data,
    reset: () => {
      setError(null);
      setData(null);
    },
  };
}

// Specific hooks for different AI features
export function useVenueDescriptionGenerator(options?: UseAIOptions) {
  return useAI('generate-description', options);
}

export function useEventSuggestionsGenerator(options?: UseAIOptions) {
  return useAI('event-suggestions', options);
}

export function useSearchSuggestionsGenerator(options?: UseAIOptions) {
  return useAI('search-suggestions', options);
}