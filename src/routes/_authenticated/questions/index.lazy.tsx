import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/questions/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/questions/"!</div>
}
