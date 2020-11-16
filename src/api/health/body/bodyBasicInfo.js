import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/bodyBasicInfo/getData',
    method: 'get',
    params: query
  })
}

export function getBodyBasicInfo(id) {
  return request({
    url: '/bodyBasicInfo/get',
    method: 'get',
    params: { id }
  })
}

export function createBodyBasicInfo(data) {
  return request({
    url: '/bodyBasicInfo/create',
    method: 'post',
    data
  })
}

export function updateBodyBasicInfo(data) {
  return request({
    url: '/bodyBasicInfo/edit',
    method: 'post',
    data
  })
}
export function deleteBodyBasicInfo(ids) {
  const data = {
      ids
  }
  return request({
    url: '/bodyBasicInfo/delete',
    method: 'post',
    data
  })
}

export function getBodyBasicInfoDateStat(query) {
  return request({
    url: '/bodyBasicInfo/dateStat',
    method: 'get',
    params: query
  })
}

export function getBodyBasicInfoYoyStat(query) {
  return request({
    url: '/bodyBasicInfo/yoyStat',
    method: 'get',
    params: query
  })
}
