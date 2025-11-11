import { buildApiUrl } from './api';

export interface RoomDTO {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  roomSize: number;
  numBedrooms: number;
  numBathrooms: number;
  availableFrom?: string;
  isRoomAvailable: boolean;
  city?: string;
  district?: string;
  ward?: string;
  street?: string;
  addressDetails?: string;
  imageUrls: string[];
  createdAt?: string;
  updatedAt?: string;
  ownerId?: number;
  ownerName?: string;
  ownerVerified?: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface FilterParam {
  city?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  minSize?: number;
  maxSize?: number;
  numBedrooms?: number;
  numBathrooms?: number;
  isAvailable?: boolean;
}

/**
 * Fetch all rooms with optional filters
 */
export const getRooms = async (filters?: FilterParam): Promise<RoomDTO[]> => {
  try {
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = buildApiUrl(
      `/api/rooms${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
    );

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch rooms: ${response.statusText}`);
    }

    const result: ApiResponse<RoomDTO[]> = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

/**
 * Fetch a single room by ID
 */
export const getRoomById = async (id: string | number): Promise<RoomDTO> => {
  try {
    const url = buildApiUrl(`/api/rooms/${id}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch room: ${response.statusText}`);
    }

    const result: ApiResponse<RoomDTO> = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching room:', error);
    throw error;
  }
};

/**
 * Convert RoomDTO to the format expected by the UI components
 */
export const mapRoomDTOToUIRoom = (room: RoomDTO): any => {
  return {
    id: room.id.toString(),
    title: room.title,
    price: room.price,
    location:
      room.location || `${room.city || ''}, ${room.district || ''}`.trim(),
    area: room.roomSize,
    images:
      room.imageUrls.length > 0
        ? room.imageUrls
        : ['https://via.placeholder.com/300x200/6200ee/ffffff?text=Room'],
    amenities: [], // You can populate this based on your backend data structure
    saved: false, // This should come from user's saved rooms
    rating: room.rating || 0,
    reviewCount: room.reviewCount || 0,
    landlord: {
      name: room.ownerName || 'Unknown',
      verified: room.ownerVerified || false,
    },
    availableFrom: room.availableFrom
      ? new Date(room.availableFrom).toLocaleDateString()
      : room.isRoomAvailable
        ? 'Available Now'
        : 'Not Available',
    roomType: room.numBedrooms
      ? room.numBedrooms === 1
        ? '1 Bedroom'
        : `${room.numBedrooms} Bedrooms`
      : 'Studio',
    distanceToCenter: 0, // You can calculate this based on coordinates if available
    description: room.description,
    numBedrooms: room.numBedrooms,
    numBathrooms: room.numBathrooms,
    roomSize: room.roomSize,
    city: room.city,
    district: room.district,
    ward: room.ward,
    street: room.street,
    addressDetails: room.addressDetails,
    isRoomAvailable: room.isRoomAvailable,
  };
};
