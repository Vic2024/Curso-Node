import { createApp } from './app.js'
import { MovieModel } from './models/database/MongoDB/movie.js'

createApp({ movieModel: MovieModel })
