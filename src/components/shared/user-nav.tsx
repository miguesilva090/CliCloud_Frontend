import { useRouter } from '@/routes/hooks/use-router'
import { useAuthStore } from '@/stores/auth-store'
import { clearAllWindowData } from '@/utils/window-utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function UserNav() {
  const router = useRouter()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const name = useAuthStore((state) => state.name)
  const email = useAuthStore((state) => state.email)

  const initials = name
    ? `${name.split(' ')[0][0]}${name.split(' ')[1]?.[0] || ''}`
    : ''

  const handleLogout = async () => {
    try {
      // Clear all window data
      clearAllWindowData()

      // Clear auth store
      clearAuth()

      // Use a small delay to ensure state updates are processed
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Navigate to login
      router.push('/login')
    } catch (error) {
      console.error('Error during logout:', error)
      // Force navigation to login in case of error
      router.push('/login')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-14 w-14 rounded-full'>
          <Avatar className='h-14 w-14'>
            <AvatarImage
              src=''
              alt={name || ''}
              className='aspect-square h-full w-full object-cover'
            />
            <AvatarFallback className='flex h-full w-full items-center justify-center'>
              <div className='flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground text-md font-semibold'>
                {initials}
              </div>
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56 p-2' align='end' forceMount>
        <DropdownMenuLabel className='p-2'>
          <div className='flex flex-col space-y-1.5'>
            <p className='text-sm font-semibold leading-none text-foreground'>
              {name || 'User'}
            </p>
            <p className='text-xs font-medium text-muted-foreground'>
              {email || 'user@example.com'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className='my-1.5' />
        <DropdownMenuGroup className='p-1'>
          <DropdownMenuItem
            className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm'
            onClick={() => router.push('/platform/profile')}
          >
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm'>
            Configurações
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className='my-1.5' />
        <DropdownMenuItem
          className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-red-500 focus:text-red-500'
          onClick={handleLogout}
        >
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
