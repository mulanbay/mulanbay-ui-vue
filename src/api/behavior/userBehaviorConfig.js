import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/userBehaviorConfig/getData',
    method: 'get',
    params: query
  })
}

export function getUserBehaviorConfig(id) {
  return request({
    url: '/userBehaviorConfig/get',
    method: 'get',
    params: { id }
  })
}

export function createUserBehaviorConfig(data) {
  return request({
    url: '/userBehaviorConfig/create',
    method: 'post',
    data
  })
}

export function updateUserBehaviorConfig(data) {
  return request({
    url: '/userBehaviorConfig/edit',
    method: 'post',
    data
  })
}
export function deleteUserBehaviorConfig(ids) {
  const data = {
      ids
  }
  return request({
    url: '/userBehaviorConfig/delete',
    method: 'post',
    data
  })
}

export function getUserBehaviorConfigTree(needRoot) {
  return request({
    url: '/userBehaviorConfig/getUserBehaviorConfigTree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

export function getUserBehaviorTypeTree(needRoot) {
  return request({
    url: '/userBehaviorConfig/getUserBehaviorTypeTree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}