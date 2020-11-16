import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/sportMilestone/getData',
    method: 'get',
    params: query
  })
}

export function changeSportMilestoneStatus(id,status) {
  const data = {
      id,
      status
  }
  return request({
    url: '/sportMilestone/changeStatus',
    method: 'post',
    params: data
  })
}


export function getSportMilestone(id) {
  return request({
    url: '/sportMilestone/get',
    method: 'get',
    params: { id }
  })
}

export function getSportMilestoneTree(pid,needRoot) {
  return request({
    url: '/sportMilestone/getSportMilestoneTree',
    method: 'get',
    params: {
      pid:pid,
      needRoot:needRoot
    }
  })
}

export function createSportMilestone(data) {
  return request({
    url: '/sportMilestone/create',
    method: 'post',
    data
  })
}

export function updateSportMilestone(data) {
  return request({
    url: '/sportMilestone/edit',
    method: 'post',
    data
  })
}

export function deleteSportMilestone(ids) {
  const data = {
      ids
  }
  return request({
    url: '/sportMilestone/delete',
    method: 'post',
    data
  })
}

export function getSportMilestoneStat(query) {
  return request({
    url: '/sportMilestone/stat',
    method: 'get',
    params: query
  })
}

export function refreshSportMilestone() {
  return request({
    url: '/sportMilestone/refresh',
    method: 'get'
  })
}
