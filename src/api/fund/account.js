import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/account/getData',
    method: 'get',
    params: query
  })
}

export function changeAccountStatus(id,status) {
  const data = {
      id,
      status
  }
  return request({
    url: '/account/changeStatus',
    method: 'post',
    params: data
  })
}

export function changeAccount(data) {
  return request({
    url: '/account/change',
    method: 'post',
    data
  })
}


export function getAccount(id) {
  return request({
    url: '/account/get',
    method: 'get',
    params: { id }
  })
}

export function getAccountTree(needRoot) {
  return request({
    url: '/account/getAccountTree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

export function createAccount(data) {
  return request({
    url: '/account/create',
    method: 'post',
    data
  })
}

export function updateAccount(data) {
  return request({
    url: '/account/edit',
    method: 'post',
    data
  })
}
export function deleteAccount(ids) {
  const data = {
      ids
  }
  return request({
    url: '/account/delete',
    method: 'post',
    data
  })
}

export function getAccountStat(query) {
  return request({
    url: '/account/stat',
    method: 'get',
    params:query
  })
}

export function getAccountForecast(query) {
  return request({
    url: '/account/forecast',
    method: 'get',
    params:query
  })
}

export function createAccountSnapshotInfo(data) {
  return request({
    url: '/account/createSnapshot',
    method: 'post',
    data
  })
}

export function updateBudgetLogAccountChange(bussKey) {
  const data = {
      bussKey
  }
  return request({
    url: '/account/updateBudgetLogAccountChange',
    method: 'post',
    data
  })
}
