import { createLazyFileRoute } from '@tanstack/react-router'
import ProjectDetails from '@/features/project-details'

export const Route = createLazyFileRoute('/_authenticated/projects/$id/')({
	component: ProjectDetails,
})
