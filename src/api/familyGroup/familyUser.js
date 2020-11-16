import request from '@/utils/request'

export function inviteFamilyUser(data) {
  return request({
    url: '/familyUser/invite',
    method: 'post',
    data
  })
}

export function joinFamilyUser(data) {
  return request({
    url: '/familyUser/join',
    method: 'post',
    data
  })
}

export function applySeparateFamilyUser(data) {
  return request({
    url: '/familyUser/applySeparate',
    method: 'post',
    data
  })
}

export function separateFamilyUser(data) {
  return request({
    url: '/familyUser/separate',
    method: 'post',
    data
  })
}

export function deleteFamilyUser(id) {
  const data = {
      id
  }
  return request({
    url: '/familyUser/delete',
    method: 'post',
    data
  })
}
