import { createLazyFileRoute } from '@tanstack/react-router'
import ProjectDetails from '@/features/project-details'

export const Route = createLazyFileRoute('/_authenticated/admin/projects/$id/')({
	component: ProjectDetails,
})
