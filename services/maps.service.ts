import { api } from '../utils/fetcher';

// LocationData interface matching backend DTO
export interface LocationData {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

// NearbyPlace interface matching backend DTO
export interface NearbyPlace {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  placeId: string;
  rating: number;
  type: string;
  distanceInMeters: number;
}

// LocationResponse interface matching backend DTO
export interface LocationResponse {
  status: string;
  message: string;
  location: LocationData;
  nearbyPlaces: NearbyPlace[];
}

// LocationSearchRequest interface matching backend DTO
export interface LocationSearchRequest {
  address: string;
  longitude?: number;
  latitude?: number;
}

// LocationMarkerRequest interface matching backend DTO
export interface LocationMarkerRequest {
  address: string;
  id: number;
}

// LocationMarkerResponse interface matching backend DTO
export interface LocationMarkerResponse {
  id: number;
  address: string;
  longitude: number;
  latitude: number;
}

export const mapsService = {
  // Search location by address
  async searchLocation(
    request: LocationSearchRequest,
  ): Promise<LocationResponse> {
    try {
      const response = await api
        .post('maps/locations', {
          json: request,
        })
        .json();

      return response as LocationResponse;
    } catch (error) {
      console.error('Error searching location:', error);
      throw error;
    }
  },

  // Get markers for multiple locations
  async getMarkers(
    requests: LocationMarkerRequest[],
  ): Promise<LocationMarkerResponse[]> {
    try {
      const response = await api
        .post('maps/markers', {
          json: requests,
        })
        .json();

      return response as LocationMarkerResponse[];
    } catch (error) {
      console.error('Error fetching markers:', error);
      throw error;
    }
  },
};
