import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Outlet, useRouter } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import {
	getGlobalSettings,
	pingServer,
} from '@/api/services/globals/options.ts'
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
	const isOnline = useMiscellaneousStore((state) => state.isOnline)
	const setIsOnline = useMiscellaneousStore((state) => state.setIsOnline)
	const { showLoader, hideLoader } = useLoader()
	const { theme } = useTheme()
	const globalSettingsQuery = useQuery({
		...getGlobalSettings(),
		enabled: !!authToken && isOnline,
	})

	const pingServerQuery = useQuery({
		...pingServer(),
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
			const onNoConnection = window.location.pathname === '/no-connection'
			if (!online && !onNoConnection) {
				window.location.replace('/no-connection')
			}
		}

		function handleOnline() {
			update(true)
		}
		function handleOffline() {
			update(false)
		}

		const isOnNoConnectionPage = window.location.pathname === '/no-connection'
		if (!isOnNoConnectionPage) {
			update(navigator.onLine)
		}

		window.addEventListener('online', handleOnline)
		window.addEventListener('offline', handleOffline)

		return () => {
			window.removeEventListener('online', handleOnline)
			window.removeEventListener('offline', handleOffline)
		}
	}, [setIsOnline])

	useEffect(() => {
		if (user?.id_users || !authToken) return

		const isOnNoConnection = window.location.pathname === '/no-connection'
		if (pingServerQuery.isError && !isOnNoConnection) {
			window.location.replace('/no-connection')
		}
	}, [authToken, pingServerQuery.isError, user?.id_users])

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
