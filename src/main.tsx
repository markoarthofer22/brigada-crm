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
import { handleServerError } from '@/utils/handle-server-error'
import { LoaderProvider } from '@/context/loader-provider.tsx'
import InstallButton from '@/components/pwa/install-button.tsx'
import { FontProvider } from './context/font-context'
import { ThemeProvider } from './context/theme-context'
import './index.css'
// Generated Routes
import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: (failureCount, error) => {
				// eslint-disable-next-line no-console
				if (import.meta.env.DEV) console.log({ failureCount, error })

				if (failureCount >= 0 && import.meta.env.DEV) return false
				if (failureCount > 3 && import.meta.env.PROD) return false

				return !(
					error instanceof AxiosError &&
					[401, 403].includes(error.response?.status ?? 0)
				)
			},
			refetchOnWindowFocus: import.meta.env.PROD,
			staleTime: 10 * 1000, // 10s
		},
		mutations: {
			onError: (error) => {
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
					<ThemeProvider defaultTheme='system' storageKey='vite-ui-theme'>
						<FontProvider>
							<NuqsAdapter>
								<RouterProvider router={router} />
								<InstallButton />
							</NuqsAdapter>
						</FontProvider>
					</ThemeProvider>
				</QueryClientProvider>
			</LoaderProvider>
		</I18nextProvider>
	)
}
