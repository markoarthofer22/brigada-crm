import { Link } from '@tanstack/react-router'
import { Globe, Laptop, LogOut, Moon, Sun, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Languages, useAuthStore } from '@/stores/authStore.ts'
import { cn } from '@/lib/utils.ts'
import { useTheme } from '@/context/theme-context.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarTrigger } from '@/components/ui/sidebar.tsx'

interface HeaderProps {
	small?: boolean
	showSidebarToggle?: boolean
	className?: string
}

export function Header({
	small = false,
	className,
	showSidebarToggle = true,
}: HeaderProps) {
	const { setTheme, theme } = useTheme()
	const setLanguage = useAuthStore((state) => state.auth.setLang)
	const {
		t,
		i18n: { changeLanguage, language: activeLang, services },
	} = useTranslation()
	const languages = Object.keys(services.resourceStore.data)

	const handleLocaleChange = async (newLocale: string) => {
		await changeLanguage(newLocale)
		setLanguage(newLocale as Languages)
	}
	const user = useAuthStore((state) => state.auth.user)

	return (
		<header
			className={cn(
				'sticky top-0 z-50 w-full border-b bg-background',
				className
			)}
		>
			<div
				className={cn('flex h-16 items-center justify-between px-4', {
					'justify-end': small,
				})}
			>
				<div className='flex items-center gap-x-4'>
					{showSidebarToggle && (
						<SidebarTrigger
							variant='outline'
							className='scale-125 sm:scale-100'
						/>
					)}

					{!small && (
						<div className='flex items-center gap-2'>
							<Link to='/' className='font-bold'>
								YourBrand
							</Link>
						</div>
					)}
				</div>

				<div className='flex items-center gap-4'>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='ghost' size='icon'>
								<Globe className='h-5 w-5' />
								<span className='sr-only'>Toggle language</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuLabel>{t('Languages.title')}</DropdownMenuLabel>
							<DropdownMenuSeparator />
							{languages.map((lang) => (
								<DropdownMenuItem
									key={lang}
									className={activeLang === lang ? 'bg-muted' : ''}
									onClick={() => handleLocaleChange(lang)}
								>
									{t('Languages.' + lang)}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='ghost'
								size='icon'
								className='focus-visible:ring-0'
							>
								{theme === 'light' ? (
									<Sun className='size-5' />
								) : theme === 'dark' ? (
									<Moon className='size-5' />
								) : (
									<Laptop className='size-5' />
								)}
								<span className='sr-only'>Toggle theme</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuLabel>{t('Header.theme.title')}</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => setTheme('light')}>
								<Sun className='mr-2 size-5' />
								<span>{t('Header.theme.light')}</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTheme('dark')}>
								<Moon className='mr-2 size-5' />
								<span>{t('Header.theme.dark')}</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTheme('system')}>
								<Laptop className='mr-2 size-5' />
								<span>{t('Header.theme.system')}</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					{user && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Avatar className='h-8 w-8 cursor-pointer'>
									<AvatarImage
										src='/placeholder.svg?height=32&width=32'
										alt='User'
									/>
									<AvatarFallback>JD</AvatarFallback>
								</Avatar>
							</DropdownMenuTrigger>
							<DropdownMenuContent className='w-56' align='end' forceMount>
								<DropdownMenuLabel className='font-normal'>
									<div className='flex flex-col space-y-1'>
										<p className='text-sm font-medium leading-none'>John Doe</p>
										<p className='text-xs leading-none text-muted-foreground'>
											john.doe@example.com
										</p>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuGroup>
									<DropdownMenuItem>
										<User className='mr-2 h-4 w-4' />
										<span>{t('Header.user.profile')}</span>
									</DropdownMenuItem>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<LogOut className='mr-2 h-4 w-4' />
									<span>{t('Header.user.logout')}</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			</div>
		</header>
	)
}
