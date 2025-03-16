import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Outlet, useRouter } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { useGetGlobalSettings } from '@/api/services/globals/options.ts'
import { useAuthStore } from '@/stores/authStore.ts'
import { useLoader } from '@/context/loader-provider.tsx'
import { useTheme } from '@/context/theme-context.tsx'
import { Toaster } from '@/components/ui/sonner.tsx'

const Root = () => {
	const user = useAuthStore((state) => state.auth.user)
	const setLanguage = useAuthStore((state) => state.auth.setLang)
	const setUser = useAuthStore((state) => state.auth.setUser)
	const { showLoader, hideLoader } = useLoader()
	const { theme } = useTheme()
	const globalSettingsQuery = useQuery(useGetGlobalSettings())
	const router = useRouter()

	useEffect(() => {
		if (user?.id_users) return

		if (!globalSettingsQuery.data) return

		setLanguage(globalSettingsQuery.data.lang)

		if (globalSettingsQuery.data?.user) {
			setUser(globalSettingsQuery.data.user)
		}
	}, [globalSettingsQuery.data, router, setLanguage, setUser, user?.id_users])

	useEffect(() => {
		if (globalSettingsQuery.isLoading) {
			showLoader()
		} else {
			hideLoader()
		}
	}, [globalSettingsQuery.isLoading])

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
