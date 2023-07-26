import { ObjectId } from "mongodb"

export interface Redirect {
  _id: ObjectId
  subdomain: string
  url: string
  created: Date
  hits: number
}
