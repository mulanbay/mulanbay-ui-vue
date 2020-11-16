import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/goodsLifetime/getData',
    method: 'get',
    params: query
  })
}

export function getGoodsLifetime(id) {
  return request({
    url: '/goodsLifetime/get',
    method: 'get',
    params: { id }
  })
}

export function getGoodsLifetimeTree(needRoot) {
  return request({
    url: '/goodsLifetime/getGoodsLifetimeTree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

export function createGoodsLifetime(data) {
  return request({
    url: '/goodsLifetime/create',
    method: 'post',
    data
  })
}

export function updateGoodsLifetime(data) {
  return request({
    url: '/goodsLifetime/edit',
    method: 'post',
    data
  })
}
export function deleteGoodsLifetime(ids) {
  const data = {
      ids
  }
  return request({
    url: '/goodsLifetime/delete',
    method: 'post',
    data
  })
}

export function aiMatch(goodsName) {
  const data = {
      goodsName
  }
  return request({
    url: '/goodsLifetime/aiMatch',
    method: 'post',
    data
  })
}
