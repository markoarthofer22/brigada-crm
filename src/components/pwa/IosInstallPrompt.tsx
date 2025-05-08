import { useEffect, useState } from 'react'
import { IconShare2, IconSquareRoundedPlus, IconX } from '@tabler/icons-react'
import { Trans, useTranslation } from 'react-i18next'
import { useMiscellaneousStore } from '@/stores/miscStore.ts'
import { cn, isInStandaloneMode, isIOS } from '@/lib/utils.ts'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'

export const IosInstallPrompt = () => {
	const { t } = useTranslation()
	const miscStore = useMiscellaneousStore((state) => state)

	const [showPrompt, setShowPrompt] = useState(false)

	useEffect(() => {
		if (isIOS() && !isInStandaloneMode() && !miscStore.isDeferredDiscarded) {
			setShowPrompt(true)
		}
	}, [miscStore.isDeferredDiscarded])

	const handleClose = () => {
		setShowPrompt(false)
		miscStore.setIsDeferredDiscarded(true)
	}

	if (!showPrompt && miscStore.isDeferredDiscarded) return null

	return (
		<>
			{miscStore.iosPromptPosition === 'center' && (
				<div className='fixed inset-0 z-50 bg-black/80' />
			)}
			<Card
				className={cn('z-50 shadow-lg lg:hidden', {
					'fixed bottom-4 right-4 max-w-sm animate-in slide-in-from-bottom-10':
						miscStore.iosPromptPosition === 'bottom',
					'absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2':
						miscStore.iosPromptPosition === 'center',
				})}
			>
				<CardHeader className='pb-2'>
					<div className='flex items-center justify-between'>
						<CardTitle className='text-base'>{t('Ios.title')}</CardTitle>
						<Button
							variant='ghost'
							size='icon'
							className='h-6 w-6'
							onClick={handleClose}
						>
							<IconX className='h-4 w-4' />
							<span className='sr-only'>Close</span>
						</Button>
					</div>
				</CardHeader>
				<CardContent className='space-y-2 text-sm text-muted-foreground'>
					<p>{t('Ios.description')}</p>
					<div className='flex items-center gap-2'>
						<IconShare2 className='size-6' />
						<span>
							<Trans i18nKey='Ios.share' components={[<strong />]} />
						</span>
					</div>
					<div className='flex items-center gap-2'>
						<IconSquareRoundedPlus className='size-6' />
						<span>
							<Trans i18nKey='Ios.save' components={[<strong />]} />
						</span>
					</div>
				</CardContent>
				<CardFooter className='pt-2'>
					<Button className='w-full' onClick={handleClose}>
						{t('Ios.checked')}
					</Button>
				</CardFooter>
			</Card>
		</>
	)
}
