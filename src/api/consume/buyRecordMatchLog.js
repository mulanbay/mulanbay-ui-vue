import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/buyRecordMatchLog/getData',
    method: 'get',
    params: query
  })
}

export function createBuyRecordMatchLog(data) {
  return request({
    url: '/buyRecordMatchLog/create',
    method: 'post',
    data
  })
}

export function getBuyRecord(buyRecordId) {
  return request({
    url: '/buyRecordMatchLog/getBuyRecord',
    method: 'get',
    params: {
      buyRecordId
    }
  })
}

export function getCompareData(id) {
  return request({
    url: '/buyRecordMatchLog/getCompareData',
    method: 'get',
    params: {
      id
    }
  })
}

export function statMatchLog(para) {
  return request({
    url: '/buyRecordMatchLog/stat',
    method: 'get',
    params: para
  })
}