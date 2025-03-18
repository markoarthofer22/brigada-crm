import { useNavigate, useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface GeneralErrorProps extends React.HTMLAttributes<HTMLDivElement> {
	minimal?: boolean
}

export default function GeneralError({
	className,
	minimal = false,
}: GeneralErrorProps) {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const { history } = useRouter()
	return (
		<div className={cn('h-svh w-full', className)}>
			<div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
				{!minimal && (
					<h1 className='text-[7rem] font-bold leading-tight'>
						{t('Error.500.title')}
					</h1>
				)}
				<span className='font-medium'>
					{t('Error.500.description')} {`:')`}
				</span>
				<p className='text-center text-muted-foreground'>
					{t('Error.500.explanation')}
				</p>
				{!minimal && (
					<div className='mt-6 flex gap-4'>
						<Button variant='outline' onClick={() => history.go(-1)}>
							{t('Actions.goBack')}
						</Button>
						<Button onClick={() => navigate({ to: '/' })}>
							{t('Actions.backToHome')}
						</Button>
					</div>
				)}
			</div>
		</div>
	)
}
