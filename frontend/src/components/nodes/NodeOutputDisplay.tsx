import React from 'react'
import Markdown from 'react-markdown'
import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/prism'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

interface NodeOutputDisplayProps {
    output: Record<string, any>
}

const NodeOutputDisplay: React.FC<NodeOutputDisplayProps> = ({ output }) => {
    const detectLanguage = (code: string): string => {
        // Python indicators
        if (code.includes('def ') || code.includes('import ') || /:\s*\n\s+/.test(code)) {
            return 'python'
        }
        // C++ indicators
        if (
            code.includes('#include') ||
            /\b(cout|cin|endl)\b/.test(code) ||
            /\b(int|void|class)\s+\w+\s*\(/.test(code)
        ) {
            return 'cpp'
        }
        // TypeScript/JavaScript indicators
        if (code.includes('interface ') || code.includes('type ') || code.includes('const ') || /=>\s*{/.test(code)) {
            return 'typescript'
        }
        if (code.includes('function ') || code.includes('let ') || code.includes('var ')) {
            return 'javascript'
        }
        // Default to typescript if we can't determine
        return 'typescript'
    }

    const isCodeBlock = (value: any): boolean => {
        // Check if the value is a string and looks like code
        if (typeof value !== 'string') return false
        // More comprehensive heuristic for code detection
        const codeIndicators = [
            // General syntax
            '{',
            '}',
            '()',
            '=>',
            ';',
            // Function definitions
            'function',
            'def ',
            'class ',
            // Variable declarations
            'const ',
            'let ',
            'var ',
            'int ',
            'float ',
            // Imports
            'import ',
            'from ',
            '#include',
            // Control structures
            'if ',
            'for ',
            'while ',
            'return ',
        ]
        return value.includes('\n') && codeIndicators.some((indicator) => value.includes(indicator))
    }

    const renderValue = (value: any) => {
        if (isCodeBlock(value)) {
            const language = detectLanguage(value)
            return (
                <SyntaxHighlighter
                    language={language}
                    style={oneDark}
                    customStyle={{
                        margin: 0,
                        borderRadius: '8px',
                        padding: '12px',
                    }}
                >
                    {value}
                </SyntaxHighlighter>
            )
        }
        return <Markdown>{JSON.stringify(value, null, 1)}</Markdown>
    }

    return (
        <>
            {output && (
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
                    <div>
                        {Object.entries(output).map(([key, value]) => (
                            <div key={key} className="my-2 flex flex-col items-start">
                                <label className="text-sm font-semibold mb-1 block">{key}:</label>
                                <div className="ml-2 mt-auto w-full">{renderValue(value)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}

export default NodeOutputDisplay
