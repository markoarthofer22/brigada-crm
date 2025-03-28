import { createLazyFileRoute } from '@tanstack/react-router'
import ProjectDetailsForRegularUser from '@/features/project-details-regular-user'

export const Route = createLazyFileRoute('/_authenticated/projects/$id/')({
	component: ProjectDetailsForRegularUser,
})
