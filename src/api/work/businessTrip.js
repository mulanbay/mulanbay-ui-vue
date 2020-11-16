import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/businessTrip/getData',
    method: 'get',
    params: query
  })
}

export function getBusinessTrip(id) {
  return request({
    url: '/businessTrip/get',
    method: 'get',
    params: { id }
  })
}

export function createBusinessTrip(data) {
  return request({
    url: '/businessTrip/create',
    method: 'post',
    data
  })
}

export function updateBusinessTrip(data) {
  return request({
    url: '/businessTrip/edit',
    method: 'post',
    data
  })
}

export function deleteBusinessTrip(ids) {
  const data = {
      ids
  }
  return request({
    url: '/businessTrip/delete',
    method: 'post',
    data
  })
}
