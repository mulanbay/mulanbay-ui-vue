import request from '@/utils/request'

export function getUserSetting() {
  return request({
    url: '/userSetting/get',
    method: 'get'
  })
}


export function editUserSetting(data) {
  return request({
    url: '/userSetting/edit',
    method: 'post',
    data
  })
}
