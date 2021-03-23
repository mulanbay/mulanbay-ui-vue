import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/userQa/getData',
    method: 'get',
    params: query
  })
}

export function getUserQa(id) {
  return request({
    url: '/userQa/get',
    method: 'get',
    params: { id }
  })
}

export function statUserQaWordCloud(query) {
  return request({
    url: '/userQa/statWordCloud',
    method: 'get',
    params: query
  })
}