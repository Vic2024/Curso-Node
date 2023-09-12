import { createApp } from './app.js'
import { MovieModel } from './models/database/PosgreSQL/movie.js'

createApp({ movieModel: MovieModel })
