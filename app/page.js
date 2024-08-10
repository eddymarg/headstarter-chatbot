'use client'
import { Box, Button, Stack, TextField } from "@mui/material";
import { useEffect, useState, useRef} from "react";
import ReactMarkdown from 'react-markdown';

// modified to add loading state and sending messages by pressing enter capabilities
export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the Headstarter Support Agent, how can I assist you today?",
    },
  ])

  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;  // Don't send empty messages
    setIsLoading(true)

    setMessage('') // clear input field
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message }, // add user's message to chat
      { role: 'assistant', content: '' }, // add placeholder for assistant's response
    ])
  
    try {
      // send message to the server
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })
  
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
  
      const reader = response.body.getReader() // get reader to read response body
      const decoder = new TextDecoder() // create a decoder to decode response text
  
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true }) // decode text
        setMessages((messages) => {
          // gets all messages except last one
          let lastMessage = messages[messages.length - 1] // get last message (assistant's placeholder)
          let otherMessages = messages.slice(0, messages.length - 1) // get other messages
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text }, // append decoded text to assistant's message
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }

    setIsLoading(false)
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  // ensures most recent messages are always visible
  // auto-scrolling
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])


  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        background: 'linear-gradient(to bottom, rgba(35, 25, 66, 1), rgba(35, 25, 66, 0.7))',
      }}
    >
      <Stack
        direction={'column'}
        width="600px"
        height="700px"
        p={2}
        spacing={3}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <img 
            src='./images/robot.png' 
            alt="Robot logo"
            style={{
              width: '50px',
              height: 'auto',
            }}
          />
        </Box>
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message,index)=>(
              <Box 
                key = {index} 
                display = 'flex' 
                justifyContent={
                  message.role === 'assistant' ? 'flex-start' : 'flex-end'
                }
              >
                <Box 
                  color={message.role === 'assistant' ? '#231942' : '#FAFAFF'}
                  borderRadius={15}
                  p={3}
                  sx={{
                  background: message.role === 'assistant'
                      ? 'linear-gradient(to right, rgba(250, 250, 255, 1), rgba(250, 250, 255, 0.5))'
                      : 'linear-gradient(to right, rgba(94, 84, 142, 1), rgba(94, 84, 142, 0.5))',
                  lineHeight: 1.6,
                  wordBreak: 'break-word',
                  paddingLeft: 4,
                  paddingRight: 4,
                }}
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </Box>
              </Box>
          ))}
          <div ref={messagesEndRef}/>
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e)=>setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            style={{
              color: '#FAFAFF', // color inside input
            }}
            InputLabelProps={{
              style: { color: '#FAFAFF' }, // label color
            }}
            InputProps={{
              style: { color: '#FAFAFF' }, // text color inside input
              notched: false,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#FAFAFF', // Normal border color
                  borderRadius: 25,
                },
            },
            }}
          />
          <Button 
            variant="contained" 
            onClick={sendMessage}
            disabled={isLoading}
            style={{
              backgroundColor: '#9F86C0',
              color: '#FAFAFF',
              borderRadius: 25,
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5E548E'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#9F86C0'}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
