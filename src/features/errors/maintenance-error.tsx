import { useTranslation } from 'react-i18next'

export default function MaintenanceError() {
	const { t } = useTranslation()

	return (
		<div className='h-svh'>
			<div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
				<h1 className='text-[7rem] font-bold leading-tight'>
					{t('Error.503.title')}
				</h1>
				<span className='font-medium'>{t('Error.503.description')}</span>
				<p className='text-center text-muted-foreground'>
					{t('Error.503.explanation')}
				</p>
			</div>
		</div>
	)
}
