import React from 'react'
import { useTabManager } from '@/hooks/use-tab-manager'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'

interface PersistentTabsProps {
  defaultValue?: string
  className?: string
  children: React.ReactNode
  tabKey?: string
}

export const PersistentTabs: React.FC<PersistentTabsProps> = ({
  defaultValue = '',
  className,
  children,
  tabKey,
}) => {
  const { activeTab, setActiveTab } = useTabManager({
    defaultTab: defaultValue,
    tabKey,
  })

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className={className}>
      {children}
    </Tabs>
  )
}

// Re-export the other tab components for convenience
export { TabsList, TabsTrigger, TabsContent }
