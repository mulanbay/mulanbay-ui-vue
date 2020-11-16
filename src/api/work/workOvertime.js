import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/workOvertime/getData',
    method: 'get',
    params: query
  })
}

export function getWorkOvertime(id) {
  return request({
    url: '/workOvertime/get',
    method: 'get',
    params: { id }
  })
}

export function createWorkOvertime(data) {
  return request({
    url: '/workOvertime/create',
    method: 'post',
    data
  })
}

export function updateWorkOvertime(data) {
  return request({
    url: '/workOvertime/edit',
    method: 'post',
    data
  })
}

export function deleteWorkOvertime(ids) {
  const data = {
      ids
  }
  return request({
    url: '/workOvertime/delete',
    method: 'post',
    data
  })
}

export function getWorkOvertimeDateStat(query) {
  return request({
    url: '/workOvertime/dateStat',
    method: 'get',
    params: query
  })
}