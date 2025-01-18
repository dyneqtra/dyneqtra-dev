import type { FC } from 'react'
import { memo } from 'react'
import { Button } from '@nextui-org/react'
import { Icon } from '@iconify/react'
import { useDispatch, useSelector } from 'react-redux'
import { useHotkeys } from 'react-hotkeys-hook'
import { undo, redo } from '../../../store/flowSlice'
import { RootState } from '../../../store/store'
import TipPopup from './TipPopUp'

const UndoRedo: FC = () => {
    const dispatch = useDispatch()
    const history = useSelector((state: RootState) => state.flow.history)

    const handleUndo = () => {
        if (history.past.length > 0) {
            dispatch(undo())
        }
    }

    const handleRedo = () => {
        if (history.future.length > 0) {
            dispatch(redo())
        }
    }

    useHotkeys(
        ['ctrl+z', 'meta+z'],
        (event) => {
            event.preventDefault()
            handleUndo()
        },
        [handleUndo]
    )

    useHotkeys(
        ['ctrl+shift+z', 'meta+shift+z', 'ctrl+y', 'meta+y'],
        (event) => {
            event.preventDefault()
            handleRedo()
        },
        [handleRedo]
    )

    return (
        <>
            <TipPopup title="Undo" shortcuts={['ctrl', 'z']}>
                <Button
                    size="sm"
                    isIconOnly
                    className="bg-background"
                    data-tooltip-id="workflow.undo"
                    onClick={handleUndo}
                    isDisabled={history.past.length === 0}
                >
                    <Icon icon="solar:undo-left-linear" width={16} className="text-foreground" />
                </Button>
            </TipPopup>
            <TipPopup title="Redo" shortcuts={['ctrl', 'y']}>
                <Button
                    size="sm"
                    isIconOnly
                    className="bg-background"
                    data-tooltip-id="workflow.redo"
                    onClick={handleRedo}
                    isDisabled={history.future.length === 0}
                >
                    <Icon icon="solar:undo-right-linear" width={16} className="text-foreground" />
                </Button>
            </TipPopup>
        </>
    )
}

export default memo(UndoRedo)
