import React, { useState, useEffect } from 'react'
import { TextField, Button, Dialog, DialogContent, DialogTitle, DialogActions, Card, CardContent, Typography, IconButton, Divider, Hidden, LinearProgress } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { Link } from 'react-router-dom'
import request from '../utils/request'
import paidRequest from '../utils/paidRequest'
import { toast } from 'react-toastify'
import { host } from '../constants'
import ArrowBack from '@mui/icons-material/ArrowBackIos'
import AddIcon from '@mui/icons-material/Add'

const useStyles = makeStyles(theme => ({
  page_wrap: {
    ...theme.templates.page_wrap
  },
  top_grid: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gridGap: '1em',
    marginBottom: '1.25em',
    alignItems: 'center'
  },
  mobile_top: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gridGap: '1em',
    marginBottom: '1.25em',
    alignItems: 'center'
  },
  marketplace_grid: {
    margin: '1.25em auto 2em auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridGap: '1em',
    width: '100%',
    [theme.breakpoints.down('lg')]: {
      gridTemplateColumns: 'repeat(2, 1fr)'
    },
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '1fr'
    }
  },
  bot_name: {
    whiteSpace: 'nowrap'
  },
  card_actions: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto',
    gridGap: '0.5em',
    alignItems: 'center',
    width: '100%'
  },
  card: {
    borderRadius: '16px',
    transition: 'all 0.4s',
    '&:hover': {
      opacity: '0.85',
      transform: 'scale(1.05)',
      boxShadow: '5px 6px 21px 0px rgba(0,0,0,0.4)'
    }
  }
}), { name: 'Marketplace' })

const Marketplace = ({ history }) => {
  const [sellListOpen, setSellListOpen] = useState(false)
  const [sellAmount, setSellAmount] = useState(5000)
  const [sellAmountOpen, setSellAmountOpen] = useState(false)
  const [botToSell, setBotToSell] = useState({})
  const [bots, setBots] = useState([])
  const [ownBots, setOwnBots] = useState([])
  const [botToBuy, setBotToBuy] = useState({})
  const [buyOpen, setBuyOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [buyLoading, setBuyLoading] = useState(false)
  const classes = useStyles()

  const handleSell = async e => {
    e.preventDefault()
    const response = await request('post', `${host}/listBotOnMarketplace`, {
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
    try {
      setBuyLoading(true)
      const response = await paidRequest('post', `${host}/buyBotFromMarketplace`, {
        botID: botToBuy.id
      })
      if (response.status !== 'error') {
        setBuyOpen(false)
        history.push(`/bot/${botToBuy.id}`)
        toast.success(`You bought ${botToBuy.name}!`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setBuyLoading(false)
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const marketplaceBots = await request(
          'POST',
          `${host}/listMarketplaceBots`,
          {}
        )
        if (marketplaceBots.status !== 'error') {
          setBots(marketplaceBots.result)
        }
        const response = await request(
          'POST',
          `${host}/listOwnBots`,
          {}
        )
        if (response.status !== 'error') {
          setOwnBots(response.result)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className={classes.page_wrap}>
      <Hidden smDown>
        <div className={classes.top_grid}>
          <div>
            <IconButton onClick={() => history.go(-1)}><ArrowBack /></IconButton>
          </div>
          <Typography variant='h1'>Marketplace</Typography>
          <div>
            <Button fullWidth startIcon={<AddIcon />} variant='contained' onClick={() => setSellListOpen(true)}>Sell a bot</Button>
          </div>
        </div>
      </Hidden>
      <Hidden smUp>
        <div className={classes.mobile_top}>
          <IconButton onClick={() => history.go(-1)}><ArrowBack /></IconButton>
          <Typography variant='h1'>Marketplace</Typography>
        </div>
        <Button fullWidth startIcon={<AddIcon />} variant='contained' onClick={() => setSellListOpen(true)}>Sell a bot</Button>
      </Hidden>
      <Divider />
      <div className={classes.marketplace_grid}>
        {bots.map((x, i) => (
          <Card key={i} className={classes.card}>
            <CardContent>
              <Typography className={classes.bot_name} variant='h2'>{x.name}</Typography>
              <Typography color='textSecondary' paragraph>{x.motto}</Typography>
              <Typography paragraph>
                <i>Created by:</i> {x.creatorName}
              </Typography>
              <Typography paragraph>
                <i>Listed by:</i> {x.sellerName}
              </Typography>
              <div className={classes.card_actions}>
                <Typography><b>Price:</b> {Number(x.amount).toLocaleString()} sats</Typography>
                <Button
                  onClick={() => {
                    // setBuyOpen(true)
                    setBotToBuy(x)
                  }}
                >Try
                </Button>
                <Button
                  variant='outlined' onClick={() => {
                    setBuyOpen(true)
                    setBotToBuy(x)
                  }}
                >Buy
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {loading && <LinearProgress />}
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
          {buyLoading && <LinearProgress />}
          <DialogActions>
            {!buyLoading && <Button onClick={() => setBuyOpen(false)}>Cancel</Button>}
            {!buyLoading && <Button variant='contained' type='submit'>Buy Now</Button>}
          </DialogActions>
        </form>
      </Dialog>
    </div>
  )
}

export default Marketplace
