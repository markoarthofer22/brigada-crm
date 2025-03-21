import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { getProjectById } from '@/api/services/projects/options.ts'
import { useLoader } from '@/context/loader-provider'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@/components/ui/tabs.tsx'
import { Header } from '@/components/header.tsx'
import { Main } from '@/components/layout/main'
import QuestionLayout from '@/features/project-details/(components)/question-layout'

enum TabsEnum {
	QUESTIONS = 'questions',
	ZONES = 'zones',
}

export default function ProjectDetails() {
	const { t } = useTranslation()
	const { id } = useParams({ strict: false })
	const { showLoader, hideLoader } = useLoader()

	const [activeTab, setActiveTab] = useState<TabsEnum>(TabsEnum.QUESTIONS)

	const projectQuery = useQuery({
		...getProjectById(Number(id)),
		enabled: !!id,
	})

	useEffect(() => {
		if (projectQuery.isLoading) {
			showLoader()
		} else {
			hideLoader()
		}
	}, [projectQuery.isLoading])

	return (
		<>
			<Header />

			<Main>
				<div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
					<div>
						<h2 className='text-2xl font-bold tracking-tight'>
							{t('ProjectDetails.title')} {id}
						</h2>
						<p className='text-muted-foreground'>
							{t('ProjectDetails.description')}
						</p>
					</div>
				</div>
				<div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
					<Tabs
						defaultValue={activeTab}
						onValueChange={(value) => setActiveTab(value as TabsEnum)}
					>
						<TabsList>
							<TabsTrigger value={TabsEnum.QUESTIONS}>
								{t('ProjectDetails.tabs.questions')}
							</TabsTrigger>
							<TabsTrigger value={TabsEnum.ZONES}>
								{t('ProjectDetails.tabs.zones')}
							</TabsTrigger>
						</TabsList>
						<TabsContent value={TabsEnum.QUESTIONS}>
							<QuestionLayout />
						</TabsContent>
						<TabsContent value={TabsEnum.ZONES}>Coming soon</TabsContent>
					</Tabs>
				</div>
			</Main>
		</>
	)
}
