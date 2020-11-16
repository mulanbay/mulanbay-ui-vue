import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/lifeExperienceDetail/getData',
    method: 'get',
    params: query
  })
}

export function getLifeExperienceDetail(id) {
  return request({
    url: '/lifeExperienceDetail/get',
    method: 'get',
    params: { id }
  })
}

export function createLifeExperienceDetail(data) {
  return request({
    url: '/lifeExperienceDetail/create',
    method: 'post',
    data
  })
}

export function updateLifeExperienceDetail(data) {
  return request({
    url: '/lifeExperienceDetail/edit',
    method: 'post',
    data
  })
}
export function deleteLifeExperienceDetail(ids) {
  const data = {
      ids
  }
  return request({
    url: '/lifeExperienceDetail/delete',
    method: 'post',
    data
  })
}
