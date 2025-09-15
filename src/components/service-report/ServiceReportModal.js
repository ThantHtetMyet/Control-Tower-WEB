import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Fade
} from '@mui/material';

const ServiceReportModal = ({ open, onClose, title, message }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="service-report-dialog-title"
      aria-describedby="service-report-dialog-description"
      TransitionComponent={Fade}
      transitionDuration={{
        enter: 400,
        exit: 300
      }}
      PaperProps={{
        sx: {
          minWidth: '350px',
          padding: 0,
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: 'rgba(128, 0, 128, 0.15)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(128, 0, 128, 0.2)',
          boxShadow: '0 20px 60px rgba(128, 0, 128, 0.4), 0 8px 32px rgba(75, 0, 130, 0.3)',
          animation: 'gentleSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '@keyframes gentleSlideIn': {
            '0%': {
              opacity: 0,
              transform: 'scale(0.8) translateY(-20px)'
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1) translateY(0)'
            }
          }
        }
      }}
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(75, 0, 130, 0.4)',
          backdropFilter: 'blur(4px)',
          transition: 'all 0.3s ease-in-out'
        }
      }}
    >
      <DialogTitle 
        id="service-report-dialog-title"
        sx={{
          background: 'linear-gradient(135deg, #800080 0%, #4B0082 50%, #663399 100%)',
          color: '#fff',
          padding: '20px 24px',
          textAlign: 'center',
          margin: 0,
          fontWeight: 600,
          fontSize: '1.1rem',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          animation: 'fadeInDown 0.5s ease-out 0.1s both',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)',
            zIndex: 1
          },
          '& *': {
            position: 'relative',
            zIndex: 2
          }
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ 
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.95)',
        animation: 'fadeInUp 0.5s ease-out 0.2s both'
      }}>
        <DialogContentText 
          id="service-report-dialog-description" 
          sx={{ 
            color: 'rgba(75, 0, 130, 0.9)', 
            textAlign: 'center',
            marginTop: 3,
            fontSize: '1rem',
            fontWeight: 500,
            textShadow: '0 1px 4px rgba(128, 0, 128, 0.1)',
            animation: 'fadeIn 0.4s ease-out 0.3s both'
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ 
        justifyContent: 'center', 
        padding: '0 24px 24px',
        background: 'rgba(255, 255, 255, 0.95)',
        animation: 'fadeInUp 0.5s ease-out 0.4s both'
      }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #800080 0%, #4B0082 100%)',
            color: '#fff',
            border: '1px solid rgba(128, 0, 128, 0.2)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4B0082 0%, #800080 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 8px 25px rgba(128, 0, 128, 0.4)'
            },
            minWidth: '120px',
            borderRadius: '10px',
            padding: '10px 24px',
            fontWeight: 600,
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 12px rgba(75, 0, 130, 0.2)',
            '&:active': {
              transform: 'translateY(0px)'
            }
          }}
        >
          OK
        </Button>
      </DialogActions>
      
      {/* Global keyframes for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Dialog>
  );
};

export default ServiceReportModal;