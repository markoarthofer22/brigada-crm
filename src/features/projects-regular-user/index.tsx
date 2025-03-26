import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getAllProjects } from '@/api/services/projects/options.ts'
import { ActiveStatus } from '@/api/services/projects/schema.ts'
import { useLoader } from '@/context/loader-provider'
import { Header } from '@/components/header.tsx'
import { Main } from '@/components/layout/main.tsx'
import { EmptyProjects } from '@/features/projects-regular-user/(components)/no-projects'
import { ProjectList } from '@/features/projects-regular-user/(components)/no-projects/list-projects'

const ProjectsRegularUser = () => {
	const { t } = useTranslation()
	const { showLoader, hideLoader } = useLoader()
	const projectsQuery = useQuery({
		...getAllProjects(),
	})

	useEffect(() => {
		if (projectsQuery.isLoading) {
			showLoader()
		} else {
			hideLoader()
		}
	}, [projectsQuery.isLoading])

	const visibleProjects = projectsQuery.data?.filter(
		(project) => project.active === ActiveStatus.ACTIVE
	)

	return (
		<>
			<Header />

			<Main>
				{projectsQuery.data?.length === 0 ? (
					<EmptyProjects />
				) : (
					<div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
						<div>
							<h2 className='text-2xl font-bold tracking-tight'>
								{t('Projects.title')}
							</h2>
							<p className='text-muted-foreground'>
								{t('Projects.regularUserDescription')}
							</p>

							<ProjectList projects={visibleProjects} />
						</div>
					</div>
				)}
			</Main>
		</>
	)
}

export default ProjectsRegularUser
