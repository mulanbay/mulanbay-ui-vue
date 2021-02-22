import request from '@/utils/request'

export function info() {
  return request({
    url: '/cache/info',
    method: 'get'
  })
}
