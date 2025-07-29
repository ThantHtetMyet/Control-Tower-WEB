import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

const CustomModal = ({ open, onClose, title, message }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="custom-dialog-title"
      aria-describedby="custom-dialog-description"
      PaperProps={{
        sx: {
          minWidth: '300px',
          padding: 0,
          borderRadius: 1,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle 
        id="custom-dialog-title"
        sx={{
          background: '#800080',
          color: '#fff',
          padding: '16px 24px',
          textAlign: 'left',
          margin: 0
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ 
        padding: '64px 24px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <DialogContentText 
          id="custom-dialog-description" 
          sx={{ 
            color: '#800080', 
            textAlign: 'center',
            margin: 0,
            marginTop: '28px',
            fontSize: '1rem'
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ 
        justifyContent: 'center', 
        padding: '0 24px 32px',
        marginTop: '-8px'
      }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            background: '#800080',
            '&:hover': {
              background: '#6a006a'
            },
            minWidth: '100px',
            borderRadius: 1,
            padding: '8px 24px'
          }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomModal;