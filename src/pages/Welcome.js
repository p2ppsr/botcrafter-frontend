import React, { useState, useEffect } from 'react'
import request from '../utils/request'
import { Typography, TextField, Button } from '@mui/material'
import { Link } from 'react-router-dom'
import { submitDirectTransaction } from '@babbage/sdk'

const Welcome = () => {
  const [name, setName] = useState('')
  const [profile, setProfile] = useState('')
  const [needsCreate, setNeedsCreate] = useState(false)

  useEffect(() => {
    (async () => {
      const profile = await request(
        'POST',
        'http://localhost:4444/getOwnProfile',
        {}
      )
      if (profile.status === 'error') {
        setNeedsCreate(true)
      } else {
        setProfile(profile.result)
      }
    })()
  }, [])

  const handleCashOut = async () => {
    const result = await request(
      'POST',
      'http://localhost:4444/cashOut',
      {}
    )
    if (result.status !== 'error') {
      const cash = result.result
      await submitDirectTransaction({
        protocol: '3241645161d8',
        transaction: {
          ...cash.transaction,
          outputs: [{
            vout: 0,
            satoshis: cash.amount,
            derivationSuffix: cash.derivationSuffix
          }]
        },
        senderIdentityKey: cash.senderIdentityKey,
        note: 'Payment for chatbot NFT sales',
        derivationPrefix: cash.derivationPrefix,
        amount: cash.amount
      })
    }
  }

  const handleCreate = async () => {
    const response = await request(
      'POST',
      'http://localhost:4444/createUser',
      {
        name
      }
    )
    if (response.status !== 'error') {
      setNeedsCreate(false)
      setProfile({
        name,
        balance: 0
      })
    }
  }

  return (
    <div>
      <h1>welcome</h1>
      {needsCreate
        ? (
          <>
            <p>Create your profile</p>
            <TextField
              onChange={e => setName(e.target.value)}
              value={name}
              label='Your Name'
            />
            <br />
            <br />
            <Button onClick={handleCreate}>Create Profile</Button>
          </>
          )
        : (
          <>
            <Typography>{profile.name}</Typography>
            <Typography>balance: {profile.balance}</Typography>
            {profile.balance > 0 && (
              <Button onClick={handleCashOut}>Cash Out</Button>
            )}
            <Link to='/my-bots'>Bots</Link>
            <br />
            <br />
            <Link to='/marketplace'>Marketplace</Link>
          </>
          )}
    </div>
  )
}

export default Welcome
