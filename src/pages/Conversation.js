import React, { useState, useEffect } from 'react'
import boomerang from 'boomerang-http'
import { Typography, TextField, Button, Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material'
import { Link } from 'react-router-dom'

const Conversation = ({ match, history }) => {
  const [bot, setBot] = useState({})
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)

  const handleSend = async (e) => {
    e.preventDefault()
    setMessages(oldMessages => {
      return [
        ...oldMessages,
        { role: 'user', content: text }
      ]
    })
    setLoading(true)
      const response = await boomerang(
        'POST',
        'http://localhost:4444/sendMessage',
        {
          botID: match.params.botID,
          conversationID: match.params.conversationID,
          message: text
        }
      )
    setMessages(oldMessages => {
      return [
        ...oldMessages,
        { role: 'assistant', content: response.result }
      ]
    })
    setText('')
    setLoading(false)
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
      const messagesResponse = await boomerang(
        'POST',
        'http://localhost:4444/listConversationMessages',
        {
          botID: match.params.botID,
          conversationID: match.params.conversationID
        }
      )
      setMessages(messagesResponse.result)
      setLoading(false)
    })()
  }, [])
  
    return (
      <div>
        <Button onClick={() => history.go(-1)}>back</Button>
        <h1>{bot.name}</h1>
        <i>{bot.motto}</i>
      {messages.map((x, i) => (
        <p key={i}><b>{x.role}</b>: {x.content}</p>
      ))}
        {loading && <p>...</p>}
        <br />
        <br />
        <br />
        <form onSubmit={handleSend}>
      <TextField
        onChange={e => setText(e.target.value)}
          value={text}
            fullWidth
            disabled={loading}
        placeholder='Write a message...'
        />
        </form>
    </div>
  )
}

export default Conversation