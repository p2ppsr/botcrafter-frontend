import React, { useState } from 'react'
import boomerang from 'boomerang-http'
import { Typography, TextField, Button } from '@mui/material'

const Welcome = () => {
  const [text, setText] = useState('')
  const [result, setResult] = useState('')

  const handleSend = async () => {
      const response = await boomerang(
        'POST',
        'http://localhost:4444/chat',
        {
          input: text
        }
      )
      setResult(response.text)
    }

  return (
    <div>
      <h1>welcome</h1>
      <Typography>{result}</Typography>
      <TextField
        onChange={e => setText(e.target.value)}
        value={text}
        label='message'
      />
      <Button onClick={handleSend}>Send</Button>
    </div>
  )
}

export default Welcome