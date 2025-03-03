import axios from '@/api/axios.ts'

export async function login() {
  // parse data and call api
  const response = await axios.post('login', {
    name: 'admin',
    password: 'admin',
  })

  return response.data
}
