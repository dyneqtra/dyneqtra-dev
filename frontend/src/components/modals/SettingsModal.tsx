'use client'

import type { CardProps, SwitchProps } from '@nextui-org/react'
import React, { useState, useEffect } from 'react'
import {
    Card,
    CardBody,
    CardFooter,
    Tabs,
    Tab,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Button,
    useDisclosure,
    Input,
    extendVariants,
    Switch,
    cn,
    Divider,
    ScrollShadow,
} from '@nextui-org/react'
import { Icon } from '@iconify/react'
import { listApiKeys, setApiKey, getApiKey, deleteApiKey } from '@/utils/api'
import { useTheme } from 'next-themes'

// CellWrapper Component
const CellWrapper = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('flex items-center justify-between gap-2 rounded-medium bg-content2 p-4', className)}
            {...props}
        >
            {children}
        </div>
    )
)

CellWrapper.displayName = 'CellWrapper'

// CustomSwitch Component
const CustomSwitch = extendVariants(Switch, {
    variants: {
        color: {
            foreground: {
                wrapper: ['group-data-[selected=true]:bg-foreground', 'group-data-[selected=true]:text-background'],
            },
        },
    },
})

// SwitchCell Component
type SwitchCellProps = Omit<SwitchProps, 'color'> & {
    label: string
    description: string
    color?: SwitchProps['color'] | 'foreground'
    classNames?: SwitchProps['classNames'] & {
        description?: string | string[]
    }
}

const SwitchCell = React.forwardRef<HTMLInputElement, SwitchCellProps>(
    ({ label, description, classNames, ...props }, ref) => (
        <CustomSwitch
            ref={ref}
            classNames={{
                ...classNames,
                base: cn(
                    'inline-flex bg-content2 flex-row-reverse w-full max-w-full items-center',
                    'justify-between cursor-pointer rounded-medium gap-2 p-4',
                    classNames?.base
                ),
            }}
            {...props}
        >
            <div className="flex flex-col">
                <p className={cn('text-medium', classNames?.label)}>{label}</p>
                <p className={cn('text-small text-default-500', classNames?.description)}>{description}</p>
            </div>
        </CustomSwitch>
    )
)

SwitchCell.displayName = 'SwitchCell'

// Provider Types
interface ProviderParameter {
    name: string
    description: string
    required: boolean
    type: string
}

interface ProviderConfig {
    id: string
    name: string
    description: string
    category: string
    parameters: ProviderParameter[]
    icon: string
}

