import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/commonRecord/getData',
    method: 'get',
    params: query
  })
}

export function getCommonRecord(id) {
  return request({
    url: '/commonRecord/get',
    method: 'get',
    params: { id }
  })
}

export function createCommonRecord(data) {
  return request({
    url: '/commonRecord/create',
    method: 'post',
    data
  })
}

export function updateCommonRecord(data) {
  return request({
    url: '/commonRecord/edit',
    method: 'post',
    data
  })
}
export function deleteCommonRecord(ids) {
  const data = {
      ids
  }
  return request({
    url: '/commonRecord/delete',
    method: 'post',
    data
  })
}

export function getCommonRecordDateStat(query) {
  return request({
    url: '/commonRecord/dateStat',
    method: 'get',
    params: query
  })
}

export function getCommonRecordAnalyse(query) {
  return request({
    url: '/commonRecord/analyse',
    method: 'get',
    params: query
  })
}

export function getCommonRecordTimeline(query) {
  return request({
    url: '/commonRecord/timeline',
    method: 'get',
    params: query
  })
}

export function getLatestCommonRecord(query) {
  return request({
    url: '/commonRecord/getLatest',
    method: 'get',
    params: query
  })
}

export function statCommonRecord(query) {
  return request({
    url: '/commonRecord/stat',
    method: 'get',
    params: query
  })
}