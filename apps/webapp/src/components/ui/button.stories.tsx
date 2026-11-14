import type { Meta, StoryObj } from '@storybook/tanstack-react'

import { Button } from '@/components/ui/button'

const meta = {
  component: Button
  } satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  args: {
    children: 'Login',
    variant: 'destructive'
  }
}
