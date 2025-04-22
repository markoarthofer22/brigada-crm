import { useTranslation } from 'react-i18next'
import { UserType } from '@/api/services/user/schema.ts'
import { useAuthStore } from '@/stores/authStore.ts'
import GeneralError from '@/features/errors/general-error.tsx'
import UserUpsertForm from '@/features/user-crud/components/user-upsert-form.tsx'
import ContentSection from '../components/content-section'

export default function SettingsAccount() {
	const { t } = useTranslation()

	const user = useAuthStore((state) => state.auth.user)

	const allowAdminActions = user?.admin === UserType.ADMIN

	if (!user) return <GeneralError />

	return (
		<ContentSection
			title={t('Settings.account.title')}
			desc={t('Settings.account.description')}
		>
			<UserUpsertForm
				allowUserActions={allowAdminActions}
				initialValues={{
					id_users: user.id_users,
					firstname: user?.firstname ?? '',
					lastname: user?.lastname ?? '',
					email: user?.email ?? '',
					admin: user?.admin,
					active: user?.active ?? false,
				}}
			/>
		</ContentSection>
	)
}