// APIKeys Component
const APIKeys = (props: CardProps): React.ReactElement => {
    const [keys, setKeys] = useState<{ name: string; value: string }[]>([])
    const [originalKeys, setOriginalKeys] = useState<{ name: string; value: string }[]>([])
    const [providers, setProviders] = useState<ProviderConfig[]>([])
    const [selectedProvider, setSelectedProvider] = useState<ProviderConfig | null>(null)

    const fetchProviders = async () => {
        try {
            const response = await fetch('/api/env-mgmt/providers')
            const data = await response.json()
            if (Array.isArray(data)) {
                setProviders(data)
            } else {
                console.error('Expected providers data to be an array')
                setProviders([])
            }
        } catch (error) {
            console.error('Error fetching providers:', error)
            setProviders([])
        }
    }

    const fetchApiKeys = async () => {
        try {
            const response = await listApiKeys()
            const keyValues = await Promise.all(
                response.map(async (key: string) => {
                    const value = await getApiKey(key)
                    return { name: value.name, value: value.value }
                })
            )

            setKeys(keyValues)
            setOriginalKeys(keyValues)
        } catch (error) {
            console.error('Error fetching API keys:', error)
        }
    }

    useEffect(() => {
        fetchProviders()
        fetchApiKeys()
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setKeys((prevKeys) => prevKeys.map((key) => (key.name === name ? { ...key, value: value } : key)))
    }

    const handleDeleteKey = async (name: string) => {
        try {
            await deleteApiKey(name)
            await fetchApiKeys()
        } catch (error) {
            console.error('Error deleting API key:', error)
        }
    }

    const saveApiKeys = async () => {
        try {
            await Promise.all(
                keys.map(async ({ name, value }) => {
                    const originalKey = originalKeys.find((k) => k.name === name)
                    const trimmedValue = value.trim()

                    if (originalKey && trimmedValue !== originalKey.value) {
                        if (trimmedValue !== '') {
                            await setApiKey(name, trimmedValue)
                        } else {
                            await handleDeleteKey(name)
                        }
                    }
                })
            )
            await fetchApiKeys()
        } catch (error) {
            console.error('Error saving API keys:', error)
        }
    }

    const hasChanges = () => {
        return keys.some((key) => {
            const originalKey = originalKeys.find((k) => k.name === key.name)
            return originalKey && key.value.trim() !== originalKey.value
        })
    }

    const getProviderIcon = (iconName: string) => {
        const iconMap: Record<string, string> = {
            // LLM Providers
            openai: 'logos:openai-icon',
            azure: 'logos:microsoft-azure',
            anthropic: 'logos:anthropic',
            google: 'logos:google-icon',
            deepseek: 'solar:code-circle-bold',
            cohere: 'solar:magic-stick-3-bold',
            voyage: 'solar:rocket-bold',
            mistral: 'solar:stars-bold',

            // Vector Store Providers
            pinecone: 'logos:pinecone',
            weaviate: 'logos:weaviate',
            qdrant: 'logos:qdrant',
            chroma: 'solar:database-minimalistic-bold',
            supabase: 'logos:supabase-icon',
            database: 'solar:database-bold',
        }
        return iconMap[iconName] || iconMap.database
    }

    const renderProviderGrid = () => {
        const vectorStoreProviders = providers.filter((p) => p.category === 'vectorstore')
        const llmProviders = providers.filter((p) => p.category === 'llm')

        return (
            <div className="space-y-6">
                {/* LLM Providers */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Icon icon="solar:brain-bold" className="text-primary" width={20} />
                        <div>
                            <h4 className="text-medium font-medium">AI Models</h4>
                            <p className="text-tiny text-default-400">Configure your AI model providers</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {llmProviders.map((provider) => (
                            <Card
                                key={provider.id}
                                isPressable
                                onPress={() => setSelectedProvider(provider)}
                                className={cn(
                                    'border-2',
                                    selectedProvider?.id === provider.id ? 'border-primary' : 'border-transparent'
                                )}
                            >
                                <CardBody className="gap-2">
                                    <div className="flex items-center gap-2">
                                        <Icon icon={getProviderIcon(provider.icon)} width={24} />
                                        <div>
                                            <h5 className="text-small font-medium">{provider.name}</h5>
                                            <p className="text-tiny text-default-400">{provider.description}</p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Vector Store Providers */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Icon icon="solar:database-bold" className="text-primary" width={20} />
                        <div>
                            <h4 className="text-medium font-medium">Vector Databases</h4>
                            <p className="text-tiny text-default-400">Configure your vector database providers</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {vectorStoreProviders.map((provider) => (
                            <Card
                                key={provider.id}
                                isPressable
                                onPress={() => setSelectedProvider(provider)}
                                className={cn(
                                    'border-2',
                                    selectedProvider?.id === provider.id ? 'border-primary' : 'border-transparent'
                                )}
                            >
                                <CardBody className="gap-2">
                                    <div className="flex items-center gap-2">
                                        <Icon icon={getProviderIcon(provider.icon)} width={24} />
                                        <div>
                                            <h5 className="text-small font-medium">{provider.name}</h5>
                                            <p className="text-tiny text-default-400">{provider.description}</p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Selected Provider Configuration */}
                {selectedProvider && (
                    <Card className="mt-6">
                        <CardBody className="gap-4">
                            <div className="flex items-center gap-2">
                                <Icon icon={getProviderIcon(selectedProvider.icon)} width={24} />
                                <div>
                                    <h4 className="text-medium font-medium">{selectedProvider.name} Configuration</h4>
                                    <p className="text-tiny text-default-400">{selectedProvider.description}</p>
                                </div>
                            </div>
                            <Divider />
                            <div className="space-y-3">
                                {selectedProvider.parameters.map((param) => {
                                    const key = keys.find((k) => k.name === param.name)
                                    return (
                                        <Input
                                            key={param.name}
                                            label={param.description}
                                            placeholder={`Enter ${param.description.toLowerCase()}`}
                                            name={param.name}
                                            value={key?.value || ''}
                                            type={param.type === 'password' ? 'password' : 'text'}
                                            size="sm"
                                            variant="bordered"
                                            isClearable
                                            onClear={() => handleDeleteKey(param.name)}
                                            onFocus={() =>
                                                setKeys((prevKeys) =>
                                                    prevKeys.map((key) =>
                                                        key.name === param.name ? { ...key, value: '' } : key
                                                    )
                                                )
                                            }
                                            onChange={handleInputChange}
                                        />
                                    )
                                })}
                            </div>
                        </CardBody>
                    </Card>
                )}
            </div>
        )
    }

    return (
        <Card {...props}>
            <CardBody className="gap-4 p-0">{renderProviderGrid()}</CardBody>
            {hasChanges() && (
                <CardFooter className="px-0 pt-4">
                    <div className="flex gap-2 ml-auto">
                        <Button
                            variant="light"
                            onPress={() => {
                                setKeys(originalKeys)
                                setSelectedProvider(null)
                            }}
                            startContent={<Icon icon="solar:close-circle-bold" width={20} />}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            onPress={saveApiKeys}
                            startContent={<Icon icon="solar:disk-bold" width={20} />}
                        >
                            Save Changes
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    )
}

// Main SettingsModal Component
const SettingsModal = (props: CardProps): JSX.Element => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const { theme, setTheme } = useTheme()

    return (
        <>
            <Button onPress={onOpen} variant="light" isIconOnly>
                <Icon className="text-default-500" icon="solar:settings-linear" width={24} />
            </Button>

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="2xl"
                scrollBehavior="inside"
                classNames={{
                    base: 'max-h-[90vh]',
                    body: 'p-0',
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Settings</ModalHeader>
                            <ModalBody>
                                <Tabs
                                    classNames={{
                                        tabList: 'mx-4 mt-2',
                                        panel: 'px-4 py-2',
                                        cursor: 'bg-primary/20',
                                        tab: 'max-w-fit px-4 h-10 data-[selected=true]:text-primary data-[selected=true]:font-medium',
                                        tabContent: 'group-data-[selected=true]:text-primary',
                                    }}
                                >
                                    <Tab
                                        key="appearance"
                                        title={
                                            <div className="flex items-center gap-2">
                                                <Icon icon="solar:palette-bold" width={20} />
                                                <span>Appearance</span>
                                            </div>
                                        }
                                    >
                                        <Card className="border-none shadow-none bg-transparent">
                                            <CardBody>
                                                <SwitchCell
                                                    label="Dark Mode"
                                                    description="Toggle between light and dark theme"
                                                    isSelected={theme === 'dark'}
                                                    onValueChange={(isSelected) =>
                                                        setTheme(isSelected ? 'dark' : 'light')
                                                    }
                                                />
                                            </CardBody>
                                        </Card>
                                    </Tab>
                                    <Tab
                                        key="api-keys"
                                        title={
                                            <div className="flex items-center gap-2">
                                                <Icon icon="solar:key-minimalistic-bold" width={20} />
                                                <span>API Keys</span>
                                            </div>
                                        }
                                    >
                                        <APIKeys className="border-none shadow-none bg-transparent" />
                                    </Tab>
                                </Tabs>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}

export default SettingsModal
