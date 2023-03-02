import React, { useState, useEffect } from 'react'
import { Typography, TextField, Button, Dialog, DialogContent, DialogTitle, DialogActions, Select, MenuItem, IconButton, Card } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { Link } from 'react-router-dom'
import Delete from '@mui/icons-material/Delete'
import Add from '@mui/icons-material/Add'
import request from '../utils/request'
import paidRequest from '../utils/paidRequest'
import { toast } from 'react-toastify'

const useStyles = makeStyles({
}, { name: 'Marketplace' })

const Marketplace = ({ history }) => {
  const [sellListOpen, setSellListOpen] = useState(false)
  const [sellAmount, setSellAmount] = useState(5000)
  const [sellAmountOpen, setSellAmountOpen] = useState(false)
  const [botToSell, setBotToSell] = useState({})
  const [bots, setBots] = useState([])
  const [ownBots, setOwnBots] = useState([])
  const [botToBuy, setBotToBuy] = useState({})
  const [buyOpen, setBuyOpen] = useState(false)
  const classes = useStyles()

  const handleSell = async e => {
    e.preventDefault()
    const response = await request('post', 'http://localhost:4444/listBotOnMarketplace', {
      botID: botToSell.id,
      amount: sellAmount
    })
    if (response.status !== 'error') {
      setOwnBots(old => {
        old.splice(ownBots.findIndex(x => x.id === botToSell.id), 1)
        return [...old]
      })
      const newBots = bots.concat({
        ...botToSell,
        amount: sellAmount,
        sellerName: 'You'
      })
      setBots(newBots)
      setSellAmountOpen(false)
      setBotToSell({})
      toast.success(`You listed ${botToSell.name} for sale!`)
    }
  }

  const handleBuy = async e => {
    e.preventDefault()
    const response = await paidRequest('post', 'http://localhost:4444/buyBotFromMarketplace', {
      botID: botToBuy.id
    })
    if (response.status !== 'error') {
      setBuyOpen(false)
      history.push(`/bot/${botToBuy.id}`)
      toast.success(`You bought ${botToBuy.name}!`)
    }
  }

  useEffect(() => {
    (async () => {
      const marketplaceBots = await request(
        'POST',
        'http://localhost:4444/listMarketplaceBots',
        {}
      )
      if (marketplaceBots.status !== 'error') {
        setBots(marketplaceBots.result)
      }
      const response = await request(
        'POST',
        'http://localhost:4444/listOwnBots',
        {}
      )
      if (response.status !== 'error') {
        setOwnBots(response.result)
      }
    })()
  }, [])

  return (
    <div>
      <Button onClick={() => history.go(-1)}>Back</Button>
      <h1>Marketplace</h1>
      <Button onClick={() => setSellListOpen(true)}>Sell a bot</Button>
      {bots.map((x, i) => (
        <Card key={i}>
          <h2>{x.name}</h2>
          <i>{x.motto}</i>
          <p>Amount: {x.amount}</p>
          <Button
            variant='contained' onClick={() => {
              setBuyOpen(true)
              setBotToBuy(x)
            }}
          >Buy
          </Button>
        </Card>
      ))}
      <Dialog open={sellListOpen} fullWidth maxWidth='xl' onClose={() => setSellListOpen(false)}>
        <DialogTitle>Sell a Bot</DialogTitle>
        <DialogContent>
          {ownBots.length === 0 && (
            <div>
              <p>You have no bots!</p>
              <Link to='/my-bots' onClick={() => setSellListOpen(false)}>Create one to sell</Link>
            </div>
          )}
          {ownBots.map((x, i) => (
            <div key={i}>
              <h3>{x.name}</h3>
              <i>{x.motto}</i>
              <Button onClick={() => {
                setBotToSell(x)
                setSellListOpen(false)
                setSellAmountOpen(true)
              }}
              >sell
              </Button>
            </div>
          ))}
        </DialogContent>
      </Dialog>
      <Dialog open={sellAmountOpen} onClose={() => setSellAmountOpen(false)}>
        <form onSubmit={handleSell}>
          <DialogTitle>How Much for "{botToSell.name}"</DialogTitle>
          <DialogContent>
            <TextField
              onChange={e => setSellAmount(e.target.value)}
              value={sellAmount}
              label='Amount'
            />
          </DialogContent>
          <DialogActions>
            <Button type='submit'>Sell Now</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={buyOpen} onClose={() => setBuyOpen(false)}>
        <form onSubmit={handleBuy}>
          <DialogTitle>Want to buy "{botToBuy.name}" for {botToBuy.amount} satoshis?</DialogTitle>
          <DialogActions>
            <Button onClick={() => setBuyOpen(false)}>Cancel</Button>
            <Button variant='contained' type='submit'>Buy Now</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  )
}

export default Marketplace
