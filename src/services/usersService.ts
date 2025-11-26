import axiosInstance from '../utils/axios'
import { API_ENDPOINTS } from '../config/api'

class UsersService {
  async getProfile(): Promise<any> {
    const response = await axiosInstance.get(API_ENDPOINTS.USERS.ME)
    return response.data
  }

  async uploadAvatar(file: File): Promise<any> {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await axiosInstance.post(API_ENDPOINTS.USERS.AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async updateProfile(data: { fullName?: string }): Promise<any> {
    const payload: Record<string, any> = {}
    if (data.fullName !== undefined) {
      payload.full_name = data.fullName
    }

    const response = await axiosInstance.patch(API_ENDPOINTS.USERS.ME, payload)
    return response.data
  }
}

const usersService = new UsersService()
export default usersService
