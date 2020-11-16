import request from '@/utils/request'

export function getBackHomeDateStat(query) {
  return request({
    url: '/backHome/dateStat',
    method: 'get',
    params: query
  })
}
