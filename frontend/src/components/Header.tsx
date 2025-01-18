import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
    Input,
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    Link,
    Button,
    Spinner,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Alert,
    CircularProgress,
} from '@nextui-org/react'
import { Icon } from '@iconify/react'
import SettingsCard from './modals/SettingsModal'
import { setProjectName } from '../store/flowSlice'
import RunModal from './modals/RunModal'
import { getWorkflow } from '../utils/api'
import { useRouter } from 'next/router'
import DeployModal from './modals/DeployModal'
import { formatDistanceStrict } from 'date-fns'
import { useHotkeys } from 'react-hotkeys-hook'
import { useWorkflowExecution } from '../hooks/useWorkflowExecution'
import { AlertState } from '../types/alert'

interface HeaderProps {
    activePage: 'dashboard' | 'workflow' | 'evals' | 'trace' | 'rag'
    associatedWorkflowId?: string
}

import { RootState } from '../store/store'

const Header: React.FC<HeaderProps> = ({ activePage, associatedWorkflowId }) => {
    const dispatch = useDispatch()
    const nodes = useSelector((state: RootState) => state.flow.nodes)
    const projectName = useSelector((state: RootState) => state.flow.projectName)
    const [isDebugModalOpen, setIsDebugModalOpen] = useState<boolean>(false)
    const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false)
    const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false)
    const workflowId = useSelector((state: RootState) => state.flow.workflowID)
    const [alert, setAlert] = useState<AlertState>({
        message: '',
        color: 'default',
        isVisible: false,
    })
    const testInputs = useSelector((state: RootState) => state.flow.testInputs)
    const [selectedRow, setSelectedRow] = useState<number | null>(null)

    const router = useRouter()
    const { id } = router.query
    const isRun = id && id[0] == 'R'

    const showAlert = (message: string, color: AlertState['color']) => {
        setAlert({ message, color, isVisible: true })
        setTimeout(() => setAlert((prev) => ({ ...prev, isVisible: false })), 3000)
    }

    const {
        isRunning,
        completionPercentage,
        workflowRuns,
        isUpdatingStatus,
        executeWorkflow,
        stopWorkflow,
        updateRunStatuses,
    } = useWorkflowExecution({ onAlert: showAlert })

    useEffect(() => {
        if (testInputs.length > 0 && !selectedRow) {
            setSelectedRow(testInputs[0].id)
        }
    }, [testInputs])

    const handleRunWorkflow = async (): Promise<void> => {
        setIsDebugModalOpen(true)
    }

    const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        dispatch(setProjectName(e.target.value))
    }

    const handleDownloadWorkflow = async (): Promise<void> => {
        if (!workflowId) return

        try {
            const workflow = await getWorkflow(workflowId)

            const workflowDetails = {
                name: workflow.name,
                definition: workflow.definition,
                description: workflow.description,
            }

            const blob = new Blob([JSON.stringify(workflowDetails, null, 2)], {
                type: 'application/json',
            })

            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${projectName.replace(/\s+/g, '_')}.json`

            document.body.appendChild(a)
            a.click()

            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Error downloading workflow:', error)
        }
    }

    const handleDeploy = (): void => {
        setIsDeployModalOpen(true)
    }

    const getApiEndpoint = (): string => {
        if (typeof window === 'undefined') {
            return ''
        }
        const baseUrl = window.location.origin
        return `${baseUrl}/api/wf/${workflowId}/start_run/?run_type=non_blocking`
    }

    useEffect(() => {
        if (isHistoryOpen) {
            updateRunStatuses()
        }
    }, [isHistoryOpen])

    useHotkeys(
        ['mod+enter'],
        (e) => {
            e.preventDefault()

            if (testInputs.length === 0) {
                setIsDebugModalOpen(true)
                return
            }

            const testCase = testInputs.find((row) => row.id === selectedRow) ?? testInputs[0]

            if (testCase) {
                const { id, ...inputValues } = testCase
                const inputNode = nodes.find((node) => node.type === 'InputNode')
                const inputNodeId = inputNode?.data?.title || inputNode?.id

                if (inputNodeId) {
                    const initialInputs = {
                        [inputNodeId]: inputValues,
                    }
                    executeWorkflow(initialInputs)
                }
            }
        },
        {
            enableOnFormTags: true,
            enabled: activePage === 'workflow',
        }
    )

    return (
        <>
            {alert.isVisible && (
                <div className="fixed bottom-4 right-4 z-50">
                    <Alert color={alert.color}>{alert.message}</Alert>
                </div>
            )}
            <Navbar
                classNames={{
                    base: 'lg:bg-background lg:backdrop-filter-none h-12 mt-1 shadow-sm',
                    wrapper: 'px-4 sm:px-6',
                    item: [
                        'flex',
                        'relative',
                        'h-full',
                        'items-center',
                        "data-[active=true]:after:content-['']",
                        'data-[active=true]:after:absolute',
                        'data-[active=true]:after:bottom-0',
                        'data-[active=true]:after:left-0',
                        'data-[active=true]:after:right-0',
                        'data-[active=true]:after:h-[2px]',
                        'data-[active=true]:after:rounded-[2px]',
                        'data-[active=true]:after:bg-primary',
                        'data-[active=true]:after:text-primary',
                    ],
                }}
            >
                <NavbarBrand className="h-12 max-w-fit">
                    {activePage === 'dashboard' ? (
                        <p className="font-bold text-default-900 cursor-pointer">PySpur</p>
                    ) : (
                        <Link href="/" className="cursor-pointer">
                            <p className="font-bold text-default-900">PySpur</p>
                        </Link>
                    )}
                </NavbarBrand>

                {(activePage === 'workflow' || activePage === 'trace') && (
                    <NavbarContent
                        className="h-12 rounded-full bg-content2 dark:bg-content1 sm:flex"
                        id="workflow-title"
                        justify="start"
                    >
                        <Input
                            className="px-4"
                            type="text"
                            placeholder="Project Name"
                            value={projectName}
                            onChange={handleProjectNameChange}
                            disabled={activePage !== 'workflow'}
                        />
                    </NavbarContent>
                )}
                <NavbarContent
                    className="h-12 gap-4 rounded-full bg-content2 px-4 dark:bg-content1 max-w-fit"
                    justify="end"
                    id="dashboard-editor-nav"
                >
                    <NavbarItem isActive={activePage === 'dashboard'}>
                        <Link className="flex gap-2 text-inherit" href="/dashboard">
                            Dashboard
                        </Link>
                    </NavbarItem>
                    {activePage === 'workflow' && <NavbarItem isActive={activePage === 'workflow'}>Editor</NavbarItem>}
                    {activePage === 'trace' && <NavbarItem isActive={activePage === 'trace'}>Trace</NavbarItem>}
                    <NavbarItem isActive={activePage === 'evals'}>
                        <Link className="flex gap-2 text-inherit" href="/evals">
                            Evals
                        </Link>
                    </NavbarItem>
                    <NavbarItem isActive={activePage === 'rag'}>
                        <Link className="flex gap-2 text-inherit" href="/rag">
                            RAG
                        </Link>
                    </NavbarItem>
                </NavbarContent>
                {activePage === 'workflow' && (
                    <NavbarContent
                        className="ml-auto flex h-12 max-w-fit items-center gap-0 rounded-full p-0 lg:bg-content2 lg:px-1 lg:dark:bg-content1"
                        justify="end"
                        id="workflow-actions-buttons"
                    >
                        {!isRun && (
                            <>
                                {isRunning ? (
                                    <>
                                        <NavbarItem className="hidden sm:flex">
                                            <CircularProgress
                                                size="sm"
                                                value={completionPercentage}
                                                color="success"
                                                showValueLabel={true}
                                                aria-label="Running progress"
                                            />
                                        </NavbarItem>
                                        <NavbarItem className="hidden sm:flex">
                                            <Button isIconOnly radius="full" variant="light" onClick={stopWorkflow}>
                                                <Icon
                                                    className="text-foreground/60"
                                                    icon="solar:stop-linear"
                                                    width={22}
                                                />
                                            </Button>
                                        </NavbarItem>
                                    </>
                                ) : (
                                    <NavbarItem className="hidden sm:flex">
                                        <Button isIconOnly radius="full" variant="light" onClick={handleRunWorkflow}>
                                            <Icon className="text-foreground/60" icon="solar:play-linear" width={22} />
                                        </Button>
                                    </NavbarItem>
                                )}
                            </>
                        )}
                        <NavbarItem className="hidden sm:flex">
                            <Dropdown isOpen={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                                <DropdownTrigger>
                                    <Button isIconOnly radius="full" variant="light">
                                        <Icon className="text-foreground/60" icon="solar:history-linear" width={22} />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu>
                                    {isUpdatingStatus ? (
                                        <DropdownItem key={`fetching-latest-runs`}>
                                            <div className="flex items-center gap-2">
                                                <Spinner size="sm" />
                                                <span>Fetching latest runs...</span>
                                            </div>
                                        </DropdownItem>
                                    ) : (
                                        workflowRuns.map((run, index) => (
                                            <DropdownItem
                                                key={index}
                                                onPress={() => window.open(`/trace/${run.id}`, '_blank')}
                                                textValue={`Version ${index + 1}`}
                                            >
                                                {`${run.id} | ${run.status.toLowerCase()} ${
                                                    (run.status.toLowerCase() === 'running' ||
                                                        run.status.toLowerCase() === 'pending') &&
                                                    run.start_time
                                                        ? `for last ${formatDistanceStrict(Date.parse(run.start_time + 'Z'), new Date(), { addSuffix: false })}`
                                                        : (run.status.toLowerCase() === 'failed' ||
                                                                run.status.toLowerCase() === 'completed') &&
                                                            run.end_time
                                                          ? `${formatDistanceStrict(Date.parse(run.end_time + 'Z'), new Date(), { addSuffix: true })}`
                                                          : ''
                                                }`}
                                            </DropdownItem>
                                        ))
                                    )}
                                </DropdownMenu>
                            </Dropdown>
                        </NavbarItem>
                        <NavbarItem className="hidden sm:flex">
                            <Button isIconOnly radius="full" variant="light" onClick={handleDownloadWorkflow}>
                                <Icon className="text-foreground/60" icon="solar:download-linear" width={24} />
                            </Button>
                        </NavbarItem>
                        <NavbarItem className="hidden sm:flex">
                            <Button isIconOnly radius="full" variant="light" onClick={handleDeploy}>
                                <Icon className="text-foreground/60" icon="solar:cloud-upload-linear" width={24} />
                            </Button>
                        </NavbarItem>
                    </NavbarContent>
                )}
                {activePage === 'trace' && associatedWorkflowId && (
                    <NavbarContent
                        className="ml-auto flex h-12 max-w-fit items-center gap-0 rounded-full p-0 lg:bg-content2 lg:px-1 lg:dark:bg-content1"
                        justify="end"
                    >
                        <NavbarItem>
                            <Link href={`/workflows/${associatedWorkflowId}`}>
                                <Button variant="light">Go To Workflow</Button>
                            </Link>
                        </NavbarItem>
                    </NavbarContent>
                )}
                <NavbarContent
                    className="ml-2 flex h-12 max-w-fit items-center gap-0 rounded-full p-0 lg:bg-content2 lg:px-1 lg:dark:bg-content1"
                    justify="end"
                >
                    <NavbarItem className="hidden sm:flex">
                        <SettingsCard />
                    </NavbarItem>
                </NavbarContent>
            </Navbar>
            <RunModal
                isOpen={isDebugModalOpen}
                onOpenChange={setIsDebugModalOpen}
                onRun={async (selectedInputs) => {
                    await executeWorkflow(selectedInputs)
                    setIsDebugModalOpen(false)
                }}
            />
            <DeployModal
                isOpen={isDeployModalOpen}
                onOpenChange={setIsDeployModalOpen}
                getApiEndpoint={getApiEndpoint}
            />
        </>
    )
}

export default Header
