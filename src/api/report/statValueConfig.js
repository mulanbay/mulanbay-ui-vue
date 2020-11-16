import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/statValueConfig/getData',
    method: 'get',
    params: query
  })
}

export function getStatValueConfig(id) {
  return request({
    url: '/statValueConfig/get',
    method: 'get',
    params: { id }
  })
}

export function getStatValueConfigs(fid,type) {
  return request({
    url: '/statValueConfig/getConfigs',
    method: 'get',
    params: { fid:fid,type:type }
  })
}

export function createStatValueConfig(data) {
  return request({
    url: '/statValueConfig/create',
    method: 'post',
    data
  })
}

export function updateStatValueConfig(data) {
  return request({
    url: '/statValueConfig/edit',
    method: 'post',
    data
  })
}
export function deleteStatValueConfig(ids) {
  const data = {
      ids
  }
  return request({
    url: '/statValueConfig/delete',
    method: 'post',
    data
  })
}
