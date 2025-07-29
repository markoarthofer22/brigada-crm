import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getAnalyticsForProject } from '@/api/services/analytics/options.ts'
import { Header } from '@/components/header.tsx'
import { Main } from '@/components/layout/main'
import UserUpsertFormSkeleton from '@/features/user-crud/components/user-upsert-form-skeleton.tsx'

export default function Analytics() {
	const { t } = useTranslation()

	// project select

	const analyticsQuery = useQuery({
		...getAnalyticsForProject({
			// test
			id_projects: '28',
		}),
	})

	if (analyticsQuery.isLoading) {
		return (
			<div>
				<Header className='border-b-0' />
				<Main fixed>
					<div className='mb-2 flex items-center justify-between space-y-2'>
						<h1 className='text-2xl font-bold tracking-tight'>
							{t('Analytics.title')}
						</h1>
					</div>
					<UserUpsertFormSkeleton />
				</Main>
			</div>
		)
	}

	return (
		<>
			<Header className='border-b-0' />
			<Main fixed className='max-w-screen-lg pb-6 pl-4'>
				<div className='mb-2 flex items-center justify-between space-y-2'>
					<h1 className='text-2xl font-bold tracking-tight'>
						{t('Analytics.title')}
					</h1>
				</div>
				<div className='mb-6 flex flex-col gap-4'></div>
			</Main>
		</>
	)
}
