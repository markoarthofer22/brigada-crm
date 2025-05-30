import { LinkProps } from '@tanstack/react-router'

interface BaseNavItem {
	title: string
	badge?: string
	icon?: React.ElementType
	disabled?: boolean
}

type NavLink = BaseNavItem & {
	url: LinkProps['to']
	items?: never
}

type NavCollapsible = BaseNavItem & {
	items: (BaseNavItem & { url: LinkProps['to'] })[]
	url?: never
}

type NavItem = NavCollapsible | NavLink

interface NavGroup {
	title: string
	allowAll?: boolean
	items: NavItem[]
}

interface SidebarData {
	navGroups: NavGroup[]
	mutualGroups: NavGroup[]
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink }
