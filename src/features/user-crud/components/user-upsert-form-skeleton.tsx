import { Skeleton } from '@/components/ui/skeleton'

function UserUpsertFormSkeleton() {
	return (
		<div className='grid max-w-screen-md gap-6'>
			<div className='grid gap-4'>
				<Skeleton className='h-10 w-full' />
				<div className='grid grid-cols-2 gap-4'>
					<Skeleton className='h-10 w-full' />
					<Skeleton className='h-10 w-full' />
				</div>
				<div className='flex items-center gap-x-2'>
					<Skeleton className='h-10 flex-1' />
					<Skeleton className='h-10 w-40' />
				</div>
				<Skeleton className='h-10 w-full' />
				<Skeleton className='ml-auto mt-2 h-10 w-40' />
			</div>
		</div>
	)
}

export default UserUpsertFormSkeleton
