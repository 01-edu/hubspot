import { readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { createClient } from '@01-edu/api'
import { z01Credentials } from '../config.mjs'

const { run } = await createClient(z01Credentials)


const rootDir = dirname(new URL(import.meta.url).pathname)

export default Object.fromEntries(
  (await readFile(join(rootDir, 'queries.graphql'), 'utf8'))

    // parse the file
    .split(/\bquery ([^({ ]+)/)
    .flatMap((_, i, arr) => (i % 2 ? [[_, arr[i + 1]]] : []))

    // create the functions
    .map(([name, code]) => {
      const query = `query ${name} ${code}`
      return [name, variables => run(query, variables)]
    }),
)
