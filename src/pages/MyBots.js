import React, { useState, useEffect } from 'react'
import { Typography, TextField, Button, Dialog, DialogContent, DialogTitle, DialogActions, Select, MenuItem, IconButton, Hidden, Divider, List, ListItem, ListItemText, LinearProgress } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { Link } from 'react-router-dom'
import Delete from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import request from '../utils/request'
import paidRequest from '../utils/paidRequest'
import { host } from '../constants'
import ArrowBack from '@mui/icons-material/ArrowBackIos'

const useStyles = makeStyles(theme => ({
  page_wrap: {
    ...theme.templates.page_wrap
  },
  training_messages_grid: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gridGap: '0.5em',
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr'
    }
  },
  training_msg_field: {
    // minWidth: '15em'
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
  creator: {
    backgroundColor: '#99ffee',
    color: '#000 !important',
    fontWeight: 'bold !important',
    fontSize: '0.6em !important',
    borderRadius: '3px',
    padding: '0.2em'
  },
  listed: {
    backgroundColor: '#ffee99',
    color: '#000 !important',
    fontWeight: 'bold !important',
    fontSize: '0.6em !important',
    borderRadius: '3px',
    padding: '0.2em'
  }
}), { name: 'MyBots' })

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
  const [loading, setLoading] = useState(true)
  const [createLoading, setCreateLoading] = useState(false)
  const classes = useStyles()

  const handleCreate = async () => {
    try {
      setCreateLoading(true)
      const response = await paidRequest('post', `${host}/createBot`, {
        name,
        motto,
        trainingMessages
      })
      if (response.status !== 'error') {
        setCreateOpen(false)
        history.push(`/bot/${response.result}`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setCreateLoading(false)
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const response = await request(
          'POST',
          `${host}/listOwnBots`,
          {}
        )
        if (response.status !== 'error') {
          setBots(response.result)
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
          <Typography variant='h1'>My Bots</Typography>
          <div>
            <Button fullWidth startIcon={<AddIcon />} variant='contained' onClick={() => setCreateOpen(true)}>Train a Bot</Button>
          </div>
        </div>
      </Hidden>
      <Hidden smUp>
        <div className={classes.mobile_top}>
          <IconButton onClick={() => history.go(-1)}><ArrowBack /></IconButton>
          <Typography variant='h1'>My Bots</Typography>
        </div>
        <Button fullWidth startIcon={<AddIcon />} variant='contained' onClick={() => setCreateOpen(true)}>Train a bot</Button>
      </Hidden>
      <Divider />
      <List>
      {bots.map((x, i) => (
        <Link key={i} to={`/bot/${x.id}`}>
          <ListItem button dense divider>
            <ListItemText
              primary={<Typography>{x.name} <span className={classes.creator}>Created by {x.creatorName}</span> {x.isForSale && <span className={classes.listed}>LISTED</span>}</Typography>}
              secondary={x.motto}
            />
          </ListItem>
        </Link>
      ))}
      </List>
      <Dialog open={createOpen} fullWidth maxWidth='xl'>
        <DialogTitle>New Bot</DialogTitle>
        <DialogContent>
          <TextField
            disabled={createLoading}
            onChange={e => setName(e.target.value)}
            value={name}
            label='Name'
            fullWidth
          />
          <br />
          <br />
          <TextField
            disabled={createLoading}
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
                  disabled={createLoading}
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
                  disabled={createLoading}
                  placeholder='Training Message...'
                />
                <IconButton
                  disabled={createLoading}
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
          {!createLoading && <Button
            onClick={() => {
              const newTrainingMessages = trainingMessages.concat({
                role: 'user',
                content: ''
              })
              setTrainingMessages(newTrainingMessages)
            }}
            startIcon={<AddIcon />}
            variant='outlined'
          >
            New Training Message
          </Button>}
          {createLoading && <LinearProgress />}
        </DialogContent>
        {!createLoading && <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>
            cancel
          </Button>
          <Button variant='contained' onClick={handleCreate}>
            Create Bot
          </Button>
        </DialogActions>}
      </Dialog>
      {loading && <LinearProgress />}
    </div>
  )
}

export default MyBots
