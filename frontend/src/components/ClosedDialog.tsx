import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack
} from '@mui/material'
import { AccessTime as ClockIcon } from '@mui/icons-material'
import { BUSINESS_HOURS_DETAIL } from '../hooks/useBusinessHours'

interface ClosedDialogProps {
  open: boolean
  onClose: () => void
}

export default function ClosedDialog({ open, onClose }: ClosedDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxWidth: 400,
          width: '100%',
          textAlign: 'center'
        }
      }}
    >
      <DialogTitle sx={{ pb: 0, pt: 4 }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: 'warning.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2
          }}
        >
          <ClockIcon sx={{ fontSize: 38, color: 'warning.dark' }} />
        </Box>
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          Outside Business Hours
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
          Sorry, we are not accepting orders at the moment.
        </Typography>
        <Box
          sx={{
            bgcolor: 'warning.50',
            border: '1.5px solid',
            borderColor: 'warning.main',
            borderRadius: 2,
            px: 3,
            py: 2
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
            <ClockIcon sx={{ color: 'warning.dark', fontSize: 20 }} />
            <Typography variant="body1" fontWeight="bold" color="warning.dark">
              Business Hours
            </Typography>
          </Stack>
          <Typography variant="body2" color="warning.dark" sx={{ mt: 0.5 }}>
            {BUSINESS_HOURS_DETAIL}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Please come back during business hours to place an order.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{ px: 4, borderRadius: 2 }}
        >
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  )
}
