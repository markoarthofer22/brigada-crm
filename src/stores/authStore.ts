import Cookies from 'js-cookie'
import { create } from 'zustand'
import { GlobalsSettings } from '@/api/services/globals/schema.ts'
import { User } from '@/api/services/user/schema.ts'

export enum Languages {
	HR = 'hr',
	EN = 'en',
}

interface AuthState {
	auth: {
		questionTypes: GlobalsSettings['questions_types'] | null
		setQuestionTypes: (
			questionTypes: GlobalsSettings['questions_types']
		) => void
		user: User | null
		lang: Languages | null
		setLang: (lang: Languages) => void
		setUser: (user: User | null) => void
		accessToken: string | null
		refreshToken: string | null
		setRefreshToken: (refreshToken: string) => void
		sessionId: string | null
		setSessionId: (id: string | null) => void
		setAccessToken: (accessToken: string) => void
		resetCookie: () => void
		reset: () => void
	}
}

const ACCESS_TOKEN = import.meta.env.VITE_COOKIE_ACCESS_TOKEN
const REFRESH_TOKEN = import.meta.env.VITE_COOKIE_REFRESH_TOKEN
const PERSIST_2_MONTHS = 60 * 24 * 60 * 60

export const useAuthStore = create<AuthState>()((set) => {
	const cookieAccessToken = Cookies.get(ACCESS_TOKEN)
	const cookieRefreshToken = Cookies.get(REFRESH_TOKEN)
	const initToken = cookieAccessToken ? JSON.parse(cookieAccessToken) : null
	const refreshToken = cookieRefreshToken
		? JSON.parse(cookieRefreshToken)
		: null
	return {
		auth: {
			questionTypes: null,
			user: null,
			setUser: (user) =>
				set((state) => ({ ...state, auth: { ...state.auth, user } })),
			accessToken: initToken,
			refreshToken,
			sessionId: null,
			setAccessToken: (accessToken) =>
				set((state) => {
					Cookies.set(ACCESS_TOKEN, JSON.stringify(accessToken), {
						expires: PERSIST_2_MONTHS,
					})
					return { ...state, auth: { ...state.auth, accessToken } }
				}),
			setRefreshToken: (refreshToken) =>
				set((state) => {
					Cookies.set(REFRESH_TOKEN, JSON.stringify(refreshToken), {
						expires: PERSIST_2_MONTHS,
					})
					return { ...state, auth: { ...state.auth, refreshToken } }
				}),
			resetCookie: () =>
				set((state) => {
					Cookies.remove(ACCESS_TOKEN)
					Cookies.remove(REFRESH_TOKEN)
					return {
						...state,
						auth: { ...state.auth, accessToken: null, refreshToken: null },
					}
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
			setQuestionTypes: (questionTypes) => {
				set((state) => {
					return { ...state, auth: { ...state.auth, questionTypes } }
				})
			},
		},
	}
})

// export const useAuth = () => useAuthStore((state) => state.auth)
