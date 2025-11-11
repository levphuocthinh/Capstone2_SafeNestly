import { api, ApiResponse } from '../utils/fetcher';

// Backend RoomDTO interface (matches the Java RoomDTO)
export interface RoomDTO {
  id: number;
  title: string;
  description?: string;
  price?: number;
  location?: string;
  roomSize?: number;
  numBedrooms?: number;
  numBathrooms?: number;
  availableFrom?: string;
  isRoomAvailable?: boolean;
  city?: string;
  district?: string;
  ward?: string;
  street?: string;
  addressDetails?: string;
  imageUrls?: string[];
  ownerId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Frontend Room interface (matches the mobile app)
export interface Room {
  id: string;
  title: string;
  price: number;
  location: string;
  area: number;
  images: string[];
  amenities: string[];
  saved: boolean;
  rating: number;
  reviewCount: number;
  landlord: {
    name: string;
    verified: boolean;
  };
  availableFrom: string;
  roomType: string;
  distanceToCenter: number;
}

// Transform backend RoomDTO to frontend Room interface
const transformRoomDTO = (roomDTO: RoomDTO): Room => {
  return {
    id: roomDTO.id.toString(),
    title: roomDTO.title,
    price: roomDTO.price || 0,
    location:
      roomDTO.location ||
      `${roomDTO.city || ''} ${roomDTO.district || ''} ${roomDTO.ward || ''}`.trim(),
    area: roomDTO.roomSize || 0,
    images: roomDTO.imageUrls || [],
    amenities: [], // TODO: Add amenities from backend when available
    saved: false, // TODO: Add saved status from backend when available
    rating: 4.5, // TODO: Add rating from backend when available
    reviewCount: 0, // TODO: Add review count from backend when available
    landlord: {
      name: 'Landlord', // TODO: Add landlord info from backend when available
      verified: true, // TODO: Add verification status from backend when available
    },
    availableFrom: roomDTO.availableFrom || 'Available Now',
    roomType:
      roomDTO.numBedrooms === 1
        ? '1 Bedroom'
        : roomDTO.numBedrooms === 0
          ? 'Studio'
          : `${roomDTO.numBedrooms} Bedrooms`,
    distanceToCenter: 0, // TODO: Calculate distance when location data is available
  };
};

export const roomService = {
  // Get all rooms (public endpoint - no auth required)
  async getAllRooms(): Promise<Room[]> {
    try {
      const response = await api.get('api/rooms').json();

      if ((response as any).status === 200) {
        const rooms: RoomDTO[] = (response as any).data || [];
        return rooms.map(transformRoomDTO);
      } else {
        throw new Error((response as any).message || 'Failed to fetch rooms');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  },

  // Get room by ID
  async getRoomById(id: string): Promise<Room> {
    try {
      const response: ApiResponse = await api.get(`api/rooms/${id}`).json();

      if (response.statusCode === 200 && (response as any).data) {
        return transformRoomDTO((response as any).data);
      } else {
        throw new Error(response.message || 'Failed to fetch room');
      }
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  },

  // Get rooms by owner ID
  async getRoomsByOwner(ownerId: number): Promise<Room[]> {
    try {
      const response: ApiResponse = await api
        .get(`api/rooms/owner/${ownerId}`)
        .json();

      if (response.statusCode === 200) {
        const rooms: RoomDTO[] = (response as any).data || [];
        return rooms.map(transformRoomDTO);
      } else {
        throw new Error(response.message || 'Failed to fetch owner rooms');
      }
    } catch (error) {
      console.error('Error fetching owner rooms:', error);
      throw error;
    }
  },

  // Get my rooms (current user's rooms)
  async getMyRooms(): Promise<Room[]> {
    try {
      const response: ApiResponse = await api.get('api/rooms/owner').json();

      if (response.statusCode === 200) {
        const rooms: RoomDTO[] = (response as any).data || [];
        return rooms.map(transformRoomDTO);
      } else {
        throw new Error(response.message || 'Failed to fetch my rooms');
      }
    } catch (error) {
      console.error('Error fetching my rooms:', error);
      throw error;
    }
  },
};
