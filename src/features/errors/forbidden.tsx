import { useNavigate, useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export default function ForbiddenError() {
	const navigate = useNavigate()
	const { history } = useRouter()
	const { t } = useTranslation()

	return (
		<div className='h-svh'>
			<div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
				<h1 className='text-[7rem] font-bold leading-tight'>
					{t('Error.403.title')}
				</h1>
				<span className='font-medium'>{t('Error.403.description')}</span>
				<p className='text-center text-muted-foreground'>
					{t('Error.403.explanation')}
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
