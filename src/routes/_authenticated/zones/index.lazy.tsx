import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/zones/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/projects/zones/"!</div>
}
