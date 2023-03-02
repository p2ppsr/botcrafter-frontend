import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import Prompt from '@babbage/react-prompt'

ReactDOM.render(
  <Prompt
    appName='BotCrafter'
    author='Ty Everett'
    authorUrl='https://tyeverett.com'
    description='Train and trade AI chatbots with unique personalities as NFTs on Bitcoin SV'
    screenshots={[]}
  >
    <App />
  </Prompt>,
  document.getElementById('root')
)
