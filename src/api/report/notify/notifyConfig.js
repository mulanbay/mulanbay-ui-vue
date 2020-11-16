import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/notifyConfig/getData',
    method: 'get',
    params: query
  })
}

export function getNotifyConfig(id) {
  return request({
    url: '/notifyConfig/get',
    method: 'get',
    params: { id }
  })
}

export function createNotifyConfig(data) {
  return request({
    url: '/notifyConfig/create',
    method: 'post',
    data
  })
}

export function updateNotifyConfig(data) {
  return request({
    url: '/notifyConfig/edit',
    method: 'post',
    data
  })
}
export function deleteNotifyConfig(ids) {
  const data = {
      ids
  }
  return request({
    url: '/notifyConfig/delete',
    method: 'post',
    data
  })
}

export function getNotifyConfigTree(needRoot) {
  return request({
    url: '/notifyConfig/getNotifyConfigTree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}
