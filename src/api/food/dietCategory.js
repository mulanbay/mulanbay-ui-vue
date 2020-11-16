import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/dietCategory/getData',
    method: 'get',
    params: query
  })
}

export function getDietCategory(id) {
  return request({
    url: '/dietCategory/get',
    method: 'get',
    params: { id }
  })
}

export function createDietCategory(data) {
  return request({
    url: '/dietCategory/create',
    method: 'post',
    data
  })
}

export function updateDietCategory(data) {
  return request({
    url: '/dietCategory/edit',
    method: 'post',
    data
  })
}

export function deleteDietCategory(ids) {
  const data = {
      ids
  }
  return request({
    url: '/dietCategory/delete',
    method: 'post',
    data
  })
}
