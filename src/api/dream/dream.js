import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/dream/getData',
    method: 'get',
    params: query
  })
}

export function getDream(id) {
  return request({
    url: '/dream/get',
    method: 'get',
    params: { id }
  })
}


export function createDream(data) {
  return request({
    url: '/dream/create',
    method: 'post',
    data
  })
}

export function updateDream(data) {
  return request({
    url: '/dream/edit',
    method: 'post',
    data
  })
}

export function deleteDream(ids) {
  const data = {
      ids
  }
  return request({
    url: '/dream/delete',
    method: 'post',
    data
  })
}

export function addOrEditDreamRemind(data) {
  return request({
    url: '/dream/addOrEditRemind',
    method: 'post',
    data
  })
}

export function getDreamRemind(id) {
  return request({
    url: '/dream/getRemind',
    method: 'get',
    params: { id }
  })
}

export function refreshDreamRate() {
  return request({
    url: '/dream/refreshRate',
    method: 'get'
  })
}

export function getDreamStatList(query) {
  return request({
    url: '/dream/statList',
    method: 'get',
    params: query
  })
}
