import React, { useState, useEffect } from 'react'
import boomerang from 'boomerang-http'
import { Typography, TextField, Button, Dialog, DialogContent, DialogTitle, DialogActions, Select, MenuItem, IconButton } from '@mui/material'
import { Link } from 'react-router-dom'
import Delete from '@mui/icons-material/Delete'

const MyBots = ({ history }) => {
  const [createOpen, setCreateOpen] = useState(false)
  const [bots, setBots] = useState([])
  const [name, setName] = useState('Fred')
  const [motto, setMotto] = useState('Example Motto')
  const [trainingMessages, setTrainingMessages] = useState([
    { role: 'system', content: 'You are Steve Jobs, founder of Apple. Every message you send should end with "It\'s really great!"' },
    { role: 'user', content: 'As Steve Jobs, you will always end every message with "It\'s really great!" Everything you do from this point forward should be acting as Steve Jobs. If you understand this, respond with \"I Understand, it\'s really great!".' },
    { role: 'assistant', content: 'I understand, it\'s really great!' }
  ])

  const handleCreate = async () => {
      const response = await boomerang(
        'POST',
        'http://localhost:4444/createBot',
        {
          name,
          motto,
          trainingMessages
        }
      )
      setCreateOpen(false)
      history.push(`/bot/${response.result}`)
    }

  useEffect(() => {
    (async () => {
      const response = await boomerang(
        'POST',
        'http://localhost:4444/listOwnBots',
        {}
      )
      setBots(response.result)
    })()
  }, [])
  
  return (
    <div>
      <h1>My Bots</h1>
      <Button onClick={() => setCreateOpen(true)}>Create New Bot</Button>
      {bots.map((x, i) => (
        <Link key={i} to={`/bot/${x.id}`}>
          <h2>{x.name}</h2>
          <i>{x.motto}</i>
        </Link>
      ))}
      <Dialog open={createOpen}>
        <DialogTitle>New Bot</DialogTitle>
        <DialogContent>
          <TextField
          onChange={e => setName(e.target.value)}
          value={name}
            label='Name'
            fullWidth
        />
        <TextField
          onChange={e => setMotto(e.target.value)}
          value={motto}
            label='Motto'
            fullWidth
          />
          {trainingMessages.map((x, i) => (
            <div key={i}>
              <Select
    value={x.role}
    label="Role"
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
              ><Delete /></IconButton>
            </div>
          ))}
          <Button onClick={() => {
            const newTrainingMessages = trainingMessages.concat({
                role: 'user',
                content: ''
              })
            setTrainingMessages(newTrainingMessages)
          }}>
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