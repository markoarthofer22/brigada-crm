import { createFileRoute } from '@tanstack/react-router'
import ProjectsRegularUser from '@/features/projects-regular-user'

export const Route = createFileRoute('/_authenticated/')({
	component: ProjectsRegularUser,
})
