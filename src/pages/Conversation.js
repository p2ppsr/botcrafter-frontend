import React, { useState, useEffect } from 'react'
import request from '../utils/request'
import { Typography, TextField, Button, IconButton } from '@mui/material'
import { host } from '../constants'
import { makeStyles } from '@mui/styles'
import ConversationControls from '../components/ConversationControls'
import ArrowBack from '@mui/icons-material/ArrowBackIos'
import Send from '@mui/icons-material/Send'

const useStyles = makeStyles(theme => ({
  page_wrap: {
    ...theme.templates.page_wrap
  },
  top_wrap: {
    top: '0px',
    left: '0px',
    position: 'fixed',
    width: '100vw',
    backgroundColor: '#ffffff',
    boxShadow: theme.shadows[3]
  },
  top_grid: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gridGap: '1em',
    padding: '0px 1.5em',
    boxSizing: 'border-box',
    margin: '0.75em auto',
    alignItems: 'center',
    maxWidth: theme.maxContentWidth,
    [theme.breakpoints.down('sm')]: {
      gridGap: '0.4em',
      margin: '0.4em auto',
      padding: '0px 0.5em'
    }
  },
  top_title: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    userSelect: 'none'
  },
  bot_name: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '0.9em',
    userSelect: 'none'
  },
  messages_wrap: {
    paddingTop: '4em',
    paddingBottom: '6em'
  },
  send_form: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    backgroundColor: '#ffffff',
    width: '100vw',
    padding: '0.75em',
    boxShadow: theme.shadows[3],
    boxSizing: 'border-box'
  },
  send_grid: {
    margin: 'auto',
    maxWidth: theme.maxContentWidth,
    display: 'grid',
    gridGap: '0.5em',
    gridTemplateColumns: '1fr auto'
  },
  message_field: {
    margin: 'auto',
    maxWidth: theme.maxContentWidth
  },
  send_button: {
    justifySelf: 'left'
  }
}), { name: 'Conversation' })

const Conversation = ({ match, history }) => {
  const [bot, setBot] = useState({})
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [conversation, setConversation] = useState({})
  const [loading, setLoading] = useState(true)
  const classes = useStyles()

  const handleSend = async (e) => {
    e.preventDefault()
    setText(text.trim())
    setMessages(oldMessages => {
      return [
        ...oldMessages,
        { role: 'user', content: text.trim() }
      ]
    })
    setLoading(true)
    const response = await request(
      'POST',
      `${host}/sendMessage`,
      {
        botID: match.params.botID,
        conversationID: match.params.conversationID,
        message: text.trim()
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

  const handleKey = async e => {
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.stopPropagation()
      await handleSend(e)
      e.target.focus()
    }
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
      const messagesResponse = await request(
        'POST',
        `${host}/listConversationMessages`,
        {
          botID: match.params.botID,
          conversationID: match.params.conversationID
        }
      )
      const conversationResponse = await request(
        'POST',
        `${host}/listConversationsWithBot`,
        {
          botID: match.params.botID
        }
      )
      setConversation(conversationResponse.result.find(x => x.id == match.params.conversationID))
      setBot(response.result)
      setMessages(messagesResponse.result)
      setLoading(false)
    })()
  }, [])

  return (
    <div className={classes.page_wrap}>
      <div className={classes.top_wrap}>
        <div className={classes.top_grid}>
          <IconButton onClick={() => history.go(-1)}><ArrowBack /></IconButton>
          <div>
            <Typography variant='h1' className={classes.top_title}>{conversation.title}</Typography>
            <Typography className={classes.bot_name} color='textSecondary'>{bot.name}</Typography>
          </div>
          {conversation && conversation.title && <ConversationControls
            conversation={conversation} update={async () => {
              const conversationResponse = await request(
                'POST',
            `${host}/listConversationsWithBot`,
            {
              botID: match.params.botID
            }
              )
              setConversation(conversationResponse.result.find(x => x.id == match.params.conversationID))
            }}
                                                 />}
        </div>
      </div>
      <div className={classes.messages_wrap}>
        {messages.map((x, i) => (
          <p key={i}><b>{x.role === 'assistant' ? bot.name : 'You'}</b>: {x.content}</p>
        ))}
        {loading && <p>...</p>}
      </div>
      <form className={classes.send_form} onSubmit={handleSend}>
        <div className={classes.send_grid}>
          <TextField
            onChange={e => setText(e.target.value)}
            value={text}
            multiline
            className={classes.message_field}
            fullWidth
            disabled={loading}
            placeholder='Write a message...'
            onKeyUp={handleKey}
          />
          <IconButton className={classes.send_button} color='primary' disabled={loading} type='submit'><Send /></IconButton>
        </div>
      </form>
    </div>
  )
}

export default Conversation
