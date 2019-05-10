import { feature } from '../feature'
describe('feature', () => {
  test('should return string type', () => {
    expect(typeof feature()).toEqual('string')
  })
})
