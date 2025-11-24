import { buildApiUrl } from '../utils/api';
import { getStoredToken } from '../utils/auth-storage';
import { RoomDTO } from './room.service';

// Interface cho ViewRequestCreateDTO từ backend
export interface ViewRequestCreateDTO {
  roomId: number;
  message: string;
}

// Interface cho ViewRequestDTO response từ backend
export interface ViewRequestDTO {
  id?: number;
  roomId?: number;
  tenantId?: number;
  ownerId?: number;
  message?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interface cho response từ API
export interface CreateViewRequestResponse {
  success: boolean;
  data?: ViewRequestDTO;
  error?: string;
  message?: string;
}

/**
 * Service để xử lý các thao tác liên quan đến View Request
 */
export const viewRequestService = {
  /**
   * Tạo yêu cầu xem phòng mới
   * @param roomId - ID của phòng
   * @param room - Thông tin phòng để tạo message tự động
   * @param customMessage - Message tùy chỉnh (optional)
   * @returns Promise<CreateViewRequestResponse>
   */
  async createViewRequest(
    roomId: number,
    room: RoomDTO,
    customMessage?: string,
  ): Promise<CreateViewRequestResponse> {
    try {
      // Lấy token từ storage
      const token = await getStoredToken();
      if (!token) {
        return {
          success: false,
          error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        };
      }

      // Tạo message tự động nếu không có custom message
      const message =
        customMessage ||
        `Tôi muốn xem phòng "${room.title}" tại ${
          room.location || [room.city, room.district].filter(Boolean).join(', ')
        }`;

      // Chuẩn bị request body
      const requestBody: ViewRequestCreateDTO = {
        roomId,
        message,
      };

      // Gọi API
      const response = await fetch(buildApiUrl('/api/view-requests'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      // Xử lý response
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          (response.status === 401
            ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
            : response.status === 403
              ? 'Bạn không có quyền thực hiện thao tác này.'
              : response.status === 400
                ? 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.'
                : `Không thể gửi yêu cầu (mã ${response.status}). Vui lòng thử lại sau.`);

        return {
          success: false,
          error: errorMessage,
        };
      }

      const data: ViewRequestDTO = await response.json();

      return {
        success: true,
        data,
        message: 'Yêu cầu xem phòng đã được gửi thành công.',
      };
    } catch (error) {
      console.error('Error creating view request:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Không thể gửi yêu cầu. Vui lòng kiểm tra kết nối mạng và thử lại.',
      };
    }
  },
};
