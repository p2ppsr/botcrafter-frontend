import React, { useState, useEffect } from 'react'
import request from '../utils/request'
import { Typography, TextField, Button, Dialog, DialogContent, DialogTitle, DialogActions, List, ListItem, ListItemText, IconButton } from '@mui/material'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { host } from '../constants'
import { makeStyles } from '@mui/styles'
import ComposeIcon from '@mui/icons-material/Create'
import ArrowBack from '@mui/icons-material/ArrowBackIos'

const useStyles = makeStyles(theme => ({
  page_wrap: {
    ...theme.templates.page_wrap
  },
  conversations_header: {
    display: 'grid',
    gridGap: '1em',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    marginBottom: '0.75em',
    marginTop: '1em',
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr'
    }
  }
}), { name: 'Bot' })

const Bot = ({ match, history }) => {
  const [bot, setBot] = useState({})
  const [conversations, setConversations] = useState([])
  const [createOpen, setCreateOpen] = useState(false)
  const [title, setTitle] = useState('New Conversation')
  const [sellAmount, setSellAmount] = useState(35000)
  const [sellOpen, setSellOpen] = useState(false)
  const [isBotForSale, setIsBotForSale] = useState(false)
  const classes = useStyles()

  const handleCreate = async () => {
    const response = await request(
      'POST',
      `${host}/createConversation`,
      {
        title,
        botID: match.params.botID
      }
    )
    if (response.status !== 'error') {
      setCreateOpen(false)
      history.push(`/conversation/${match.params.botID}/${response.result}`)
    }
  }

  const handleSell = async () => {
    const response = await request(
      'POST',
      `${host}/listBotOnMarketplace`,
      {
        botID: match.params.botID,
        amount: sellAmount
      }
    )
    if (response.status !== 'error') {
      setSellOpen(false)
      history.push('/marketplace')
      toast.success(`${bot.name} was listed for sale!`)
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
      setBot(response.result)
      const conversationsResponse = await request(
        'POST',
        `${host}/listConversationsWithBot`,
        {
          botID: match.params.botID
        }
      )
      setConversations(conversationsResponse.result)
      const saleResult = await request(
        'POST',
        `${host}/isBotOnMarketplace`,
        {
          botID: match.params.botID
        }
      )
      setIsBotForSale(saleResult.result)
    })()
  }, [])

  return (
    <div className={classes.page_wrap}>
      <IconButton onClick={() => history.go(-1)}><ArrowBack /></IconButton>
      <Typography variant='h1'>{bot.name}</Typography>
      <Typography color='textSecondary'>{bot.motto}</Typography>
      <Button disabled={isBotForSale} onClick={() => setSellOpen(true)}>{isBotForSale ? 'Listed for sale' : 'Sell This Bot'}</Button>
      <div className={classes.conversations_header}>
        <Typography variant='h2'>Conversations</Typography>
        <div>
        <Button
          variant='contained'
          onClick={() => setCreateOpen(true)}
          startIcon={<ComposeIcon />}
        >
          New Conversation
          </Button>
          </div>
      </div>
      <List>
      {conversations.map((x, i) => (
        <Link key={i} to={`/conversation/${match.params.botID}/${x.id}`}>
          <ListItem button divider>
            <ListItemText
              primary={x.title}
              secondary={x.lastMessage}
            />
          </ListItem>
        </Link>
      ))}
      </List>
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
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
      <Dialog open={sellOpen} onClose={() => setSellOpen(false)}>
        <DialogTitle>Sell "{bot.name}"?</DialogTitle>
        <DialogContent>
          <TextField
            onChange={e => setSellAmount(e.target.value)}
            value={sellAmount}
            label='Amount'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSellOpen(false)}>
            cancel
          </Button>
          <Button onClick={handleSell}>
            List Now
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default Bot
