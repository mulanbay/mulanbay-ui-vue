import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/planConfig/getData',
    method: 'get',
    params: query
  })
}

export function getPlanConfig(id) {
  return request({
    url: '/planConfig/get',
    method: 'get',
    params: { id }
  })
}

export function createPlanConfig(data) {
  return request({
    url: '/planConfig/create',
    method: 'post',
    data
  })
}

export function updatePlanConfig(data) {
  return request({
    url: '/planConfig/edit',
    method: 'post',
    data
  })
}
export function deletePlanConfig(ids) {
  const data = {
      ids
  }
  return request({
    url: '/planConfig/delete',
    method: 'post',
    data
  })
}

export function getPlanConfigTree(needRoot) {
  return request({
    url: '/planConfig/getPlanConfigTree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}
