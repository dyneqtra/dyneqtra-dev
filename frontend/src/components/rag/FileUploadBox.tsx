import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardBody, Button } from '@nextui-org/react'
import { Upload, X } from 'lucide-react'

interface FileUploadBoxProps {
    onFilesChange: (files: File[]) => void
}

const FileUploadBox: React.FC<FileUploadBoxProps> = ({ onFilesChange }) => {
    const [files, setFiles] = useState<File[]>([])

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            setFiles((prev) => [...prev, ...acceptedFiles])
            onFilesChange([...files, ...acceptedFiles])
        },
        [files, onFilesChange]
    )

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index)
        setFiles(newFiles)
        onFilesChange(newFiles)
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt'],
            'text/markdown': ['.md'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
    })

    return (
        <div className="space-y-4">
            <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Card
                    className={`border-2 border-dashed transition-colors cursor-pointer
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-default-200 hover:border-primary'}`}
                >
                    <CardBody className="py-8">
                        <div className="flex flex-col items-center gap-4">
                            <Upload className={`w-8 h-8 ${isDragActive ? 'text-primary' : 'text-default-400'}`} />
                            <div className="text-center">
                                <p className="text-default-500">
                                    {isDragActive
                                        ? 'Drop the files here'
                                        : 'Drag and drop files here or click to browse'}
                                </p>
                                <p className="text-xs text-default-400 mt-1">
                                    Supported formats: PDF, TXT, MD, DOC, DOCX
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {files.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium">Selected Files ({files.length})</p>
                    <div className="space-y-2">
                        {files.map((file, index) => (
                            <Card key={index} className="bg-default-50">
                                <CardBody className="py-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">{file.name}</span>
                                            <span className="text-xs text-default-400">
                                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                            </span>
                                        </div>
                                        <Button isIconOnly size="sm" variant="light" onPress={() => removeFile(index)}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default FileUploadBox
