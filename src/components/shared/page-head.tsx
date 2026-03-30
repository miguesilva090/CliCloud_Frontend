import { Helmet } from 'react-helmet-async'

export function PageHead({ title = 'Kutubi' }) {
  return (
    <Helmet>
      <title> {title} </title>
    </Helmet>
  )
}
