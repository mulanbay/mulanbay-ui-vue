import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/lifeExperience/getData',
    method: 'get',
    params: query
  })
}

export function getLifeExperience(id) {
  return request({
    url: '/lifeExperience/get',
    method: 'get',
    params: { id }
  })
}

export function createLifeExperience(data) {
  return request({
    url: '/lifeExperience/create',
    method: 'post',
    data
  })
}

export function updateLifeExperience(data) {
  return request({
    url: '/lifeExperience/edit',
    method: 'post',
    data
  })
}
export function deleteLifeExperience(ids) {
  const data = {
      ids
  }
  return request({
    url: '/lifeExperience/delete',
    method: 'post',
    data
  })
}


export function getLifeExperienceTree(needRoot) {
  return request({
    url: '/lifeExperience/getLifeExperienceTree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}

export function getLifeExperienceStartCityTree(needRoot) {
  return request({
    url: '/lifeExperience/getStartCityTree',
    method: 'get',
    params: {
      needRoot:needRoot
    }
  })
}


export function getLifeExperienceCostStat(query) {
  return request({
    url: '/lifeExperience/costStat',
    method: 'get',
    params: query
  })
}

export function getLifeExperienceDateStat(query) {
  return request({
    url: '/lifeExperience/dateStat',
    method: 'get',
    params: query
  })
}

export function getLifeExperienceYoyStat(query) {
  return request({
    url: '/lifeExperience/yoyStat',
    method: 'get',
    params: query
  })
}

export function getLifeExperienceMapStat(query) {
  return request({
    url: '/lifeExperience/mapStat',
    method: 'get',
    params: query
  })
}

export function getLifeExperienceTransferMapByLifeExpStat(query) {
  return request({
    url: '/lifeExperience/transferMapByLifeExpStat',
    method: 'get',
    params: query
  })
}

export function getLifeExperienceTransferMapStat(query) {
  return request({
    url: '/lifeExperience/transferMapStat',
    method: 'get',
    params: query
  })
}

export function getLifeExperienceWouldCloudStat(query) {
  return request({
    url: '/lifeExperience/wordCloudStat',
    method: 'get',
    params: query
  })
}
