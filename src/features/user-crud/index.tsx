import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { getUserById } from '@/api/services/user/options.ts'
import { useLoader } from '@/context/loader-provider'
import { Header } from '@/components/header.tsx'
import { Main } from '@/components/layout/main'
import UserUpsertFormSkeleton from '@/features/user-crud/components/user-upsert-form-skeleton.tsx'
import UserUpsertForm from '@/features/user-crud/components/user-upsert-form.tsx'

export default function UsersCrud() {
	const { t } = useTranslation()
	const { id } = useParams({ strict: false })
	const { showLoader, hideLoader } = useLoader()

	const userQuery = useQuery({
		...getUserById(Number(id)),
		enabled: !!id,
	})

	useEffect(() => {
		if (userQuery.isLoading) {
			showLoader()
		} else {
			hideLoader()
		}
	}, [userQuery.isLoading])

	return (
		<>
			<Header />

			<Main>
				<div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
					<div>
						<h2 className='text-2xl font-bold tracking-tight'>
							{t('Users.title')} {id}
						</h2>
						<p className='text-muted-foreground'>{t('Users.description')}</p>
					</div>
				</div>
				<div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
					{userQuery.isLoading ? (
						<UserUpsertFormSkeleton />
					) : (
						<UserUpsertForm initialValues={userQuery.data} />
					)}
				</div>
			</Main>
		</>
	)
}
