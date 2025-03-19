import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { getAllProjects } from '@/api/services/projects/options.ts'
import { useLoader } from '@/context/loader-provider.tsx'
import { Header } from '@/components/header.tsx'
import { Main } from '@/components/layout/main.tsx'
import { GenericTable } from '@/components/table/generic-table'
import { columns } from '@/features/projects/components/projects-columns.tsx'
import { ProjectDialogs } from '@/features/projects/components/projects-dialogs.tsx'
import { ProjectsPrimaryButtons } from '@/features/projects/components/projects-primary-buttons.tsx'
import ProjectsProvider from '@/features/projects/context/projects-context.tsx'

const Projects = () => {
	const { t } = useTranslation()
	const { showLoader, hideLoader } = useLoader()
	const router = useRouter()

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

	useEffect(() => {
		if (projectsQuery.isError && projectsQuery.isFetched) {
			router.navigate({ to: '/500' })
		}
	}, [projectsQuery.isError, projectsQuery.isFetched])

	return (
		<ProjectsProvider>
			<Header />

			<Main fixed>
				<div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
					<div>
						<h2 className='text-2xl font-bold tracking-tight'>
							{t('Projects.title')}
						</h2>
						<p className='text-muted-foreground'>{t('Projects.description')}</p>
					</div>
					<ProjectsPrimaryButtons />
				</div>
				<div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
					<GenericTable data={projectsQuery.data ?? []} columns={columns} />
				</div>
			</Main>

			<ProjectDialogs />
		</ProjectsProvider>
	)
}

export default Projects
