import {
	IconDeviceProjector,
	IconLayoutDashboard,
	IconSettings,
	IconTool,
	IconUsers,
} from '@tabler/icons-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
	navGroups: [
		{
			title: 'pages',
			items: [
				{
					title: 'dashboard',
					url: '/',
					icon: IconLayoutDashboard,
				},
				{
					title: 'users',
					url: '/users',
					icon: IconUsers,
				},
				{
					title: 'projects',
					url: '/projects',
					icon: IconDeviceProjector,
				},
			],
		},
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
