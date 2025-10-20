import { Link } from '@tanstack/react-router'
import BrigadaLogo from '@/assets/logo.png'
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
						<img
							src={BrigadaLogo}
							alt={import.meta.env.VITE_BRAND}
							className='h-14 w-32 object-contain'
						/>
					</Link>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
