import { createLazyFileRoute } from '@tanstack/react-router'
import Templates from '@/features/templates'

export const Route = createLazyFileRoute('/_authenticated/admin/templates/')({
	component: Templates,
})
