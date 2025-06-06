import { useEffect } from 'react'
import Cookies from 'js-cookie'
import {
	createFileRoute,
	Outlet,
	useLocation,
	useRouter,
} from '@tanstack/react-router'
import { UserType } from '@/api/services/user/schema.ts'
import { useAuthStore } from '@/stores/authStore.ts'
import { cn } from '@/lib/utils'
import { SearchProvider } from '@/context/search-context'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'

export const Route = createFileRoute('/_authenticated')({
	component: RouteComponent,
})

function RouteComponent() {
	const defaultOpen = Cookies.get('sidebar:state') !== 'false'
	const user = useAuthStore((state) => state.auth.user)
	const authToken = useAuthStore((state) => state.auth.accessToken)
	const router = useRouter()
	const pathname = useLocation({
		select: (location) => location.pathname,
	})

	useEffect(() => {
		if (!authToken && !user) {
			router.navigate({
				to: '/sign-in',
				search: { redirect: router.history.location.href },
			})
		}
	}, [router, authToken, user])

	useEffect(() => {
		const isTablet =
			window.innerWidth >= 768 &&
			window.innerWidth <= 1024 &&
			navigator.userAgent.toLowerCase().includes('mobile')

		if (isTablet) {
			Cookies.set('sidebar:state', 'false')
		}
	}, [])

	useEffect(() => {
		if (
			user?.admin === UserType.ADMIN &&
			!pathname.includes('/admin') &&
			!pathname.includes('/settings')
		) {
			router.navigate({ to: '/admin' })
		}
	}, [router, user?.admin, pathname])

	return (
		<SearchProvider>
			<SidebarProvider defaultOpen={defaultOpen}>
				<AppSidebar />
				<div
					id='content'
					className={cn(
						'ml-auto w-full max-w-full',
						'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
						'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
						'transition-[width] duration-200 ease-linear',
						'flex h-full min-h-screen flex-col self-stretch',
						'group-data-[scroll-locked=1]/body:h-full',
						'group-data-[scroll-locked=1]/body:has-[main.fixed-main]:h-full'
					)}
				>
					<Outlet />
				</div>
			</SidebarProvider>
		</SearchProvider>
	)
}
