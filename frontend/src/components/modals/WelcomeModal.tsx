import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react'
import { useDispatch } from 'react-redux'
import { markWelcomeSeen } from '../../store/userPreferencesSlice'

interface WelcomeModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
    const dispatch = useDispatch()

    const handleClose = () => {
        dispatch(markWelcomeSeen())
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalContent>
                <ModalHeader>Welcome to PySpur! 👋</ModalHeader>
                <ModalBody>
                    <p>PySpur is your platform for building and managing AI workflows.</p>
                    <p>Get started by:</p>
                    <ul className="list-disc pl-6">
                        <li>Creating a new Spur from scratch</li>
                        <li>Using one of our templates</li>
                        <li>Importing an existing workflow</li>
                    </ul>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onPress={handleClose}>
                        Get Started
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
