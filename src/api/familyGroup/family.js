import request from '@/utils/request'

export function getMyFamily() {
  return request({
    url: '/family/getMyFamily',
    method: 'get'
  })
}


export function createFamily(data) {
  return request({
    url: '/family/create',
    method: 'post',
    data
  })
}

export function updateFamily(data) {
  return request({
    url: '/family/edit',
    method: 'post',
    data
  })
}

export function deleteFamily(ids) {
  const data = {
      ids
  }
  return request({
    url: '/family/delete',
    method: 'post',
    data
  })
}

export function dismissFamily(id) {
  const data = {
      id
  }
  return request({
    url: '/family/dismiss',
    method: 'post',
    data
  })
}

