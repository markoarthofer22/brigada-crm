import en from '@/locales/en/en.json'
import hr from '@/locales/hr/hr.json'
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { Languages, useAuthStore } from './stores/authStore'

i18n
	.use(initReactI18next)
	.use(LanguageDetector)
	.init({
		resources: {
			hr: {
				translation: hr,
			},
			en: {
				translation: en,
			},
		},
		supportedLngs: [Languages.HR, Languages.EN],
		fallbackLng: Languages.HR,
		lng: useAuthStore.getState().auth.lang ?? undefined,
		interpolation: {
			escapeValue: false, // not needed for react as it escapes by default
		},
		debug: false,
		parseMissingKeyHandler: (key) => {
			return key.replaceAll('.', ' ')
		},
	})

export default i18n
