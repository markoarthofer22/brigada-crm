import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useGetAllUsers } from '@/api/services/user/options.ts'
import { useLoader } from '@/context/loader-provider.tsx'
import { Header } from '@/components/header.tsx'
import { Main } from '@/components/layout/main'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider from './context/users-context'

export default function Users() {
	const { t } = useTranslation()
	const { showLoader, hideLoader } = useLoader()
	const router = useRouter()
	// Parse user list

	const usersQuery = useQuery({
		...useGetAllUsers(),
	})

	useEffect(() => {
		if (usersQuery.isLoading) {
			showLoader()
		} else {
			hideLoader()
		}
	}, [usersQuery.isLoading])

	useEffect(() => {
		if (usersQuery.isError && usersQuery.isFetched) {
			router.navigate({ to: '/500' })
		}
	}, [usersQuery.isError, usersQuery.isFetched])

	return (
		<UsersProvider>
			<Header />

			<Main fixed>
				<div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
					<div>
						<h2 className='text-2xl font-bold tracking-tight'>
							{t('Users.title')}
						</h2>
						<p className='text-muted-foreground'>{t('Users.description')}</p>
					</div>
					<UsersPrimaryButtons />
				</div>
				<div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
					<UsersTable data={usersQuery.data ?? []} columns={columns} />
				</div>
			</Main>

			<UsersDialogs />
		</UsersProvider>
	)
}
