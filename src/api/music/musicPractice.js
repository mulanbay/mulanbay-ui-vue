import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/musicPractice/getData',
    method: 'get',
    params: query
  })
}

export function getMusicPractice(id) {
  return request({
    url: '/musicPractice/get',
    method: 'get',
    params: { id }
  })
}

export function getMusicPracticeFromThisStat(id) {
  return request({
    url: '/musicPractice/fromThisStat',
    method: 'get',
    params: { id }
  })
}

export function createMusicPractice(data) {
  return request({
    url: '/musicPractice/create',
    method: 'post',
    data
  })
}

export function createMusicPracticeByTemplate(data) {
  return request({
    url: '/musicPractice/createByTemplate',
    method: 'post',
    data
  })
}


export function updateMusicPractice(data) {
  return request({
    url: '/musicPractice/edit',
    method: 'post',
    data
  })
}
export function deleteMusicPractice(ids) {
  const data = {
      ids
  }
  return request({
    url: '/musicPractice/delete',
    method: 'post',
    data
  })
}

export function getMusicPracticeDateStat(query) {
  return request({
    url: '/musicPractice/dateStat',
    method: 'get',
    params: query
  })
}

export function getMusicPracticeTimeStat(query) {
  return request({
    url: '/musicPractice/timeStat',
    method: 'get',
    params: query
  })
}

export function getMusicPracticeCompareStat(query) {
  return request({
    url: '/musicPractice/compareStat',
    method: 'get',
    params: query
  })
}

export function getMusicPracticeYoyStat(query) {
  return request({
    url: '/musicPractice/yoyStat',
    method: 'get',
    params: query
  })
}
