import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/consumeType/getData',
    method: 'get',
    params: query
  })
}

export function getConsumeType(id) {
  return request({
    url: '/consumeType/get',
    method: 'get',
    params: { id }
  })
}

export function createConsumeType(data) {
  return request({
    url: '/consumeType/create',
    method: 'post',
    data
  })
}

export function updateConsumeType(data) {
  return request({
    url: '/consumeType/edit',
    method: 'post',
    data
  })
}
export function deleteConsumeType(ids) {
  const data = {
      ids
  }
  return request({
    url: '/consumeType/delete',
    method: 'post',
    data
  })
}

export function getConsumeTypeTree(needRoot) {
  return request({
    url: '/consumeType/getConsumeTypeTree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

