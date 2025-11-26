import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Fade,
    Box
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import RMSTheme from '../theme-resource/RMSTheme';

/**
 * Reusable Warning Modal Component
 * 
 * @param {boolean} open - Controls modal visibility
 * @param {function} onClose - Callback when modal is closed
 * @param {string} title - Title text to display (required)
 * @param {string|React.ReactNode} content - Content/message to display (required)
 * @param {string} buttonText - Text for OK button (default: "OK")
 * @param {function} onConfirm - Optional callback when OK is clicked (defaults to onClose)
 */
const WarningModal = ({
    open,
    onClose,
    title,
    content,
    buttonText = "OK",
    onConfirm
}) => {
    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        } else {
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            TransitionComponent={Fade}
            transitionDuration={{ enter: 400, exit: 250 }}
            PaperProps={{
                sx: {
                    minWidth: 320,
                    borderRadius: 4,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'linear-gradient(180deg, rgba(28,35,57,0.95) 0%, rgba(9,14,28,0.95) 80%)',
                    boxShadow: '0 25px 70px rgba(8,15,31,0.55)',
                    overflow: 'hidden'
                }
            }}
            sx={{
                '& .MuiBackdrop-root': {
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(4px)'
                }
            }}
        >
            <DialogTitle
                sx={{
                    textAlign: 'center',
                    fontWeight: 600,
                    color: '#ffffff',
                    pb: 2,
                    pt: 2,
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                }}
            >
                {/* <WarningIcon sx={{ fontSize: 28, color: '#fef2f2' }} /> */}
                <Box component="span">{title}</Box>
            </DialogTitle>
            <DialogContent
                sx={{
                    py: 3,
                    px: 4,
                }}
            >
                <Typography
                    variant="body2"
                    sx={{
                        textAlign: 'center',
                        color: 'rgba(241,245,249,0.90)',
                        fontSize: '15px',
                        paddingTop: 5,
                        lineHeight: 1.6
                    }}
                >
                    {content}
                </Typography>
            </DialogContent>
            <DialogActions
                sx={{
                    justifyContent: 'center',
                    px: 4,
                    pb: 3
                }}
            >
                <Button
                    onClick={handleConfirm}
                    sx={{
                        background: RMSTheme.components.button.primary.background,
                        color: RMSTheme.components.button.primary.text,
                        padding: '10px 32px',
                        borderRadius: RMSTheme.borderRadius.small,
                        border: `1px solid ${RMSTheme.components.button.primary.border}`,
                        boxShadow: RMSTheme.components.button.primary.shadow,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '15px',
                        '&:hover': {
                            background: RMSTheme.components.button.primary.hover,
                            transform: 'translateY(-1px)',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                        },
                        transition: 'all 0.2s ease'
                    }}
                >
                    {buttonText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default WarningModal;
