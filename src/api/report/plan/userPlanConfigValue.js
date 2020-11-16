import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/userPlanConfigValue/getData',
    method: 'get',
    params: query
  })
}

export function getUserPlanConfigValue(id) {
  return request({
    url: '/userPlanConfigValue/get',
    method: 'get',
    params: { id }
  })
}

export function createUserPlanConfigValue(data) {
  return request({
    url: '/userPlanConfigValue/create',
    method: 'post',
    data
  })
}

export function updateUserPlanConfigValue(data) {
  return request({
    url: '/userPlanConfigValue/edit',
    method: 'post',
    data
  })
}
export function deleteUserPlanConfigValue(ids) {
  const data = {
      ids
  }
  return request({
    url: '/userPlanConfigValue/delete',
    method: 'post',
    data
  })
}
