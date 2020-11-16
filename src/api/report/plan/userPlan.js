import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/userPlan/getData',
    method: 'get',
    params: query
  })
}

export function getUserPlan(id) {
  return request({
    url: '/userPlan/get',
    method: 'get',
    params: { id }
  })
}

export function createUserPlan(data) {
  return request({
    url: '/userPlan/create',
    method: 'post',
    data
  })
}

export function updateUserPlan(data) {
  return request({
    url: '/userPlan/edit',
    method: 'post',
    data
  })
}
export function deleteUserPlan(ids) {
  const data = {
      ids
  }
  return request({
    url: '/userPlan/delete',
    method: 'post',
    data
  })
}

export function getUserPlanTree(needRoot,planType,relatedBeans) {
  return request({
    url: '/userPlan/getUserPlanTree',
    method: 'get',
    params: {
      needRoot:needRoot,
      planType:planType,
      relatedBeans:relatedBeans
    }
  })
}

export function addOrEditUserPlanRemind(data) {
  return request({
    url: '/userPlan/addOrEditRemind',
    method: 'post',
    data
  })
}

export function getUserPlanRemind(id) {
  return request({
    url: '/userPlan/getRemind',
    method: 'get',
    params: { id }
  })
}

export function getUserPlanStat(query) {
  return request({
    url: '/userPlan/getStat',
    method: 'get',
    params: query
  })
}
