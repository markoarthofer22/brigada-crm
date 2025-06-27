import { createLazyFileRoute } from '@tanstack/react-router'
import TemplateDetails from '@/features/template-details'

export const Route = createLazyFileRoute(
	'/_authenticated/admin/templates/$id/'
)({
	component: TemplateDetails,
})
