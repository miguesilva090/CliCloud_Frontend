import * as React from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  to?: string
  disableLink?: boolean
  width?: number
}

const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  ({ width, to = '/', disableLink = false, className, ...props }, ref) => {
    // Default aspect ratio of 95x25
    const aspectRatio = 95 / 25

    // If width is provided, calculate height to maintain aspect ratio
    const calculatedHeight = width ? width / aspectRatio : 50 / aspectRatio

    const logoContent = (
      <svg
        width={width}
        height={calculatedHeight}
        viewBox='0 0 25.135 6.614'
        xmlns='http://www.w3.org/2000/svg'
        className={cn('text-primary', className)}
      >
        <defs>
          <linearGradient id='logo-gradient'>
            <stop stopColor='currentColor' offset={0} />
            <stop stopColor='currentColor' stopOpacity={0.973} offset={0.523} />
            <stop stopColor='currentColor' stopOpacity={0.969} offset={1} />
          </linearGradient>
        </defs>
        <g fill='currentColor' fillOpacity={0.973}>
          <g strokeWidth={1.11}>
            <path
              className='cls-3'
              d='M3.977 3.927q0 1.103-1.326 1.103a2.606 2.606 0 0 1-.824-.114v-.504a2.66 2.66 0 0 0 .829.114q.685 0 .685-.57a1.544 1.544 0 0 1-.609.12q-1.122 0-1.122-1.226 0-1.243 1.306-1.245a6.66 6.66 0 0 1 1.06.104zm-.635-1.75a1.359 1.359 0 0 0-.444-.057q-.658 0-.66.727 0 .702.572.702a1.202 1.202 0 0 0 .534-.13zM5.212.698v3.425h-.636V.698zM5.69 2.868q0-1.266 1.247-1.267 1.247 0 1.247 1.267 0 1.262-1.247 1.262T5.69 2.868zm1.247.778q.61 0 .612-.789 0-.768-.612-.77-.612 0-.611.77 0 .788.61.787zM8.663.698h.635v1.101a1.116 1.116 0 0 1 .636-.191q1.073 0 1.073 1.209 0 1.308-1.23 1.308a6.597 6.597 0 0 1-1.114-.102zm.635 2.845a1.7 1.7 0 0 0 .507.07q.57 0 .57-.813 0-.665-.495-.665a1.305 1.305 0 0 0-.585.13zM11.367 3.33q0-.75 1.094-.75a2.783 2.783 0 0 1 .512.048v-.19q0-.342-.486-.342a3.983 3.983 0 0 0-.914.114v-.493a3.983 3.983 0 0 1 .914-.12q1.121 0 1.122.83v1.688h-.37l-.228-.229a1.256 1.256 0 0 1-.724.229q-.92 0-.92-.785zm1.094-.318c-.306 0-.457.104-.457.311 0 .208.128.336.383.336a.975.975 0 0 0 .587-.196V3.06a2.615 2.615 0 0 0-.508-.048zM14.844.698v3.425h-.635V.698zM15.443 4.009v-.527a2.59 2.59 0 0 0 .969.167c.272 0 .41-.088.41-.263 0-.176-.092-.252-.276-.252h-.456q-.768 0-.768-.755 0-.792 1.12-.792a2.732 2.732 0 0 1 .893.144v.528a2.425 2.425 0 0 0-.913-.168q-.515 0-.516.264c0 .167.1.252.3.252h.408c.558 0 .839.251.839.755q0 .79-1.07.79a2.902 2.902 0 0 1-.94-.143zM17.78 2.868q0-1.266 1.248-1.267 1.246 0 1.246 1.267 0 1.262-1.246 1.262-1.247 0-1.247-1.262zm1.248.778q.61 0 .61-.789 0-.768-.61-.77-.611 0-.612.77 0 .788.612.787zM20.753 4.122V1.61q0-1.034 1.131-1.035a1.568 1.568 0 0 1 .562.095v.504a1.37 1.37 0 0 0-.516-.096c-.36 0-.541.178-.541.532h.755v.504h-.755v2.008z'
            />
            <path
              className='cls-3'
              d='M22.326 1.191h.47l.096.408h.633v.503h-.564V3.26q0 .353.305.353h.26v.504h-.572q-.631 0-.632-.679z'
            />
          </g>
          <text
            x={-716.865}
            y={-2971.618}
            fontFamily="'Franklin Gothic Medium'"
            fontSize={16.314}
            strokeWidth={0.136}
            style={{
              lineHeight: 1.25,
            }}
            xmlSpace='preserve'
            transform='matrix(.10284 0 0 .10284 83.665 311.623)'
          >
            <tspan x={-716.865} y={-2971.618}>
              {'GROUP'}
            </tspan>
          </text>
        </g>
      </svg>
    )

    if (disableLink) {
      return (
        <div
          ref={ref}
          className={cn('inline-flex items-center', className)}
          {...props}
        >
          {logoContent}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center', className)}
        {...props}
      >
        <Link to={to} className='transition-opacity hover:opacity-80'>
          {logoContent}
        </Link>
      </div>
    )
  }
)

Logo.displayName = 'Logo'

export { Logo }
