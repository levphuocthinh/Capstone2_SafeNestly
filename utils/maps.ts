import { API_URL } from '../constants/env';

export type LocationData = {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId: string;
};

export type NearbyPlace = {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  type: string;
  distanceInMeters: number;
};

export type LocationApiResponse = {
  status: 'SUCCESS' | 'ERROR';
  message?: string;
  location: LocationData;
  nearbyPlaces?: NearbyPlace[];
};

export async function searchLocation(
  address: string,
  signal?: AbortSignal,
): Promise<LocationApiResponse> {
  if (!API_URL) {
    throw new Error('API_URL is not set');
  }

  const res = await fetch(`${API_URL}/maps/locations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.NODE_ENV === 'development'
        ? { 'ngrok-skip-browser-warning': 'true' }
        : {}),
    },
    body: JSON.stringify({ address }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed with ${res.status}`);
  }

  const data = (await res.json()) as LocationApiResponse;
  return data;
}
