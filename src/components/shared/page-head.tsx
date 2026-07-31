import { Helmet } from 'react-helmet-async'

/**
 * Document title da app: sempre "CliCloud".
 * O parâmetro `title` mantém-se por compatibilidade com páginas existentes
 * (título de ecrã fica no UI / window manager, não no document title).
 */
export function PageHead(_props?: { title?: string }) {
  return (
    <Helmet>
      <title>CliCloud</title>
    </Helmet>
  )
}
