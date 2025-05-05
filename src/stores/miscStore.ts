import Cookies from 'js-cookie'
import { create } from 'zustand'

interface DefaultState {
	isDeferredDiscarded: boolean
	setIsDeferredDiscarded: (
		isDeferredDiscarded: boolean,
		position?: 'bottom' | 'center'
	) => void
	iosPromptPosition: 'bottom' | 'center'
}

const MISC_TOKEN = import.meta.env.VITE_COOKIE_MISC_TOKEN
const PERSIST_7_DAYS = 7 * 24 * 60 * 60

export const useMiscellaneousStore = create<DefaultState>()((set) => {
	const miscToken = Cookies.get(MISC_TOKEN)
	const initToken = miscToken ? JSON.parse(miscToken) : null

	return {
		isDeferredDiscarded: !!initToken,
		iosPromptPosition: 'bottom',
		setIsDeferredDiscarded: (isDeferredDiscarded, position = 'bottom') => {
			Cookies.set(MISC_TOKEN, JSON.stringify(isDeferredDiscarded), {
				expires: PERSIST_7_DAYS,
			})
			set({ isDeferredDiscarded, iosPromptPosition: position })
		},
	}
})
