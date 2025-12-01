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

export interface RoomFilterParams {
  search?: string;
  filter?: string;
  page?: number;
  size?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export const roomService = {
  // Get all rooms (public endpoint - no auth required)
  async getAllRooms(filterParams?: RoomFilterParams): Promise<RoomDTO[]> {
    try {
      let url = 'api/rooms';
      const queryParams = new URLSearchParams();

      if (filterParams) {
        if (filterParams.search) {
          queryParams.append('search', filterParams.search);
        }
        if (filterParams.filter) {
          queryParams.append('filter', filterParams.filter);
        }
        if (filterParams.page !== undefined) {
          queryParams.append('page', filterParams.page.toString());
        }
        if (filterParams.size !== undefined) {
          queryParams.append('size', filterParams.size.toString());
        }
        if (filterParams.sort) {
          queryParams.append('sort', filterParams.sort);
        }
        if (filterParams.order) {
          queryParams.append('order', filterParams.order);
        }
      }

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      const response = await api.get(url).json();

      if ((response as any).status === 200) {
        const rooms: RoomDTO[] = (response as any).data || [];
        return rooms;
      } else {
        throw new Error((response as any).message || 'Failed to fetch rooms');
      }
    } catch (error: any) {
      // Handle 404 - Backend returns 404 when no rooms found (NotFoundException)
      // This is a valid case when filters don't match any rooms
      // ky throws HTTPError which has a response property
      if (error?.name === 'HTTPError' || error?.response) {
        const status = error.response?.status;
        if (status === 404) {
          // Try to get message from response body
          try {
            const errorBody = await error.response.json();
            console.log(
              'No rooms found:',
              errorBody.message || 'No rooms matching filters',
            );
          } catch {
            console.log('No rooms found matching the filters');
          }
          return [];
        }
      }

      // Also check for status code directly in error object (fallback)
      if (error?.status === 404) {
        console.log('No rooms found matching the filters');
        return [];
      }

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
