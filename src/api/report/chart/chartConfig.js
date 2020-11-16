import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/chartConfig/getData',
    method: 'get',
    params: query
  })
}

export function getChartConfig(id) {
  return request({
    url: '/chartConfig/get',
    method: 'get',
    params: { id }
  })
}

export function createChartConfig(data) {
  return request({
    url: '/chartConfig/create',
    method: 'post',
    data
  })
}

export function updateChartConfig(data) {
  return request({
    url: '/chartConfig/edit',
    method: 'post',
    data
  })
}
export function deleteChartConfig(ids) {
  const data = {
      ids
  }
  return request({
    url: '/chartConfig/delete',
    method: 'post',
    data
  })
}

export function getChartConfigTree(needRoot) {
  return request({
    url: '/chartConfig/getChartConfigTree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

export function getChartConfigForUserTree(needRoot) {
  return request({
    url: '/chartConfig/getChartConfigForUserTree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}
