import { useNavigate, useRouter } from '@tanstack/react-router'
import { IconWorldOff } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { useMiscellaneousStore } from '@/stores/miscStore.ts'
import { Button } from '@/components/ui/button'

export default function NotFoundError() {
	const navigate = useNavigate()
	const { history } = useRouter()
	const { t } = useTranslation()
	const isOnline = useMiscellaneousStore((store) => store.isOnline)

	return (
		<div className='h-svh'>
			<div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
				<IconWorldOff className='mb-2 h-16 w-16 text-muted-foreground' />
				<h1 className='text-3xl font-bold leading-tight'>
					{t('Error.NoConnection.title')}
				</h1>
				<span className='font-medium'>
					{t('Error.NoConnection.description')}
				</span>
				<p className='text-center text-muted-foreground'>
					{t('Error.NoConnection.explanation')}
				</p>
				<div className='mt-6 flex gap-4'>
					<Button
						variant='outline'
						disabled={!isOnline}
						onClick={() => history.go(-1)}
					>
						{t('Actions.goBack')}
					</Button>
					<Button disabled={!isOnline} onClick={() => navigate({ to: '/' })}>
						{t('Actions.backToHome')}
					</Button>
				</div>
			</div>
		</div>
	)
}
