import Cookies from 'js-cookie'
import { create } from 'zustand'
import { User } from '@/api/services/user/schema.ts'

export enum Languages {
	HR = 'hr',
	EN = 'en',
}

interface AuthState {
	auth: {
		user: User | null
		lang: Languages | null
		setLang: (lang: Languages) => void
		setUser: (user: User | null) => void
		accessToken: string | null
		sessionId: string | null
		setSessionId: (id: string | null) => void
		setAccessToken: (accessToken: string) => void
		resetAccessToken: () => void
		reset: () => void
	}
}

const ACCESS_TOKEN = import.meta.env.VITE_COOKIE_ACCESS_TOKEN

export const useAuthStore = create<AuthState>()((set) => {
	const cookieState = Cookies.get(ACCESS_TOKEN)
	const initToken = cookieState ? JSON.parse(cookieState) : null
	return {
		auth: {
			user: null,
			setUser: (user) =>
				set((state) => ({ ...state, auth: { ...state.auth, user } })),
			accessToken: initToken,
			sessionId: null,
			setAccessToken: (accessToken) =>
				set((state) => {
					Cookies.set(ACCESS_TOKEN, JSON.stringify(accessToken))
					return { ...state, auth: { ...state.auth, accessToken } }
				}),
			resetAccessToken: () =>
				set((state) => {
					Cookies.remove(ACCESS_TOKEN)
					return { ...state, auth: { ...state.auth, accessToken: '' } }
				}),
			lang: null,
			setLang: (lang) => {
				set((state) => {
					return { ...state, auth: { ...state.auth, lang } }
				})
			},
			setSessionId: (id) => {
				set((state) => {
					return { ...state, auth: { ...state.auth, sessionId: id } }
				})
			},
			reset: () =>
				set((state) => {
					Cookies.remove(ACCESS_TOKEN)
					return {
						...state,
						auth: { ...state.auth, user: null, accessToken: '' },
					}
				}),
		},
	}
})

// export const useAuth = () => useAuthStore((state) => state.auth)
