import { Rocket } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function EmptyProjects() {
	const { t } = useTranslation()

	return (
		<div className='flex h-full flex-col items-center justify-center p-8 text-center'>
			<div className='mb-6 flex items-center justify-center'>
				<div className='relative'>
					<div className='absolute -left-6 -top-6 h-24 w-24 animate-pulse rounded-full bg-primary/15 dark:bg-white/80' />
					<div className='absolute -bottom-8 -right-8 h-16 w-16 animate-pulse rounded-full bg-primary/15 delay-300 dark:bg-white/70' />
					<div className='relative flex h-32 w-32 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-background p-4 dark:border-muted-foreground/90'>
						<Rocket className='h-12 w-12 text-primary' />
					</div>
				</div>
			</div>

			<h2 className='mb-2 text-2xl font-bold tracking-tight'>
				{t('Projects.title')}
			</h2>

			<p className='max-w-md text-muted-foreground'>
				{t('Projects.noProjects')}
			</p>
		</div>
	)
}
