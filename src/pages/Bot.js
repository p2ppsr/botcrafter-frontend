import React, { useState, useEffect } from 'react'
import request from '../utils/request'
import { TextField, Button, Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { host } from '../constants'

const Bot = ({ match, history }) => {
  const [bot, setBot] = useState({})
  const [conversations, setConversations] = useState([])
  const [createOpen, setCreateOpen] = useState(false)
  const [title, setTitle] = useState('New Conversation')
  const [sellAmount, setSellAmount] = useState(5000)
  const [sellOpen, setSellOpen] = useState(false)
  const [isBotForSale, setIsBotForSale] = useState(false)

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
    <div>
      <Button onClick={() => history.go(-1)}>back</Button>
      <h1>{bot.name}</h1>
      <i>{bot.motto}</i>
      <br />
      <br />
      <Button disabled={isBotForSale} onClick={() => setSellOpen(true)}>{isBotForSale ? 'Listed for sale' : 'Sell This Bot'}</Button>
      <Button onClick={() => setCreateOpen(true)}>New Conversation</Button>
      {conversations.map((x, i) => (
        <Link key={i} to={`/conversation/${match.params.botID}/${x.id}`}>
          <h2>{x.title}</h2>
          {/* <h3>{x.motto}</h3> TODO last messages in conversations */}
        </Link>
      ))}
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
