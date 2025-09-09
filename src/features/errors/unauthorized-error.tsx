import { useEffect } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useLoader } from '@/context/loader-provider.tsx'
import { Button } from '@/components/ui/button'

export default function UnauthorisedError() {
	const navigate = useNavigate()
	const { history } = useRouter()
	const { t } = useTranslation()

	const { hideLoader } = useLoader()

	useEffect(() => {
		hideLoader()
	}, [])
	return (
		<div className='h-svh'>
			<div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
				<h1 className='text-[7rem] font-bold leading-tight'>
					{t('Error.401.title')}
				</h1>
				<span className='font-medium'>{t('Error.401.description')}</span>
				<p className='text-center text-muted-foreground'>
					{t('Error.401.explanation')}
				</p>
				<div className='mt-6 flex gap-4'>
					<Button variant='outline' onClick={() => history.go(-1)}>
						{t('Actions.goBack')}
					</Button>
					<Button onClick={() => navigate({ to: '/' })}>
						{t('Actions.backToHome')}
					</Button>
				</div>
			</div>
		</div>
	)
}
