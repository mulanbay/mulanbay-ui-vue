import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/moduleConfig/getData',
    method: 'get',
    params: query
  })
}

export function getModuleConfig(id) {
  return request({
    url: '/moduleConfig/get',
    method: 'get',
    params: { id }
  })
}


export function createModuleConfig(data) {
  return request({
    url: '/moduleConfig/create',
    method: 'post',
    data
  })
}

export function updateModuleConfig(data) {
  return request({
    url: '/moduleConfig/edit',
    method: 'post',
    data
  })
}

export function deleteModuleConfig(ids) {
  const data = {
      ids
  }
  return request({
    url: '/moduleConfig/delete',
    method: 'post',
    data
  })
}

export function publishModuleConfig(data) {
  return request({
    url: '/moduleConfig/publish',
    method: 'post',
    data
  })
}

export function refreshModuleConfig(data) {
  return request({
    url: '/moduleConfig/refresh',
    method: 'post',
    data
  })
}

export function revokeModuleConfig(data) {
  return request({
    url: '/moduleConfig/revoke',
    method: 'post',
    data
  })
}