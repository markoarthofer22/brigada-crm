import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { getAllProjects } from '@/api/services/projects/options.ts'
import { Project, ProjectType } from '@/api/services/projects/schema.ts'
import { useLoader } from '@/context/loader-provider.tsx'
import { Header } from '@/components/header.tsx'
import { Main } from '@/components/layout/main.tsx'
import { GenericTable } from '@/components/table/generic-table'
import { TemplatesDialogs } from '@/features/templates/components/template-dialogs.tsx'
import { TemplatePrimaryButtons } from '@/features/templates/components/template-primary-buttons.tsx'
import TemplatesProvider from '@/features/templates/context/templates-context.tsx'
import { columns } from './components/template-columns.tsx'

const Templates = () => {
	const { t } = useTranslation()
	const { showLoader, hideLoader } = useLoader()
	const router = useRouter()

	const projectsQuery = useQuery({
		...getAllProjects(ProjectType.TEMPLATE),
	})

	const onRowClick = (row: Project) => {
		if (row.id_projects) {
			router.navigate({ to: `/admin/templates/${row.id_projects}` })
		}
	}

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
		<TemplatesProvider>
			<Header />

			<Main fixed>
				<div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
					<div>
						<h2 className='text-2xl font-bold tracking-tight'>
							{t('Templates.title')}
						</h2>
						<p className='text-muted-foreground'>
							{t('Templates.description')}
						</p>
					</div>
					<TemplatePrimaryButtons />
				</div>
				<div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
					<GenericTable
						onRowClick={onRowClick}
						data={projectsQuery.data ?? []}
						columns={columns}
					/>
				</div>
			</Main>

			<TemplatesDialogs />
		</TemplatesProvider>
	)
}

export default Templates
