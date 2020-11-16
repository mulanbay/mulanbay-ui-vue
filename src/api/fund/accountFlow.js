import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/accountFlow/getData',
    method: 'get',
    params: query
  })
}

export function getAccountFlow(id) {
  return request({
    url: '/accountFlow/get',
    method: 'get',
    params: { id }
  })
}

export function getAccountFlowTree(pid,needRoot) {
  return request({
    url: '/accountFlow/getAccountTree',
    method: 'get',
    params: {
      pid:pid,
      needRoot:needRoot
    }
  })
}

export function createAccountFlow(data) {
  return request({
    url: '/accountFlow/create',
    method: 'post',
    data
  })
}

export function updateAccountFlow(data) {
  return request({
    url: '/accountFlow/edit',
    method: 'post',
    data
  })
}
export function deleteAccountFlow(ids) {
  const data = {
      ids
  }
  return request({
    url: '/accountFlow/delete',
    method: 'post',
    data
  })
}


export function getAccountFlowAnalyse(query) {
  return request({
    url: '/accountFlow/analyse',
    method: 'get',
    params: query
  })
}