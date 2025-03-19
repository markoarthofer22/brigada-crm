import { IconUsersGroup, IconUserShield } from '@tabler/icons-react'
import { UserType } from '@/api/services/user/schema.ts'

export const userTypes = [
	{
		label: 'Admin',
		value: UserType.ADMIN.toString(),
		icon: IconUserShield,
	},
	{
		label: 'User',
		value: UserType.REGULAR.toString(),
		icon: IconUsersGroup,
	},
] as const
