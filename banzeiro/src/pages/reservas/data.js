import { PASSENGERS, CHANNELS } from '../../data/mock'

export function channelStats() {
  return Object.keys(CHANNELS).map((key) => ({ key, count: PASSENGERS.filter((p) => p.channel === key).length }))
}
