'use client'

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import ListItem from '@tiptap/extension-list-item'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from '@nextui-org/react'
import { Icon } from '@iconify/react'
import { List, ListOrdered } from 'lucide-react'
import styles from './TextEditor.module.css'
import { Markdown } from 'tiptap-markdown'

interface TextEditorProps {
    nodeID: string
    fieldName: string
    content: string
    setContent: (content: string) => void
    isEditable?: boolean
    fullScreen?: boolean
    inputSchema?: string[]
    fieldTitle?: string
}

interface TextEditorRef {
    insertAtCursor: (text: string) => void
}

const TextEditor = forwardRef<TextEditorRef, TextEditorProps>(
    ({ content, setContent, isEditable = true, fullScreen = false, inputSchema = [], fieldTitle }, ref) => {
        const editor = useEditor({
            extensions: [
                Color.configure({ types: [TextStyle.name, ListItem.name] }),
                TextStyle.configure(),
                StarterKit.configure({
                    bulletList: { keepMarks: true, keepAttributes: false },
                    orderedList: { keepMarks: true, keepAttributes: false },
                }),
                Underline,
                Markdown.configure({
                    html: false,
                    transformPastedText: true,
                    transformCopiedText: true,
                }),
            ],
            content: content ? content : '',
            editorProps: {
                attributes: {
                    class: [
                        'w-full bg-content2 hover:bg-content3 transition-colors min-h-[120px] max-h-[300px] overflow-y-auto resize-y rounded-medium px-3 py-2 text-foreground outline-none placeholder:text-foreground-500',
                        isEditable ? '' : 'rounded-medium',
                        fullScreen ? styles.fullScreenEditor : styles.truncatedEditor,
                    ]
                        .filter(Boolean)
                        .join(' '),
                },
            },
            onUpdate: ({ editor }) => {
                setContent(editor.storage.markdown?.getMarkdown() ?? '')
            },
            editable: isEditable,
            autofocus: 'end',
        })

        useImperativeHandle(ref, () => ({
            insertAtCursor: (text: string) => {
                if (editor) {
                    editor.chain().focus().insertContent(text).run()
                }
            },
        }))

        const { isOpen, onOpen, onOpenChange } = useDisclosure()

        const modalEditor = useEditor({
            extensions: [
                Color.configure({ types: [TextStyle.name, ListItem.name] }),
                TextStyle.configure(),
                StarterKit.configure({
                    bulletList: { keepMarks: true, keepAttributes: false },
                    orderedList: { keepMarks: true, keepAttributes: false },
                }),
                Underline,
                Markdown.configure({
                    html: false,
                    transformPastedText: true,
                    transformCopiedText: true,
                }),
            ],
            content: content ? content : '',
            editorProps: {
                attributes: {
                    class: 'w-full bg-content2 hover:bg-content3 transition-colors min-h-[40vh] resize-y rounded-medium px-3 py-2 text-foreground outline-none placeholder:text-foreground-500',
                },
            },
            onUpdate: ({ editor }) => {
                const newContent = editor.storage.markdown?.getMarkdown() ?? ''
                if (newContent !== content) {
                    setContent(newContent)
                }
            },
            editable: true,
            autofocus: false,
        })

        const renderVariableButtons = (editorInstance: Editor | null) => {
            if (inputSchema === null || inputSchema === undefined || inputSchema.length === 0) {
                return null
            }

            const generateFullSchemaJson = () => {
                const schemaObject = inputSchema.reduce(
                    (acc, variable) => {
                        acc[variable] = `{{${variable}}}`
                        return acc
                    },
                    {} as Record<string, string>
                )
                return JSON.stringify(schemaObject, null, 2)
            }

            return (
                <div className="flex flex-wrap gap-2 mb-2 px-2">
                    {Array.isArray(inputSchema) && inputSchema.length > 0 && (
                        <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            onPress={() => {
                                if (editorInstance) {
                                    editorInstance.chain().focus().insertContent(generateFullSchemaJson()).run()
                                }
                            }}
                            isIconOnly
                        >
                            <Icon icon="solar:document-add-linear" className="w-4 h-4" />
                        </Button>
                    )}
                    {Array.isArray(inputSchema)
                        ? inputSchema.map((variable) => (
                              <Button
                                  key={variable}
                                  size="sm"
                                  variant="flat"
                                  color="primary"
                                  onPress={() => {
                                      if (editorInstance) {
                                          editorInstance.chain().focus().insertContent(`{{${variable}}}`).run()
                                      }
                                  }}
                              >
                                  {variable}
                              </Button>
                          ))
                        : null}
                </div>
            )
        }

        const renderToolbar = (editorInstance: Editor | null, isFullScreen = false) => {
            if (!editorInstance) return null

            const buttonSize = isFullScreen ? 'sm' : 'md'
            const buttonClassName = isFullScreen ? 'w-4 h-4' : 'w-3 h-3'
            const toolbarClassName = `px-2 py-2 rounded-t-medium flex flex-col gap-2 w-full bg-content2 border-b border-divider`

            return (
                <div className={toolbarClassName}>
                    <div className="flex justify-start items-center gap-1 w-full lg:w-10/12 flex-wrap">
                        <Button
                            onPress={() => editorInstance.chain().focus().toggleBold().run()}
                            disabled={!editorInstance.can().chain().focus().toggleBold().run()}
                            color="primary"
                            variant={editorInstance.isActive('bold') ? 'solid' : 'flat'}
                            size={buttonSize}
                            isIconOnly
                        >
                            <Icon icon="solar:text-bold-linear" className={buttonClassName} />
                        </Button>
                        <Button
                            onPress={() => editorInstance.chain().focus().toggleItalic().run()}
                            disabled={!editorInstance.can().chain().focus().toggleItalic().run()}
                            color="primary"
                            variant={editorInstance.isActive('italic') ? 'solid' : 'flat'}
                            size={buttonSize}
                            isIconOnly
                        >
                            <Icon icon="solar:text-italic-linear" className={buttonClassName} />
                        </Button>
                        <Button
                            onPress={() => editorInstance.chain().focus().toggleUnderline().run()}
                            disabled={!editorInstance.can().chain().focus().toggleUnderline().run()}
                            color="primary"
                            variant={editorInstance.isActive('underline') ? 'solid' : 'flat'}
                            size={buttonSize}
                            isIconOnly
                        >
                            <Icon icon="solar:text-underline-linear" className={buttonClassName} />
                        </Button>
                        <Button
                            onPress={() => editorInstance.chain().focus().toggleBulletList().run()}
                            color="primary"
                            variant={editorInstance.isActive('bulletList') ? 'solid' : 'flat'}
                            size={buttonSize}
                            isIconOnly
                        >
                            <List className={buttonClassName} />
                        </Button>
                        <Button
                            onPress={() => editorInstance.chain().focus().toggleOrderedList().run()}
                            color="primary"
                            variant={editorInstance.isActive('orderedList') ? 'solid' : 'flat'}
                            size={buttonSize}
                            isIconOnly
                        >
                            <ListOrdered className={buttonClassName} />
                        </Button>
                    </div>
                    {renderVariableButtons(editorInstance)}
                </div>
            )
        }

        const handleCancel = (onClose: () => void) => {
            if (modalEditor) {
                modalEditor.commands.setContent(content || '')
            }
            onClose()
        }

        const handleSave = (onClose: () => void) => {
            if (modalEditor) {
                const newContent = modalEditor.storage.markdown?.getMarkdown() ?? ''
                if (editor) {
                    editor.commands.setContent(newContent)
                }
                setContent(newContent)
                onClose()
            }
        }

        return (
            <div className="relative">
                {!fullScreen && (
                    <Button
                        onPress={onOpen}
                        isIconOnly
                        className="absolute top-0 right-0 z-10"
                        size="sm"
                    >
                        <Icon icon="solar:full-screen-linear" className="w-4 h-4" />
                    </Button>
                )}

                {isEditable && renderToolbar(editor)}
                <div className={styles.tiptap}>
                    <EditorContent editor={editor} />
                </div>

                <Modal
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                    size="5xl"
                    scrollBehavior="inside"
                    placement="center"
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">Prompt Editor</ModalHeader>
                                <ModalBody>
                                    <div>
                                        {renderToolbar(modalEditor, true)}
                                        <div className={styles.tiptap}>
                                            <EditorContent editor={modalEditor} />
                                        </div>
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="danger" variant="light" onPress={() => handleCancel(onClose)}>
                                        Cancel
                                    </Button>
                                    <Button color="primary" onPress={() => handleSave(onClose)}>
                                        Save
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </div>
        )
    }
)

TextEditor.displayName = 'TextEditor'

export default TextEditor
