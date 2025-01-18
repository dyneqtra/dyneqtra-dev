import React, { useState, useEffect } from 'react'
import { Card, CardBody, Button, Divider, Progress, Alert, Spinner, Chip, Tooltip } from '@nextui-org/react'
import { useRouter } from 'next/router'
import { Info, ArrowLeft, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import FileUploadBox from './FileUploadBox'
import {
    addDocumentsToKnowledgeBase,
    getKnowledgeBase,
    getKnowledgeBaseJobStatus,
    KnowledgeBaseCreationJob,
} from '@/utils/api'

interface Step {
    title: string
    description: string
    isCompleted: boolean
}

const AddDocumentsWizard: React.FC<{ knowledgeBaseId: string }> = ({ knowledgeBaseId }) => {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [knowledgeBase, setKnowledgeBase] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [jobStatus, setJobStatus] = useState<KnowledgeBaseCreationJob | null>(null)
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

    useEffect(() => {
        const loadKnowledgeBase = async () => {
            try {
                const kb = await getKnowledgeBase(knowledgeBaseId)
                setKnowledgeBase(kb)
            } catch (error) {
                console.error('Error loading knowledge base:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadKnowledgeBase()
    }, [knowledgeBaseId])

    // Add cleanup on unmount
    useEffect(() => {
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval)
            }
        }
    }, [pollingInterval])

    const startPollingJobStatus = (jobId: string) => {
        // Clear any existing interval
        if (pollingInterval) {
            clearInterval(pollingInterval)
        }

        // Start polling every 2 seconds
        const interval = setInterval(async () => {
            try {
                const status = await getKnowledgeBaseJobStatus(jobId)
                setJobStatus(status)

                // Stop polling if the job is completed or failed
                if (status.status === 'completed' || status.status === 'failed') {
                    clearInterval(interval)
                    setPollingInterval(null)

                    // Redirect to RAG page if completed
                    if (status.status === 'completed') {
                        router.push('/rag')
                    }
                }
            } catch (error) {
                console.error('Error polling job status:', error)
                clearInterval(interval)
                setPollingInterval(null)
            }
        }, 2000)

        setPollingInterval(interval)
    }

    const [steps] = useState<Step[]>([
        {
            title: 'Upload Documents',
            description: 'Select documents to add to your knowledge base',
            isCompleted: false,
        },
        {
            title: 'Processing',
            description: 'Add documents to your knowledge base',
            isCompleted: false,
        },
    ])

    const handleFilesChange = (newFiles: File[]) => {
        setUploadedFiles(newFiles)
    }

    const handleNext = async () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
            if (currentStep === 0) {
                try {
                    // Add documents to knowledge base
                    const response = await addDocumentsToKnowledgeBase(knowledgeBaseId, uploadedFiles)
                    // Set initial job status immediately
                    setJobStatus({
                        id: response.id,
                        status: 'processing',
                        progress: 0,
                        current_step: 'Initializing...',
                        total_files: uploadedFiles.length,
                        processed_files: 0,
                        total_chunks: 0,
                        processed_chunks: 0,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    startPollingJobStatus(response.id)
                } catch (error) {
                    console.error('Error adding documents:', error)
                }
            }
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? All progress will be lost.')) {
            router.push('/rag')
        }
    }

    const renderUploadStep = () => (
        <div className="flex flex-col gap-6">
            <div className="space-y-4">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Upload Documents</span>
                            <Tooltip content="Select documents to add to your knowledge base">
                                <Info className="w-4 h-4 text-default-400" />
                            </Tooltip>
                        </div>
                    </div>

                    <FileUploadBox onFilesChange={handleFilesChange} />
                </div>
            </div>
        </div>
    )

    const renderProcessingStep = () => {
        if (!jobStatus) return null

        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{jobStatus.current_step}</span>
                        <span className="text-sm text-default-400">{Math.round(jobStatus.progress * 100)}%</span>
                    </div>
                    <Progress
                        value={jobStatus.progress * 100}
                        color={jobStatus.status === 'failed' ? 'danger' : 'primary'}
                        className="w-full"
                    />
                </div>

                <div className="space-y-4">
                    {jobStatus.total_files > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span>Files Processed</span>
                            <span>
                                {jobStatus.processed_files} / {jobStatus.total_files}
                            </span>
                        </div>
                    )}

                    {jobStatus.total_chunks > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span>Chunks Processed</span>
                            <span>
                                {jobStatus.processed_chunks} / {jobStatus.total_chunks}
                            </span>
                        </div>
                    )}
                </div>

                {jobStatus.status === 'failed' && (
                    <Alert color="danger" className="mt-4">
                        {jobStatus.error_message || 'An error occurred while processing your documents.'}
                    </Alert>
                )}

                <div className="flex items-center gap-2 text-sm text-default-400">
                    <Spinner size="sm" />
                    <span>
                        {jobStatus.status === 'failed'
                            ? 'Processing failed'
                            : jobStatus.status === 'completed'
                              ? 'Processing complete'
                              : 'Processing your documents...'}
                    </span>
                </div>
            </div>
        )
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return renderUploadStep()
            case 1:
                return renderProcessingStep()
            default:
                return null
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Spinner size="lg" />
            </div>
        )
    }

    if (!knowledgeBase) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Alert color="danger">Knowledge base not found</Alert>
            </div>
        )
    }

    return (
        <div className="max-w-[1200px] mx-auto p-6 min-h-screen bg-gradient-to-b from-background to-default-50/50">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left side - Steps */}
                <div className="w-full md:w-1/3 lg:w-1/4">
                    <motion.div
                        className="sticky top-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex flex-col max-w-fit mb-2">
                            <h1 className="text-3xl font-bold text-default-900">Add Documents</h1>
                            <p className="text-small text-default-400">Add documents to your knowledge base</p>
                        </div>
                        <Progress
                            classNames={{
                                base: 'mb-8',
                                track: 'drop-shadow-md',
                                indicator: 'bg-gradient-to-r from-primary to-primary-500',
                                label: 'text-sm font-medium',
                                value: 'text-sm font-medium text-default-500',
                            }}
                            label="Progress"
                            size="md"
                            value={(currentStep / (steps.length - 1)) * 100}
                            showValueLabel={true}
                            valueLabel={`${currentStep + 1} of ${steps.length}`}
                        />
                        <div className="flex flex-col gap-4">
                            {steps.map((step, index) => (
                                <motion.button
                                    key={index}
                                    onClick={() => setCurrentStep(index)}
                                    className={`flex flex-col gap-1 rounded-xl border-1 p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
                    ${
                        currentStep === index
                            ? 'border-primary bg-primary/5 shadow-md'
                            : step.isCompleted
                              ? 'border-success/50 bg-success/5'
                              : 'border-default-200 dark:border-default-100'
                    }`}
                                    disabled={!step.isCompleted && index > currentStep}
                                    whileHover={{ scale: !(!step.isCompleted && index > currentStep) ? 1.02 : 1 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors duration-300
                        ${
                            currentStep === index
                                ? 'bg-primary text-white shadow-md'
                                : step.isCompleted
                                  ? 'bg-success text-white'
                                  : 'bg-default-100 text-default-600'
                        }`}
                                        >
                                            {step.isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="font-semibold text-default-900">{step.title}</span>
                                            <span className="text-xs text-default-400">{step.description}</span>
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right side - Content */}
                <motion.div
                    className="flex-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="bg-background/60 dark:bg-background/60 backdrop-blur-lg backdrop-saturate-150 shadow-xl border-1 border-default-200">
                        <CardBody className="gap-8 p-8">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-bold text-default-900">{knowledgeBase.name}</h2>
                                        <Chip size="sm" variant="flat" color="primary">
                                            {knowledgeBase.document_count} documents
                                        </Chip>
                                    </div>
                                    <p className="text-small text-default-400">{steps[currentStep].description}</p>
                                </div>
                                <div className="text-default-400 text-sm font-medium">
                                    Step {currentStep + 1} of {steps.length}
                                </div>
                            </div>

                            <Divider className="my-4" />

                            <motion.div
                                className="min-h-[300px]"
                                key={currentStep}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderStepContent()}
                            </motion.div>

                            <Divider className="my-4" />

                            <div className="flex justify-between items-center">
                                <Button
                                    color="danger"
                                    variant="light"
                                    onPress={handleCancel}
                                    className="font-medium hover:bg-danger/10"
                                >
                                    Cancel
                                </Button>
                                <div className="flex gap-3">
                                    {currentStep > 0 && (
                                        <Button
                                            variant="bordered"
                                            onPress={handleBack}
                                            className="font-medium"
                                            startContent={<ArrowLeft size={18} />}
                                        >
                                            Back
                                        </Button>
                                    )}
                                    <Button
                                        color="primary"
                                        onPress={handleNext}
                                        className="font-medium"
                                        isDisabled={uploadedFiles.length === 0}
                                    >
                                        {currentStep === steps.length - 1 ? 'Add Documents' : 'Next'}
                                    </Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}

export default AddDocumentsWizard
