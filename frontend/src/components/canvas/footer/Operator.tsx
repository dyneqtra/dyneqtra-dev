import React, { memo } from 'react'
import ZoomInOut from './ZoomInOut'
import { MiniMap } from '@xyflow/react'
import UndoRedo from './UndoRedo'
import { Button, ButtonGroup } from '@nextui-org/react'
import { useModeStore } from '../../../store/modeStore'
import { Icon } from '@iconify/react'
import TipPopup from './TipPopUp'
import { useTheme } from 'next-themes'

function Operator({ handleLayout }) {
    const mode = useModeStore((state) => state.mode)
    const setMode = useModeStore((state) => state.setMode)
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <>
            <MiniMap
                style={{
                    width: 102,
                    height: 72,
                    background: isDark ? '#333' : '#fff',
                }}
                nodeColor={() => (isDark ? '#777' : '#eee')}
                className="!absolute !left-4 !bottom-14 z-[9] !m-0 !w-[102px] !h-[72px] !border-[0.5px] !border-default-200 !rounded-lg !shadow-lg"
            />
            <div className="flex items-center mt-1 gap-2 absolute left-4 bottom-4 z-[9]">
                <ZoomInOut />
                <ButtonGroup>
                    <TipPopup title="Select" shortcuts={['v']}>
                        <Button
                            size="sm"
                            isIconOnly
                            onPress={() => setMode('pointer' as any)}
                            className="bg-background"
                        >
                            <Icon
                                className={mode === ('pointer' as any) ? 'text-foreground' : 'text-foreground/60'}
                                icon={mode === ('pointer' as any) ? 'solar:cursor-bold' : 'solar:cursor-linear'}
                                width={16}
                            />
                        </Button>
                    </TipPopup>
                    <TipPopup title="Pan" shortcuts={['space']}>
                        <Button size="sm" isIconOnly onPress={() => setMode('hand')} className="bg-background">
                            <Icon
                                className={mode === 'hand' ? 'text-foreground' : 'text-foreground/60'}
                                icon={mode === 'hand' ? 'solar:hand-shake-bold' : 'solar:hand-shake-linear'}
                                width={16}
                            />
                        </Button>
                    </TipPopup>
                    <TipPopup title="Layout Nodes">
                        <Button size="sm" isIconOnly onPress={handleLayout} className="bg-background">
                            <Icon className="text-foreground" icon="solar:ruler-angular-linear" width={16} />
                        </Button>
                    </TipPopup>
                </ButtonGroup>
                <ButtonGroup>
                    <UndoRedo />
                </ButtonGroup>
            </div>
        </>
    )
}

export default memo(Operator)
