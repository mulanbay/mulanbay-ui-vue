import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/userCalendarConfig/getData',
    method: 'get',
    params: query
  })
}

export function getUserCalendarConfig(id) {
  return request({
    url: '/userCalendarConfig/get',
    method: 'get',
    params: { id }
  })
}

export function createUserCalendarConfig(data) {
  return request({
    url: '/userCalendarConfig/create',
    method: 'post',
    data
  })
}

export function updateUserCalendarConfig(data) {
  return request({
    url: '/userCalendarConfig/edit',
    method: 'post',
    data
  })
}
export function deleteUserCalendarConfig(ids) {
  const data = {
      ids
  }
  return request({
    url: '/userCalendarConfig/delete',
    method: 'post',
    data
  })
}

export function getUserCalendarConfigTree(needRoot) {
  return request({
    url: '/userCalendarConfig/getUserCalendarConfigTree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}
