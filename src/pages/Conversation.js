import React, { useState, useEffect } from 'react'
import request from '../utils/request'
import { TextField, Button } from '@mui/material'
import { host } from '../constants'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles(theme => ({
  page_wrap: {
    ...theme.templates.page_wrap
  }
}), { name: 'Conversation' })

const Conversation = ({ match, history }) => {
  const [bot, setBot] = useState({})
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const classes = useStyles()

  const handleSend = async (e) => {
    e.preventDefault()
    setMessages(oldMessages => {
      return [
        ...oldMessages,
        { role: 'user', content: text }
      ]
    })
    setLoading(true)
    const response = await request(
      'POST',
      `${host}/sendMessage`,
      {
        botID: match.params.botID,
        conversationID: match.params.conversationID,
        message: text
      }
    )
    if (response.status !== 'error') {
      setMessages(oldMessages => {
        return [
          ...oldMessages,
          { role: 'assistant', content: response.result }
        ]
      })
      setText('')
    }
    setLoading(false)
  }

  useEffect(() => {
    (async () => {
      const response = await request(
        'POST',
        `${host}/findBotById`,
        {
          id: match.params.botID
        }
      )
      setBot(response.result)
      const messagesResponse = await request(
        'POST',
        `${host}/listConversationMessages`,
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
    <div className={classes.page_wrap}>
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
