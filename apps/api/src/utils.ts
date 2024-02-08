import { NextFunction, Request, Response } from 'express'
import { AnyZodObject } from 'zod'
import { db } from './db'

export const validate = (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      return next()
    } catch (error) {
      return res.status(400).json(error)
    }
  }

export const all = (
  query: string,
  params?: any,
) => {
  return new Promise<any[]>((resolve, reject) => {
    db.all(query, params,
      (error, rows) => {
        if (error) {
          return reject(error)
        }
        resolve(rows)
      },
    )
  })
}

export const get = (
  query: string,
  params?: any,
) => {
  return new Promise<any>((resolve, reject) => {
    db.get(query, params,
      (error, row) => {
        if (error) {
          return reject(error)
        }
        resolve(row)
      },
    )
  })
}
