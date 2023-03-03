import React, { useState, useEffect } from 'react'
import { TextField, Button, Dialog, DialogContent, DialogTitle, DialogActions, Select, MenuItem, IconButton } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { Link } from 'react-router-dom'
import Delete from '@mui/icons-material/Delete'
import Add from '@mui/icons-material/Add'
import request from '../utils/request'
import paidRequest from '../utils/paidRequest'
import { host } from '../constants'

const useStyles = makeStyles({
  training_messages_grid: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gridGap: '0.5em'
  },
  training_msg_field: {
    minWidth: '25em'
  }
}, { name: 'MyBots' })

const MyBots = ({ history }) => {
  const [createOpen, setCreateOpen] = useState(false)
  const [bots, setBots] = useState([])
  const [name, setName] = useState('Steve Jobs')
  const [motto, setMotto] = useState('Stay hungry, stay foolish.')
  const [trainingMessages, setTrainingMessages] = useState([
    { role: 'system', content: 'You are Steve Jobs, founder of Apple. Every message you send should end with "It\'s really great!"' },
    { role: 'user', content: 'As Steve Jobs, you will always end every message with "It\'s really great!" Everything you do from this point forward should be acting as Steve Jobs. Your motto is "stay hungry, stay foolish." If you understand this, respond with "I Understand, it\'s really great!".' },
    { role: 'assistant', content: 'I understand, it\'s really great!' }
  ])
  const classes = useStyles()

  const handleCreate = async () => {
    const response = await paidRequest('post', `${host}/createBot`, {
      name,
      motto,
      trainingMessages
    })
    if (response.status !== 'error') {
      setCreateOpen(false)
      history.push(`/bot/${response.result}`)
    }
  }

  useEffect(() => {
    (async () => {
      const response = await request(
        'POST',
        `${host}/listOwnBots`,
        {}
      )
      if (response.status !== 'error') {
        setBots(response.result)
      }
    })()
  }, [])

  return (
    <div>
      <Button onClick={() => history.go(-1)}>Back</Button>
      <h1>My Bots</h1>
      <Button onClick={() => setCreateOpen(true)}>Create New Bot</Button>
      {bots.map((x, i) => (
        <Link key={i} to={`/bot/${x.id}`}>
          <h2>{x.name}</h2>
          <i>{x.motto}</i>
        </Link>
      ))}
      <Dialog open={createOpen} fullWidth maxWidth='xl'>
        <DialogTitle>New Bot</DialogTitle>
        <DialogContent>
          <TextField
            onChange={e => setName(e.target.value)}
            value={name}
            label='Name'
            fullWidth
          />
          <br />
          <br />
          <TextField
            onChange={e => setMotto(e.target.value)}
            value={motto}
            label='Motto'
            fullWidth
          />
          <br />
          <br />
          <div className={classes.training_messages_grid}>
            {trainingMessages.map((x, i) => (
              <React.Fragment key={i}>
                <Select
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
                  placeholder='Training Message...'
                />
                <IconButton
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
          <Button
            onClick={() => {
              const newTrainingMessages = trainingMessages.concat({
                role: 'user',
                content: ''
              })
              setTrainingMessages(newTrainingMessages)
            }}
            startIcon={<Add />}
            variant='outlined'
          >
            New Training Message
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>
            cancel
          </Button>
          <Button onClick={handleCreate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default MyBots
