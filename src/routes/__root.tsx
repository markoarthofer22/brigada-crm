import { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext } from '@tanstack/react-router'
import GeneralError from '@/features/errors/general-error'
import NotFoundError from '@/features/errors/not-found-error'
import Root from '@/features/root/root.tsx'

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient
}>()({
	component: Root,
	notFoundComponent: NotFoundError,
	errorComponent: GeneralError,
})
