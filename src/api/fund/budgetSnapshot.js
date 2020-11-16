import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/budgetSnapshot/getData',
    method: 'get',
    params: query
  })
}
