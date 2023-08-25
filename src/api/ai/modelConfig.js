import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/modelConfig/getData',
    method: 'get',
    params: query
  })
}

export function getModelConfig(id) {
  return request({
    url: '/modelConfig/get',
    method: 'get',
    params: { id }
  })
}

export function getProcessorTree(needRoot) {
  return request({
    url: '/modelConfig/getProcessorTree',
    method: 'get',
    params: { needRoot }
  })
}


export function createModelConfig(data) {
  return request({
    url: '/modelConfig/create',
    method: 'post',
    data
  })
}

export function updateModelConfig(data) {
  return request({
    url: '/modelConfig/edit',
    method: 'post',
    data
  })
}

export function deleteModelConfig(ids) {
  const data = {
      ids
  }
  return request({
    url: '/modelConfig/delete',
    method: 'post',
    data
  })
}

export function publishModelConfig(data) {
  return request({
    url: '/modelConfig/publish',
    method: 'post',
    data
  })
}

export function refreshModelConfig(data) {
  return request({
    url: '/modelConfig/refresh',
    method: 'post',
    data
  })
}

export function revokeModelConfig(data) {
  return request({
    url: '/modelConfig/revoke',
    method: 'post',
    data
  })
}
