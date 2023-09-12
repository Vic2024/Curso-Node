import pg from 'pg'
import { processSQL } from './Process.js'
const { Client } = pg
const config = {
  host: 'localhost',
  port: 5432,
  database: 'Movies-database',
  user: 'postgres',
  password: '123456'

}
const client = new Client(config)
await client.connect()
const {
  queryByFilterGenre,
  queryGetAllMovies,
  queryByIDMovie,
  queryInsertMovie,
  queryDeleteMovie,
  queryUpdateMovie
} = processSQL()
export class MovieModel {
  static async getAll ({ genre }) {
    if (genre) {
      const result = await queryByFilterGenre({ genre, client })
      return result
    }
    const result = await queryGetAllMovies({ client })
    return result
  }

  static async getById ({ id }) {
    const result = await queryByIDMovie({ id, client })
    return result
  }

  static async create ({ input }) {
    const result = await queryInsertMovie({ input, client })
    return result
  }

  static async delete ({ id }) {
    const result = await queryDeleteMovie({ id, client })
    return result
  }

  static async update ({ id, input }) {
    const result = await queryUpdateMovie({ id, input, client })
    return result
  }
}
