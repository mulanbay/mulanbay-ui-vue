import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/priceRegion/getData',
    method: 'get',
    params: query
  })
}

export function changePriceRegionStatus(id,status) {
  const data = {
      id,
      status
  }
  return request({
    url: '/priceRegion/changeStatus',
    method: 'post',
    params: data
  })
}


export function getPriceRegion(id) {
  return request({
    url: '/priceRegion/get',
    method: 'get',
    params: { id }
  })
}

export function createPriceRegion(data) {
  return request({
    url: '/priceRegion/create',
    method: 'post',
    data
  })
}

export function updatePriceRegion(data) {
  return request({
    url: '/priceRegion/edit',
    method: 'post',
    data
  })
}
export function deletePriceRegion(ids) {
  const data = {
      ids
  }
  return request({
    url: '/priceRegion/delete',
    method: 'post',
    data
  })
}
