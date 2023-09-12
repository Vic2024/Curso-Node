export const querysMovies = {
  allData: () => `
    SELECT MOVIES.ID, TITLE, YEAR, DIRECTOR, DURATION, POSTER, RATE,
    ARRAY_AGG(GENRE.NAME) AS GENRE
    FROM MOVIES
    INNER JOIN MOVIES_GENRE AS CONECTION
    ON MOVIES.ID = CONECTION.MOVIES_ID
    INNER JOIN GENRE
    ON CONECTION.GENRE = GENRE.ID
    GROUP BY MOVIES.ID
    `,
  byQuery: () => ` 
    select movie.id, movie.title,movie.year,movie.director,
    movie.duration,movie.poster,movie.rate, array_agg(genre.name) as genre
    from movies as movie 
    inner join movies_genre as conection 
    on conection.movies_id = movie.id 
    inner join genre 
    on conection.genre = genre.id 
    group by genre.name, movie.id, conection. movies_id, conection.genre, genre.id
    having genre.id = $1
  `,
  insertMovie: () => `
  INSERT INTO MOVIES (ID,TITLE,YEAR,DIRECTOR,DURATION,POSTER,RATE)
  VALUES ($1,$2,$3,$4,$5,$6,$7)
  `,
  insertGenre: () => `
  INSERT INTO MOVIES_GENRE (movies_id, genre)
  VALUES (($1), (SELECT ID FROM GENRE WHERE NAME = $2))
  `,
  updateMovie: () => `
  UPDATE "movies"
      SET
          "title" = $1,
          "year" = $2,
          "director" = $3,
          "duration" = $4,
          "poster" = $5,
          "rate" = $6
    WHERE "id" = $7
  `
}
