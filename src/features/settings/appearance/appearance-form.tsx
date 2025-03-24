import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { fonts } from '@/config/fonts'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useFont } from '@/context/font-context'
import { useTheme } from '@/context/theme-context'
import { buttonVariants } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const appearanceFormSchema = z.object({
	theme: z.enum(['light', 'dark', 'system'], {
		required_error: 'Please select a theme.',
	}),
	font: z.enum(fonts, {
		invalid_type_error: 'Select a font',
		required_error: 'Please select a font.',
	}),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

export function AppearanceForm() {
	const { font, setFont } = useFont()
	const { setTheme, theme } = useTheme()

	const { t } = useTranslation()

	const defaultValues: Partial<AppearanceFormValues> = {
		theme: theme as 'light' | 'dark' | 'system',
		font,
	}

	const form = useForm<AppearanceFormValues>({
		resolver: zodResolver(appearanceFormSchema),
		defaultValues,
	})

	function onSubmit(data: AppearanceFormValues) {
		if (data.font != font) setFont(data.font)
		if (data.theme != theme) setTheme(data.theme)
	}
	useEffect(() => {
		onSubmit(form.getValues())
	}, [form, onSubmit])

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
				<FormField
					control={form.control}
					name='font'
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t('Header.font.title')}</FormLabel>
							<div className='relative w-max'>
								<FormControl>
									<select
										className={cn(
											buttonVariants({ variant: 'outline' }),
											'w-[200px] appearance-none font-normal capitalize'
										)}
										{...field}
									>
										{fonts.map((font) => (
											<option key={font} value={font}>
												{font}
											</option>
										))}
									</select>
								</FormControl>
								<ChevronDownIcon className='absolute right-3 top-2.5 h-4 w-4 opacity-50' />
							</div>
							<FormDescription className='font-manrope'>
								{t('Header.font.description')}
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='theme'
					render={({ field }) => (
						<FormItem className='space-y-1'>
							<FormLabel>{t('Header.theme.title')}</FormLabel>
							<FormDescription>{t('Header.theme.description')}</FormDescription>
							<FormMessage />
							<RadioGroup
								onValueChange={field.onChange}
								defaultValue={field.value}
								className='grid max-w-xl grid-cols-3 gap-8 pt-2'
							>
								<FormItem>
									<FormLabel className='[&:has([data-state=checked])>div]:border-primary'>
										<FormControl>
											<RadioGroupItem value='light' className='sr-only' />
										</FormControl>
										<div className='items-center rounded-md border-2 border-muted p-1 hover:border-accent'>
											<div className='space-y-2 rounded-sm bg-[#ecedef] p-2'>
												<div className='space-y-2 rounded-md bg-white p-2 shadow-sm'>
													<div className='h-2 w-[80px] rounded-lg bg-[#ecedef]' />
													<div className='h-2 w-[100px] rounded-lg bg-[#ecedef]' />
												</div>
												<div className='flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm'>
													<div className='h-4 w-4 rounded-full bg-[#ecedef]' />
													<div className='h-2 w-[100px] rounded-lg bg-[#ecedef]' />
												</div>
												<div className='flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm'>
													<div className='h-4 w-4 rounded-full bg-[#ecedef]' />
													<div className='h-2 w-[100px] rounded-lg bg-[#ecedef]' />
												</div>
											</div>
										</div>
										<span className='block w-full p-2 text-center font-normal'>
											{t('Header.theme.light')}
										</span>
									</FormLabel>
								</FormItem>
								<FormItem>
									<FormLabel className='[&:has([data-state=checked])>div]:border-primary'>
										<FormControl>
											<RadioGroupItem value='dark' className='sr-only' />
										</FormControl>
										<div className='items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground'>
											<div className='space-y-2 rounded-sm bg-slate-950 p-2'>
												<div className='space-y-2 rounded-md bg-slate-800 p-2 shadow-sm'>
													<div className='h-2 w-[80px] rounded-lg bg-slate-400' />
													<div className='h-2 w-[100px] rounded-lg bg-slate-400' />
												</div>
												<div className='flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm'>
													<div className='h-4 w-4 rounded-full bg-slate-400' />
													<div className='h-2 w-[100px] rounded-lg bg-slate-400' />
												</div>
												<div className='flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm'>
													<div className='h-4 w-4 rounded-full bg-slate-400' />
													<div className='h-2 w-[100px] rounded-lg bg-slate-400' />
												</div>
											</div>
										</div>
										<span className='block w-full p-2 text-center font-normal'>
											{t('Header.theme.dark')}
										</span>
									</FormLabel>
								</FormItem>
								<FormItem>
									<FormLabel className='[&:has([data-state=checked])>div]:border-primary'>
										<FormControl>
											<RadioGroupItem value='system' className='sr-only' />
										</FormControl>
										<div className='items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground'>
											<div className='space-y-2 rounded-sm bg-gradient-to-br from-white to-slate-950 p-2'>
												<div className='space-y-2 rounded-md bg-gradient-to-br from-slate-100 to-slate-800 p-2 shadow-sm'>
													<div className='h-2 w-[80px] rounded-lg bg-slate-400' />
													<div className='h-2 w-[100px] rounded-lg bg-slate-400' />
												</div>
												<div className='flex items-center space-x-2 rounded-md bg-gradient-to-br from-slate-100 to-slate-800 p-2 shadow-sm'>
													<div className='h-4 w-4 rounded-full bg-slate-400' />
													<div className='h-2 w-[100px] rounded-lg bg-slate-400' />
												</div>
												<div className='flex items-center space-x-2 rounded-md bg-gradient-to-br from-slate-100 to-slate-800 p-2 shadow-sm'>
													<div className='h-4 w-4 rounded-full bg-slate-400' />
													<div className='h-2 w-[100px] rounded-lg bg-slate-400' />
												</div>
											</div>
										</div>
										<span className='block w-full p-2 text-center font-normal'>
											{t('Header.theme.system')}
										</span>
									</FormLabel>
								</FormItem>
							</RadioGroup>
						</FormItem>
					)}
				/>
			</form>
		</Form>
	)
}
