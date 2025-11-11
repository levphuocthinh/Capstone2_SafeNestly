import { api, ApiResponse } from '../utils/fetcher';

// Backend RoomDTO interface (matches the Java RoomDTO)
export interface RoomDTO {
  id: number;
  title: string;
  description?: string;
  price?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  roomSize?: number;
  numBedrooms?: number;
  numBathrooms?: number;
  availableFrom?: Date | string;
  isRoomAvailable?: boolean;
  city?: string;
  district?: string;
  ward?: string;
  street?: string;
  addressDetails?: string;
  ownerName?: string;
  imageUrls?: string[];
  ownerId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const roomService = {
  // Get all rooms (public endpoint - no auth required)
  async getAllRooms(): Promise<RoomDTO[]> {
    try {
      const response = await api.get('api/rooms').json();

      if ((response as any).status === 200) {
        const rooms: RoomDTO[] = (response as any).data || [];
        return rooms;
      } else {
        throw new Error((response as any).message || 'Failed to fetch rooms');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  },

  // Get room by ID
  async getRoomById(id: string): Promise<RoomDTO> {
    try {
      const response: ApiResponse = await api.get(`api/rooms/${id}`).json();

      return (response as any).data as RoomDTO;
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  },

  // Get rooms by owner ID
  async getRoomsByOwner(ownerId: number): Promise<RoomDTO[]> {
    try {
      const response: ApiResponse = await api
        .get(`api/rooms/owner/${ownerId}`)
        .json();

      if (response.statusCode === 200) {
        const rooms: RoomDTO[] = (response as any).data || [];
        return rooms;
      } else {
        throw new Error(response.message || 'Failed to fetch owner rooms');
      }
    } catch (error) {
      console.error('Error fetching owner rooms:', error);
      throw error;
    }
  },

  // Get my rooms (current user's rooms)
  async getMyRooms(): Promise<RoomDTO[]> {
    try {
      const response: ApiResponse = await api.get('api/rooms/owner').json();

      if (response.statusCode === 200) {
        const rooms: RoomDTO[] = (response as any).data || [];
        return rooms;
      } else {
        throw new Error(response.message || 'Failed to fetch my rooms');
      }
    } catch (error) {
      console.error('Error fetching my rooms:', error);
      throw error;
    }
  },
};
