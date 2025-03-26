import {
	IconDeviceProjector,
	IconLayoutDashboard,
	IconSettings,
	IconTool,
	IconUsers,
} from '@tabler/icons-react'
import { type NavItem, type SidebarData } from '../types'

const adminRoutes: NavItem[] = [
	{
		title: 'dashboard',
		url: '/admin',
		icon: IconLayoutDashboard,
	},
	{
		title: 'users',
		url: '/admin/users',
		icon: IconUsers,
	},
	{
		title: 'projects',
		url: '/admin/projects',
		icon: IconDeviceProjector,
	},
]

const userRoutes: NavItem[] = [
	{
		title: 'projects',
		url: '/projects',
		icon: IconDeviceProjector,
	},
]

export const sidebarData: SidebarData = {
	navGroups: [
		{
			title: 'pages',
			items: [...adminRoutes, ...userRoutes],
		},
	],
	mutualGroups: [
		{
			title: 'other',
			items: [
				{
					title: 'settings',
					icon: IconSettings,
					items: [
						{
							title: 'account',
							url: '/settings/account',
							icon: IconTool,
						},
					],
				},
			],
		},
	],
}
