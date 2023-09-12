import { querysMovies } from './consultasSQL.js'
const { byQuery, allData, insertGenre, insertMovie, updateMovie } = querysMovies

export function processSQL () {
  const queryByFilterGenre = async ({ genre, client }) => {
    let genres
    const lowerGenre = genre.toLowerCase()
    try {
      const { rows: result } = await client.query(
        'SELECT id, name FROM genre WHERE LOWER(name) = $1', [lowerGenre]
      )
      genres = result
    } catch (err) {
      console.log(err)
    }
    if (genres.length === 0) return []
    const [{ id }] = genres
    try {
      const { rows: moviesGenre } = await client.query(byQuery(), [id])
      return moviesGenre
    } catch (err) {
      console.log(err)
    }
  }

  const queryGetAllMovies = async ({ client }) => {
    try {
      const { rows: movies } = await client.query(allData())
      return movies
    } catch (err) {
      console.log(err)
    }
  }

  const queryByIDMovie = async ({ id, client }) => {
    try {
      const { rows: movie } = await client.query(`${allData()} HAVING MOVIES.ID = $1`, [id])
      if (movie.length === 0) return null
      return movie
    } catch (err) {
      console.log(err)
    }
  }

  const queryInsertMovie = async ({ input, client }) => {
    const { genre: genreInput, title, year, director, duration, poster, rate } = input
    const { rows: [{ uuid }] } = await client.query('select gen_random_uuid() as uuid')
    await client.query(insertMovie(), [uuid, title, year, director, duration, poster, rate])
    genreInput.forEach(async el => {
      await client.query(insertGenre(), [uuid, el])
    })
    try {
      const { rows: movie } = await client.query(`${allData()} HAVING MOVIES.ID = $1`, [uuid])
      if (movie.length === 0) return null
      return movie
    } catch (err) {
      console.log(err)
    }
  }

  const queryDeleteMovie = async ({ id, client }) => {
    try {
      await client.query('delete from "movies_genre" where "movies_id" = $1;', [id])
      await client.query('delete from "movies" where "id" = $1;', [id])
      return true
    } catch (err) {
      console.log(err)
      return false
    }
  }

  const queryUpdateMovie = async ({ id, input, client }) => {
    const { genre: genreInput, title, year, director, duration, poster, rate } = input
    try {
      await client.query(updateMovie, [title, year, director, duration, poster, rate, id])
    } catch (err) {
      console.log(err)
    }
    try {
      await client.query('delete from "movies_genre" where "movies_id" = $1;', [id])
    } catch (err) {
      console.log(err)
    }
    genreInput.forEach(async el => {
      try {
        await client.query(insertGenre(), [id, el])
      } catch (err) {
        console.log(err)
      }
    })
    const result = await queryByIDMovie({ id, client })
    return result
  }

  return { queryByFilterGenre, queryGetAllMovies, queryByIDMovie, queryInsertMovie, queryDeleteMovie, queryUpdateMovie }
}
