import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { AxiosError } from 'axios'
import {
	QueryCache,
	QueryClient,
	QueryClientProvider,
} from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import i18n from '@/i18n'
import { NuqsAdapter } from 'nuqs/adapters/react'
import { I18nextProvider } from 'react-i18next'
import { toast } from 'sonner'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useMiscellaneousStore } from '@/stores/miscStore.ts'
import { handleServerError } from '@/lib/utils.ts'
import { LoaderProvider } from '@/context/loader-provider.tsx'
import { Button } from '@/components/ui/button.tsx'
import { IosInstallPrompt } from '@/components/pwa/IosInstallPrompt.tsx'
import InstallButton from '@/components/pwa/install-button.tsx'
import { FontProvider } from './context/font-context'
import { ThemeProvider } from './context/theme-context'
import './index.css'
// Generated Routes
import { routeTree } from './routeTree.gen'

const ServiceWorkerUpdater = () => {
	const {
		needRefresh: [needRefresh],
		updateServiceWorker,
	} = useRegisterSW({
		// optional logging
		onRegisteredSW(swUrl, registration) {
			console.log('SW registered:', swUrl, registration)
		},
		onRegisterError(error) {
			console.error('SW registration error', error)
		},
	})

	const [visible, setVisible] = useState<boolean>(false)

	useEffect(() => {
		console.log('needRefresh', needRefresh)
		if (needRefresh) {
			setVisible(true)
		}
	}, [needRefresh])

	if (!visible) return null

	return (
		<div className='fixed inset-x-4 bottom-4 z-50'>
			<div className='mx-auto flex max-w-xl items-center gap-3 rounded-2xl border bg-background/95 px-4 py-3 shadow-lg backdrop-blur'>
				<div className='flex-1'>
					<p className='text-sm font-medium'>New version available</p>
					<p className='text-xs text-muted-foreground'>
						We’ve updated the app. Reload to get the latest version.
					</p>
				</div>

				<div className='flex items-center gap-2'>
					<Button
						size='sm'
						onClick={() => {
							// activate new SW + reload
							updateServiceWorker(true)
						}}
					>
						Update
					</Button>
					<button
						type='button'
						className='text-xs text-muted-foreground hover:text-foreground'
						onClick={() => setVisible(false)}
					>
						Dismiss
					</button>
				</div>
			</div>
		</div>
	)
}

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
			staleTime: 0,
			gcTime: 0,
		},
		mutations: {
			onError: (error) => {
				const isOnline = useMiscellaneousStore.getState().isOnline

				if (!isOnline) {
					return
				}

				handleServerError(error)
				if (error instanceof AxiosError) {
					if (error.response?.status === 304) {
						toast.error('Content not modified!')
					}
				}
			},
		},
	},
	queryCache: new QueryCache({
		onError: (error) => {
			const isOnline = useMiscellaneousStore.getState().isOnline

			if (!isOnline) {
				return
			}

			if (error instanceof AxiosError) {
				if (error.response?.status === 401) {
					const redirect = `${router.history.location.href}`
					router.navigate({ to: '/sign-in', search: { redirect } })
				}
				if (error.response?.status === 500) {
					toast.error('Internal Server Error!')
					router.navigate({ to: '/500' })
				}
				if (error.response?.status === 403) {
					router.navigate({ to: '/403' })
				}
			}
		},
	}),
})

// Create a new router instance
const router = createRouter({
	routeTree,
	context: { queryClient },
	defaultPreload: 'intent',
	defaultPreloadStaleTime: 0,
	trailingSlash: 'never',
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement)
	root.render(
		<I18nextProvider i18n={i18n}>
			<LoaderProvider>
				<QueryClientProvider client={queryClient}>
					<ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
						<FontProvider>
							<NuqsAdapter>
								<RouterProvider router={router} />
								<InstallButton />
								<IosInstallPrompt />
								<ServiceWorkerUpdater />
							</NuqsAdapter>
						</FontProvider>
					</ThemeProvider>
				</QueryClientProvider>
			</LoaderProvider>
		</I18nextProvider>
	)
}
