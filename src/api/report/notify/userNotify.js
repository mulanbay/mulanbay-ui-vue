import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/userNotify/getData',
    method: 'get',
    params: query
  })
}

export function getUserNotify(id) {
  return request({
    url: '/userNotify/get',
    method: 'get',
    params: { id }
  })
}

export function createUserNotify(data) {
  return request({
    url: '/userNotify/create',
    method: 'post',
    data
  })
}

export function updateUserNotify(data) {
  return request({
    url: '/userNotify/edit',
    method: 'post',
    data
  })
}
export function deleteUserNotify(ids) {
  const data = {
      ids
  }
  return request({
    url: '/userNotify/delete',
    method: 'post',
    data
  })
}

export function getUserNotifyTree(needRoot,relatedBeans) {
  return request({
    url: '/userNotify/getUserNotifyTree',
    method: 'get',
    params: {
      needRoot:needRoot,
      relatedBeans:relatedBeans
    }
  })
}

export function addOrEditUserNotifyRemind(data) {
  return request({
    url: '/userNotify/addOrEditRemind',
    method: 'post',
    data
  })
}

export function getUserNotifyRemind(id) {
  return request({
    url: '/userNotify/getRemind',
    method: 'get',
    params: { id }
  })
}

export function getUserNotifyStat(query) {
  return request({
    url: '/userNotify/getStat',
    method: 'get',
    params: query
  })
}

export function deleteUserNotifyStatCache() {
  return request({
    url: '/userNotify/deleteStatCache',
    method: 'post'
  })
}