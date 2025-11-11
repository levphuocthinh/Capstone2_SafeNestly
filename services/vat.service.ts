import ky from 'ky';
import { VAT_SERVICE_URL } from '../constants/env';
import { RoomDTO } from './room.service';
import { NearbyPlace, LocationData, LocationResponse } from './maps.service';

// Safety Score Response interface matching VAT model API
export interface SafetyScoreResponse {
  property_id: number;
  crime_score: number;
  user_score: number;
  environment_score: number;
  overall_score: number;
  last_updated_at: string;
  ai_summary: string | null;
}

// Property format for VAT API request
interface VATPropertyRequest {
  id: number;
  title: string;
  description?: string;
  price?: number;
  roomSize?: number;
  numBedrooms?: number;
  numBathrooms?: number;
  isRoomAvailable?: boolean;
  availableFrom?: string | null;
  ownerId?: number;
  ownerName?: string;
  location: {
    formattedAddress: string;
    latitude: number;
    longitude: number;
    placeId: string;
  };
  imageUrls?: string[];
}

// Safety Score Request interface
export interface SafetyScoreRequest {
  property: VATPropertyRequest;
  nearbyPlaces: NearbyPlace[];
}

export const vatService = {
  // Get safety score and AI summary for a property
  async getSafetyScore(
    propertyId: number,
    property: RoomDTO,
    locationData: LocationResponse,
  ): Promise<SafetyScoreResponse> {
    try {
      if (!VAT_SERVICE_URL) {
        throw new Error('VAT_SERVICE_URL is not configured');
      }

      // Format property data according to VAT API specification
      const vatProperty: VATPropertyRequest = {
        id: propertyId,
        title: property.title,
        description: property.description,
        price: property.price,
        roomSize: property.roomSize,
        numBedrooms: property.numBedrooms,
        numBathrooms: property.numBathrooms,
        isRoomAvailable: property.isRoomAvailable ?? true,
        availableFrom: property.availableFrom
          ? typeof property.availableFrom === 'string'
            ? property.availableFrom
            : property.availableFrom.toISOString()
          : null,
        ownerId: property.ownerId,
        ownerName: property.ownerName,
        location: {
          formattedAddress: locationData.location.formattedAddress,
          latitude: locationData.location.latitude,
          longitude: locationData.location.longitude,
          placeId: locationData.location.placeId,
        },
        imageUrls: property.imageUrls || [],
      };

      const requestBody: SafetyScoreRequest = {
        property: vatProperty,
        nearbyPlaces: locationData.nearbyPlaces,
      };

      const response = await ky
        .post(`${VAT_SERVICE_URL}/api/v1/properties/${propertyId}/safety`, {
          json: requestBody,
          timeout: 60000, // 60 second timeout for AI processing
        })
        .json<SafetyScoreResponse>();

      return response;
    } catch (error) {
      console.error('Error fetching safety score:', error);
      throw error;
    }
  },
};
