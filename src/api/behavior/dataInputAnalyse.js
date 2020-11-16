import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/dataInputAnalyse/getData',
    method: 'get',
    params: query
  })
}

export function getDataInputAnalyse(id) {
  return request({
    url: '/dataInputAnalyse/get',
    method: 'get',
    params: { id }
  })
}

export function createDataInputAnalyse(data) {
  return request({
    url: '/dataInputAnalyse/create',
    method: 'post',
    data
  })
}

export function updateDataInputAnalyse(data) {
  return request({
    url: '/dataInputAnalyse/edit',
    method: 'post',
    data
  })
}
export function deleteDataInputAnalyse(ids) {
  const data = {
      ids
  }
  return request({
    url: '/dataInputAnalyse/delete',
    method: 'post',
    data
  })
}

export function getDataInputAnalyseStat(query) {
  return request({
    url: '/dataInputAnalyse/stat',
    method: 'get',
    params: query
  })
}

export function getDataInputAnalyseTree(needRoot) {
  return request({
    url: '/dataInputAnalyse/getDataInputAnalyseTree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}