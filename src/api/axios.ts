import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const api = axios.create({
  baseURL: import.meta.env.VITE_DOMAIN_PATH,
})

export const isAxiosError = axios.isAxiosError

api.interceptors.request.use((config) => {
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: CustomAxiosRequestConfig | undefined = error.config

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true
      try {
        // do intercept
        return axios.request(error.config)
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 403) {
          await logout()
          return
        }
      }
    } else {
      if (error instanceof AxiosError) {
        throw error
      }
      throw new AxiosError(
        error.message,
        error.code,
        error.config,
        error.request,
        error.response
      )
    }

    return Promise.reject(error)
  }
)

function logout() {}

export default api
