import { api, ApiResponse } from '../utils/fetcher';

// UserProfile interface matching the component's structure
export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  verified: boolean;
  memberSince: string;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    locationTracking: boolean;
  };
}

// Extended API response type for profile endpoint
interface ProfileApiResponse extends ApiResponse {
  isVerified?: boolean;
  avatarUrl?: string;
  createdAt?: string;
}

// Helper function to format date
const formatMemberSince = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${month} ${year}`;
  } catch (error) {
    return '';
  }
};

// Default profile values
const defaultProfile: UserProfile = {
  name: '',
  email: '',
  phone: 'Not provided',
  avatar: 'https://via.placeholder.com/100x100',
  verified: false,
  memberSince: '',
  preferences: {
    notifications: true,
    emailUpdates: false,
    locationTracking: true,
  },
};

/**
 * Get user profile from API
 * @returns Promise with UserProfile object or error message
 */
export const getUserProfile = async (): Promise<{
  success: boolean;
  profile?: UserProfile;
  error?: string;
}> => {
  try {
    // Call API directly to get full response with all fields
    const data: ProfileApiResponse = await api
      .get('renterowner/get-profile')
      .json();

    if (data.statusCode === 200) {
      const profile: UserProfile = {
        name: data.fullName || '',
        email: data.email || '',
        phone: data.phone || 'Not provided',
        avatar: data.avatarUrl || 'https://via.placeholder.com/100x100',
        verified: data.isVerified || false,
        memberSince: formatMemberSince(data.createdAt),
        preferences: {
          notifications: true,
          emailUpdates: false,
          locationTracking: true,
        },
      };

      return {
        success: true,
        profile,
      };
    } else {
      return {
        success: false,
        error: data.message || 'Failed to load profile',
      };
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
};

// Export default profile for initialization
export { defaultProfile };
