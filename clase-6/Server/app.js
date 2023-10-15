import express from 'express'
import logger from 'morgan'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import pkg from 'pg'
import dotenv from 'dotenv'
dotenv.config()
const { Client } = pkg

const PORT = process.env.PORT ?? 3000
const app = express()
const server = createServer(app)
const io = new Server(server, {
  connectionStateRecovery: {

  }
})

const client = new Client({
  host: process.env.HOST,
  port: process.env.PORT_DATABASE,
  database: process.env.DATABASE,
  user: process.env.USER,
  password: process.env.PASSWORD
})

await client.connect()

await client.query(`
  CREATE TABLE IF NOT EXISTS public.messages (
    id serial,
    content text,
    "user" text,
    PRIMARY KEY (id)
);
`)

io.on('connection', async (socket) => {
  console.log('A user has connected!')

  socket.on('disconnect', () => {
    console.log('an user has disconnected')
  })

  socket.on('chat message', async (msg) => {
    let result, lastInsertRowid
    const username = socket.handshake.auth.username ?? 'anonymus'
    try {
      result = await client.query('INSERT INTO messages (content, "user") VALUES ($1, $2) RETURNING id', [msg, username])
      lastInsertRowid = result.rows[0].id.toString()
    } catch (err) {
      console.error(err)
      return
    }
    io.emit('chat message', msg, lastInsertRowid, username)
  })

  if (!socket.recovered) {
    try {
      const result = await client.query(
        'SELECT id, content, "user" FROM messages WHERE id > $1', [socket.handshake.auth.serverOffset]
      )
      result.rows.forEach(row => {
        socket.emit('chat message', row.content, row.id.toString(), row.user)
      })
    } catch (err) {
      console.log(err)
    }
  }
})

app.use(logger('dev'))

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/client/index.html')
})

server.listen(PORT, () => {
  console.log(`App listening on Port: ${PORT}`)
})
