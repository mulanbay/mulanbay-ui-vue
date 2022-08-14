import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/treatRecord/getData',
    method: 'get',
    params: query
  })
}


export function getTreatRecord(id) {
  return request({
    url: '/treatRecord/get',
    method: 'get',
    params: { id }
  })
}

export function createTreatRecord(data) {
  return request({
    url: '/treatRecord/create',
    method: 'post',
    data
  })
}

export function updateTreatRecord(data) {
  return request({
    url: '/treatRecord/edit',
    method: 'post',
    data
  })
}
export function deleteTreatRecord(ids) {
  const data = {
      ids
  }
  return request({
    url: '/treatRecord/delete',
    method: 'post',
    data
  })
}

export function getTreatRecordTagsTree(needRoot) {
  return request({
    url: '/treatRecord/getTagsTree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

export function getTreatCategoryTree(groupField,needRoot) {
  return request({
    url: '/treatRecord/getTreatCategoryTree',
    method: 'get',
    params: {
      groupField:groupField,
      needRoot:needRoot
    }
  })
}

export function getTreatRecordFullStat(query) {
  return request({
    url: '/treatRecord/fullStat',
    method: 'get',
    params: query
  })
}

export function getTreatRecordDateStat(query) {
  return request({
    url: '/treatRecord/dateStat',
    method: 'get',
    params: query
  })
}

export function getTreatRecordOverallStat(query) {
  return request({
    url: '/treatRecord/overallStat',
    method: 'get',
    params: query
  })
}

export function getTreatRecordAnalyseStat(query) {
  return request({
    url: '/treatRecord/analyseStat',
    method: 'get',
    params: query
  })
}

export function getTreatRecordYoyStat(query) {
  return request({
    url: '/treatRecord/yoyStat',
    method: 'get',
    params: query
  })
}

export function getTreatRecordStat(query) {
  return request({
    url: '/treatRecord/stat',
    method: 'get',
    params: query
  })
}

