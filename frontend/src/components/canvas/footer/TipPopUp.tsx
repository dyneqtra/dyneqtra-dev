import { memo, forwardRef } from 'react'
import { Tooltip } from '@nextui-org/react'

type TipPopupProps = {
    title: string
    children: React.ReactNode
    shortcuts?: string[]
}

const TipPopup = forwardRef<HTMLDivElement, TipPopupProps>(({ title, children, shortcuts }, ref) => {
    return (
        <Tooltip
            content={
                <div className="flex items-center gap-1 px-2 h-6 text-xs font-medium text-foreground rounded-lg border-[0.5px] border-default-200">
                    {title}
                </div>
            }
        >
            <div ref={ref}>{children}</div>
        </Tooltip>
    )
})

// Add display name for better debugging
TipPopup.displayName = 'TipPopup'

export default memo(TipPopup)
