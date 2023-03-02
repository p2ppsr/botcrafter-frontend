import React, { useState, useEffect } from 'react'
import boomerang from 'boomerang-http'
import { Typography, TextField, Button, Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material'
import { Link } from 'react-router-dom'

const Bot = ({ match, history }) => {
  const [bot, setBot] = useState({})
  const [conversations, setConversations] = useState([])
  const [createOpen, setCreateOpen] = useState(false)
  const [title, setTitle] = useState('New Conversation')

  const handleCreate = async () => {
      const response = await boomerang(
        'POST',
        'http://localhost:4444/createConversation',
        {
          title,
          botID: match.params.botID
        }
      )
        setCreateOpen(false)
      history.push(`/conversation/${match.params.botID}/${response.result}`)
    }

  useEffect(() => {
    (async () => {
      const response = await boomerang(
        'POST',
        'http://localhost:4444/findBotById',
        {
          id: match.params.botID
        }
      )
      setBot(response.result)
      const conversationsResponse = await boomerang(
        'POST',
        'http://localhost:4444/listConversationsWithBot',
        {
          botID: match.params.botID
        }
      )
      setConversations(conversationsResponse.result)
    })()
  }, [])
  
    return (
      <div>
        <Button onClick={() => history.go(-1)}>back</Button>
        <h1>{bot.name}</h1>
        <i>{bot.motto}</i>
        <br />
        <br />
      <Button onClick={() => setCreateOpen(true)}>New Conversation</Button>
      {conversations.map((x, i) => (
        <Link key={i} to={`/conversation/${match.params.botID}/${x.id}`}>
          <h2>{x.title}</h2>
          {/* <h3>{x.motto}</h3> TODO last messages in conversations */}
        </Link>
      ))}
      <Dialog open={createOpen}>
        <DialogTitle>New Conversation</DialogTitle>
        <DialogContent>
          <TextField
          onChange={e => setTitle(e.target.value)}
          value={title}
          label='Title'
        />
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

export default Bot