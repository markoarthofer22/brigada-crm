import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MAX_FILE_UPLOAD_SIZE } from '@/consts/dropzone-defaults'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
	deleteImageForProject,
	upsertImageForProject,
} from '@/api/services/projects/projects.ts'
import {
	ProjectDetails,
	UpsertImageForProject,
	UpsertImageForProjectType,
} from '@/api/services/projects/schema.ts'
import { bytesToMB } from '@/lib/utils.ts'
import { useHandleGenericError } from '@/hooks/use-handle-generic-error.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
	FileInput,
	FileUploader,
	FileUploaderContent,
	FileUploaderItem,
} from '@/components/ui/file-uploader.tsx'
import {
	Form,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select.tsx'

interface ImageUploaderProps {
	projectId: number
	allImages: ProjectDetails['images']
	path: string
	selectDisabled?: boolean
}

const ImageUploader = ({
	projectId,
	selectDisabled,
	allImages,
	path,
}: ImageUploaderProps) => {
	const queryClient = useQueryClient()
	const { handleError } = useHandleGenericError()
	const { t } = useTranslation()

	const [selectedImage, setSelectedImage] = useState<number | null>(null)

	const activeImageLayout = useMemo(() => {
		if (!selectedImage) return undefined

		return allImages?.find((img) => img.id_images === selectedImage)
	}, [allImages, selectedImage])

	const upsertImageMutation = useMutation({
		mutationFn: (data: UpsertImageForProjectType) => {
			const parsedData = UpsertImageForProject.parse(data)
			return upsertImageForProject(parsedData)
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['projects', projectId],
			})
			toast.success(t('ProjectDetails.imageUpdated'))
		},
		onError: (error: unknown) => {
			handleError(error)
		},
	})

	const deleteImageMutation = useMutation({
		mutationFn: () =>
			deleteImageForProject(projectId, activeImageLayout!.id_images!),
		onSuccess: async () => {
			form.setValue('file', [])
			await queryClient.invalidateQueries({
				queryKey: ['projects', projectId],
			})
			toast.success(t('ProjectDetails.imageDeleted'))
		},
		onError: (error: unknown) => {
			handleError(error)
		},
	})

	const form = useForm<UpsertImageForProjectType>({
		resolver: zodResolver(UpsertImageForProject),
		defaultValues: {
			id: projectId ?? undefined,
			file: [],
		},
	})

	const onSubmit = async (data: UpsertImageForProjectType) => {
		await upsertImageMutation.mutateAsync(data)
	}

	useEffect(() => {
		if (allImages?.length) {
			setSelectedImage(allImages[allImages.length - 1].id_images)
		}
	}, [allImages])
	return (
		<div>
			<div className='mb-4 mt-6 flex flex-col items-start space-y-2'>
				<p className='text-sm font-medium'>{t('ProjectDetails.selectImage')}</p>
				<div className='flex flex-row items-center gap-x-2'>
					<Select
						disabled={
							selectDisabled ||
							upsertImageMutation.isPending ||
							deleteImageMutation.isPending
						}
						value={selectedImage?.toString() ?? undefined}
						onValueChange={(value) => setSelectedImage(Number(value))}
					>
						<SelectTrigger className='w-80'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent side='bottom'>
							{allImages?.map((image) => (
								<SelectItem key={image.id_images} value={`${image.id_images}`}>
									{image.data.file_name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Button
						disabled={
							allImages?.length === 0 ||
							upsertImageMutation.isPending ||
							deleteImageMutation.isPending
						}
						onClick={() => {
							setSelectedImage(null)
						}}
					>
						{t('ProjectDetails.addImage')}
					</Button>

					<Button
						onClick={() => deleteImageMutation.mutate()}
						variant='destructive'
						disabled={
							upsertImageMutation.isPending ||
							deleteImageMutation.isPending ||
							!activeImageLayout?.id_images
						}
					>
						{t('Actions.delete')}
					</Button>
				</div>
			</div>

			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className='flex flex-col space-y-6'
				>
					<FormField
						control={form.control}
						name='file'
						render={({ field, fieldState }) =>
							activeImageLayout?.name && path ? (
								<div className='h-[500px] max-w-4xl rounded-lg border-2 border-dashed border-accent p-2'>
									<img
										src={`${path}/${activeImageLayout.name}`}
										alt={activeImageLayout.name}
										className='h-full w-full rounded-lg object-contain object-center'
									/>
								</div>
							) : (
								<FormItem>
									<FormLabel>{t('Input.label.projectImage')}</FormLabel>
									<FileUploader
										name={field.name}
										value={field.value}
										onValueChange={async (value) => {
											field.onChange(value)
											upsertImageMutation.mutate(form.getValues())
										}}
										disabled={
											upsertImageMutation.isPending ||
											deleteImageMutation.isPending
										}
										reSelect={true}
										className='relative h-[500px]'
									>
										{(!field.value || field.value.length === 0) && (
											<FileInput maxSize={bytesToMB(MAX_FILE_UPLOAD_SIZE)} />
										)}
										{field.value && field.value.length > 0 && (
											<FileUploaderContent className='h-full w-full rounded-lg border-2 border-dashed border-accent bg-background/80'>
												{field.value.map((file, i) => (
													<FileUploaderItem
														allowRemove={false}
														key={i}
														index={i}
														aria-roledescription={`file ${i + 1} containing ${
															file.name
														}`}
														className='h-full w-full'
													>
														<img
															src={URL.createObjectURL(file)}
															alt={file.name}
															className='h-full w-full rounded-md object-contain'
														/>
													</FileUploaderItem>
												))}
											</FileUploaderContent>
										)}
									</FileUploader>
									<FormDescription className='!mt-3 text-xs font-medium'>
										<sup>*</sup>
										{t('Input.description.projectImage')}
									</FormDescription>
									<FormMessage
										values={{
											value: bytesToMB(MAX_FILE_UPLOAD_SIZE),
										}}
									>
										{fieldState.error?.message}
									</FormMessage>
								</FormItem>
							)
						}
					/>
				</form>
			</Form>
		</div>
	)
}

export default ImageUploader
