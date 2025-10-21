import BrigadaLogo from '@/assets/logo.png'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { TeamSwitcher } from '@/components/layout/team-switcher'
import { sidebarData } from './data/sidebar-data'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible='icon' variant='floating' {...props}>
			<SidebarHeader>
				<TeamSwitcher />
			</SidebarHeader>
			<SidebarContent>
				{sidebarData.navGroups.map((props) => (
					<NavGroup key={props.title} {...props} />
				))}

				{sidebarData.mutualGroups.map((props) => (
					<NavGroup allowAll key={props.title} {...props} />
				))}
			</SidebarContent>
			<SidebarFooter>
				<img
					src={BrigadaLogo}
					alt={import.meta.env.VITE_BRAND}
					className='h-14 w-32 object-contain'
				/>
				{/*<NavUser />*/}
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
