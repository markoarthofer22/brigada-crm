import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Outlet, useRouter } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { getGlobalSettings } from '@/api/services/globals/options.ts'
import { useAuthStore } from '@/stores/authStore.ts'
import { useMiscellaneousStore } from '@/stores/miscStore.ts'
import { useLoader } from '@/context/loader-provider.tsx'
import { useTheme } from '@/context/theme-context.tsx'
import { Toaster } from '@/components/ui/sonner.tsx'

const Root = () => {
	const user = useAuthStore((state) => state.auth.user)
	const setLanguage = useAuthStore((state) => state.auth.setLang)
	const setSession = useAuthStore((state) => state.auth.setSessionId)
	const setUser = useAuthStore((state) => state.auth.setUser)
	const setQuestionTypes = useAuthStore((state) => state.auth.setQuestionTypes)
	const authToken = useAuthStore((state) => state.auth.accessToken)
	const setIsOnline = useMiscellaneousStore((state) => state.setIsOnline)
	const { showLoader, hideLoader } = useLoader()
	const { theme } = useTheme()
	const globalSettingsQuery = useQuery({
		...getGlobalSettings(),
		enabled: !!authToken,
	})
	const router = useRouter()

	useEffect(() => {
		if (user?.id_users || !authToken) return

		if (!globalSettingsQuery.data) return

		setLanguage(globalSettingsQuery.data.lang)
		setSession(globalSettingsQuery.data.session_id)

		if (globalSettingsQuery.data?.user) {
			setUser(globalSettingsQuery.data.user)
		}

		setQuestionTypes(globalSettingsQuery.data.questions_types)
	}, [
		globalSettingsQuery.data,
		router,
		setLanguage,
		setQuestionTypes,
		setSession,
		setUser,
		user?.id_users,
	])

	useEffect(() => {
		if (globalSettingsQuery.isLoading) {
			showLoader()
		} else {
			hideLoader()
		}
	}, [globalSettingsQuery.isLoading])

	useEffect(() => {
		const update = (online: boolean) => {
			console.log('Network status changed:', online)
			setIsOnline(online)
			if (!online)
				router.navigate({
					to: '/no-connection',
				})
		}

		update(navigator.onLine)

		window.addEventListener('online', () => update(true))
		window.addEventListener('offline', () => update(false))

		return () => {
			window.removeEventListener('online', () => update(true))
			window.removeEventListener('offline', () => update(false))
		}
	}, [router, setIsOnline])

	if (globalSettingsQuery.isLoading) {
		return null
	}

	return (
		<>
			<Outlet />
			<Toaster
				position='top-right'
				richColors
				theme={theme as 'light' | 'dark' | 'system'}
			/>
			{import.meta.env.MODE === 'development' && (
				<>
					<ReactQueryDevtools buttonPosition='bottom-left' />
					<TanStackRouterDevtools position='bottom-right' />
				</>
			)}
		</>
	)
}

export default Root
