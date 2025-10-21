import { Link } from '@tanstack/react-router'
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'

export function TeamSwitcher() {
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton size='lg' asChild>
					<Link to='/'>
						<p className='text-[40px] font-semibold uppercase text-destructive'>
							{import.meta.env.VITE_TITLE}
						</p>
					</Link>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
