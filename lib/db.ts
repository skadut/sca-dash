import postgres from "postgres"

const getConnectionString = () => {
  const host = process.env.DB_HOST
  const port = process.env.DB_PORT
  const name = process.env.DB_NAME
  const user = process.env.DB_USER
  const password = process.env.DB_PASSWORD

  if (!host || !port || !name || !user || !password) {
    throw new Error("Missing database environment variables")
  }

  return `postgresql://${user}:${password}@${host}:${port}/${name}`
}

let sql: ReturnType<typeof postgres> | null = null

const getSql = () => {
  if (!sql) {
    sql = postgres(getConnectionString(), {
      ssl: false,
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    })
  }
  return sql
}

export async function query<T>(text: string): Promise<T[]> {
  const client = getSql()
  const result = await client.unsafe(text)
  return result as T[]
}

export default getSql
