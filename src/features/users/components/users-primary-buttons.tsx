import { Link } from '@tanstack/react-router'
import { IconUserPlus } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function UsersPrimaryButtons() {
	const { t } = useTranslation()
	return (
		<div className='flex gap-2'>
			<Button className='space-x-1' asChild>
				<Link to='/users/add'>
					{t('Users.add')} <IconUserPlus size={18} />
				</Link>
			</Button>
		</div>
	)
}
