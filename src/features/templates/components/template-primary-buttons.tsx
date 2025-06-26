import { IconLayoutGridAdd } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useTemplates } from '@/features/templates/context/templates-context.tsx'

export function TemplatePrimaryButtons() {
	const { t } = useTranslation()
	const { setOpen } = useTemplates()
	return (
		<div className='flex gap-2'>
			<Button className='space-x-1' onClick={() => setOpen('add')}>
				{t('Templates.add')} <IconLayoutGridAdd size={18} />
			</Button>
		</div>
	)
}
