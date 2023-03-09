import React from 'react'
import { Select, MenuItem, TextField, Button, IconButton } from '@mui/material'
import { makeStyles } from '@mui/styles'
import Delete from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'

const useStyles = makeStyles(theme => ({
  training_messages_grid: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gridGap: '0.5em',
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr'
    }
  }
}), { name: 'TrainingEditor' })

const TrainingEditor = ({ loading, trainingMessages, setTrainingMessages }) => {
  const classes = useStyles()
  return (
    <>
      <div className={classes.training_messages_grid}>
        {trainingMessages.map((x, i) => (
          <React.Fragment key={i}>
            <Select
              disabled={loading}
              value={x.role}
              onChange={e => {
                trainingMessages[i].role = e.target.value
                setTrainingMessages([...trainingMessages])
              }}
            >
              <MenuItem value='system'>System</MenuItem>
              <MenuItem value='user'>User</MenuItem>
              <MenuItem value='assistant'>Assistant</MenuItem>
            </Select>
            <TextField
              multiline
              className={classes.training_msg_field}
              value={x.content}
              onChange={e => setTrainingMessages(old => {
                old[i].content = e.target.value
                return [...old]
              })}
              fullWidth
              disabled={loading}
              placeholder='Training Message...'
            />
            <IconButton
              disabled={loading}
              onClick={() => {
                setTrainingMessages(old => {
                  old.splice(i, 1)
                  return [...old]
                })
              }}
            ><Delete />
            </IconButton>
          </React.Fragment>
        ))}
      </div>
      <br />
      {!loading && <Button
        onClick={() => {
          const newTrainingMessages = trainingMessages.concat({
            role: 'user',
            content: ''
          })
          setTrainingMessages(newTrainingMessages)
        }}
        startIcon={<AddIcon />}
        variant='outlined'
                   >
        New Training Message
      </Button>}
    </>
  )
}

export default TrainingEditor
