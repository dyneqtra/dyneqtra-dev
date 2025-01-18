import React from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'

interface NodeErrorDisplayProps {
    error: string
}

const NodeErrorDisplay: React.FC<NodeErrorDisplayProps> = ({ error }) => {
    return (
        <div
            className="p-5"
            style={{
                overflowY: 'auto',
                touchAction: 'none',
            }}
            onWheelCapture={(e) => {
                e.stopPropagation()
            }}
        >
            <div className="my-2 flex flex-col items-start">
                <label className="text-sm font-semibold mb-1 text-danger block">Error:</label>
                <div className="ml-2 mt-auto w-full">
                    <CodeMirror
                        value={error}
                        extensions={[python()]}
                        theme={oneDark}
                        basicSetup={{
                            lineNumbers: false,
                            foldGutter: false,
                            dropCursor: false,
                            allowMultipleSelections: false,
                            indentOnInput: false,
                        }}
                        editable={false}
                        style={{
                            backgroundColor: 'rgba(243, 18, 96, 0.05)',
                            borderRadius: '8px',
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default NodeErrorDisplay
