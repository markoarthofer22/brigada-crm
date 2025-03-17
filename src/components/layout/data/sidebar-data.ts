import {
	IconLayoutDashboard,
	IconSettings,
	IconTool,
	IconUsers,
} from '@tabler/icons-react'
import { Command } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
	user: {
		name: 'Admin',
		email: 'admin@gmail.com',
		avatar: '/avatars/shadcn.jpg',
	},
	teams: [
		{
			name: 'Shadcn Admin',
			logo: Command,
			plan: 'Vite + ShadcnUI',
		},
	],
	navGroups: [
		{
			title: 'Pages',
			items: [
				{
					title: 'Dashboard',
					url: '/',
					icon: IconLayoutDashboard,
				},
				{
					title: 'Users',
					url: '/users',
					icon: IconUsers,
				},
			],
		},
		{
			title: 'Other',
			items: [
				{
					title: 'Settings',
					icon: IconSettings,
					items: [
						{
							title: 'Account',
							url: '/settings/account',
							icon: IconTool,
						},
					],
				},
			],
		},
	],
}
