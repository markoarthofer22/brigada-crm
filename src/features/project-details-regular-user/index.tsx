import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { getProjectById } from '@/api/services/projects/options.ts'
import { useLoader } from '@/context/loader-provider'
import { Header } from '@/components/header.tsx'
import { Main } from '@/components/layout/main'
import ZonesLayoutRegularUser from '@/features/project-details-regular-user/(components)/zones-layout'

export default function ProjectDetailsForRegularUser() {
	const { t } = useTranslation()
	const { id } = useParams({ strict: false })

	const { showLoader, hideLoader } = useLoader()

	const projectQuery = useQuery({
		...getProjectById(Number(id)),
		enabled: !!id,
	})

	useEffect(() => {
		if (projectQuery.isLoading) {
			showLoader()
		} else {
			hideLoader()
		}
	}, [projectQuery.isLoading])

	if (!projectQuery.data?.id_projects) return null

	return (
		<>
			<Header />

			<Main>
				<div className='flex flex-wrap items-center justify-between space-y-2'>
					<div className='mb-4 space-y-4'>
						<h2 className='w-fit text-2xl font-bold'>
							{t('ProjectDetails.title')} {projectQuery.data.name}
						</h2>
					</div>
				</div>
				<div className='mt-4'>
					<ZonesLayoutRegularUser
						path={projectQuery.data!.path!}
						projectId={projectQuery.data.id_projects}
						zones={projectQuery.data.zones}
						allImages={projectQuery.data.images}
					/>
				</div>
			</Main>
		</>
	)
}
