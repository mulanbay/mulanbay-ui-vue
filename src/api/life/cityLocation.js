import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/cityLocation/getData',
    method: 'get',
    params: query
  })
}

export function getCityLocation(id) {
  return request({
    url: '/cityLocation/get',
    method: 'get',
    params: { id }
  })
}

export function getCityLocationByLocation(location) {
  return request({
    url: '/cityLocation/getByLocation',
    method: 'get',
    params: { location }
  })
}

export function createCityLocation(data) {
  return request({
    url: '/cityLocation/create',
    method: 'post',
    data
  })
}

export function updateCityLocation(data) {
  return request({
    url: '/cityLocation/edit',
    method: 'post',
    data
  })
}
export function deleteCityLocation(ids) {
  const data = {
      ids
  }
  return request({
    url: '/cityLocation/delete',
    method: 'post',
    data
  })
}
