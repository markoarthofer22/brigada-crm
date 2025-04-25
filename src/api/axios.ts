import axios, { AxiosError } from 'axios'
import createAuthRefreshInterceptor from 'axios-auth-refresh'
import { getUserRefreshToken } from '@/api/services/authorization/authorization.ts'
import { useAuthStore } from '@/stores/authStore.ts'

const api = axios.create({
	baseURL: import.meta.env.VITE_DOMAIN_PATH,
})

export const isAxiosError = axios.isAxiosError

api.interceptors.request.use((config) => {
	const accessToken = useAuthStore.getState().auth.accessToken

	if (accessToken) {
		config.headers['Authorization'] = 'Bearer ' + accessToken
	}
	return config
})

createAuthRefreshInterceptor(api, refreshAuthLogic)

/**
 * Refreshes the authentication token and retries the failed request.
 * If the token refresh fails, the user is logged out.
 *
 * @param failedRequest - The Axios error object representing the failed request.
 * @returns A promise that resolves after retrying the request or rejects if the token refresh fails.
 */
async function refreshAuthLogic(failedRequest: AxiosError) {
	if (
		failedRequest?.response?.status === 401 &&
		failedRequest?.config?.url !== '/user/login'
	) {
		try {
			const refreshToken = useAuthStore.getState().auth.refreshToken
			const setAccessToken = useAuthStore.getState().auth.setAccessToken
			const setRefreshToken = useAuthStore.getState().auth.setRefreshToken

			if (!refreshToken) {
				useAuthStore.getState().auth.reset()
				return Promise.reject(failedRequest)
			}

			const newToken = await getUserRefreshToken(refreshToken)

			if (!newToken.refresh_token && !newToken.access_token) {
				useAuthStore.getState().auth.reset()
				return Promise.reject(failedRequest)
			}

			setRefreshToken(newToken.refresh_token)
			setAccessToken(newToken.access_token)

			if (failedRequest.config?.headers) {
				failedRequest.config.headers['Authorization'] =
					`Bearer ${newToken.access_token}`
			}

			return Promise.resolve()
		} catch (error) {
			useAuthStore.getState().auth.reset()
			return Promise.reject(error)
		}
	}
}

export async function logout() {
	const response = await axios.post(
		import.meta.env.VITE_DOMAIN_PATH + '/user/logout',
		{}
	)

	return response.data
}

export default api
