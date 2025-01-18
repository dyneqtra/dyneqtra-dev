import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
    Button,
    Card,
    CardBody,
    Input,
    Textarea,
    Select,
    SelectItem,
    SelectSection,
    Progress,
    Divider,
    Chip,
    Spinner,
    Alert,
    Tooltip,
} from '@nextui-org/react'
import { Info, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import {
    createVectorIndex,
    getEmbeddingModels,
    getVectorStores,
    listDocumentCollections,
    listApiKeys,
    getApiKey,
} from '@/utils/api'
import type {
    DocumentCollectionResponse,
    EmbeddingModelConfig,
    VectorStoreConfig,
    VectorIndexCreateRequest,
} from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'

interface EmbeddingConfig {
    name: string
    description: string
    collection_id: string
    embedding_model: string
    vector_db: string
    search_strategy: string
}

const steps = [
    {
        title: 'Select Collection',
        description: 'Choose a document collection to create an index from',
        isCompleted: false,
    },
    {
        title: 'Configure Embeddings',
        description: 'Configure embedding model and vector store settings',
        isCompleted: false,
    },
    {
        title: 'Create Index',
        description: 'Review and create your vector index',
        isCompleted: false,
    },
]

const generateRandomName = () => {
    const adjectives = [
        'Smart',
        'Brilliant',
        'Dynamic',
        'Quantum',
        'Neural',
        'Cosmic',
        'Intelligent',
        'Advanced',
        'Strategic',
        'Innovative',
    ]
    const nouns = [
        'Atlas',
        'Nexus',
        'Matrix',
        'Archive',
        'Library',
        'Vault',
        'Repository',
        'Database',
        'Collection',
        'Hub',
    ]
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
    const now = new Date()
    const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
    return `${randomAdjective} ${randomNoun} - ${timestamp}`
}

export const VectorIndexWizard: React.FC = () => {
    const router = useRouter()
    const [activeStep, setActiveStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [collections, setCollections] = useState<DocumentCollectionResponse[]>([])
    const [embeddingModels, setEmbeddingModels] = useState<Record<string, EmbeddingModelConfig>>({})
    const [vectorStores, setVectorStores] = useState<Record<string, VectorStoreConfig>>({})
    const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
    const [isLoadingModels, setIsLoadingModels] = useState(true)
    const [isLoadingStores, setIsLoadingStores] = useState(true)
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [config, setConfig] = useState<EmbeddingConfig>({
        name: '',
        description: '',
        collection_id: '',
        embedding_model: '',
        vector_db: '',
        search_strategy: 'vector',
    })
    const [nameAlert, setNameAlert] = useState<string | null>(null)

    useEffect(() => {
        const loadData = async () => {
            try {
                const [modelsData, storesData] = await Promise.all([getEmbeddingModels(), getVectorStores()])
                setEmbeddingModels(modelsData)
                setVectorStores(storesData)
            } catch (error) {
                console.error('Error loading data:', error)
            } finally {
                setIsLoadingModels(false)
                setIsLoadingStores(false)
            }
        }

        const loadApiKeys = async () => {
            try {
                const keys = await listApiKeys()
                const keyValues: Record<string, string> = {}
                for (const key of keys) {
                    const keyData = await getApiKey(key)
                    if (keyData.value) {
                        keyValues[key] = keyData.value
                    }
                }
                setApiKeys(keyValues)
            } catch (error) {
                console.error('Error loading API keys:', error)
            }
        }

        loadData()
        loadApiKeys()
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [collectionsData, modelsData, storesData] = await Promise.all([
                    listDocumentCollections(),
                    getEmbeddingModels(),
                    getVectorStores(),
                ])
                setCollections(collectionsData)
                setEmbeddingModels(modelsData)
                setVectorStores(storesData)
            } catch (error) {
                console.error('Error fetching data:', error)
                setAlert({ type: 'error', message: 'Error loading configuration options' })
            }
        }
        fetchData()
    }, [])

    // Clear alert after 3 seconds
    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => {
                setAlert(null)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [alert])

    // Clear name alert after 3 seconds
    useEffect(() => {
        if (nameAlert) {
            const timer = setTimeout(() => {
                setNameAlert(null)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [nameAlert])

    const handleNext = () => {
        if (activeStep < steps.length - 1) {
            if (activeStep === 0 && !config.name.trim()) {
                const randomName = generateRandomName()
                setConfig((prev) => ({ ...prev, name: randomName }))
                setNameAlert(`Using generated name: ${randomName}`)
            }
            setActiveStep((prevStep) => prevStep + 1)
        } else {
            handleSubmit()
        }
    }

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1)
    }

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true)
            const createRequest: VectorIndexCreateRequest = {
                name: config.name,
                description: config.description,
                collection_id: config.collection_id,
                embedding: {
                    model: config.embedding_model,
                    vector_db: config.vector_db,
                    search_strategy: config.search_strategy,
                    semantic_weight: 1.0,
                    keyword_weight: 0.0,
                    top_k: 3,
                    score_threshold: 0.7,
                },
            }
            const index = await createVectorIndex(createRequest)
            setAlert({ type: 'success', message: 'Vector index created successfully' })
            router.push(`/rag/indices/${index.id}`)
        } catch (error) {
            console.error('Error creating index:', error)
            setAlert({ type: 'error', message: 'Error creating vector index' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleConfigChange =
        (field: keyof EmbeddingConfig) => (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
            const value = event.target.value
            setConfig((prev) => ({ ...prev, [field]: value }))
        }

    const ApiKeyWarning = ({
        modelInfo,
        storeInfo,
    }: {
        modelInfo?: EmbeddingModelConfig
        storeInfo?: VectorStoreConfig
    }) => {
        let missingParams: string[] = []
        let serviceName = ''

        if (modelInfo) {
            modelInfo.required_env_vars.forEach((envVar) => {
                if (!apiKeys[envVar] || apiKeys[envVar] === '') {
                    missingParams.push(envVar)
                }
            })
            serviceName = modelInfo.name
        } else if (storeInfo) {
            storeInfo.required_env_vars.forEach((envVar) => {
                if (!apiKeys[envVar] || apiKeys[envVar] === '') {
                    missingParams.push(envVar)
                }
            })
            serviceName = storeInfo.name
        } else {
            return null
        }

        if (missingParams.length > 0) {
            return (
                <Alert className="mt-2" color="warning" title={`Missing Configuration for ${serviceName}`}>
                    {missingParams.length === 1
                        ? `Please set the ${missingParams[0]} in Settings > API Keys before using this service.`
                        : `Please set the following in Settings > API Keys before using this service: ${missingParams.join(', ')}`}
                </Alert>
            )
        }

        return null
    }

    const renderEmbeddingSection = () => (
        <div className="space-y-2">
            <Select
                placeholder="Select embedding model"
                selectedKeys={[config.embedding_model]}
                onChange={(e) => handleConfigChange('embedding_model')(e as any)}
                isLoading={isLoadingModels}
                classNames={{
                    trigger: 'h-12',
                }}
            >
                {(() => {
                    const groupedModels = Object.entries(embeddingModels).reduce(
                        (groups, [modelId, modelInfo]) => {
                            const provider = modelInfo.provider || 'Other'
                            if (!groups[provider]) {
                                groups[provider] = []
                            }
                            groups[provider].push({ ...modelInfo, id: modelId })
                            return groups
                        },
                        {} as Record<string, (EmbeddingModelConfig & { id: string })[]>
                    )

                    return Object.entries(groupedModels).map(([provider, models], index, entries) => (
                        <SelectSection key={provider} title={provider} showDivider={index < entries.length - 1}>
                            {models.map((model) => (
                                <SelectItem key={model.id} value={model.id} textValue={model.name}>
                                    <div className="flex flex-col">
                                        <span>{model.name}</span>
                                        <span className="text-tiny text-default-400">
                                            {model.dimensions} dimensions
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectSection>
                    ))
                })()}
            </Select>
            {config.embedding_model && <ApiKeyWarning modelInfo={embeddingModels[config.embedding_model]} />}
        </div>
    )

    const renderVectorStoreSection = () => (
        <div className="space-y-2">
            <Select
                placeholder="Select vector database"
                selectedKeys={[config.vector_db]}
                onChange={(e) => handleConfigChange('vector_db')(e as any)}
                isLoading={isLoadingStores}
                classNames={{
                    trigger: 'h-12',
                }}
            >
                {Object.entries(vectorStores).map(([storeId, store]) => (
                    <SelectItem key={storeId} value={storeId} textValue={store.name}>
                        <div className="flex flex-col">
                            <span>{store.name}</span>
                            <span className="text-tiny text-default-400">{store.description}</span>
                        </div>
                    </SelectItem>
                ))}
            </Select>
            {config.vector_db && <ApiKeyWarning storeInfo={vectorStores[config.vector_db]} />}
        </div>
    )

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Select
                                label="Document Collection"
                                placeholder="Select a document collection"
                                selectedKeys={config.collection_id ? [config.collection_id] : []}
                                onChange={(e) => handleConfigChange('collection_id')(e as any)}
                                isRequired
                            >
                                {collections.map((collection) => (
                                    <SelectItem key={collection.id} value={collection.id}>
                                        {collection.name}
                                    </SelectItem>
                                ))}
                            </Select>
                            <div className="flex gap-2">
                                <Input
                                    label="Index Name"
                                    placeholder="Optional - Enter a name or leave empty for a random name"
                                    value={config.name}
                                    onChange={handleConfigChange('name')}
                                    className="w-full"
                                    endContent={
                                        <Tooltip content="Leave empty for a randomly generated name">
                                            <Info className="w-4 h-4 text-default-400" />
                                        </Tooltip>
                                    }
                                />
                                <Button
                                    isIconOnly
                                    variant="flat"
                                    className="self-end h-14"
                                    onPress={() =>
                                        handleConfigChange('name')({ target: { value: generateRandomName() } } as any)
                                    }
                                >
                                    🎲
                                </Button>
                            </div>
                            <Textarea
                                label="Description"
                                value={config.description}
                                onChange={handleConfigChange('description')}
                                minRows={3}
                                endContent={
                                    <Tooltip content="Optional description of your vector index">
                                        <Info className="w-4 h-4 text-default-400" />
                                    </Tooltip>
                                }
                            />
                        </div>
                    </div>
                )

            case 1:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">Configure Index</h3>
                            <Tooltip content="Configure your vector index settings">
                                <Info className="w-4 h-4 text-default-400" />
                            </Tooltip>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-medium">Embedding Model</span>
                                    <Tooltip content="Configure how your text will be converted to vector embeddings">
                                        <Info className="w-4 h-4 text-default-400" />
                                    </Tooltip>
                                </div>
                                {renderEmbeddingSection()}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-medium">Vector Database</span>
                                    <Tooltip content="Choose where your vector embeddings will be stored">
                                        <Info className="w-4 h-4 text-default-400" />
                                    </Tooltip>
                                </div>
                                {renderVectorStoreSection()}
                            </div>
                        </div>
                    </div>
                )

            case 2:
                const selectedCollection = collections.find((c) => c.id === config.collection_id)
                return (
                    <Card>
                        <CardBody className="gap-4">
                            <div className="text-lg font-semibold">Review Configuration</div>
                            <div className="space-y-4">
                                <div>
                                    <div className="font-medium">Collection:</div>
                                    <div className="text-default-500">
                                        {selectedCollection?.name || config.collection_id}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-medium">Index Name:</div>
                                    <div className="text-default-500">{config.name}</div>
                                </div>
                                {config.description && (
                                    <div>
                                        <div className="font-medium">Description:</div>
                                        <div className="text-default-500">{config.description}</div>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="font-medium">Embedding Model:</div>
                                        <div className="text-default-500">
                                            {embeddingModels[config.embedding_model]?.name || config.embedding_model}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-medium">Vector Database:</div>
                                        <div className="text-default-500">
                                            {vectorStores[config.vector_db]?.name || config.vector_db}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                )

            default:
                return null
        }
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
                            <h1 className="text-3xl font-bold text-default-900">Create Vector Index</h1>
                            <p className="text-small text-default-400">
                                Follow the steps to configure your vector index settings.
                            </p>
                        </div>
                        <Progress
                            classNames={{
                                base: 'mb-4',
                                track: 'drop-shadow-md',
                                indicator: 'bg-gradient-to-r from-primary to-primary-500',
                                label: 'text-sm font-medium',
                                value: 'text-sm font-medium text-default-500',
                            }}
                            label="Progress"
                            size="md"
                            value={(activeStep / (steps.length - 1)) * 100}
                            showValueLabel={true}
                            valueLabel={`${activeStep + 1} of ${steps.length}`}
                        />

                        <AnimatePresence>
                            {nameAlert && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Alert className="mb-4" color="primary" startContent={<Info className="h-4 w-4" />}>
                                        {nameAlert}
                                    </Alert>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {alert && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Alert
                                        className="mb-4"
                                        color={alert.type}
                                        startContent={
                                            alert.type === 'success' ? (
                                                <CheckCircle className="h-4 w-4" />
                                            ) : (
                                                <Info className="h-4 w-4" />
                                            )
                                        }
                                    >
                                        {alert.message}
                                    </Alert>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex flex-col gap-4">
                            {steps.map((step, index) => (
                                <motion.button
                                    key={index}
                                    onClick={() => setActiveStep(index)}
                                    className={`flex flex-col gap-1 rounded-xl border-1 p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
                    ${
                        activeStep === index
                            ? 'border-primary bg-primary/5 shadow-md'
                            : index < activeStep
                              ? 'border-success/50 bg-success/5'
                              : 'border-default-200 dark:border-default-100'
                    }`}
                                    disabled={index > activeStep}
                                    whileHover={{ scale: index <= activeStep ? 1.02 : 1 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors duration-300
                        ${
                            activeStep === index
                                ? 'bg-primary text-white shadow-md'
                                : index < activeStep
                                  ? 'bg-success text-white'
                                  : 'bg-default-100 text-default-600'
                        }`}
                                        >
                                            {index < activeStep ? '✓' : index + 1}
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
                            {renderStepContent(activeStep)}

                            <Divider className="my-4" />

                            <div className="flex justify-between items-center">
                                <Button
                                    color="danger"
                                    variant="light"
                                    onPress={() => router.back()}
                                    className="font-medium hover:bg-danger/10"
                                >
                                    Cancel
                                </Button>
                                <div className="flex gap-3">
                                    {activeStep > 0 && (
                                        <Button
                                            variant="bordered"
                                            onPress={handleBack}
                                            className="font-medium"
                                            startContent={<ArrowLeft size={18} />}
                                            isDisabled={isSubmitting}
                                        >
                                            Back
                                        </Button>
                                    )}
                                    <Button
                                        color="primary"
                                        onPress={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                                        className="font-medium"
                                        endContent={activeStep !== steps.length - 1 && <ArrowRight size={18} />}
                                        isLoading={isSubmitting}
                                        isDisabled={
                                            (activeStep === 0 && !config.collection_id) ||
                                            (activeStep === 1 && (!config.embedding_model || !config.vector_db))
                                        }
                                    >
                                        {activeStep === steps.length - 1 ? 'Create Index' : 'Next'}
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
