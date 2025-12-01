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
import { Download as DownloadIcon, Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';
import RMSTheme from '../theme-resource/RMSTheme';

/**
 * Reusable Download Confirmation Modal Component with Three Actions
 * 
 * @param {boolean} open - Controls modal visibility
 * @param {function} onCancel - Callback when Cancel button is clicked (go back to review)
 * @param {function} onCreateOnly - Callback when Create/Update Report Only is clicked
 * @param {function} onDownload - Callback when Download Report is clicked
 * @param {string} title - Title text to display (default: "Submit Report")
 * @param {string|React.ReactNode} content - Content/message to display
 * @param {string} createOnlyLabel - Label for the create/update only button (default: "Create Report Only")
 * @param {boolean} loading - Loading state for the action buttons
 */
const DownloadConfirmationModal = ({
    open,
    onCancel,
    onCreateOnly,
    onDownload,
    title = "Submit Report",
    content = "Would you like to download the report after creating it?",
    createOnlyLabel = "Create Report Only",
    loading = false
}) => {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            fullWidth
            maxWidth="sm"
            TransitionComponent={Fade}
            transitionDuration={{ enter: 400, exit: 250 }}
            PaperProps={{
                sx: {
                    minWidth: 450,
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
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                }}
            >
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
                    px: 3,
                    pb: 3,
                    gap: 1.5,
                    flexWrap: 'nowrap'
                }}
            >
                <Button
                    onClick={onCancel}
                    disabled={loading}
                    startIcon={<CloseIcon />}
                    sx={{
                        background: '#6c757d',
                        color: 'white',
                        padding: '10px 24px',
                        borderRadius: RMSTheme.borderRadius.small,
                        border: '1px solid #5a6268',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                        '&:hover': {
                            background: '#5a6268',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                        },
                        '&:disabled': {
                            opacity: 0.6
                        },
                        transition: 'all 0.2s ease'
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onCreateOnly}
                    disabled={loading}
                    startIcon={!loading && <SaveIcon />}
                    sx={{
                        background: '#17a2b8',
                        color: 'white',
                        padding: '10px 24px',
                        borderRadius: RMSTheme.borderRadius.small,
                        border: '1px solid #138496',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                        '&:hover': {
                            background: '#138496',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                        },
                        '&:disabled': {
                            opacity: 0.6
                        },
                        transition: 'all 0.2s ease'
                    }}
                >
                    {loading ? 'Processing...' : createOnlyLabel}
                </Button>
                <Button
                    onClick={onDownload}
                    disabled={loading}
                    startIcon={!loading && <DownloadIcon />}
                    sx={{
                        background: RMSTheme.components.button.primary.background,
                        color: RMSTheme.components.button.primary.text,
                        padding: '10px 24px',
                        borderRadius: RMSTheme.borderRadius.small,
                        border: `1px solid ${RMSTheme.components.button.primary.border}`,
                        boxShadow: RMSTheme.components.button.primary.shadow,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                        '&:hover': {
                            background: RMSTheme.components.button.primary.hover,
                            transform: 'translateY(-1px)',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                        },
                        '&:disabled': {
                            opacity: 0.6
                        },
                        transition: 'all 0.2s ease'
                    }}
                >
                    {loading ? 'Processing...' : 'Download Report'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DownloadConfirmationModal;
