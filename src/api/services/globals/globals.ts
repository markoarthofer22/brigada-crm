import axios from '@/api/axios.ts'
import { GlobalSettingsResponse } from '@/api/services/globals/schema.ts'

export async function getGlobalSettings() {
  const response = await axios.get('/settings')
  return GlobalSettingsResponse.parse(response.data)
}
