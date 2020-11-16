import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/lifeArchives/getData',
    method: 'get',
    params: query
  })
}

export function getLifeArchives(id) {
  return request({
    url: '/lifeArchives/get',
    method: 'get',
    params: { id }
  })
}

export function getSource(id) {
  return request({
    url: '/lifeArchives/getSource',
    method: 'get',
    params: { id }
  })
}

export function createLifeArchives(data) {
  return request({
    url: '/lifeArchives/create',
    method: 'post',
    data
  })
}

export function updateLifeArchives(data) {
  return request({
    url: '/lifeArchives/edit',
    method: 'post',
    data
  })
}
export function deleteLifeArchives(ids) {
  const data = {
      ids
  }
  return request({
    url: '/lifeArchives/delete',
    method: 'post',
    data
  })
}

export function getConsumeTypeTree(needRoot) {
  return request({
    url: '/consumeType/getConsumeTypeTree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

