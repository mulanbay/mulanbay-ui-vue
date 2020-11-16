import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/musicPracticeTune/getData',
    method: 'get',
    params: query
  })
}

export function getMusicPracticeTune(id) {
  return request({
    url: '/musicPracticeTune/get',
    method: 'get',
    params: { id }
  })
}

export function createMusicPracticeTune(data) {
  return request({
    url: '/musicPracticeTune/create',
    method: 'post',
    data
  })
}

export function updateMusicPracticeTune(data) {
  return request({
    url: '/musicPracticeTune/edit',
    method: 'post',
    data
  })
}
export function deleteMusicPracticeTune(ids) {
  const data = {
      ids
  }
  return request({
    url: '/musicPracticeTune/delete',
    method: 'post',
    data
  })
}

export function getMusicPracticeTuneTree(tuneType) {
  return request({
    url: '/musicPracticeTune/getMusicPracticeTuneTree',
    method: 'get',
    params: {
      tuneType:tuneType
    }
  })
}

export function getMusicPracticeTuneNameStat(query) {
  return request({
    url: '/musicPracticeTune/nameStat',
    method: 'get',
    params: query
  })
}

export function getMusicPracticeTuneLevelStat(query) {
  return request({
    url: '/musicPracticeTune/levelStat',
    method: 'get',
    params: query
  })
}

export function getMusicPracticeTuneStat(query) {
  return request({
    url: '/musicPracticeTune/stat',
    method: 'get',
    params: query
  })
}

