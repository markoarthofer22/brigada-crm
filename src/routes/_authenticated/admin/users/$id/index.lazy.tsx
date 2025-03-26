import { createLazyFileRoute } from '@tanstack/react-router'
import UsersCrud from '@/features/user-crud'

export const Route = createLazyFileRoute('/_authenticated/admin/users/$id/')({
	component: UsersCrud,
})
