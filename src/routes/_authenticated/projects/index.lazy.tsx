import { createLazyFileRoute } from '@tanstack/react-router'
import ProjectsRegularUser from '@/features/projects-regular-user'

export const Route = createLazyFileRoute('/_authenticated/projects/')({
	component: ProjectsRegularUser,
})
