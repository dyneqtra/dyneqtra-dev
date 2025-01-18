import React, { useState, useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { json } from '@codemirror/lang-json'

import { oneDark } from '@codemirror/theme-one-dark'

interface CodeEditorProps {
    code: string
    onChange: (value: string) => void
    disabled?: boolean
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, disabled }) => {
    const [value, setValue] = useState<string>('')

    useEffect(() => {
        if (typeof code === 'string') {
            setValue(code)
        }
    }, [code])

    const handleEditorChange = (newValue: string) => {
        setValue(newValue)
        onChange(newValue)
    }

    return (
        <div className="code-editor w-full">
            <label className="text-sm font-semibold mb-2 block">Code Editor</label>
            <CodeMirror
                value={value}
                height="200px"
                theme={oneDark}
                extensions={[python(), json()]}
                onChange={handleEditorChange}
                className="border"
                editable={!disabled}
            />
        </div>
    )
}

export default CodeEditor
