import type React from 'react'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

declare global {
	interface Window {
		deferredPrompt?: BeforeInstallPromptEvent
	}
}

const InstallButton: React.FC = () => {
	const { t } = useTranslation()
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null)
	const [isInstalled, setIsInstalled] = useState<boolean>(false)

	useEffect(() => {
		const handleBeforeInstall = (e: Event) => {
			// eslint-disable-next-line no-console
			console.log('beforeinstallprompt event captured')
			e.preventDefault()
			const event = e as BeforeInstallPromptEvent
			setDeferredPrompt(event)
			window.deferredPrompt = event
		}

		const handleAppInstalled = () => {
			setIsInstalled(true)
			setDeferredPrompt(null)
			// eslint-disable-next-line no-console
			console.log('PWA was installed')
		}

		window.addEventListener('beforeinstallprompt', handleBeforeInstall)
		window.addEventListener('appinstalled', handleAppInstalled)

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
			window.removeEventListener('appinstalled', handleAppInstalled)
		}
	}, [])

	const handleInstallClick = async () => {
		if (!deferredPrompt) return
		await deferredPrompt.prompt()
		const { outcome } = await deferredPrompt.userChoice
		// eslint-disable-next-line no-console
		console.log(`User response to the install prompt: ${outcome}`)
		setDeferredPrompt(null)
	}

	const handleDismiss = () => {
		setDeferredPrompt(null)
	}

	if (isInstalled || !deferredPrompt) {
		return null
	}

	return (
		<Card className='fixed bottom-4 right-4 z-50 max-w-sm shadow-lg duration-300 animate-in fade-in slide-in-from-bottom-10'>
			<Button
				variant='ghost'
				size='icon'
				className='absolute right-2 top-1 h-8 w-8'
				onClick={handleDismiss}
			>
				<X className='h-4 w-4' />
				<span className='sr-only'>Close</span>
			</Button>
			<CardHeader className='pb-2'>
				<div className='flex items-center justify-between'>
					<CardTitle className='text-base'>{t('Pwa.title')}</CardTitle>
				</div>
			</CardHeader>
			<CardContent className='pb-2'>
				<p className='text-sm text-muted-foreground'>{t('Pwa.description')}</p>
			</CardContent>
			<CardFooter className='pt-2'>
				<Button onClick={handleInstallClick} className='w-full'>
					{t('Pwa.install')}
				</Button>
			</CardFooter>
		</Card>
	)
}

export default InstallButton
