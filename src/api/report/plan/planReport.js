import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/planReport/getData',
    method: 'get',
    params: query
  })
}

export function deletePlanReport(ids) {
  const data = {
      ids
  }
  return request({
    url: '/planReport/delete',
    method: 'post',
    data
  })
}

export function reStatPlanReport(data) {
  return request({
    url: '/planReport/reStat',
    method: 'post',
    data
  })
}

export function manualStatPlanReport(data) {
  return request({
    url: '/planReport/manualStat',
    method: 'post',
    data
  })
}

export function cleanDataPlanReport(data) {
  return request({
    url: '/planReport/cleanData',
    method: 'post',
    data
  })
}

export function getPlanReportStat(query) {
  return request({
    url: '/planReport/stat',
    method: 'get',
    params: query
  })
}

export function getPlanReportDateStat(query) {
  return request({
    url: '/planReport/dateStat',
    method: 'get',
    params: query
  })
}

export function getPlanReportAvgStat(query) {
  return request({
    url: '/planReport/avgStat',
    method: 'get',
    params: query
  })
}

export function getPlanReportTimelineStat(query) {
  return request({
    url: '/planReport/timelineStat',
    method: 'get',
    params: query
  })
}

export function reStatPlanReportTimeline(data) {
  return request({
    url: '/planReport/reStatTimeline',
    method: 'post',
    data
  })
}

