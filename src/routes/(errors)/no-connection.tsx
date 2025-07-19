import { createFileRoute } from '@tanstack/react-router'
import NoConnection from '@/features/errors/no-connection.tsx'

export const Route = createFileRoute('/(errors)/no-connection')({
	component: NoConnection,
})
