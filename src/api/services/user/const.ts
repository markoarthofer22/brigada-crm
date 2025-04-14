import {
	IconBell,
	IconBellX,
	IconUsersGroup,
	IconUserShield,
} from '@tabler/icons-react'
import { ActiveStatus } from '@/api/services/projects/schema.ts'
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

export const entityActive = [
	{
		label: 'Active',
		value: ActiveStatus.ACTIVE.toString(),
		icon: IconBell,
	},
	{
		label: 'Inactive',
		value: ActiveStatus.INACTIVE.toString(),
		icon: IconBellX,
	},
]
